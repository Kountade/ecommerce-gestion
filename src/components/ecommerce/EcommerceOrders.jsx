// src/components/ecommerce/EcommerceOrders.jsx
// ============================================================
// Commandes en ligne - SANS FILTRES DE DATE
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  Search, ShoppingCart, Package, RefreshCw, X,
  CheckCircle, AlertCircle, AlertTriangle, Eye, Filter,
  ChevronLeft, ChevronRight, Calendar, CreditCard, Truck,
  Loader2, Printer, Ban, Clock, TrendingUp,
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
const EcommerceOrders = () => {
  const navigate = useNavigate();

  // --- Data ---
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [stats, setStats] = useState({
    total: 0, total_amount: 0, by_status: {}, by_payment_status: {},
  });

  // --- Pagination serveur ---
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // --- Filtres ---
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // --- Notification ---
  const [notification, setNotification] = useState({
    show: false, message: '', type: 'success',
  });

  // --- Actions ---
  const [actionLoading, setActionLoading] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  // ============================================================
  // NOTIFICATIONS
  // ============================================================
  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
  };

  const getToken = () => localStorage.getItem('Token');

  // ============================================================
  // CHARGEMENT DES COMMANDES
  // ============================================================
  const fetchOrders = useCallback(async (page = 1) => {
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
      if (paymentFilter !== 'all') params.append('payment_status', paymentFilter);
      if (searchTerm) params.append('search', searchTerm);

      // ✅ NOUVELLE URL (sans le préfixe "admin" qui causait le bug)
      const url = `/ecommerce-admin/orders/?${params.toString()}`;
      console.log('🔍 fetchOrders:', url);

      const response = await AxiosInstance.get(url, {
        headers: { Authorization: `Token ${token}` },
      });

      const data = response.data;
      console.log('✅ Réponse API:', data);

      let results = [];
      let count = 0;

      if (Array.isArray(data)) {
        results = data;
        count = data.length;
      } else if (data && typeof data === 'object') {
        if (Array.isArray(data.results)) results = data.results;
        count = typeof data.count === 'number' ? data.count : results.length;
      }

      setOrders(results);
      setTotalCount(count);
      setTotalPages(count > 0 ? Math.ceil(count / itemsPerPage) : 1);

      // Stats locales
      const byStatus = results.reduce((acc, o) => {
        acc[o.status] = (acc[o.status] || 0) + 1;
        return acc;
      }, {});
      const byPayment = results.reduce((acc, o) => {
        acc[o.payment_status] = (acc[o.payment_status] || 0) + 1;
        return acc;
      }, {});
      const totalAmount = results.reduce(
        (sum, o) => sum + parseFloat(o.total || 0), 0
      );

      setStats({
        total: count,
        total_amount: totalAmount,
        by_status: byStatus,
        by_payment_status: byPayment,
      });

      setIsFirstLoad(false);
    } catch (error) {
      console.error('❌ Erreur fetchOrders:', error);
      if (error.response?.status === 401) {
        showNotification('Session expirée', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else {
        showNotification('Erreur de chargement', 'error');
      }
      setOrders([]);
      setTotalCount(0);
      setTotalPages(1);
      setIsFirstLoad(false);
    } finally {
      setLoading(false);
    }
  }, [
    statusFilter, paymentFilter, searchTerm, itemsPerPage, navigate,
  ]);

  // ============================================================
  // EFFET DE CHARGEMENT
  // ============================================================
  useEffect(() => {
    fetchOrders(currentPage);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    statusFilter, paymentFilter, searchTerm,
    itemsPerPage, currentPage
  ]);

  // ============================================================
  // ACTIONS
  // ============================================================
  const handleAction = async (id, action, label) => {
    if (!window.confirm(`Confirmer l'action : ${label} ?`)) return;
    setActionLoading(true);
    try {
      const token = getToken();
      
      // ✅ NOUVELLE URL POUR LES ACTIONS (sans le préfixe "admin")
      await AxiosInstance.post(
        `/ecommerce-admin/orders/${id}/${action}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      
      showNotification(`Commande ${label.toLowerCase()} avec succès`, 'success');
      fetchOrders(currentPage);
    } catch (error) {
      console.error(`Erreur ${action}:`, error);
      showNotification(
        error.response?.data?.error || `Erreur "${label}"`,
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  const handlePrintTicket = async (order) => {
    setPrintingId(order.id);
    try {
      navigate(`/ventes/${order.id}/pdf`);
      showNotification('Ouverture du ticket...', 'success');
    } catch (error) {
      showNotification('Erreur impression', 'error');
    } finally {
      setPrintingId(null);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // ============================================================
  // BADGES
  // ============================================================
  const getStatusBadge = (status) => {
    const configs = {
      draft: { label: 'En attente', className: 'badge-warning', icon: Clock },
      confirmed: { label: 'Confirmée', className: 'badge-info', icon: CheckCircle },
      paid: { label: 'Payée', className: 'badge-success', icon: CreditCard },
      delivered: { label: 'Livrée', className: 'badge-primary', icon: Truck },
      cancelled: { label: 'Annulée', className: 'badge-error', icon: Ban },
      returned: { label: 'Retournée', className: 'badge-warning', icon: Ban },
    };
    const cfg = configs[status] || { label: status, className: 'badge-ghost', icon: Package };
    const Icon = cfg.icon;
    return (
      <span className={`badge ${cfg.className} gap-1`}>
        <Icon className="w-3 h-3" /> {cfg.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const configs = {
      paid: { label: 'Payé', className: 'badge-success' },
      partial: { label: 'Partiel', className: 'badge-warning' },
      pending: { label: 'En attente', className: 'badge-error' },
    };
    const cfg = configs[status] || { label: status, className: 'badge-ghost' };
    return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
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
            Chargement des commandes en ligne...
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
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-xl">
                <ShoppingCart className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary">
                Commandes en ligne
              </h1>
              {loading && !isFirstLoad && (
                <Loader2 className="w-5 h-5 text-primary animate-spin ml-2" />
              )}
            </div>
            <p className="text-sm text-gray-500 ml-1">
              Toutes les commandes en ligne
              {totalCount > 0 && ` • ${totalCount.toLocaleString('fr-FR')} commande(s)`}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => fetchOrders(currentPage)}
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
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">
          <div className="bg-white shadow-md rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-primary">{stats.total || 0}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-primary/20" />
            </div>
          </div>
          <div className="bg-white shadow-md rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Montant</p>
                <p className="text-xl font-bold text-success">
                  {formatCurrency(stats.total_amount)}
                </p>
              </div>
              <CreditCard className="w-8 h-8 text-success/20" />
            </div>
          </div>
          {stats.by_status &&
            Object.entries(stats.by_status)
              .filter(([_, count]) => count > 0)
              .map(([status, count]) => (
                <div key={status} className="bg-white shadow-md rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-gray-500">
                        {status === 'draft'
                          ? 'En attente'
                          : status === 'confirmed'
                          ? 'Confirmées'
                          : status === 'paid'
                          ? 'Payées'
                          : status === 'delivered'
                          ? 'Livrées'
                          : status === 'cancelled'
                          ? 'Annulées'
                          : 'Retournées'}
                      </p>
                      <p className="text-xl font-bold">{count}</p>
                    </div>
                    <span className="badge badge-ghost">{count}</span>
                  </div>
                </div>
              ))}
        </div>
      )}

      {/* Filtres */}
      <div className="bg-white rounded-xl shadow-md p-4">
        <div className="flex flex-col gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Rechercher par numéro de commande ou client..."
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
              <option value="draft">En attente</option>
              <option value="confirmed">Confirmées</option>
              <option value="paid">Payées</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
            </select>
            <select
              className="select select-bordered w-full"
              value={paymentFilter}
              onChange={(e) => {
                setPaymentFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les paiements</option>
              <option value="paid">Payé</option>
              <option value="partial">Partiel</option>
              <option value="pending">En attente</option>
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
                <th className="py-3 px-4">N° Commande</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4 hidden lg:table-cell">Date</th>
                <th className="py-3 px-4 text-right">Total</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Paiement</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && !isFirstLoad &&
                Array.from({ length: Math.min(itemsPerPage, 5) }).map((_, i) => (
                  <tr key={`skeleton-${i}`} className="animate-pulse">
                    <td className="py-3 px-4"><div className="h-4 w-24 bg-gray-200 rounded"></div></td>
                    <td className="py-3 px-4"><div className="h-4 w-32 bg-gray-200 rounded"></div></td>
                    <td className="py-3 px-4 hidden lg:table-cell"><div className="h-4 w-20 bg-gray-200 rounded"></div></td>
                    <td className="py-3 px-4 text-right"><div className="h-4 w-20 bg-gray-200 rounded ml-auto"></div></td>
                    <td className="py-3 px-4 text-center"><div className="h-6 w-20 bg-gray-200 rounded mx-auto"></div></td>
                    <td className="py-3 px-4 text-center"><div className="h-6 w-16 bg-gray-200 rounded mx-auto"></div></td>
                    <td className="py-3 px-4 text-center"><div className="w-8 h-8 bg-gray-200 rounded-full mx-auto"></div></td>
                  </tr>
                ))}

              {!loading && orders.length === 0 && (
                <tr>
                  <td colSpan="7" className="text-center py-16">
                    <div className="flex flex-col items-center gap-3">
                      <ShoppingCart className="w-16 h-16 text-gray-300" />
                      <p className="text-gray-500 font-medium">
                        Aucune commande en ligne trouvée
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

              {!loading && orders.map((order) => (
                <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <button
                      onClick={() => navigate(`/ecommerce/commandes/${order.id}`)}
                      className="font-mono font-semibold text-primary hover:underline"
                    >
                      {order.invoice_number}
                    </button>
                  </td>
                  <td className="py-3 px-4 font-medium">
                    {order.client_name || 'Client anonyme'}
                  </td>
                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDateTime(order.sale_date)}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-semibold text-primary">
                    {formatCurrency(order.total)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(order.status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    {getPaymentBadge(order.payment_status)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex justify-center gap-1 flex-wrap">
                      <button
                        onClick={() => navigate(`/ecommerce/commandes/${order.id}`)}
                        className="btn btn-ghost btn-sm btn-circle tooltip text-primary"
                        data-tip="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {order.status === 'draft' && (
                        <>
                          <button
                            onClick={() => handleAction(order.id, 'confirm', 'Confirmer')}
                            className="btn btn-ghost btn-sm btn-circle tooltip text-success"
                            data-tip="Confirmer"
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <CheckCircle className="w-4 h-4" />
                            )}
                          </button>
                          <button
                            onClick={() => handleAction(order.id, 'cancel', 'Annuler')}
                            className="btn btn-ghost btn-sm btn-circle tooltip text-error"
                            data-tip="Annuler"
                            disabled={actionLoading}
                          >
                            {actionLoading ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Ban className="w-4 h-4" />
                            )}
                          </button>
                        </>
                      )}

                      {order.status === 'confirmed' && (
                        <button
                          onClick={() => handleAction(order.id, 'deliver', 'Marquer livrée')}
                          className="btn btn-ghost btn-sm btn-circle tooltip text-info"
                          data-tip="Marquer livrée"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Truck className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      <button
                        className="btn btn-ghost btn-sm btn-circle tooltip text-primary"
                        data-tip="Imprimer"
                        onClick={() => handlePrintTicket(order)}
                        disabled={printingId === order.id}
                      >
                        {printingId === order.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination serveur */}
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
                <option value="200">200 lignes</option>
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

export default EcommerceOrders;