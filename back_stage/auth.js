const bcrypt = require('bcrypt');
const crypto = require('crypto');
const pool = require('./db');

// 1️⃣ Register
const registerUser = async (req, res) => {
  const { username, email, password } = req.body;

  console.log('Register request body:', req.body); // DEBUG

  if (!username || !email || !password) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Hashed password:', hashedPassword); // DEBUG

    const newUser = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email`,
      [username, email, hashedPassword]
    );

    console.log('New user inserted:', newUser.rows[0]); // DEBUG

    res.status(201).json({
      message: "Le compte a été créé avec succès!",
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error('Register error:', err); // <--- This will show the real issue
    if (err.code === '23505') {
      return res.status(409).json({ error: "Email already exists" });
    }
    res.status(500).json({ error: "Server error" });
  }
};


// 2️⃣ Login
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  try {
    const result = await pool.query(
      `SELECT id, username, email, password_hash
       FROM users WHERE email = $1`,
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    const validPass = await bcrypt.compare(password, user.password_hash);

    if (!validPass) {
      return res.status(401).json({ error: "Wrong password" });
    }

    res.json({
      message: "Connexion réussie",
      user: {
        id: user.id,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

// 3️⃣ Forgot Password
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const token = crypto.randomBytes(32).toString('hex');
    const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    const result = await pool.query(
      `UPDATE users
       SET reset_token = $1, reset_token_expiry = $2
       WHERE email = $3
       RETURNING email`,
      [token, expiry, email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Email not found" });
    }

    // Temporary: return token (later send by email)
    res.json({
      message: "Password reset token generated",
      token
    });
  } catch (err) {
    res.status(500).json({ error: "Server error" });
  }
};

module.exports = { registerUser, loginUser, forgotPassword };
