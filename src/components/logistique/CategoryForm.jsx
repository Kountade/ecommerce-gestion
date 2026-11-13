// src/components/stock/CategoryForm.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Save, X, FolderTree, RefreshCw, ArrowLeft,
  CheckCircle, AlertCircle, Trash2, Home,
  Tag, FileText
} from 'lucide-react';

const CategoryForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    parent: '',
    is_active: true
  });
  const [categories, setCategories] = useState([]);
  const [childrenCount, setChildrenCount] = useState(0);
  const [productsCount, setProductsCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [errors, setErrors] = useState({});
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });

  const showNotification = (message, type) => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 4000);
  };

  const getToken = () => localStorage.getItem('Token');

  // ✅ CORRECTION : gérer la réponse paginée { count, results: [...] }
  const extractList = (data) => {
    if (Array.isArray(data)) return data;
    if (data && Array.isArray(data.results)) return data.results;
    return [];
  };

  // Charger toutes les catégories (pour le select parent)
  const loadCategories = async () => {
    try {
      const token = getToken();
      // ✅ page_size élevé pour tout récupérer (compatible LargePagination.max_page_size = 5000)
      const response = await AxiosInstance.get('/categories/', {
        params: { page_size: 5000 },
        headers: { 'Authorization': `Token ${token}` }
      });
      setCategories(extractList(response.data));
    } catch (error) {
      console.error('Erreur chargement catégories:', error);
      if (error.response?.status === 401) {
        showNotification('Session expirée, veuillez vous reconnecter', 'error');
        setTimeout(() => navigate('/login'), 2000);
      }
    }
  };

  // Charger la catégorie à modifier
  const loadCategory = async () => {
    if (!isEditMode) {
      setFetching(false);
      return;
    }

    try {
      const token = getToken();
      const response = await AxiosInstance.get(`/categories/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      const category = response.data;
      setFormData({
        name: category.name || '',
        code: category.code || '',
        description: category.description || '',
        // ✅ CORRECTION : parent vient parfois comme objet, parfois comme id
        parent: category.parent
          ? (typeof category.parent === 'object' ? category.parent.id : category.parent)
          : '',
        is_active: category.is_active !== undefined ? category.is_active : true
      });

      // ✅ Compteurs exposés par CategorySerializer (si disponibles)
      setChildrenCount(category.children_count ?? 0);
      setProductsCount(category.products_count ?? 0);
    } catch (error) {
      console.error('Erreur chargement catégorie:', error);
      if (error.response?.status === 401) {
        showNotification('Session expirée', 'error');
        navigate('/login');
      } else if (error.response?.status === 404) {
        showNotification('Catégorie non trouvée', 'error');
        navigate('/categories');
      } else {
        showNotification('Impossible de charger la catégorie', 'error');
        navigate('/categories');
      }
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    const init = async () => {
      await loadCategories();
      await loadCategory();
    };
    init();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const generateCode = () => {
    const prefix = formData.name ? formData.name.substring(0, 3).toUpperCase() : 'CAT';
    const randomNum = Math.floor(Math.random() * 1000);
    const code = `${prefix}${randomNum}`;
    setFormData(prev => ({ ...prev, code }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Le nom est requis';
    }
    if (!formData.code.trim()) {
      newErrors.code = 'Le code est requis';
    }
    if (formData.code) {
      const existingCategory = categories.find(c =>
        c.code === formData.code && c.id !== parseInt(id)
      );
      if (existingCategory) {
        newErrors.code = 'Ce code existe déjà';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    setErrors({});
    try {
      const token = getToken();
      const dataToSend = {
        name: formData.name,
        code: formData.code,
        description: formData.description,
        is_active: formData.is_active,
        // ✅ CORRECTION : null explicite si pas de parent
        parent: formData.parent ? parseInt(formData.parent) : null
      };

      const headers = { 'Authorization': `Token ${token}` };

      if (isEditMode) {
        await AxiosInstance.patch(`/categories/${id}/`, dataToSend, { headers });
        showNotification('Catégorie modifiée avec succès', 'success');
      } else {
        await AxiosInstance.post('/categories/', dataToSend, { headers });
        showNotification('Catégorie créée avec succès', 'success');
      }

      setTimeout(() => navigate('/categories'), 1500);
    } catch (error) {
      console.error('Erreur:', error);
      if (error.response?.status === 401) {
        showNotification('Session expirée, veuillez vous reconnecter', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.response?.data) {
        // ✅ Gestion des erreurs Django (field + non_field_errors)
        const data = error.response.data;
        if (typeof data === 'object') {
          setErrors(data);
          const firstMsg =
            data.non_field_errors?.[0] ||
            data.detail ||
            Object.values(data).flat()?.[0] ||
            'Veuillez vérifier les champs';
          showNotification(firstMsg, 'error');
        } else {
          showNotification('Une erreur est survenue', 'error');
        }
      } else {
        showNotification('Une erreur est survenue', 'error');
      }
    } finally {
      setLoading(false);
    }
  };

  // ✅ NOUVEAU : suppression (inspirée de EntrepotForm)
  const handleDelete = async () => {
    try {
      const token = getToken();
      await AxiosInstance.delete(`/categories/${id}/`, {
        headers: { 'Authorization': `Token ${token}` }
      });
      showNotification('Catégorie supprimée avec succès', 'success');
      setTimeout(() => navigate('/categories'), 1500);
    } catch (error) {
      console.error('Erreur suppression:', error);
      if (error.response?.status === 400) {
        showNotification(
          error.response?.data?.detail ||
          error.response?.data?.error ||
          'Impossible de supprimer : catégorie liée à des produits ou sous-catégories',
          'error'
        );
      } else if (error.response?.status === 401) {
        showNotification('Session expirée', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showNotification('Erreur lors de la suppression', 'error');
      }
    }
    setShowDeleteModal(false);
  };

  // ✅ Catégories disponibles comme parent :
  //    - exclure soi-même
  //    - exclure les sous-catégories (pour éviter les cycles)
  const availableParents = categories.filter(cat => {
    if (isEditMode && cat.id === parseInt(id)) return false;

    // Récupérer l'id du parent (objet ou id selon le serializer)
    const parentId = cat.parent
      ? (typeof cat.parent === 'object' ? cat.parent.id : cat.parent)
      : null;

    // On n'affiche que les racines (pas de parent) — choix produit simple
    return !parentId;
  });

  if (fetching) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="text-center space-y-4">
          <div className="loading loading-spinner loading-lg text-primary w-12 h-12 sm:w-16 sm:h-16"></div>
          <p className="text-base sm:text-xl font-semibold text-base-content/70 animate-pulse">
            Chargement...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-gray-50">
      {/* Notification Toast */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50 animate-slideDown">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl rounded-xl`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Modal Suppression */}
      {showDeleteModal && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden">
            <div className="bg-error/10 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-error" />
              </div>
              <h3 className="text-xl font-bold text-error">Confirmer la suppression</h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600">Voulez-vous vraiment supprimer cette catégorie ?</p>
              <p className="font-semibold text-error mt-2">{formData.name}</p>
              {(productsCount > 0 || childrenCount > 0) && (
                <div className="text-warning text-sm mt-3 space-y-1">
                  {productsCount > 0 && <p>⚠️ {productsCount} produit(s) associé(s)</p>}
                  {childrenCount > 0 && <p>⚠️ {childrenCount} sous-catégorie(s)</p>}
                </div>
              )}
            </div>
            <div className="flex gap-3 p-4 bg-gray-50">
              <button className="btn btn-ghost flex-1" onClick={() => setShowDeleteModal(false)}>
                Annuler
              </button>
              <button className="btn btn-error flex-1 gap-2" onClick={handleDelete}>
                <Trash2 className="w-4 h-4" /> Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate('/categories')}
              className="btn btn-ghost btn-sm gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Retour
            </button>
            <div>
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-xl">
                  <FolderTree className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-gray-800">
                  {isEditMode ? 'Modifier' : 'Nouvelle'} catégorie
                </h1>
              </div>
              <p className="text-sm text-gray-500 mt-1">
                {isEditMode
                  ? 'Modifiez les informations de la catégorie'
                  : 'Créez une nouvelle catégorie de produits'}
              </p>
            </div>
          </div>
          {isEditMode && (
            <button
              onClick={() => setShowDeleteModal(true)}
              className="btn btn-error btn-sm gap-2"
            >
              <Trash2 className="w-4 h-4" /> Supprimer
            </button>
          )}
        </div>

        {/* Formulaire */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
          <form onSubmit={handleSubmit}>
            <div className="p-6 space-y-6">

              {/* Carte d'aperçu */}
              <div className="bg-gradient-to-r from-primary/5 to-transparent rounded-xl p-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-primary/20 flex items-center justify-center">
                    <FolderTree className="w-8 h-8 text-primary" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-500">Aperçu de la catégorie</p>
                    <p className="text-xl font-semibold text-primary">
                      {formData.name || 'Nom de la catégorie'}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.code ? `Code : ${formData.code}` : 'Code non défini'}
                      {formData.parent && availableParents.length > 0 && (() => {
                        const p = availableParents.find(c => c.id === parseInt(formData.parent));
                        return p ? ` • Parent : ${p.name}` : '';
                      })()}
                    </p>
                  </div>
                  <div className={`badge ${formData.is_active ? 'badge-success' : 'badge-ghost'} gap-1`}>
                    {formData.is_active ? 'Active' : 'Inactive'}
                  </div>
                </div>
              </div>

              {/* Informations générales */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control">
                  <label className="label text-sm font-medium text-gray-700">
                    Nom <span className="text-error">*</span>
                  </label>
                  <div className="relative">
                    <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className={`input input-bordered w-full pl-10 ${errors.name ? 'input-error' : ''}`}
                      placeholder="Ex: Électronique, Alimentation..."
                      autoFocus
                    />
                  </div>
                  {errors.name && (
                    <span className="text-error text-xs mt-1">
                      {Array.isArray(errors.name) ? errors.name[0] : errors.name}
                    </span>
                  )}
                </div>

                <div className="form-control">
                  <label className="label text-sm font-medium text-gray-700">
                    Code <span className="text-error">*</span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                      <input
                        type="text"
                        name="code"
                        value={formData.code}
                        onChange={handleChange}
                        className={`input input-bordered w-full pl-10 ${errors.code ? 'input-error' : ''}`}
                        placeholder="Ex: ELEC001"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={generateCode}
                      className="btn btn-outline gap-2"
                      title="Générer un code automatique"
                    >
                      <RefreshCw className="w-4 h-4" /> Auto
                    </button>
                  </div>
                  {errors.code && (
                    <span className="text-error text-xs mt-1">
                      {Array.isArray(errors.code) ? errors.code[0] : errors.code}
                    </span>
                  )}
                </div>
              </div>

              {/* Hiérarchie */}
              <div className="border-t pt-5">
                <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <Home className="w-4 h-4 text-primary" /> Hiérarchie
                </h3>
                <div className="form-control">
                  <label className="label text-sm font-medium text-gray-700">
                    Catégorie parente
                  </label>
                  <select
                    name="parent"
                    value={formData.parent}
                    onChange={handleChange}
                    className="select select-bordered w-full"
                  >
                    <option value="">Aucune (catégorie racine)</option>
                    {availableParents.map(cat => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name} ({cat.code})
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-400 mt-1">
                    Laissez vide pour créer une catégorie de premier niveau
                  </p>
                </div>
              </div>

              {/* Description */}
              <div className="border-t pt-5">
                <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-primary" /> Description
                </h3>
                <div className="form-control">
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="textarea textarea-bordered w-full"
                    rows="4"
                    placeholder="Description détaillée de la catégorie..."
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Optionnel — Une description claire aide à organiser les produits
                  </p>
                </div>
              </div>

              {/* Statut */}
              <div className="border-t pt-5">
                <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" /> Statut
                </h3>
                <div className="form-control">
                  <label className="label cursor-pointer justify-start gap-3">
                    <input
                      type="checkbox"
                      name="is_active"
                      checked={formData.is_active}
                      onChange={handleChange}
                      className="toggle toggle-primary"
                    />
                    <span className="text-sm font-medium">
                      {formData.is_active ? 'Catégorie active' : 'Catégorie inactive'}
                    </span>
                  </label>
                  <p className="text-xs text-gray-400 ml-14">
                    {formData.is_active
                      ? 'Les produits de cette catégorie seront visibles sur le site'
                      : 'Cette catégorie et ses produits seront masqués'}
                  </p>
                </div>
              </div>

              {/* Statistiques (édition) */}
              {isEditMode && (
                <div className="border-t pt-5">
                  <h3 className="text-md font-semibold mb-4 flex items-center gap-2">
                    <FolderTree className="w-4 h-4 text-primary" /> Contenu de la catégorie
                  </h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="stat bg-base-200 rounded-xl p-4">
                      <div className="stat-title text-xs">Produits associés</div>
                      <div className="stat-value text-2xl text-primary">{productsCount}</div>
                      <div className="stat-desc text-xs">Produits dans cette catégorie</div>
                    </div>
                    <div className="stat bg-base-200 rounded-xl p-4">
                      <div className="stat-title text-xs">Sous-catégories</div>
                      <div className="stat-value text-2xl text-secondary">{childrenCount}</div>
                      <div className="stat-desc text-xs">Catégories enfants</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t">
              <button
                type="button"
                onClick={() => navigate('/categories')}
                className="btn btn-ghost gap-2 px-6"
                disabled={loading}
              >
                <X className="w-4 h-4" /> Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary gap-2 px-8 min-w-[140px]"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="loading loading-spinner loading-sm"></span>
                    {isEditMode ? 'Modification...' : 'Création...'}
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" /> {isEditMode ? 'Enregistrer' : 'Créer'}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Info box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div className="flex items-start gap-3">
            <div className="p-1 bg-blue-100 rounded-lg">
              <AlertCircle className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-blue-800">Information</p>
              <p className="text-xs text-blue-600 mt-1">
                La modification d'une catégorie peut affecter l'organisation de vos produits.
                Les sous-catégories et produits associés seront automatiquement mis à jour.
                Une catégorie inactive ne sera pas visible sur le site e-commerce.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryForm;