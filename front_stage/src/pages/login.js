import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import '../css/login.css';

const Login = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  useEffect(() => {
    if (location.state && location.state.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleLogin = async (e) => {
    e.preventDefault(); 
    console.log("Tentative de connexion avec:", email); 

    try {
      const response = await fetch('http://127.0.0.1:5028/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("✅ Connexion réussie");
      localStorage.setItem('username', data.user.username); 
        navigate('/home'); 
      } else {
        alert("❌ " + (data.error || data.message));
      }
    } catch (error) {
      console.error("Erreur:", error);
      alert("❌ erreur de connexion au serveur");
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>Connexion</h2>
        <form onSubmit={handleLogin}>
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

          <div className="button-container">
            <button type="submit" className="login-btn">
              Se connecter
            </button>
            
            <Link to="/registre" style={{ width: '100%', display: 'block', textDecoration: 'none' }}>
              <button type="button" className="btn-create">
                Créer un compte
              </button>
            </Link>
          </div>
        </form>

        <div className="login-links">
          <Link to="/forgot-password" style={{ color: '#007c89', textDecoration: 'underline' }}>
            Mot de passe oublié ?
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;