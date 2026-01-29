import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../css/home.css';

const Home = () => {
  const navigate = useNavigate();

  // --- ÉTATS ---
  const [view, setView] = useState('stagiaire');
  const [showMenu, setShowMenu] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [stagiaires, setStagiaires] = useState([]);
  const [encadreurs, setEncadreurs] = useState([]);
  const [searchName, setSearchName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchStart, setSearchStart] = useState('');
  const [searchEnd, setSearchEnd] = useState('');
  const [editData, setEditData] = useState(null);

  // --- ÉTATS MODALS ---
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAddEncModal, setShowAddEncModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [showStagiairesModal, setShowStagiairesModal] = useState(false);
  const [selectedEncadreur, setSelectedEncadreur] = useState(null);
  const [encadreurStagiaires, setEncadreurStagiaires] = useState([]);

  // --- FORMULAIRES ---
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    tel: '',
    institution: '',
    departement: '',
    type_stage: 'PFE',
    periode_de: '',
    periode_a: ''
  });

  const [formEncData, setFormEncData] = useState({
    nom: '',
    prenom: '',
    poste: '',
    email: '',
    tel: ''
  });

  // URL de base pour l'API
  const API_URL = 'http://127.0.0.1:5028/api';

  // --- RÉCUPÉRATION DES DONNÉES ---
  const fetchData = async () => {
    setLoading(true);
    try {
      const [resStag, resEnc] = await Promise.all([
        fetch(`${API_URL}/stagiaires`),
        fetch(`${API_URL}/encadreurs`)
      ]);
      if (resStag.ok && resEnc.ok) {
        const stagiairesData = await resStag.json();
        const encadreursData = await resEnc.json();
        setStagiaires(stagiairesData);
        setEncadreurs(encadreursData);
      } else {
        console.error("Erreur lors du chargement des données");
        alert("⚠️ Erreur lors du chargement des données");
      }
    } catch (error) {
      console.error("Erreur de connexion:", error);
      alert("❌ Impossible de se connecter au serveur");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedName = localStorage.getItem('username');
    if (savedName) setCurrentUsername(savedName);
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Fermer le menu au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMenu && !event.target.closest('.user-profile-wrapper')) {
        setShowMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMenu]);

  // --- LOGIQUE DE RECHERCHE ET FILTRAGE ---
  const formatDate = (date) => {
    if (!date) return '';
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const hasSearch = searchName || searchType || searchStart || searchEnd;

  const filteredData = (view === 'stagiaire' ? stagiaires : encadreurs)
    .map((item) => {
      if (view === 'encadreur') {
        const fullName = `${item.nom} ${item.prenom}`.toLowerCase();
        const matchName = searchName
          ? fullName.includes(searchName.toLowerCase())
          : true;
        return { ...item, isMatch: hasSearch && matchName };
      }

      // Pour les stagiaires - filtrage complet
      const fullName = `${item.nom} ${item.prenom}`.toLowerCase();
      const matchName = searchName
        ? fullName.includes(searchName.toLowerCase())
        : true;
      const matchType = searchType ? item.type_stage === searchType : true;

      // Conversion des dates sans l'heure
      const stagStart = formatDate(item.periode_de);
      const stagEnd = formatDate(item.periode_a);

      // Logique de chevauchement des dates
      let matchDate = true;

      if (searchStart && searchEnd) {
        matchDate = !(stagEnd < searchStart || stagStart > searchEnd);
      } else if (searchStart) {
        matchDate = stagEnd >= searchStart;
      } else if (searchEnd) {
        matchDate = stagStart <= searchEnd;
      }

      const isMatch = hasSearch && matchName && matchType && matchDate;
      return { ...item, isMatch };
    })
    .sort((a, b) => {
      if (hasSearch) {
        return (b.isMatch ? 1 : 0) - (a.isMatch ? 1 : 0);
      }
      return 0;
    });

  // --- GESTION DES ACTIONS ---
  const handleOpenDetails = (item) => {
    setSelectedItem(item);
    setShowDetailsModal(true);
  };

  const handleOpenEdit = (item) => {
    setSelectedItem(item);
    setEditData({ ...item });
    setShowEditModal(true);
  };

  const handleSaveEdit = async () => {
    const endpoint = view === 'stagiaire' ? 'stagiaires' : 'encadreurs';
    
    // Validation
    if (!editData.nom || !editData.prenom) {
      alert("❌ Le nom et le prénom sont obligatoires");
      return;
    }

    if (view === 'encadreur' && !editData.email) {
      alert("❌ L'email est obligatoire");
      return;
    }

    try {
      const res = await fetch(
        `${API_URL}/${endpoint}/${editData.id}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(editData)
        }
      );
      
      const data = await res.json();
      
      if (res.ok) {
        alert("✅ Modification réussie !");
        setShowEditModal(false);
        setEditData(null);
        setSelectedItem(null);
        fetchData();
      } else {
        alert(`❌ ${data.error || "Erreur lors de la modification"}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur de connexion au serveur");
    }
  };

  // --- GESTION DES STAGIAIRES PAR ENCADRANT ---
  const handleOpenStagiaires = async (encadreur) => {
    setSelectedEncadreur(encadreur);
    try {
      const res = await fetch(`${API_URL}/encadreurs/${encadreur.id}/stagiaires`);
      if (res.ok) {
        const data = await res.json();
        setEncadreurStagiaires(data);
        setShowStagiairesModal(true);
      } else {
        alert("❌ Erreur lors du chargement des stagiaires");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur lors du chargement");
    }
  };

  const handleRetirerStagiaire = async (stagiaireId) => {
    if (!window.confirm('Retirer ce stagiaire de l\'encadrant ?')) return;
    
    try {
      const res = await fetch(
        `${API_URL}/encadreurs/${selectedEncadreur.id}/stagiaires/${stagiaireId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setEncadreurStagiaires(prev => prev.filter(s => s.id !== stagiaireId));
        alert("✅ Stagiaire retiré !");
        fetchData();
      } else {
        alert("❌ Erreur lors du retrait");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur de connexion");
    }
  };

  const handleAffecterStagiaire = async (stagiaireId) => {
    try {
      const res = await fetch(
        `${API_URL}/encadreurs/${selectedEncadreur.id}/stagiaires/${stagiaireId}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' }
        }
      );
      if (res.ok) {
        const stagiaire = stagiaires.find(s => s.id === stagiaireId);
        if (stagiaire) {
          setEncadreurStagiaires(prev => [...prev, stagiaire]);
        }
        alert('✅ Stagiaire affecté !');
        fetchData();
      } else {
        alert("❌ Erreur lors de l'affectation");
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur de connexion");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer cet élément ?')) return;
    
    const endpoint = view === 'stagiaire' ? 'stagiaires' : 'encadreurs';
    try {
      const res = await fetch(
        `${API_URL}/${endpoint}/${id}`,
        { method: 'DELETE' }
      );
      
      if (res.ok) {
        alert('✅ Supprimé avec succès !');
        fetchData();
      } else {
        const data = await res.json();
        alert(`❌ ${data.error || "Erreur lors de la suppression"}`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Erreur de connexion");
    }
  };

  // --- SOUMISSIONS DES FORMULAIRES ---
  const handleSubmitStagiaire = async (e) => {
    e.preventDefault();
    
    // Validation des dates
    if (formData.periode_de && formData.periode_a) {
      if (new Date(formData.periode_de) > new Date(formData.periode_a)) {
        alert("❌ La date de début doit être antérieure à la date de fin");
        return;
      }
    }
    
    console.log("📤 Envoi stagiaire:", formData);
    
    try {
      const res = await fetch(`${API_URL}/stagiaires`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      console.log("📥 Réponse serveur:", data);
      
      if (res.ok) {
        alert('✅ Stagiaire ajouté avec succès !');
        setShowAddModal(false);
        fetchData();
        // Réinitialiser le formulaire
        setFormData({
          nom: '',
          prenom: '',
          tel: '',
          institution: '',
          departement: '',
          type_stage: 'PFE',
          periode_de: '',
          periode_a: ''
        });
      } else {
        alert(`❌ ${data.error || "Erreur lors de l'ajout"}`);
      }
    } catch (err) {
      console.error("💥 Erreur complète:", err);
      alert("❌ Erreur de connexion au serveur");
    }
  };

  const handleAddEncadreur = async (e) => {
    e.preventDefault();
    
    // Validation côté client
    if (!formEncData.nom || !formEncData.prenom || !formEncData.poste || !formEncData.email) {
      alert("❌ Veuillez remplir tous les champs obligatoires");
      return;
    }

    // Validation format email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formEncData.email)) {
      alert("❌ Format d'email invalide");
      return;
    }

    console.log("📤 Envoi encadreur:", formEncData);
    
    try {
      const res = await fetch(`${API_URL}/encadreurs`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formEncData)
      });
      
      console.log("📥 Status de la réponse:", res.status);
      const data = await res.json();
      console.log("📥 Données reçues:", data);
      
      if (res.ok) {
        alert('✅ Encadrant ajouté avec succès !');
        setShowAddEncModal(false);
        fetchData();
        // Réinitialiser le formulaire
        setFormEncData({ nom: '', prenom: '', poste: '', email: '', tel: '' });
      } else {
        alert(`❌ ${data.error || "Erreur lors de l'ajout"}`);
      }
    } catch (err) {
      console.error("💥 Erreur complète:", err);
      alert("❌ Erreur de connexion au serveur. Vérifiez que le serveur est démarré.");
    }
  };

  // --- RÉINITIALISATION DES FILTRES ---
  const resetFilters = () => {
    setSearchName('');
    setSearchType('');
    setSearchStart('');
    setSearchEnd('');
  };

  // --- DÉCONNEXION ---
  const handleLogout = () => {
    if (window.confirm('Voulez-vous vraiment vous déconnecter ?')) {
      localStorage.removeItem('username');
      navigate('/');
    }
  };

  // --- GESTION FERMETURE MODALS ---
  const closeAllModals = () => {
    setShowAddModal(false);
    setShowAddEncModal(false);
    setShowDetailsModal(false);
    setShowEditModal(false);
    setShowStagiairesModal(false);
    setSelectedItem(null);
    setSelectedEncadreur(null);
    setEditData(null);
  };

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <img src="/image logo.png" alt="Logo" className="sidebar-logo" />
        <ul className="sidebar-menu">
          <button
            className={`menu-btn ${view === 'stagiaire' ? 'active' : ''}`}
            onClick={() => {
              setView('stagiaire');
              resetFilters();
            }}
          >
            📄 Stagiaire
          </button>
          <button
            className={`menu-btn ${view === 'encadreur' ? 'active' : ''}`}
            onClick={() => {
              setView('encadreur');
              resetFilters();
            }}
          >
            👨‍🏫 Encadrant
          </button>
        </ul>
      </aside>

      <div className="main-area">
        <nav className="top-navbar">
          <div className="search-bar-container"></div>

          <div className="user-profile-wrapper">
            <div className="nav-user-avatar">
              {currentUsername
                ? currentUsername.substring(0, 2).toUpperCase()
                : 'AD'}
            </div>

            <span className="username-text">
              {currentUsername || 'Admin'}
            </span>

            <button
              className="dots-menu-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
            >
              ⋮
            </button>
            {showMenu && (
              <div className="custom-dropdown-menu">
                <div
                  className="dropdown-item"
                  onClick={() => {
                    setShowMenu(false);
                    navigate('/modifier-compte');
                  }}
                >
                  ⚙️ Modifier le compte
                </div>
                <div 
                  className="dropdown-item" 
                  onClick={() => {
                    setShowMenu(false);
                    handleLogout();
                  }}
                >
                  ➔ Déconnexion
                </div>
              </div>
            )}
          </div>
        </nav>

        <section className="content-body">
          <div className="table-card">
            <div className="table-header">
              <h3>
                {view === 'stagiaire'
                  ? 'Liste des Stagiaires'
                  : 'Liste des Encadrants'}
              </h3>
              <button
                className="btn-add-new"
                onClick={() =>
                  view === 'stagiaire'
                    ? setShowAddModal(true)
                    : setShowAddEncModal(true)
                }
              >
                + Ajouter
              </button>
            </div>

            {view === 'stagiaire' && (
              <div className="search-filters">
                <div className="filter-group">
                  <label>Nom :</label>
                  <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Type de stage :</label>
                  <select
                    value={searchType}
                    onChange={(e) => setSearchType(e.target.value)}
                  >
                    <option value="">-- Tous --</option>
                    <option value="PFE">PFE</option>
                    <option value="PFA">PFA</option>
                    <option value="Affectation">Affectation</option>
                    <option value="observation">Stage d'observation</option>
                  </select>
                </div>

                <div className="filter-group">
                  <label>Début de stage :</label>
                  <input
                    type="date"
                    value={searchStart}
                    onChange={(e) => setSearchStart(e.target.value)}
                  />
                </div>

                <div className="filter-group">
                  <label>Fin de stage :</label>
                  <input
                    type="date"
                    value={searchEnd}
                    onChange={(e) => setSearchEnd(e.target.value)}
                  />
                </div>

                {hasSearch && (
                  <button
                    className="btn-reset-filters"
                    onClick={resetFilters}
                    title="Réinitialiser les filtres"
                  >
                    🔄 Réinitialiser
                  </button>
                )}
              </div>
            )}

            {view === 'encadreur' && (
              <div className="search-filters">
                <div className="filter-group">
                  <label>Nom :</label>
                  <input
                    type="text"
                    placeholder="Rechercher par nom..."
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
                  />
                </div>
                {hasSearch && (
                  <button
                    className="btn-reset-filters"
                    onClick={resetFilters}
                    title="Réinitialiser les filtres"
                  >
                    🔄 Réinitialiser
                  </button>
                )}
              </div>
            )}

            {hasSearch && (
              <div className="search-info">
                {filteredData.filter((item) => item.isMatch).length}{' '}
                résultat(s) trouvé(s)
              </div>
            )}

            <table className="custom-table">
              <thead>
                {view === 'stagiaire' ? (
                  <tr>
                    <th>Nom & Prénom</th>
                    <th>Type</th>
                    <th>Période</th>
                    <th className="text-center">Actions</th>
                  </tr>
                ) : (
                  <tr>
                    <th>Nom & Prénom</th>
                    <th>Poste</th>
                    <th>Email / Téléphone</th>
                    <th className="text-center">Actions</th>
                  </tr>
                )}
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                      ⏳ Chargement des données...
                    </td>
                  </tr>
                ) : filteredData.length === 0 ? (
                  <tr>
                    <td colSpan="4" style={{textAlign: 'center', padding: '20px'}}>
                      {hasSearch 
                        ? "🔍 Aucun résultat trouvé" 
                        : "📭 Aucune donnée disponible"}
                    </td>
                  </tr>
                ) : (
                  filteredData.map((item) => (
                    <tr
                      key={item.id}
                      className={item.isMatch ? 'highlight-row' : ''}
                    >
                      <td>
                        {item.nom} {item.prenom}
                      </td>
                      <td>
                        {view === 'stagiaire' ? item.type_stage : item.poste}
                      </td>
                      <td>
                        {view === 'stagiaire'
                          ? `${new Date(
                            item.periode_de
                          ).toLocaleDateString('fr-FR')}  ➜  ${new Date(
                            item.periode_a
                          ).toLocaleDateString('fr-FR')}`
                          : `${item.email || '---'} / ${item.tel || '---'}`}
                      </td>

                      <td className="actions-cell text-center">
                        {view === 'stagiaire' ? (
                          <button
                            title="Voir Détails"
                            className="action-btn view"
                            onClick={() => handleOpenDetails(item)}
                          >
                            👁️
                          </button>
                        ) : (
                          <button
                            title="Voir Stagiaires"
                            className="action-btn group"
                            onClick={() => handleOpenStagiaires(item)}
                          >
                            👥
                          </button>
                        )}
                        <button
                          title="Modifier"
                          className="action-btn edit"
                          onClick={() => handleOpenEdit(item)}
                        >
                          ✏️
                        </button>
                        <button
                          title="Supprimer"
                          className="action-btn delete"
                          onClick={() => handleDelete(item.id)}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* --- MODAL STAGIAIRES D'UN ENCADRANT --- */}
        {showStagiairesModal && selectedEncadreur && (
          <div className="modal-overlay-stagiaires" onClick={closeAllModals}>
            <div className="modal-content-stagiaires" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-stagiaires">
                <h3>
                  👥 Stagiaires de {selectedEncadreur.nom} {selectedEncadreur.prenom}
                </h3>
                <button className="modal-close-btn" onClick={closeAllModals}>
                  ✕
                </button>
              </div>

              <div className="modal-body-stagiaires">
                <div className="section-title">
                  <h4>📋 Stagiaires affectés ({encadreurStagiaires.length})</h4>
                </div>

                {encadreurStagiaires.length === 0 ? (
                  <div className="empty-message">
                    <p>Aucun stagiaire affecté à cet encadrant</p>
                  </div>
                ) : (
                  <div className="stagiaires-list">
                    {encadreurStagiaires.map((stagiaire) => (
                      <div key={stagiaire.id} className="stagiaire-card affecte">
                        <div className="stagiaire-info">
                          <div className="stagiaire-name">
                            <span className="avatar-small">{stagiaire.nom.charAt(0)}{stagiaire.prenom.charAt(0)}</span>
                            <div>
                              <strong>{stagiaire.nom} {stagiaire.prenom}</strong>
                              <span className="badge-type">{stagiaire.type_stage}</span>
                            </div>
                          </div>
                          <div className="stagiaire-period">
                            📅 {new Date(stagiaire.periode_de).toLocaleDateString('fr-FR')} ➜ {new Date(stagiaire.periode_a).toLocaleDateString('fr-FR')}
                          </div>
                        </div>

                        <button
                          className="btn-retirer-stagiaire"
                          onClick={() => handleRetirerStagiaire(stagiaire.id)}
                        >
                          ❌ Retirer
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="divider"></div>

                <div className="section-title">
                  <h4>➕ Affecter un nouveau stagiaire</h4>
                </div>

                {stagiaires.filter(s => !encadreurStagiaires.find(es => es.id === s.id)).length === 0 ? (
                  <div className="empty-message">
                    <p>Tous les stagiaires sont déjà affectés</p>
                  </div>
                ) : (
                  <div className="stagiaires-list">
                    {stagiaires
                      .filter(s => !encadreurStagiaires.find(es => es.id === s.id))
                      .map((stagiaire) => (
                        <div key={stagiaire.id} className="stagiaire-card disponible">
                          <div className="stagiaire-info">
                            <div className="stagiaire-name">
                              <span className="avatar-small disponible">
                                {stagiaire.nom.charAt(0)}{stagiaire.prenom.charAt(0)}
                              </span>
                              <div>
                                <strong>{stagiaire.nom} {stagiaire.prenom}</strong>
                                <span className="badge-type">{stagiaire.type_stage}</span>
                              </div>
                            </div>
                            <div className="stagiaire-period">
                              📅 {new Date(stagiaire.periode_de).toLocaleDateString('fr-FR')}
                              {' '} ➜ {' '}
                              {new Date(stagiaire.periode_a).toLocaleDateString('fr-FR')}
                            </div>
                          </div>
                          <button
                            className="btn-affecter-stagiaire"
                            onClick={() => handleAffecterStagiaire(stagiaire.id)}
                          >
                            ✓ Affecter
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              <div className="modal-footer-stagiaires">
                <button className="btn-fermer" onClick={closeAllModals}>
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL DÉTAILS --- */}
        {showDetailsModal && selectedItem && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-with-close">
                <h4>📑 Fiche Détails</h4>
                <button className="modal-close-btn" onClick={closeAllModals}>✕</button>
              </div>
              <div className="details-grid-full">
                <div className="detail-box">
                  <strong>Nom & Prénom:</strong> {selectedItem.nom}{' '}
                  {selectedItem.prenom}
                </div>
                <div className="detail-box">
                  <strong>Téléphone:</strong> {selectedItem.tel || '---'}
                </div>
                <div className="detail-box">
                  <strong>Institution:</strong> {selectedItem.institution || '---'}
                </div>
                <div className="detail-box">
                  <strong>Département:</strong>{' '}
                  {selectedItem.departement || '---'}
                </div>
                <div className="detail-box">
                  <strong>Type de Stage:</strong> {selectedItem.type_stage}
                </div>
                <div className="detail-box">
                  <strong>Période:</strong> Du{' '}
                  {new Date(selectedItem.periode_de).toLocaleDateString('fr-FR')} au{' '}
                  {new Date(selectedItem.periode_a).toLocaleDateString('fr-FR')}
                </div>
              </div>
              <div className="modal-actions">
                <button
                  className="btn-cancel"
                  onClick={closeAllModals}
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- MODAL MODIFICATION --- */}
        {showEditModal && editData && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-with-close">
                <h4>✏️ Modifier {view === 'stagiaire' ? 'Stagiaire' : 'Encadrant'}</h4>
                <button className="modal-close-btn" onClick={closeAllModals}>✕</button>
              </div>
              <form onSubmit={(e) => { e.preventDefault(); handleSaveEdit(); }}>
                <div className="form-grid">
                  <label>Nom *:</label>
                  <input
                    type="text"
                    placeholder="Nom"
                    required
                    value={editData.nom || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, nom: e.target.value })
                    }
                  />

                  <label>Prénom *:</label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    required
                    value={editData.prenom || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, prenom: e.target.value })
                    }
                  />

                  <label>Téléphone:</label>
                  <input
                    type="text"
                    placeholder="Téléphone"
                    value={editData.tel || ''}
                    onChange={(e) =>
                      setEditData({ ...editData, tel: e.target.value })
                    }
                  />

                  {view === 'stagiaire' ? (
                    <>
                      <label>Institution:</label>
                      <input
                        type="text"
                        placeholder="Institution"
                        value={editData.institution || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, institution: e.target.value })
                        }
                      />

                      <label>Département:</label>
                      <input
                        type="text"
                        placeholder="Département"
                        value={editData.departement || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, departement: e.target.value })
                        }
                      />

                      <label>Type de Stage *:</label>
                      <select
                        value={editData.type_stage || 'PFE'}
                        onChange={(e) =>
                          setEditData({ ...editData, type_stage: e.target.value })
                        }
                      >
                        <option value="PFE">PFE</option>
                        <option value="PFA">PFA</option>
                        <option value="Affectation">Affectation</option>
                        <option value="observation">
                          Stage d'observation
                        </option>
                      </select>

                      <label>Date début *:</label>
                      <input
                        type="date"
                        required
                        value={formatDate(editData.periode_de)}
                        onChange={(e) =>
                          setEditData({ ...editData, periode_de: e.target.value })
                        }
                      />

                      <label>Date fin *:</label>
                      <input
                        type="date"
                        required
                        value={formatDate(editData.periode_a)}
                        onChange={(e) =>
                          setEditData({ ...editData, periode_a: e.target.value })
                        }
                      />
                    </>
                  ) : (
                    <>
                      <label>Poste *:</label>
                      <input
                        type="text"
                        placeholder="Poste"
                        required
                        value={editData.poste || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, poste: e.target.value })
                        }
                      />

                      <label>Email *:</label>
                      <input
                        type="email"
                        placeholder="Email"
                        required
                        value={editData.email || ''}
                        onChange={(e) =>
                          setEditData({ ...editData, email: e.target.value })
                        }
                      />
                    </>
                  )}
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeAllModals}
                  >
                    Annuler
                  </button>

                  <button
                    type="submit"
                    className="btn-submit"
                  >
                    Sauvegarder
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL AJOUT STAGIAIRE --- */}
        {showAddModal && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-with-close">
                <h4>➕ Nouveau Stagiaire</h4>
                <button className="modal-close-btn" onClick={closeAllModals}>✕</button>
              </div>
              <form onSubmit={handleSubmitStagiaire}>
                <div className="form-grid">
                  <label>Nom *:</label>
                  <input
                    type="text"
                    placeholder="Nom"
                    required
                    value={formData.nom}
                    onChange={(e) =>
                      setFormData({ ...formData, nom: e.target.value })
                    }
                  />
                  <label>Prénom *:</label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    required
                    value={formData.prenom}
                    onChange={(e) =>
                      setFormData({ ...formData, prenom: e.target.value })
                    }
                  />
                  <label>Téléphone *:</label>
                  <input
                    type="text"
                    placeholder="Téléphone"
                    required
                    value={formData.tel}
                    onChange={(e) =>
                      setFormData({ ...formData, tel: e.target.value })
                    }
                  />
                  <label>Institution:</label>
                  <input
                    type="text"
                    placeholder="Institution"
                    value={formData.institution}
                    onChange={(e) =>
                      setFormData({ ...formData, institution: e.target.value })
                    }
                  />
                  <label>Département:</label>
                  <input
                    type="text"
                    placeholder="Département"
                    value={formData.departement}
                    onChange={(e) =>
                      setFormData({ ...formData, departement: e.target.value })
                    }
                  />
                  <label>Type de Stage *:</label>
                  <select
                    value={formData.type_stage}
                    onChange={(e) =>
                      setFormData({ ...formData, type_stage: e.target.value })
                    }
                  >
                    <option value="PFE">PFE</option>
                    <option value="PFA">PFA</option>
                    <option value="Affectation">Affectation</option>
                    <option value="observation">Stage d'observation</option>
                  </select>
                  <label>Date début *:</label>
                  <input
                    type="date"
                    required
                    value={formData.periode_de}
                    onChange={(e) =>
                      setFormData({ ...formData, periode_de: e.target.value })
                    }
                  />
                  <label>Date fin *:</label>
                  <input
                    type="date"
                    required
                    value={formData.periode_a}
                    onChange={(e) =>
                      setFormData({ ...formData, periode_a: e.target.value })
                    }
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeAllModals}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* --- MODAL AJOUT ENCADRANT --- */}
        {showAddEncModal && (
          <div className="modal-overlay" onClick={closeAllModals}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <div className="modal-header-with-close">
                <h4>➕ Nouvel Encadrant</h4>
                <button className="modal-close-btn" onClick={closeAllModals}>✕</button>
              </div>
              <form onSubmit={handleAddEncadreur}>
                <div className="form-grid">
                  <label>Nom *:</label>
                  <input
                    type="text"
                    placeholder="Nom"
                    required
                    value={formEncData.nom}
                    onChange={(e) =>
                      setFormEncData({ ...formEncData, nom: e.target.value })
                    }
                  />
                  <label>Prénom *:</label>
                  <input
                    type="text"
                    placeholder="Prénom"
                    required
                    value={formEncData.prenom}
                    onChange={(e) =>
                      setFormEncData({
                        ...formEncData,
                        prenom: e.target.value
                      })
                    }
                  />
                  <label>Poste *:</label>
                  <input
                    type="text"
                    placeholder="Poste"
                    required
                    value={formEncData.poste}
                    onChange={(e) =>
                      setFormEncData({ ...formEncData, poste: e.target.value })
                    }
                  />
                  <label>Email *:</label>
                  <input
                    type="email"
                    placeholder="Email"
                    required
                    value={formEncData.email}
                    onChange={(e) =>
                      setFormEncData({ ...formEncData, email: e.target.value })
                    }
                  />
                  <label>Téléphone:</label>
                  <input
                    type="text"
                    placeholder="Téléphone"
                    value={formEncData.tel}
                    onChange={(e) =>
                      setFormEncData({ ...formEncData, tel: e.target.value })
                    }
                  />
                </div>
                <div className="modal-actions">
                  <button
                    type="button"
                    className="btn-cancel"
                    onClick={closeAllModals}
                  >
                    Annuler
                  </button>
                  <button type="submit" className="btn-submit">
                    Enregistrer
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Home;