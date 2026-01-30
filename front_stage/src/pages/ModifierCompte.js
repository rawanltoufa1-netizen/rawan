import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ModifierCompte = () => {
  const navigate = useNavigate();

  const [currentData, setCurrentData] = useState({
    username: '',
    email: '',
  });
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem('username');
    const savedEmail = localStorage.getItem('email');
    
    const current = {
      username: savedUsername || 'Admin',
      email: savedEmail || ''
    };
    
    setCurrentData(current);
    setFormData({
      username: savedUsername || '',
      email: savedEmail || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    if (!formData.username.trim()) {
      setError('Le nom d\'utilisateur ne peut pas être vide');
      return;
    }

    if (formData.username.trim().length < 3) {
      setError('Le nom d\'utilisateur doit contenir au moins 3 caractères');
      return;
    }
    if (formData.email && !isValidEmail(formData.email)) {
      setError('Format d\'email invalide');
      return;
    }
    if (formData.newPassword || formData.confirmPassword) {
      if (!formData.currentPassword) {
        setError('Veuillez entrer votre mot de passe actuel');
        return;
      }

      if (formData.newPassword.length < 6) {
        setError('Le nouveau mot de passe doit contenir au moins 6 caractères');
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError('Les mots de passe ne correspondent pas');
        return;
      }
      const savedPassword = localStorage.getItem('password');
      if (savedPassword && formData.currentPassword !== savedPassword) {
        setError('Mot de passe actuel incorrect');
        return;
      }
    }
    try {
      localStorage.setItem('username', formData.username.trim());
      
      if (formData.email) {
        localStorage.setItem('email', formData.email.trim());
      }
      
      if (formData.newPassword) {
        localStorage.setItem('password', formData.newPassword);
      }

      setSuccess(true);

      setTimeout(() => {
        navigate('/home');
      }, 2000);
    } catch (err) {
      setError('Erreur lors de la sauvegarde des modifications');
    }
  };

  const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };
  const styles = {
    wrapper: {
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px'
    },
    container: {
      background: 'white',
      borderRadius: '20px',
      boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
      maxWidth: '600px',
      width: '100%',
      padding: '40px',
      animation: 'slideIn 0.4s ease-out'
    },
    header: {
      position: 'relative',
      textAlign: 'center',
      marginBottom: '30px'
    },
    btnRetour: {
      position: 'absolute',
      left: 0,
      top: 0,
      background: '#f0f0f0',
      border: 'none',
      padding: '8px 16px',
      borderRadius: '8px',
      cursor: 'pointer',
      fontSize: '14px',
      transition: 'all 0.3s ease'
    },
    title: {
      color: '#333',
      fontSize: '24px',
      margin: 0
    },
    userInfo: {
      textAlign: 'center',
      marginBottom: '30px',
      padding: '20px',
      background: 'linear-gradient(135deg, #667eea15, #764ba215)',
      borderRadius: '12px'
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '32px',
      fontWeight: 'bold',
      margin: '0 auto 15px',
      boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
    },
    currentInfo: {
      color: '#666',
      fontSize: '14px',
      margin: '5px 0',
      textAlign: 'left'
    },
    form: {
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
    },
    sectionTitle: {
      fontSize: '16px',
      fontWeight: 600,
      color: '#667eea',
      marginTop: '10px',
      marginBottom: '5px',
      borderBottom: '2px solid #667eea',
      paddingBottom: '8px'
    },
    formGroup: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    label: {
      fontWeight: 600,
      color: '#333',
      fontSize: '14px'
    },
    input: {
      padding: '12px 15px',
      border: '2px solid #e0e0e0',
      borderRadius: '10px',
      fontSize: '15px',
      transition: 'all 0.3s ease',
      outline: 'none'
    },
    alert: {
      padding: '12px 15px',
      borderRadius: '10px',
      fontSize: '14px',
      animation: 'fadeIn 0.3s ease'
    },
    alertError: {
      background: '#fee',
      color: '#c33',
      border: '1px solid #fcc'
    },
    alertSuccess: {
      background: '#efe',
      color: '#3c3',
      border: '1px solid #cfc'
    },
    formActions: {
      display: 'flex',
      gap: '15px',
      marginTop: '10px'
    },
    button: {
      flex: 1,
      padding: '12px 20px',
      border: 'none',
      borderRadius: '10px',
      fontSize: '16px',
      fontWeight: 600,
      cursor: 'pointer',
      transition: 'all 0.3s ease'
    },
    btnCancel: {
      background: '#f0f0f0',
      color: '#666'
    },
    btnSubmit: {
      background: 'linear-gradient(135deg, #667eea, #764ba2)',
      color: 'white'
    },
    hint: {
      fontSize: '12px',
      color: '#999',
      marginTop: '4px',
      fontStyle: 'italic'
    }
  };

  return (
    <div style={styles.wrapper}>
      <div style={styles.container}>
        <div style={styles.header}>
          <button 
            style={styles.btnRetour}
            onClick={() => navigate('/home')}
            onMouseOver={(e) => e.target.style.background = '#e0e0e0'}
            onMouseOut={(e) => e.target.style.background = '#f0f0f0'}
          >
            ← Retour
          </button>
          <h2 style={styles.title}>⚙️ Modifier le compte</h2>
        </div>

        <div style={styles.userInfo}>
          <div style={styles.avatar}>
            {currentData.username ? currentData.username.substring(0, 2).toUpperCase() : 'AD'}
          </div>
          <p style={{...styles.currentInfo, textAlign: 'center', fontWeight: 'bold', fontSize: '16px', marginBottom: '10px'}}>
            {currentData.username}
          </p>
          {currentData.email && (
            <p style={{...styles.currentInfo, textAlign: 'center'}}>
              📧 {currentData.email}
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} style={styles.form}>
          {error && (
            <div style={{...styles.alert, ...styles.alertError}}>
              ❌ {error}
            </div>
          )}

          {success && (
            <div style={{...styles.alert, ...styles.alertSuccess}}>
              ✅ Modifications enregistrées avec succès ! Redirection...
            </div>          )}

          <div style={styles.sectionTitle}>📋 Informations générales</div>

          <div style={styles.formGroup}>
            <label htmlFor="username" style={styles.label}>
              Nom d'utilisateur * :
            </label>
            <input
              id="username"
              name="username"
              type="text"
              placeholder="Entrez votre nom d'utilisateur"
              value={formData.username}
              onChange={handleChange}
              required
              minLength={3}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={styles.hint}>Minimum 3 caractères</span>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="email" style={styles.label}>
              Email :
            </label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="votreemail@exemple.com"
              value={formData.email}
              onChange={handleChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>
          <div style={styles.sectionTitle}>🔐 Changer le mot de passe</div>
          <span style={{...styles.hint, marginTop: '-10px'}}>
            Laissez vide si vous ne souhaitez pas changer votre mot de passe
          </span>

          <div style={styles.formGroup}>
            <label htmlFor="currentPassword" style={styles.label}>
              Mot de passe actuel :
            </label>
            <input
              id="currentPassword"
              name="currentPassword"
              type="password"
              placeholder="Entrez votre mot de passe actuel"
              value={formData.currentPassword}
              onChange={handleChange}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="newPassword" style={styles.label}>
              Nouveau mot de passe :
            </label>
            <input
              id="newPassword"
              name="newPassword"
              type="password"
              placeholder="Entrez le nouveau mot de passe"
              value={formData.newPassword}
              onChange={handleChange}
              minLength={6}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
            <span style={styles.hint}>Minimum 6 caractères</span>
          </div>

          <div style={styles.formGroup}>
            <label htmlFor="confirmPassword" style={styles.label}>
              Confirmer le nouveau mot de passe :
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Confirmez le nouveau mot de passe"
              value={formData.confirmPassword}
              onChange={handleChange}
              minLength={6}
              style={styles.input}
              onFocus={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
              }}
              onBlur={(e) => {
                e.target.style.borderColor = '#e0e0e0';
                e.target.style.boxShadow = 'none';
              }}
            />
          </div>

          <div style={styles.formActions}>
            <button 
              type="button" 
              style={{...styles.button, ...styles.btnCancel}}
              onClick={() => navigate('/home')}
              onMouseOver={(e) => {
                e.target.style.background = '#e0e0e0';
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
              }}
              onMouseOut={(e) => {
                e.target.style.background = '#f0f0f0';
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Annuler
            </button>
            <button 
              type="submit" 
              style={{...styles.button, ...styles.btnSubmit}}
              onMouseOver={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.4)';
              }}
              onMouseOut={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Enregistrer les modifications
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModifierCompte;
