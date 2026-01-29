import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/registre.css';

const Registre = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault(); // يمنع الصفحة باش تعمل Refresh

    // 1. التثبت من تطابق كلمات السر
    if (password !== confirmPassword) {
      alert("❌ Les mots de passe ne correspondent pas");
      return; // يوقف العملية هوني وما يبعثش للسيرفر
    }

    // 2. التثبت من قوة كلمة السر (Regex)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d).{8,}$/;
    if (!passwordRegex.test(password)) {
      alert("❌ Le mot de passe doit contenir au moins une majuscule, un chiffre et faire au moins 8 caractères.");
      return; // يوقف العملية هوني
    }

    // 3. إذا كل شيء مريقل، نبعثوا للسيرفر
    try {
      const response = await fetch('http://127.0.0.1:5028/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ " + data.message);
        // هوني نبعثوا الـ email لصفحة الـ login
        navigate('/login', { state: { email: email } });
      } else {
        alert("❌ " + (data.error || data.message));
      }
    } catch (error) {
      alert("❌ Erreur de connexion au serveur");
    }
  };

  return (
    <div className="login-wrapper"> {/* استعمل نفس الـ wrapper متاع الـ login باش يجيو كيف كيف */}
      <div className="login-card">
        <h2 className="login-title">Créer un compte</h2>

        <form onSubmit={handleRegister}>
          <div className="input-group">
            <label>Nom d'utilisateur:</label>
            <input
              type="text"
              placeholder="Nom"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Email:</label>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Mot de passe:</label>
            <input
              type="password"
              placeholder="Mot de passe"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <div className="input-group">
            <label>Confirmer le mot de passe:</label>
            <input
              type="password"
              placeholder="Confirmer"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>

          <div className="button-container">
            <button type="submit" className="login-btn">
              S'inscrire
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Registre;