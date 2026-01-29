const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const pool = require('./db');

const app = express();
const PORT = 5028;

// Middlewares
app.use(cors());
app.use(express.json());

/* ================= ROUTE LOGIN ================= */
app.post('/api/login', async (req, res) => {
  try {
    console.log("📩 محاولة تسجيل دخول:", req.body.email);
    
    const { email, password } = req.body;
    
    const result = await pool.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      console.log("❌ البريد الإلكتروني غير موجود");
      return res.status(401).json({ 
        error: "البريد الإلكتروني غير موجود" 
      });
    }

    const user = result.rows[0];
    console.log("✅ المستخدم موجود:", user.email);

    if (!user.password_hash) {
      console.log("❌ كلمة المرور غير محفوظة");
      return res.status(500).json({ 
        error: "خطأ في إعداد الحساب" 
      });
    }

    const validPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!validPassword) {
      console.log("❌ كلمة المرور غير صحيحة");
      return res.status(401).json({ 
        error: "كلمة المرور غير صحيحة" 
      });
    }

    console.log("✅ تسجيل دخول ناجح!");

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });

  } catch (err) {
    console.error("💥 خطأ في login:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر: " + err.message });
  }
});

/* ================= ROUTES STAGIAIRES ================= */

// جلب جميع المتدربين
app.get('/api/stagiaires', async (req, res) => {
  try {
    const all = await pool.query("SELECT * FROM stagiaires ORDER BY id DESC");
    res.json(all.rows);
  } catch (err) {
    console.error("Erreur get stagiaires:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// إضافة متدرب
app.post('/api/stagiaires', async (req, res) => {
  try {
    const { nom, prenom, tel, institution, departement, type_stage, periode_de, periode_a } = req.body;
    
    // Validation des champs requis
    if (!nom || !prenom || !tel || !periode_de || !periode_a) {
      return res.status(400).json({ 
        error: "Tous les champs obligatoires doivent être remplis" 
      });
    }

    const result = await pool.query(
      "INSERT INTO stagiaires (nom, prenom, tel, institution, departement, type_stage, periode_de, periode_a) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *",
      [nom, prenom, tel, institution, departement, type_stage, periode_de, periode_a]
    );
    
    console.log("✅ Stagiaire ajouté:", result.rows[0]);
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error("💥 Erreur insertion stagiaire:", err.message);
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});

// تعديل متدرب
app.put('/api/stagiaires/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, tel, institution, departement, type_stage, periode_de, periode_a } = req.body;
    
    await pool.query(
      "UPDATE stagiaires SET nom=$1, prenom=$2, tel=$3, institution=$4, departement=$5, type_stage=$6, periode_de=$7, periode_a=$8 WHERE id=$9",
      [nom, prenom, tel, institution, departement, type_stage, periode_de, periode_a, id]
    );
    
    console.log("✅ Stagiaire mis à jour, ID:", id);
    res.json({ message: "Stagiaire mis à jour !" });
  } catch (err) {
    console.error("💥 Erreur update stagiaire:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// حذف متدرب
app.delete('/api/stagiaires/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM stagiaires WHERE id = $1", [id]);
    console.log("✅ Stagiaire supprimé, ID:", id);
    res.json({ message: "Stagiaire supprimé !" });
  } catch (err) {
    console.error("💥 Erreur delete stagiaire:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

/* ================= ROUTES ENCADREURS ================= */

// جلب جميع المدربين
app.get('/api/encadreurs', async (req, res) => {
  try {
    const all = await pool.query("SELECT * FROM encadreurs ORDER BY id DESC");
    res.json(all.rows);
  } catch (err) {
    console.error("Erreur get encadreurs:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// إضافة مدرب - AVEC CORRECTION
app.post('/api/encadreurs', async (req, res) => {
  try {
    const { nom, prenom, poste, email, tel } = req.body;
    
    console.log("📥 Tentative d'ajout encadreur:", { nom, prenom, poste, email, tel });
    
    // Validation des champs requis
    if (!nom || !prenom || !poste || !email) {
      console.log("❌ Champs manquants");
      return res.status(400).json({ 
        error: "Tous les champs obligatoires doivent être remplis (nom, prénom, poste, email)" 
      });
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log("❌ Format email invalide");
      return res.status(400).json({ 
        error: "Format d'email invalide" 
      });
    }

    // Vérifier si l'email existe déjà
    const existingEmail = await pool.query(
      "SELECT * FROM encadreurs WHERE email = $1",
      [email]
    );

    if (existingEmail.rows.length > 0) {
      console.log("❌ Email déjà existant:", email);
      return res.status(409).json({ 
        error: "Cet email est déjà utilisé par un autre encadrant" 
      });
    }

    // Insertion dans la base de données
    const result = await pool.query(
      "INSERT INTO encadreurs (nom, prenom, poste, email, tel) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [nom, prenom, poste, email, tel]
    );
    
    console.log("✅ Encadreur ajouté avec succès:", result.rows[0]);
    res.status(201).json(result.rows[0]);
    
  } catch (err) {
    console.error("💥 Erreur insertion encadreur:", err.message);
    console.error("Code erreur:", err.code);
    
    // Gestion des erreurs spécifiques PostgreSQL
    if (err.code === '23505') { // Violation de contrainte unique
      return res.status(409).json({ 
        error: "Cet email existe déjà dans la base de données" 
      });
    }
    
    if (err.code === '23502') { // Violation NOT NULL
      return res.status(400).json({ 
        error: "Un champ obligatoire est manquant" 
      });
    }
    
    res.status(500).json({ error: "Erreur serveur: " + err.message });
  }
});

// تعديل مدرب
app.put('/api/encadreurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { nom, prenom, poste, email, tel } = req.body;
    
    // Vérifier si un autre encadreur a déjà cet email
    const existingEmail = await pool.query(
      "SELECT * FROM encadreurs WHERE email = $1 AND id != $2",
      [email, id]
    );

    if (existingEmail.rows.length > 0) {
      return res.status(409).json({ 
        error: "Cet email est déjà utilisé par un autre encadrant" 
      });
    }

    await pool.query(
      "UPDATE encadreurs SET nom=$1, prenom=$2, poste=$3, email=$4, tel=$5 WHERE id=$6",
      [nom, prenom, poste, email, tel, id]
    );
    
    console.log("✅ Encadreur mis à jour, ID:", id);
    res.json({ message: "Encadreur mis à jour !" });
  } catch (err) {
    console.error("💥 Erreur update encadreur:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// حذف مدرب
app.delete('/api/encadreurs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Vérifier s'il y a des stagiaires liés
    const linkedStagiaires = await pool.query(
      "SELECT COUNT(*) FROM stagiaires WHERE encadreurId = $1",
      [id]
    );
    
    if (linkedStagiaires.rows[0].count > 0) {
      return res.status(400).json({ 
        error: `Impossible de supprimer: ${linkedStagiaires.rows[0].count} stagiaire(s) sont liés à cet encadrant` 
      });
    }
    
    await pool.query("DELETE FROM encadreurs WHERE id = $1", [id]);
    console.log("✅ Encadreur supprimé, ID:", id);
    res.json({ message: "Encadreur supprimé !" });
  } catch (err) {
    console.error("💥 Erreur delete encadreur:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// ربط متدرب بمدرب
app.post('/api/encadreurs/:id/stagiaires/:stagId', async (req, res) => {
  try {
    const { id, stagId } = req.params;

    // Vérifier que le stagiaire existe
    const stagiaire = await pool.query(
      "SELECT * FROM stagiaires WHERE id = $1",
      [stagId]
    );
    
    if (stagiaire.rows.length === 0) {
      return res.status(404).json({ error: "المتدرب غير موجود" });
    }

    // Vérifier que l'encadreur existe
    const encadreur = await pool.query(
      "SELECT * FROM encadreurs WHERE id = $1",
      [id]
    );
    
    if (encadreur.rows.length === 0) {
      return res.status(404).json({ error: "المدرب غير موجود" });
    }

    // Mettre à jour le stagiaire
    await pool.query(
      "UPDATE stagiaires SET encadreurId = $1 WHERE id = $2",
      [id, stagId]
    );

    console.log(`✅ Stagiaire ${stagId} affecté à l'encadreur ${id}`);
    res.status(200).json({ 
      message: "تم ربط المتدرب!", 
      stagiaire: stagiaire.rows[0] 
    });
  } catch (err) {
    console.error("💥 Erreur affecter stagiaire:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// إزالة متدرب من مدرب
app.delete('/api/encadreurs/:id/stagiaires/:stagId', async (req, res) => {
  try {
    const { stagId } = req.params;
    await pool.query(
      "UPDATE stagiaires SET encadreurId = NULL WHERE id = $1",
      [stagId]
    );
    console.log(`✅ Stagiaire ${stagId} retiré de son encadreur`);
    res.json({ message: "تم إزالة المتدرب من المدرب !" });
  } catch (err) {
    console.error("💥 Erreur retirer stagiaire:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// جلب جميع المتدربين لمدرب معين
app.get('/api/encadreurs/:id/stagiaires', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      "SELECT * FROM stagiaires WHERE encadreurId = $1 ORDER BY id DESC",
      [id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error("💥 Erreur get stagiaires encadreur:", err.message);
    res.status(500).json({ error: "خطأ في السيرفر" });
  }
});

// تشغيل السيرفر
app.listen(PORT, () => {
  console.log(`✅ السيرفر يعمل على http://127.0.0.1:${PORT}`);
});