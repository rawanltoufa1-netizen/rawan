import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/home.css'; 

const AjouterStagiaire = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        nom: '', prenom: '', tel: '', institution: '',
        departement: '', type_stage: '', periode_de: '', periode_a: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('http://localhost:5028/api/stagiaires', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                alert("Stagiaire ajouté avec succès !");
                navigate('/home'); 
            }
        } catch (error) {
            console.error("Erreur d'ajout:", error);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <div className="main-area" style={{padding: '40px'}}>
                <div className="table-card">
                    <h3>➕ Ajouter un nouveau stagiaire</h3>
                    <hr /><br />
                    <form onSubmit={handleSubmit} className="stage-form">
                        <div className="form-row">
                            <input type="text" placeholder="Nom" onChange={(e) => setFormData({...formData, nom: e.target.value})} required />
                            <input type="text" placeholder="Prénom" onChange={(e) => setFormData({...formData, prenom: e.target.value})} required />
                        </div>
                        <div className="form-row">
                            <input type="text" placeholder="Téléphone" onChange={(e) => setFormData({...formData, tel: e.target.value})} />
                            <input type="text" placeholder="Institution" onChange={(e) => setFormData({...formData, institution: e.target.value})} />
                        </div>
                        <div className="form-row">
                            <input type="text" placeholder="Département" onChange={(e) => setFormData({...formData, departement: e.target.value})} />
                            <select onChange={(e) => setFormData({...formData, type_stage: e.target.value})}>
                                <option value="">Type de stage</option>
                                <option value="PFE">PFE</option>
                                <option value="Observation">Observation</option>
                                <option value="Technique">Technique</option>
                            </select>
                        </div>
                        <div className="form-row">
                            <label>De: <input type="date" onChange={(e) => setFormData({...formData, periode_de: e.target.value})} /></label>
                            <label>À: <input type="date" onChange={(e) => setFormData({...formData, periode_a: e.target.value})} /></label>
                        </div>
                        <button type="submit" className="btn-add-new">Enregistrer</button>
                        <button type="button" onClick={() => navigate('/home')} style={{marginLeft: '10px', background: '#ccc'}}>Annuler</button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AjouterStagiaire;