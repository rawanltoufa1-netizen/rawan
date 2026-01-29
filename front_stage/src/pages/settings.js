import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/settings.css';

const Settings = () => {
  const navigate = useNavigate();
  const [message, setMessage] = useState('');
const [userData, setUserData] = useState({
  username: localStorage.getItem('username') || '',
  email: '',
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});


useEffect(() => {
  const fetchUserData = async () => {
    try {
      const username = localStorage.getItem('username');
      if (!username) return;

      const response = await fetch(`http://localhost:5028/api/users/${username}`);

      if (!response.ok) {
        console.log("Utilisateur non trouvé dans la DB");
        return;
      }

      const data = await response.json();

      setUserData(prev => ({
        ...prev,
        username: data.username,
        email: data.email || ''
      }));

    } catch (error) {
      console.error("Erreur fetching data:", error);
    }
  };

  fetchUserData();
}, []);

const handleUpdate = async (e) => {
  e.preventDefault();

  const oldUsername = localStorage.getItem('username');

  if (userData.newPassword && userData.newPassword !== userData.confirmPassword) {
    setMessage("Les mots de passe ne correspondent pas !");
    return;
  }

  try {
    const response = await fetch('http://localhost:5028/api/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        oldUsername,
        ...userData
      }),
    });

    if (response.ok) {
      // update localStorage AFTER success
      localStorage.setItem('username', userData.username);
      setMessage("Compte mis à jour avec succès !");
      setTimeout(() => navigate('/home'), 2000);
    } else {
      setMessage("Erreur lors de la mise à jour.");
    }
  } catch (error) {
    setMessage("Erreur de connexion.");
  }
};


  return (
    <div className="settings-wrapper">
      <div className="settings-card">
        <h2>Modifier mon compte</h2>
        {message && <div className="alert">{message}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Nom d'utilisateur</label>
            <input type="text" value={userData.username} onChange={(e) => setUserData({...userData, username: e.target.value})} required />
          </div>
          <div className="form-group">
            <label>Email:</label>
            <input type="email" value={userData.email} onChange={(e) => setUserData({...userData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Mot de passe actuel :</label>
            <input type="password" value={userData.currentPassword} onChange={(e) => setUserData({...userData, currentPassword: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Nouveau mot de passe:</label>
            <input type="password" value={userData.newPassword} onChange={(e) => setUserData({...userData, newPassword: e.target.value})} />
          </div>
          <div className="form-group">
            <label>Confirmer le mot de passe:</label>
            <input type="password" value={userData.confirmPassword} onChange={(e) => setUserData({...userData, confirmPassword: e.target.value})} />
          </div>
          <button className="btn-cancel" type="button" onClick={() => navigate('/home')}>Annuler</button>
          <button className="btn-save"type="submit">Sauvegarder</button>
        </form>
      </div>
    </div>
  );
};

export default Settings;