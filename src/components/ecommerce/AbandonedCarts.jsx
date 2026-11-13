// src/components/ecommerce/AbandonedCarts.jsx
// ============================================================
// Paniers Abandonnés - ALIGNÉ SUR LE STANDARD EcommerceOrders
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Search, ShoppingCart, Package, RefreshCw, X,
  CheckCircle, AlertCircle, AlertTriangle, Eye, Filter,
  ChevronLeft, ChevronRight, Calendar, CreditCard, Truck,
  Loader2, Ban, Clock, TrendingUp, Mail, Trash2, Send
} from 'lucide-react';

// ============================================================
// HELPERS
// ============================================================
const formatDateTime = (date) => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return '-'; }
};

const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0 FCFA';
  const num = typeof amount === 'string' ? parseFloat(amount) : amount;
  if (isNaN(num)) return '0 FCFA';
  return `${num.toLocaleString('fr-FR')} FCFA`;
};

// ============================================================
// COMPOSANT
// ============================================================
const AbandonedCarts = () => {
  const navigate = useNavigate();

  // --- Data ---
  const [carts, setCarts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [stats, setStats] = useState({
    total: 0, total_amount: 0, by_status: {},
  });

  // --- Pagination serveur ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Filtres ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // --- Notification ---
  const [notification, setNotification] = useState({
    show: false, message: '', type: 'success',
  });

  // --- Actions ---
  const [actionLoading, setActionLoading] = useState(false);
  const [sendingId, setSendingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
  };

  const getToken = () => localStorage.getItem('Token');

  // ============================================================
  // CHARGEMENT DES PANIERS
  // ============================================================
  const fetchCarts = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const token = getToken();
      if (!token) {
        showNotification('Session expirée', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const params = new URLSearchParams();
      params.append('page', page);
      params.append('page_size', itemsPerPage);

      if (statusFilter !== 'all') params.append('status', statusFilter);
      if (searchTerm) params.append('search', searchTerm);

      const url = `/ecommerce-admin/abandoned-carts/?${params.toString()}`;
      console.log('🔍 fetchCarts:', url);

      const response = await AxiosInstance.get(url, {
        headers: { Authorization: `Token ${token}` },
      });

      const data = response.data;
      let results = [];
      let count = 0;

      if (Array.isArray(data)) {
        results = data;
        count = data.length;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.results)) results = data.results;
        count = typeof data.count === 'number' ? data.count : results.length;
      }

      setCarts(results);
      setTotalCount(count);
      setTotalPages(count > 0 ? Math.ceil(count / itemsPerPage) : 1);

      // Stats locales
      const totalAmount = results.reduce(
        (sum, c) => sum + parseFloat(c.total_value || 0), 0
      );

      setStats({
        total: count,
        total_amount: totalAmount,
      });

      setIsFirstLoad(false);
    } catch (error) {
      console.error('❌ Erreur fetchCarts:', error);
      if (error.response?.status === 401) {
        showNotification('Session expirée', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showNotification('Erreur de chargement', 'error');
      }
      setCarts([]);
      setTotalCount(0);
      setTotalPages(1);
      setIsFirstLoad(false);
    } finally {
      setLoading(false);
    }
  }, [statusFilter, searchTerm, itemsPerPage, navigate]);

  // ============================================================
  // EFFET DE CHARGEMENT
  // ============================================================
  useEffect(() => {
    fetchCarts(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, searchTerm, itemsPerPage, currentPage]);

  // ============================================================
  // ACTIONS
  // ============================================================
  const handleSendReminder = async (id) => {
    setSendingId(id);
    try {
      const token = getToken();
      await AxiosInstance.post(
        `/ecommerce-admin/abandoned-carts/${id}/send-reminder/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      showNotification('Email de relance envoyé avec succès', 'success');
      fetchCarts(currentPage);
    } catch (error) {
      console.error('Erreur envoi relance:', error);
      showNotification('Erreur lors de l\'envoi de l\'email', 'error');
    } finally {
      setSendingId(null);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Voulez-vous vraiment supprimer ce panier abandonné ?')) return;
    setDeletingId(id);
    try {
      const token = getToken();
      await AxiosInstance.delete(
        `/ecommerce-admin/abandoned-carts/${id}/`,
        { headers: { Authorization: `Token ${token}` } }
      );
      showNotification('Panier supprimé avec succès', 'success');
      fetchCarts(currentPage);
    } catch (error) {
      console.error('Erreur suppression:', error);
      showNotification('Erreur lors de la suppression', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // ============================================================
  // RENDU
  // ============================================================
  if (loading && isFirstLoad) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-base font-medium text-gray-500">
            Chargement des paniers abandonnés...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">
      {/* Notification */}
      {notification.show && (
        <div className="fixed top-20 right-4 z-50 animate-slideDown">
          <div
            className={`alert ${
              notification.type === 'success'
                ? 'alert-success'
                : notification.type === 'warning'
                ? 'alert-warning'
                : 'alert-error'
            } shadow-xl rounded-xl`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : notification.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification({ ...notification, show: false })}
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-r from-warning/10 via-warning/5 to-transparent rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-warning/10 rounded-xl">
                <ShoppingCart className="w-7 h-7 text-warning" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-warning">
                Paniers Abandonnés
              </h1>
              {loading && !isFirstLoad && (
                <Loader2 className="w-5 h-5 text-warning animate-spin ml-2" />
              )}
            </div>
            <p className="text-sm text-gray-500 ml-1">
              Clients ayant ajouté des articles sans finaliser
              {totalCount > 0 && ` • ${totalCount.toLocaleString('fr-FR')} panier(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchCarts(currentPage)}
              className="btn btn-sm sm:btn-md btn-outline gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={() => navigate('/ecommerce/dashboard')}
              className="btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-primary/80 text-white border-none shadow-lg gap-2"
            >
              <TrendingUp className="w-4 h-4" /> Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      {stats && stats.total > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white shadow-md rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total Paniers</p>
                <p className="text-xl font-bold text-warning">{stats.total || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-warning/20" />
            </div>
          </div>
          <div className="bg-white shadow-md rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Valeur Potentielle</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-success/20" />
            </div>
          </div>
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par client ou email..."
              className="input input-bordered w-full pl-9"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-outline btn-sm sm:hidden gap-2"
          >
            <Filter className="w-4 h-4" /> {showFilters ? 'Masquer' : 'Filtres'}
          </button>
          <div
            className={`${showFilters ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 gap-3`}
          >
            <select
              className="select select-bordered w-full"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="pending">En attente</option>
              <option value="reminded">Relancé</option>
              <option value="expired">Expiré</option>
            </select>
          </div>
        </div>
      </div>

      {/* Tableau */}
      <div className="bg-white rounded-xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4">Client / Email</th>
                <th className="py-3 px-4">Articles</th>
                <th className="py-3 px-4 hidden lg:table-cell">Dernière activité</th>
                <th className="py-3 px-4 text-right">Valeur Panier</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !isFirstLoad &&
                Array.from({ length: Math.min(itemsPerPage, 5) }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-40 bg-gray-200 rounded"></div></td>
                    <td className="py-3 px-4 hidden lg:table-cell"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="py-3 px-4 text-right"><div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div></td>
                    <td className="py-3 px-4 text-center"><div className="w-8 h-8 bg-gray-200 rounded-full mx-auto"></div></td>
                  </tr>
                ))}

              {!loading && carts.length === 0 && (
                <tr>
                  <td colSpan="5" className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart className="w-16 h-16 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        Aucun panier abandonné trouvé
                      </p>
                      <button
                        onClick={() => navigate('/ecommerce/dashboard')}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <TrendingUp className="w-4 h-4" /> Voir le dashboard
                      </button>
                    </div>
                  </td>
                </tr>
              )}

              {!loading && carts.map((cart) => (
                <tr key={cart.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-medium text-sm">
                      {cart.client_name || 'Visiteur anonyme'}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <Mail className="w-3 h-3" />
                      {cart.client_email || 'Non connecté'}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex flex-col gap-1">
                      {cart.items?.slice(0, 2).map((item, idx) => (
                        <div key={idx} className="text-xs text-gray-600 truncate max-w-[200px]">
                          <span className="font-semibold text-gray-800">{item.quantity}x</span> {item.product_name}
                        </div>
                      ))}
                      {cart.items?.length > 2 && (
                        <div className="text-xs text-gray-400 italic">
                          + {cart.items.length - 2} autre(s) article(s)
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Clock className="w-3 h-3 text-gray-400" />
                      {formatDateTime(cart.last_activity)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-primary">
                    {formatCurrency(cart.total_value)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-1 flex-wrap">
                      <button
                        onClick={() => handleSendReminder(cart.id)}
                        className="btn btn-ghost btn-sm btn-circle tooltip text-primary"
                        data-tip="Envoyer un email de relance"
                        disabled={sendingId === cart.id}
                      >
                        {sendingId === cart.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4" />
                        )}
                      </button>

                      <button
                        onClick={() => handleDelete(cart.id)}
                        className="btn btn-ghost btn-sm btn-circle tooltip text-error"
                        data-tip="Supprimer"
                        disabled={deletingId === cart.id}
                      >
                        {deletingId === cart.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Trash2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalCount > 0 && (
          <div className="px-6 py-4 border-t flex flex-col sm:flex-row items-center justify-between gap-4 bg-gray-50">
            <div className="text-sm text-gray-500">
              Affichage de{' '}
              {Math.min((currentPage - 1) * itemsPerPage + 1, totalCount)} à{' '}
              {Math.min(currentPage * itemsPerPage, totalCount)} sur{' '}
              {totalCount.toLocaleString('fr-FR')}
            </div>
            <div className="flex items-center gap-3">
              <select
                className="select select-bordered select-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(parseInt(e.target.value));
                  setCurrentPage(1);
                }}
              >
                <option value="20">20 lignes</option>
                <option value="50">50 lignes</option>
                <option value="100">100 lignes</option>
              </select>
              <div className="join">
                <button
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1 || loading}
                >
                  «
                </button>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1 || loading}
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <span className="join-item btn btn-sm btn-disabled">
                  Page {currentPage} / {Math.max(totalPages, 1)}
                </span>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages || loading}
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  className="join-item btn btn-sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages || loading}
                >
                  »
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AbandonedCarts;