
import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import TicketPOS from '../ventesclients/TicketPOS';
import {
  Plus, Edit, Trash2, Search, ShoppingCart,
  RefreshCw, X, CheckCircle, AlertCircle,
  Eye, Filter, ChevronLeft, ChevronRight,
  Calendar, CreditCard, Truck,
  AlertTriangle, Loader2, Printer, Ban
} from 'lucide-react';

const VentesList = () => {
  const navigate = useNavigate();

  const [ventes, setVentes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(50);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [venteToDelete, setVenteToDelete] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  const [notification, setNotification] = useState({
    show: false,
    message: '',
    type: 'success'
  });

  const [actionLoading, setActionLoading] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  const [stats, setStats] = useState({
    total: 0,
    total_amount: 0,
    by_status: {},
    by_payment_status: {}
  });

  const [viewMode, setViewMode] = useState('today');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [rangeReady, setRangeReady] = useState(false);

  // ============================================================
  // FORMATAGE
  // ============================================================

  const formatDate = (date) => {
    if (!date) return '-';

    try {
      const d = typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)
        ? new Date(`${date}T00:00:00`)
        : new Date(date);

      if (isNaN(d.getTime())) return '-';

      return d.toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '-';
    }
  };

  const formatDateInput = (date) => {
    if (!date) return '';

    try {
      if (typeof date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return date;
      }

      const d = new Date(date);
      if (isNaN(d.getTime())) return '';

      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');

      return `${year}-${month}-${day}`;
    } catch {
      return '';
    }
  };

  const formatCurrency = (amount) => {
    const num = Number(amount);

    if (!Number.isFinite(num)) return '0 FCFA';

    return `${num.toLocaleString('fr-FR')} FCFA`;
  };

  const getToken = () => localStorage.getItem('Token');

  const showNotification = (message, type = 'success') => {
    setNotification({
      show: true,
      message,
      type
    });
  };

  useEffect(() => {
    if (!notification.show) return;

    const timer = setTimeout(() => {
      setNotification(prev => ({
        ...prev,
        show: false
      }));
    }, 3000);

    return () => clearTimeout(timer);
  }, [notification]);

  // ============================================================
  // CHARGEMENT DES VENTES
  // ============================================================

  const fetchVentes = useCallback(async (page = 1) => {
    setLoading(true);

    try {
      const token = getToken();

      if (!token) {
        showNotification('Session expirée', 'error');
        navigate('/login');
        return;
      }

      const params = new URLSearchParams();

      params.append('page', page);
      params.append('page_size', itemsPerPage);

      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }

      if (paymentFilter !== 'all') {
        params.append('payment_status', paymentFilter);
      }

      if (searchTerm.trim()) {
        params.append('search', searchTerm.trim());
      }

      let url;

      if (viewMode === 'today') {
        params.append('date', formatDateInput(selectedDate));
        url = `/ventes/by-date/?${params.toString()}`;
      } else if (viewMode === 'range') {
        if (!dateFrom || !dateTo) return;

        params.append('date_from', dateFrom);
        params.append('date_to', dateTo);

        url = `/ventes/date-range/?${params.toString()}`;
      } else {
        url = `/ventes/?${params.toString()}`;
      }

      const response = await AxiosInstance.get(url, {
        headers: {
          Authorization: `Token ${token}`
        }
      });

      const data = response.data;

      let results = [];
      let count = 0;

      if (Array.isArray(data)) {
        results = data;
        count = data.length;
      } else if (data && typeof data === 'object') {
        results = Array.isArray(data.results) ? data.results : [];
        count = typeof data.count === 'number'
          ? data.count
          : results.length;
      }

      setVentes(results);
      setTotalCount(count);

      const pages = Math.max(1, Math.ceil(count / itemsPerPage));
      setTotalPages(pages);

      if (data?.stats) {
        setStats(data.stats);
      } else {
        setStats({
          total: count,
          total_amount: 0,
          by_status: {},
          by_payment_status: {}
        });
      }

      setIsFirstLoad(false);

    } catch (error) {
      console.error('Erreur fetchVentes:', error);

      if (error.response?.status === 401) {
        showNotification('Session expirée', 'error');
        navigate('/login');
      } else {
        showNotification('Erreur de chargement des ventes', 'error');
      }

      setVentes([]);
      setTotalCount(0);
      setTotalPages(1);
      setIsFirstLoad(false);

    } finally {
      setLoading(false);
    }
  }, [
    viewMode,
    selectedDate,
    dateFrom,
    dateTo,
    statusFilter,
    paymentFilter,
    searchTerm,
    itemsPerPage,
    navigate
  ]);

  // ============================================================
  // EFFET DE CHARGEMENT
  // ============================================================

  useEffect(() => {
    if (viewMode === 'range' && (!dateFrom || !dateTo || !rangeReady)) {
      return;
    }

    fetchVentes(currentPage);
  }, [
    viewMode,
    selectedDate,
    dateFrom,
    dateTo,
    statusFilter,
    paymentFilter,
    searchTerm,
    itemsPerPage,
    currentPage,
    rangeReady,
    fetchVentes
  ]);

  // ============================================================
  // NAVIGATION DES JOURS
  // ============================================================

  const goToPreviousDay = () => {
    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() - 1);
      return newDate;
    });

    setCurrentPage(1);
  };

  const goToNextDay = () => {
    const today = new Date();

    setSelectedDate(prev => {
      const newDate = new Date(prev);
      newDate.setDate(newDate.getDate() + 1);

      return newDate > today ? prev : newDate;
    });

    setCurrentPage(1);
  };

  const goToToday = () => {
    setSelectedDate(new Date());
    setViewMode('today');
    setCurrentPage(1);
    setRangeReady(false);
  };

  const handleModeChange = (mode) => {
    setViewMode(mode);
    setCurrentPage(1);

    if (mode === 'range') {
      setRangeReady(false);
    } else {
      setRangeReady(false);
    }
  };

  // ============================================================
  // RECHERCHE PAR PLAGE DE DATES
  // ============================================================

  const handleDateRangeSearch = () => {
    if (!dateFrom || !dateTo) {
      showNotification(
        'Veuillez sélectionner une plage de dates',
        'warning'
      );
      return;
    }

    if (dateTo < dateFrom) {
      showNotification(
        'La date de fin doit être après la date de début',
        'warning'
      );
      return;
    }

    const from = new Date(`${dateFrom}T00:00:00`);
    const to = new Date(`${dateTo}T00:00:00`);

    const diffDays = Math.ceil(
      (to - from) / (1000 * 60 * 60 * 24)
    );

    if (diffDays > 365) {
      showNotification(
        'La plage ne peut pas dépasser 365 jours',
        'warning'
      );
      return;
    }

    setCurrentPage(1);
    setRangeReady(true);
  };

  // ============================================================
  // RÉCUPÉRATION DES DONNÉES COMPLÈTES
  // ============================================================

  const fetchCompleteSale = async (saleId) => {
    try {
      const token = getToken();

      if (!token) {
        showNotification('Session expirée', 'error');
        return null;
      }

      const response = await AxiosInstance.get(
        `/ventes/${saleId}/`,
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      return response.data;

    } catch (error) {
      console.error('Erreur récupération vente:', error);

      showNotification(
        'Erreur lors de la récupération des données',
        'error'
      );

      return null;
    }
  };

  // ============================================================
  // IMPRESSION DU TICKET
  // ============================================================

  const handlePrintTicket = async (vente) => {
    if (printingId !== null) return;

    setPrintingId(vente.id);

    try {
      const completeVente = await fetchCompleteSale(vente.id);

      if (!completeVente) {
        showNotification(
          'Impossible de récupérer les données',
          'error'
        );
        return;
      }

      if (!completeVente.lines || completeVente.lines.length === 0) {
        showNotification(
          'Cette vente ne contient aucun produit',
          'warning'
        );
        return;
      }

      await TicketPOS(completeVente, {
        companyName: 'ETABLISSEMENTS BAH SOULEYMANE ET FILS',
        companySlogan: 'E.B.S.F',
        companyPhone: '+224 626 53 32 53',
        companyEmail: 'ebsfservices@gmail.com',
        companyAddress: 'Pita Centre – Grand Marché, Guinée'
      });

      showNotification(
        'Ticket imprimé avec succès',
        'success'
      );

    } catch (error) {
      console.error('Erreur impression ticket:', error);

      showNotification(
        "Erreur lors de l'impression du ticket",
        'error'
      );

    } finally {
      setPrintingId(null);
    }
  };

  // ============================================================
  // SUPPRESSION
  // ============================================================

  const handleDelete = async () => {
    if (!venteToDelete || actionLoading) return;

    setActionLoading(true);

    try {
      const token = getToken();

      await AxiosInstance.delete(
        `/ventes/${venteToDelete.id}/`,
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      showNotification('Vente supprimée avec succès', 'success');

      setShowDeleteModal(false);
      setVenteToDelete(null);

      fetchVentes(currentPage);

    } catch (error) {
      console.error('Erreur suppression:', error);

      showNotification(
        'Erreur lors de la suppression',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // MISE À JOUR DU STATUT
  // ============================================================

  const handleUpdateStatus = async (id, status) => {
    if (actionLoading) return;

    let notes = '';

    if (status === 'cancelled') {
      const reason = window.prompt(
        "Raison de l'annulation :",
        ''
      );

      if (reason === null) return;

      notes = reason;
    }

    setActionLoading(true);

    try {
      const token = getToken();

      if (!token) {
        showNotification('Session expirée', 'error');
        return;
      }

      const payload = { status };

      if (notes.trim()) {
        payload.notes = notes.trim();
      }

      await AxiosInstance.post(
        `/ventes/${id}/update_status/`,
        payload,
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      showNotification(
        `Statut mis à jour : ${status}`,
        'success'
      );

      fetchVentes(currentPage);

    } catch (error) {
      console.error('Erreur mise à jour statut:', error);

      showNotification(
        error.response?.data?.detail || 'Erreur lors de la mise à jour',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // CONFIRMATION
  // ============================================================

  const handleConfirmSale = async (id) => {
    if (actionLoading) return;

    setActionLoading(true);

    try {
      const token = getToken();

      if (!token) {
        showNotification('Session expirée', 'error');
        return;
      }

      await AxiosInstance.post(
        `/ventes/${id}/confirm/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      showNotification(
        'Vente confirmée avec succès',
        'success'
      );

      fetchVentes(currentPage);

    } catch (error) {
      console.error('Erreur confirmation:', error);

      showNotification(
        error.response?.data?.detail || 'Erreur lors de la confirmation',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // PAIEMENT
  // ============================================================

  const handleMarkPaid = async (id) => {
    if (actionLoading) return;

    setActionLoading(true);

    try {
      const token = getToken();

      if (!token) {
        showNotification('Session expirée', 'error');
        return;
      }

      await AxiosInstance.post(
        `/ventes/${id}/mark_paid/`,
        {},
        {
          headers: {
            Authorization: `Token ${token}`
          }
        }
      );

      showNotification(
        'Vente marquée comme payée',
        'success'
      );

      fetchVentes(currentPage);

    } catch (error) {
      console.error('Erreur paiement:', error);

      showNotification(
        error.response?.data?.detail || 'Erreur lors du paiement',
        'error'
      );

    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // PDF
  // ============================================================

  const handleDownloadPdf = (id) => {
    navigate(`/ventes/${id}/pdf`);
  };

  // ============================================================
  // PAGINATION
  // ============================================================

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setCurrentPage(newPage);
  };

  // ============================================================
  // BADGES
  // ============================================================

  const getStatusBadge = (status) => {
    const configs = {
      draft: {
        label: 'Brouillon',
        className: 'badge-ghost'
      },
      confirmed: {
        label: 'Confirmée',
        className: 'badge-info'
      },
      paid: {
        label: 'Payée',
        className: 'badge-success'
      },
      delivered: {
        label: 'Livrée',
        className: 'badge-primary'
      },
      cancelled: {
        label: 'Annulée',
        className: 'badge-error'
      },
      returned: {
        label: 'Retournée',
        className: 'badge-warning'
      }
    };

    const config = configs[status] || {
      label: status || '-',
      className: 'badge-ghost'
    };

    return (
      <span className={`badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  const getPaymentBadge = (status) => {
    const configs = {
      paid: {
        label: 'Payé',
        className: 'badge-success'
      },
      partial: {
        label: 'Partiel',
        className: 'badge-warning'
      },
      pending: {
        label: 'En attente',
        className: 'badge-error'
      }
    };

    const config = configs[status] || {
      label: status || '-',
      className: 'badge-ghost'
    };

    return (
      <span className={`badge ${config.className}`}>
        {config.label}
      </span>
    );
  };

  // ============================================================
  // CHARGEMENT INITIAL
  // ============================================================

  if (loading && isFirstLoad) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto" />
          <p className="text-base font-medium text-gray-500">
            Chargement des ventes...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU
  // ============================================================

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* NOTIFICATION */}

      {notification.show && (
        <div className="fixed top-20 right-4 z-50 animate-slideDown">
          <div className={`alert ${
            notification.type === 'success'
              ? 'alert-success'
              : notification.type === 'warning'
              ? 'alert-warning'
              : 'alert-error'
          } shadow-xl rounded-xl`}>

            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle className="w-4 h-4" />
              ) : notification.type === 'warning' ? (
                <AlertTriangle className="w-4 h-4" />
              ) : (
                <AlertCircle className="w-4 h-4" />
              )}

              <span className="font-medium">
                {notification.message}
              </span>
            </div>

            <button
              className="btn btn-ghost btn-xs btn-circle"
              onClick={() => setNotification(prev => ({
                ...prev,
                show: false
              }))}
            >
              <X className="w-3 h-3" />
            </button>

          </div>
        </div>
      )}

      {/* MODAL SUPPRESSION */}

      {showDeleteModal && venteToDelete && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden">

            <div className="bg-error/10 p-4 text-center">
              <div className="w-16 h-16 rounded-full bg-error/20 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-8 h-8 text-error" />
              </div>

              <h3 className="text-xl font-bold text-error">
                Confirmer la suppression
              </h3>
            </div>

            <div className="p-6 text-center">
              <p className="text-gray-600">
                Voulez-vous vraiment supprimer cette vente ?
              </p>

              <p className="font-semibold text-error mt-2">
                {venteToDelete.invoice_number}
              </p>

              <p className="text-sm text-gray-500">
                {venteToDelete.client_name}
              </p>
            </div>

            <div className="flex gap-3 p-4 bg-gray-50">

              <button
                className="btn btn-ghost flex-1"
                onClick={() => {
                  setShowDeleteModal(false);
                  setVenteToDelete(null);
                }}
                disabled={actionLoading}
              >
                Annuler
              </button>

              <button
                className="btn btn-error flex-1 gap-2"
                onClick={handleDelete}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}

                Supprimer
              </button>

            </div>
          </div>
        </div>
      )}

      {/* EN-TÊTE */}

      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

          <div>
            <div className="flex items-center gap-3 mb-2">

              <div className="p-2 bg-primary/10 rounded-xl">
                <ShoppingCart className="w-7 h-7 text-primary" />
              </div>

              <h1 className="text-2xl sm:text-3xl font-black text-primary">
                Ventes
              </h1>

              {loading && (
                <Loader2 className="w-5 h-5 text-primary animate-spin ml-2" />
              )}

            </div>

            <p className="text-sm text-gray-500 ml-1">

              {viewMode === 'today'
                ? `Ventes du ${formatDate(selectedDate)}`
                : viewMode === 'range'
                ? dateFrom && dateTo
                  ? `Période du ${formatDate(dateFrom)} au ${formatDate(dateTo)}`
                  : 'Sélectionnez une plage de dates'
                : 'Toutes les ventes'
              }

              {totalCount > 0 &&
                ` • ${totalCount.toLocaleString('fr-FR')} vente(s)`
              }

            </p>
          </div>

          <div className="flex flex-wrap gap-3">

            <button
              onClick={() => fetchVentes(currentPage)}
              className="btn btn-sm sm:btn-md btn-outline gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>

            <button
              onClick={() => navigate('/ventes/nouveau')}
              className="btn btn-sm sm:btn-md bg-gradient-to-r from-primary to-primary/80 text-white border-none shadow-lg gap-2"
            >
              <Plus className="w-4 h-4" />
              Nouvelle vente
            </button>

          </div>
        </div>
      </div>

      {/* SÉLECTEUR DE MODE */}

      <div className="bg-white rounded-xl shadow-md p-4">

        <div className="flex flex-col sm:flex-row gap-4">

          <div className="flex gap-2 flex-wrap">

            <button
              className={`btn btn-sm ${viewMode === 'today' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleModeChange('today')}
            >
              Aujourd'hui
            </button>

            <button
              className={`btn btn-sm ${viewMode === 'range' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleModeChange('range')}
            >
              Plage de dates
            </button>

            <button
              className={`btn btn-sm ${viewMode === 'all' ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => handleModeChange('all')}
            >
              Toutes
            </button>

          </div>

          {/* MODE JOURNALIER */}

          {viewMode === 'today' && (
            <div className="flex items-center gap-2 flex-1 justify-center sm:justify-end">

              <button
                onClick={goToPreviousDay}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <input
                type="date"
                className="input input-bordered input-sm w-auto"
                value={formatDateInput(selectedDate)}
                onChange={(e) => {
                  if (!e.target.value) return;

                  const newDate = new Date(
                    `${e.target.value}T00:00:00`
                  );

                  if (!isNaN(newDate.getTime())) {
                    setSelectedDate(newDate);
                    setCurrentPage(1);
                  }
                }}
              />

              <button
                onClick={goToNextDay}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={goToToday}
                className="btn btn-sm btn-ghost"
              >
                Aujourd'hui
              </button>

            </div>
          )}

          {/* MODE PLAGE */}

          {viewMode === 'range' && (
            <div className="flex flex-col sm:flex-row items-center gap-2 flex-1 justify-center sm:justify-end flex-wrap">

              <div className="flex items-center gap-2 flex-wrap">

                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                />

                <span className="text-sm text-gray-500">à</span>

                <input
                  type="date"
                  className="input input-bordered input-sm"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                />

                <button
                  className="btn btn-primary btn-sm"
                  onClick={handleDateRangeSearch}
                  disabled={!dateFrom || !dateTo || loading}
                >
                  <Search className="w-3 h-3" />
                  Charger
                </button>

              </div>

              {(!dateFrom || !dateTo) && (
                <span className="text-xs text-warning">
                  Sélectionnez les deux dates puis cliquez sur Charger
                </span>
              )}

              {dateFrom && dateTo && !loading && rangeReady && (
                <span className="text-xs text-success">
                  {totalCount} vente(s) trouvée(s)
                </span>
              )}

            </div>
          )}

        </div>
      </div>

      {/* STATISTIQUES */}

      {stats && stats.total !== undefined && stats.total > 0 && (

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-3">

          <div className="bg-white shadow-md rounded-xl p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-500">Total</p>
                <p className="text-xl font-bold text-primary">
                  {stats.total || 0}
                </p>
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
                        {{
                          draft: 'Brouillons',
                          confirmed: 'Confirmées',
                          paid: 'Payées',
                          delivered: 'Livrées',
                          cancelled: 'Annulées',
                          returned: 'Retournées'
                        }[status] || status}
                      </p>

                      <p className="text-xl font-bold">
                        {count}
                      </p>
                    </div>

                    <span className="badge badge-ghost">
                      {count}
                    </span>

                  </div>
                </div>

              ))
          }

        </div>
      )}

      {/* FILTRES */}

      <div className="bg-white rounded-xl shadow-md p-4">

        <div className="flex flex-col gap-3">

          <div className="relative">

            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Rechercher par numéro ou client..."
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
            <Filter className="w-4 h-4" />
            {showFilters ? 'Masquer' : 'Filtres'}
          </button>

          <div className={`${showFilters ? 'grid' : 'hidden'} sm:grid grid-cols-1 sm:grid-cols-2 gap-3`}>

            <select
              className="select select-bordered w-full"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setCurrentPage(1);
              }}
            >
              <option value="all">Tous les statuts</option>
              <option value="draft">Brouillons</option>
              <option value="confirmed">Confirmées</option>
              <option value="paid">Payées</option>
              <option value="delivered">Livrées</option>
              <option value="cancelled">Annulées</option>
              <option value="returned">Retournées</option>
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

      {/* TABLEAU DES VENTES */}

      <div className="bg-white rounded-xl shadow-xl overflow-hidden">

        <div className="overflow-x-auto">

          <table className="table w-full">

            <thead className="bg-gray-50">
              <tr>
                <th className="py-3 px-4">N° Facture</th>
                <th className="py-3 px-4">Client</th>
                <th className="py-3 px-4 hidden lg:table-cell">Date</th>
                <th className="py-3 px-4 text-right">Montant</th>
                <th className="py-3 px-4 text-center">Statut</th>
                <th className="py-3 px-4 text-center">Paiement</th>
                <th className="py-3 px-4 text-center">Actions</th>
              </tr>
            </thead>

            <tbody>

              {/* SQUELETTES */}

              {loading && Array.from({
                length: Math.min(itemsPerPage, 5)
              }).map((_, i) => (

                <tr key={`skeleton-${i}`} className="animate-pulse">

                  <td className="py-3 px-4">
                    <div className="h-4 w-20 bg-gray-200 rounded" />
                  </td>

                  <td className="py-3 px-4">
                    <div className="h-4 w-24 bg-gray-200 rounded" />
                  </td>

                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="h-4 w-16 bg-gray-200 rounded" />
                  </td>

                  <td className="py-3 px-4">
                    <div className="h-4 w-16 bg-gray-200 rounded ml-auto" />
                  </td>

                  <td className="py-3 px-4">
                    <div className="h-6 w-16 bg-gray-200 rounded mx-auto" />
                  </td>

                  <td className="py-3 px-4">
                    <div className="h-6 w-16 bg-gray-200 rounded mx-auto" />
                  </td>

                  <td className="py-3 px-4">
                    <div className="flex justify-center gap-1">
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                      <div className="w-8 h-8 bg-gray-200 rounded-full" />
                    </div>
                  </td>

                </tr>
              ))}

              {/* AUCUNE VENTE */}

              {!loading && ventes.length === 0 && (

                <tr>
                  <td colSpan="7" className="text-center py-16">

                    <div className="flex flex-col items-center gap-3">

                      <ShoppingCart className="w-16 h-16 text-gray-300" />

                      <p className="text-gray-500 font-medium">
                        Aucune vente trouvée
                      </p>

                      <button
                        onClick={() => navigate('/ventes/nouveau')}
                        className="btn btn-primary btn-sm gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Créer une vente
                      </button>

                    </div>

                  </td>
                </tr>
              )}

              {/* LISTE */}

              {!loading && ventes.map(vente => (

                <tr
                  key={vente.id}
                  className="hover:bg-gray-50 transition-colors"
                >

                  <td className="py-3 px-4">
                    <span className="font-mono font-semibold">
                      {vente.invoice_number}
                    </span>
                  </td>

                  <td className="py-3 px-4 font-medium">
                    {vente.client_name}
                  </td>

                  <td className="py-3 px-4 hidden lg:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-600">
                      <Calendar className="w-3 h-3 text-gray-400" />
                      {formatDate(vente.sale_date)}
                    </div>
                  </td>

                  <td className="py-3 px-4 text-right font-semibold text-primary">
                    {formatCurrency(vente.total)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {getStatusBadge(vente.status)}
                  </td>

                  <td className="py-3 px-4 text-center">
                    {getPaymentBadge(vente.payment_status)}
                  </td>

                  {/* ACTIONS */}

                  <td className="py-3 px-4 text-center">

                    <div className="flex justify-center gap-1 flex-wrap">

                      {/* VOIR */}

                      <button
                        onClick={() => navigate(`/ventes/${vente.id}`)}
                        className="btn btn-ghost btn-sm btn-circle tooltip"
                        data-tip="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {/* MODIFIER */}

                      {vente.status === 'draft' && (
                        <button
                          onClick={() => navigate(`/ventes/${vente.id}/modifier`)}
                          className="btn btn-ghost btn-sm btn-circle tooltip text-warning"
                          data-tip="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                      )}

                      {/* CONFIRMER */}

                      {vente.status === 'draft' && (
                        <button
                          onClick={() => handleConfirmSale(vente.id)}
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
                      )}

                      {/* MARQUER PAYÉE */}

                      {vente.status === 'confirmed' && (
                        <button
                          onClick={() => handleMarkPaid(vente.id)}
                          className="btn btn-ghost btn-sm btn-circle tooltip text-success"
                          data-tip="Marquer payée"
                          disabled={actionLoading}
                        >
                          {actionLoading ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <CreditCard className="w-4 h-4" />
                          )}
                        </button>
                      )}

                      {/* MARQUER LIVRÉE */}

                      {vente.status === 'paid' && (
                        <button
                          onClick={() => handleUpdateStatus(vente.id, 'delivered')}
                          className="btn btn-ghost btn-sm btn-circle tooltip text-primary"
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

                      {/* ANNULER */}

                      {['draft', 'confirmed', 'paid'].includes(vente.status) && (
                        <button
                          onClick={() => handleUpdateStatus(vente.id, 'cancelled')}
                          className="btn btn-ghost btn-sm btn-circle tooltip text-error"
                          data-tip="Annuler la vente"
                          disabled={actionLoading}
                        >
                          <Ban className="w-4 h-4" />
                        </button>
                      )}

                      {/* IMPRIMER TICKET */}

                      <button
                        onClick={() => handlePrintTicket(vente)}
                        className="btn btn-ghost btn-sm btn-circle tooltip text-info"
                        data-tip="Imprimer ticket"
                        disabled={printingId !== null}
                      >
                        {printingId === vente.id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Printer className="w-4 h-4" />
                        )}
                      </button>

                      {/* TÉLÉCHARGER PDF */}

                      <button
                        onClick={() => handleDownloadPdf(vente.id)}
                        className="btn btn-ghost btn-sm btn-circle tooltip text-secondary"
                        data-tip="Télécharger PDF"
                      >
                        <DownloadIcon />
                      </button>

                      {/* SUPPRIMER */}

                      <button
                        onClick={() => {
                          setVenteToDelete(vente);
                          setShowDeleteModal(true);
                        }}
                        className="btn btn-ghost btn-sm btn-circle tooltip text-error"
                        data-tip="Supprimer"
                        disabled={actionLoading}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                    </div>
                  </td>

                </tr>
              ))}

            </tbody>
          </table>
        </div>

        {/* PAGINATION */}

        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 p-4 border-t bg-gray-50">

          <div className="text-sm text-gray-500">
            Affichage de {totalCount === 0 ? 0 : ((currentPage - 1) * itemsPerPage) + 1}
            {' à '}
            {Math.min(currentPage * itemsPerPage, totalCount)}
            {' sur '}
            {totalCount} vente(s)
          </div>

          <div className="flex items-center gap-2">

            <select
              className="select select-bordered select-sm"
              value={itemsPerPage}
              onChange={(e) => {
                setItemsPerPage(Number(e.target.value));
                setCurrentPage(1);
              }}
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>

            <button
              className="btn btn-sm btn-outline btn-square"
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage <= 1 || loading}
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="text-sm font-medium px-2">
              {currentPage} / {totalPages}
            </span>

            <button
              className="btn btn-sm btn-outline btn-square"
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage >= totalPages || loading}
            >
              <ChevronRight className="w-4 h-4" />
            </button>

          </div>
        </div>

      </div>

    </div>
  );
};

// Petit composant pour l'icône PDF
const DownloadIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export default VentesList;
