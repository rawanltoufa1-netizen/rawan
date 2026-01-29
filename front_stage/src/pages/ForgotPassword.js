
import { Link } from 'react-router-dom';
import '../css/ForgotPassword.css';

const ForgotPassword = () => {
  return (
    <div className="login-card">
      <h2>Mot de passe oublié</h2>
      <p style={{ marginBottom: '20px', fontSize: '14px' }}>
        Entrez votre email pour recevoir le code
      </p>
      
      <form className="form-content">
          <div className="input-group">
            <label>Email:</label>
            <input 
              type="email" 
              placeholder="Votre email" 
              className="rounded-input" 
              required 
            />
          </div>
        
        <button type="submit" className="login-btn">Envoyer le code</button>
      </form>
      <div>
  <Link to="/" className="back-link"
  style={{ 
    color: '#007c89', 
    textDecoration: 'underline', 
    fontSize: '13px', 
  }}>
    Retour au Page de Connexion
  </Link>
</div>
    </div>
  );
};

export default ForgotPassword;