// src/components/ecommerce/EcommerceOrderDetail.jsx
// ============================================================
// Détail d'une commande en ligne - ALIGNÉ SUR LE STANDARD VentesList
// ============================================================

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import AxiosInstance from '../AxiosInstance';
import {
  ArrowLeft, Loader2, AlertCircle, AlertTriangle,
  Package, Truck, CheckCircle, XCircle, Clock,
  CreditCard, MapPin, Phone, Mail, Calendar, User,
  ShoppingBag, RefreshCw, Printer, Ban, X,
  CheckCircle as CheckIcon, FileText, Wallet,
} from 'lucide-react';

// ============================================================
// HELPERS
// ============================================================
const formatDate = (date) => {
  if (!date) return '-';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (isNaN(d.getTime())) return '-';
    return d.toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return '-'; }
};

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
// BADGES
// ============================================================
const STATUS_CONFIG = {
  draft:      { label: 'En attente', className: 'badge-warning', icon: Clock },
  confirmed:  { label: 'Confirmée',  className: 'badge-info',    icon: CheckCircle },
  paid:       { label: 'Payée',      className: 'badge-success', icon: CreditCard },
  delivered:  { label: 'Livrée',     className: 'badge-primary', icon: Truck },
  cancelled:  { label: 'Annulée',    className: 'badge-error',   icon: Ban },
  returned:   { label: 'Retournée',  className: 'badge-warning', icon: XCircle },
};

const PAYMENT_CONFIG = {
  paid:    { label: 'Payé',       className: 'badge-success' },
  partial: { label: 'Partiel',    className: 'badge-warning' },
  pending: { label: 'En attente', className: 'badge-error' },
};

const getStatusBadge = (status) => {
  const cfg = STATUS_CONFIG[status] || { label: status, className: 'badge-ghost', icon: Package };
  const Icon = cfg.icon;
  return (
    <span className={`badge ${cfg.className} gap-1`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
};

const getPaymentBadge = (status) => {
  const cfg = PAYMENT_CONFIG[status] || { label: status, className: 'badge-ghost' };
  return <span className={`badge ${cfg.className}`}>{cfg.label}</span>;
};

// ============================================================
// COMPOSANT PRINCIPAL
// ============================================================
const EcommerceOrderDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFirstLoad, setIsFirstLoad] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [printingId, setPrintingId] = useState(null);

  const [notification, setNotification] = useState({
    show: false, message: '', type: 'success',
  });

  // --- Modal de confirmation ---
  const [confirmModal, setConfirmModal] = useState({
    show: false, action: null, label: '', description: '',
  });

  const showNotification = (message, type = 'success') => {
    setNotification({ show: true, message, type });
    setTimeout(() => setNotification((prev) => ({ ...prev, show: false })), 3000);
  };

  const getToken = () => localStorage.getItem('Token');

  // ============================================================
  // CHARGEMENT
  // ============================================================
  const fetchOrder = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = getToken();
      if (!token) {
        showNotification('Session expirée', 'error');
        setTimeout(() => navigate('/login'), 2000);
        return;
      }

      const res = await AxiosInstance.get(
        `/admin/ecommerce/orders/${id}/`,
        { headers: { Authorization: `Token ${token}` } }
      );

      setOrder(res.data);
      setIsFirstLoad(false);
    } catch (err) {
      console.error('❌ Erreur chargement commande:', err);
      if (err.response?.status === 401) {
        showNotification('Session expirée', 'error');
        setTimeout(() => navigate('/login'), 2000);
      } else if (err.response?.status === 404) {
        setError('Commande introuvable');
      } else {
        setError(
          err.response?.data?.error || 'Erreur lors du chargement de la commande'
        );
      }
      setIsFirstLoad(false);
    } finally {
      setLoading(false);
    }
  }, [id, navigate]);

  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // ============================================================
  // ACTIONS
  // ============================================================
  const requestAction = (action, label, description = '') => {
    setConfirmModal({ show: true, action, label, description });
  };

  const closeConfirmModal = () => {
    setConfirmModal({ show: false, action: null, label: '', description: '' });
  };

  const executeAction = async () => {
    const { action, label } = confirmModal;
    if (!action) return;
    setActionLoading(true);
    closeConfirmModal();

    try {
      const token = getToken();
      await AxiosInstance.post(
        `/admin/ecommerce/orders/${id}/${action}/`,
        {},
        { headers: { Authorization: `Token ${token}` } }
      );
      showNotification(`Commande ${label.toLowerCase()} avec succès`, 'success');
      await fetchOrder();
    } catch (err) {
      console.error(`Erreur ${action}:`, err);
      showNotification(
        err.response?.data?.error || `Erreur "${label}"`,
        'error'
      );
    } finally {
      setActionLoading(false);
    }
  };

  // ============================================================
  // IMPRESSION
  // ============================================================
  const handlePrintTicket = async () => {
    if (!order) return;
    setPrintingId(order.id);
    try {
      navigate(`/ventes/${order.id}/pdf`);
      showNotification('Ouverture du ticket...', 'success');
    } catch (err) {
      showNotification('Erreur impression', 'error');
    } finally {
      setPrintingId(null);
    }
  };

  // ============================================================
  // RENDU — LOADING
  // ============================================================
  if (loading && isFirstLoad) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-200px)] bg-gray-50">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto"></div>
          <p className="text-base font-medium text-gray-500">
            Chargement de la commande...
          </p>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU — ERREUR
  // ============================================================
  if (error || !order) {
    return (
      <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
        <div className="bg-white rounded-xl shadow-xl p-12 text-center max-w-lg mx-auto">
          <div className="w-20 h-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-error" />
          </div>
          <h2 className="text-xl font-bold mb-2">Commande introuvable</h2>
          <p className="text-gray-500 mb-6">
            {error || 'Cette commande n\'existe pas ou a été supprimée.'}
          </p>
          <Link to="/ecommerce/commandes" className="btn btn-primary gap-2">
            <ArrowLeft className="w-4 h-4" /> Retour aux commandes
          </Link>
        </div>
      </div>
    );
  }

  // ============================================================
  // RENDU — PRINCIPAL
  // ============================================================
  const lines = order.lines || [];
  const amountDue = parseFloat(order.amount_due || 0);
  const amountPaid = parseFloat(order.amount_paid || 0);

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-gray-50 min-h-screen">

      {/* Notification toast */}
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

      {/* Modal de confirmation */}
      {confirmModal.show && (
        <div className="modal modal-open">
          <div className="modal-box max-w-md p-0 overflow-hidden">
            <div
              className={`p-4 text-center ${
                confirmModal.action === 'cancel'
                  ? 'bg-error/10'
                  : confirmModal.action === 'confirm'
                  ? 'bg-success/10'
                  : 'bg-info/10'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3 ${
                  confirmModal.action === 'cancel'
                    ? 'bg-error/20'
                    : confirmModal.action === 'confirm'
                    ? 'bg-success/20'
                    : 'bg-info/20'
                }`}
              >
                {confirmModal.action === 'cancel' ? (
                  <Ban className="w-8 h-8 text-error" />
                ) : confirmModal.action === 'confirm' ? (
                  <CheckIcon className="w-8 h-8 text-success" />
                ) : (
                  <Truck className="w-8 h-8 text-info" />
                )}
              </div>
              <h3 className="text-xl font-bold">
                {confirmModal.label} la commande ?
              </h3>
            </div>
            <div className="p-6 text-center">
              <p className="text-gray-600">
                {confirmModal.description || 'Confirmez-vous cette action ?'}
              </p>
              <p className="font-semibold text-primary mt-2">
                {order.invoice_number}
              </p>
              <p className="text-sm text-gray-500">{order.client_name}</p>
            </div>
            <div className="flex gap-3 p-4 bg-gray-50">
              <button
                className="btn btn-ghost flex-1"
                onClick={closeConfirmModal}
                disabled={actionLoading}
              >
                Annuler
              </button>
              <button
                className={`btn flex-1 gap-2 ${
                  confirmModal.action === 'cancel'
                    ? 'btn-error'
                    : confirmModal.action === 'confirm'
                    ? 'btn-success'
                    : 'btn-info'
                }`}
                onClick={executeAction}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckIcon className="w-4 h-4" />
                )}
                Confirmer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="relative overflow-hidden bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-2xl p-5">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <button
                onClick={() => navigate(-1)}
                className="btn btn-sm btn-ghost btn-circle"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
              <div className="p-2 bg-primary/10 rounded-xl">
                <ShoppingBag className="w-7 h-7 text-primary" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-primary">
                {order.invoice_number}
              </h1>
              {getStatusBadge(order.status)}
              {getPaymentBadge(order.payment_status)}
            </div>
            <p className="text-sm text-gray-500 ml-1 flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Commandée le {formatDateTime(order.sale_date)}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={fetchOrder}
              className="btn btn-sm sm:btn-md btn-outline gap-2"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
            <button
              onClick={handlePrintTicket}
              className="btn btn-sm sm:btn-md btn-secondary gap-2"
              disabled={printingId === order.id}
            >
              {printingId === order.id ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Printer className="w-4 h-4" />
              )}
              Imprimer
            </button>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* ==================== COLONNE PRINCIPALE ==================== */}
        <div className="lg:col-span-2 space-y-4 sm:space-y-6">

          {/* Articles */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Articles commandés</h2>
              <span className="badge badge-ghost ml-auto">
                {lines.length} article(s)
              </span>
            </div>

            {lines.length === 0 ? (
              <div className="p-12 text-center">
                <Package className="w-16 h-16 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">Aucun article dans cette commande</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {lines.map((line) => (
                  <div key={line.id} className="px-5 py-3 flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center shrink-0">
                      <Package className="w-5 h-5 text-gray-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">
                        {line.product_name || 'Produit'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {line.product_code && `${line.product_code} • `}
                        {line.quantity} × {formatCurrency(line.unit_price)}
                      </p>
                    </div>
                    <p className="font-bold text-sm text-primary shrink-0">
                      {formatCurrency(line.total)}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {/* Totaux */}
            <div className="px-5 py-4 bg-gray-50 border-t border-gray-100 space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Sous-total</span>
                <span className="font-medium">{formatCurrency(order.subtotal)}</span>
              </div>
              {parseFloat(order.discount_amount) > 0 && (
                <div className="flex justify-between text-success">
                  <span className="text-gray-500">Remise</span>
                  <span className="font-medium">
                    -{formatCurrency(order.discount_amount)}
                  </span>
                </div>
              )}
              {parseFloat(order.tax_amount) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">TVA</span>
                  <span className="font-medium">{formatCurrency(order.tax_amount)}</span>
                </div>
              )}
              {parseFloat(order.shipping_fee) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Livraison</span>
                  <span className="font-medium">{formatCurrency(order.shipping_fee)}</span>
                </div>
              )}
              <div className="flex justify-between font-bold text-lg pt-2 border-t border-gray-200">
                <span>Total</span>
                <span className="text-primary">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between text-success">
                <span className="text-gray-500">Payé</span>
                <span className="font-semibold">{formatCurrency(amountPaid)}</span>
              </div>
              {amountDue > 0 && (
                <div className="flex justify-between text-warning font-semibold">
                  <span>Reste à payer</span>
                  <span>{formatCurrency(amountDue)}</span>
                </div>
              )}
            </div>
          </div>

          {/* Adresse de livraison */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <Truck className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Livraison</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Adresse</p>
                  <p className="font-medium">
                    {order.delivery_address || order.client_address || 'Non renseignée'}
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Téléphone</p>
                  <p className="font-medium">{order.client_phone || '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Mail className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Email</p>
                  <p className="font-medium">{order.client_email || '—'}</p>
                </div>
              </div>
              {order.tracking_number && (
                <div className="flex items-start gap-3">
                  <FileText className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-500 mb-0.5">Numéro de suivi</p>
                    <p className="font-mono font-medium">{order.tracking_number}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {(order.notes || order.internal_notes) && (
            <div className="bg-white rounded-xl shadow-md overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                <h2 className="font-bold text-lg">Notes</h2>
              </div>
              <div className="p-5 text-sm space-y-3">
                {order.notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes client</p>
                    <p className="whitespace-pre-line">{order.notes}</p>
                  </div>
                )}
                {order.internal_notes && (
                  <div>
                    <p className="text-xs text-gray-500 mb-1">Notes internes</p>
                    <p className="whitespace-pre-line text-gray-600">
                      {order.internal_notes}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* ==================== COLONNE LATÉRALE ==================== */}
        <div className="space-y-4 sm:space-y-6">

          {/* Client */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Client</h2>
            </div>
            <div className="p-5 space-y-3">
              <div>
                <p className="text-xs text-gray-500 mb-1">Nom</p>
                <p className="font-semibold">
                  {order.client_name || 'Client anonyme'}
                </p>
              </div>
              {order.client_phone && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Téléphone</p>
                  <p className="font-medium">{order.client_phone}</p>
                </div>
              )}
              {order.client_email && (
                <div>
                  <p className="text-xs text-gray-500 mb-1">Email</p>
                  <p className="font-medium break-all">{order.client_email}</p>
                </div>
              )}
              {order.client && (
                <Link
                  to={`/clients/${order.client}`}
                  className="btn btn-sm btn-outline btn-block gap-2"
                >
                  <User className="w-4 h-4" /> Voir fiche client
                </Link>
              )}
            </div>
          </div>

          {/* Informations */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Informations</h2>
            </div>
            <div className="p-5 space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Date de commande</p>
                <p className="font-medium">{formatDateTime(order.sale_date)}</p>
              </div>
              {order.delivery_date && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Date de livraison</p>
                  <p className="font-medium">{formatDateTime(order.delivery_date)}</p>
                </div>
              )}
              {order.payment_due_date && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Échéance paiement</p>
                  <p className="font-medium">{formatDate(order.payment_due_date)}</p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Mode de paiement</p>
                <p className="font-medium">{order.payment_method || '—'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-0.5">Statut paiement</p>
                <p className="font-medium">{getPaymentBadge(order.payment_status)}</p>
              </div>
              {order.warehouse_name && (
                <div>
                  <p className="text-xs text-gray-500 mb-0.5">Entrepôt</p>
                  <p className="font-medium">{order.warehouse_name}</p>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              <h2 className="font-bold text-lg">Actions</h2>
            </div>
            <div className="p-5 space-y-2">
              {order.status === 'draft' && (
                <>
                  <button
                    onClick={() =>
                      requestAction(
                        'confirm',
                        'Confirmer',
                        'Une fois confirmée, la commande pourra être préparée et livrée.'
                      )
                    }
                    disabled={actionLoading}
                    className="btn btn-success btn-block gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle className="w-4 h-4" />
                    )}
                    Confirmer la commande
                  </button>
                  <button
                    onClick={() =>
                      requestAction(
                        'cancel',
                        'Annuler',
                        'Cette action est irréversible. La commande sera marquée comme annulée.'
                      )
                    }
                    disabled={actionLoading}
                    className="btn btn-error btn-outline btn-block gap-2"
                  >
                    {actionLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Ban className="w-4 h-4" />
                    )}
                    Annuler la commande
                  </button>
                </>
              )}

              {order.status === 'confirmed' && (
                <button
                  onClick={() =>
                    requestAction(
                      'deliver',
                      'Marquer livrée',
                      'La commande sera marquée comme livrée au client.'
                    )
                  }
                  disabled={actionLoading}
                  className="btn btn-info btn-block gap-2"
                >
                  {actionLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Truck className="w-4 h-4" />
                  )}
                  Marquer livrée
                </button>
              )}

              {['paid', 'delivered', 'cancelled', 'returned'].includes(order.status) && (
                <div className="text-center py-3 text-sm text-gray-500">
                  <CheckCircle className="w-8 h-8 text-success/40 mx-auto mb-2" />
                  Aucune action disponible pour ce statut
                </div>
              )}

              {/* Séparateur */}
              <div className="border-t border-gray-100 my-2" />

              {/* Liens externes */}
              <Link
                to={`/ventes/${order.id}`}
                className="btn btn-ghost btn-sm btn-block gap-2 justify-start"
              >
                <FileText className="w-4 h-4" /> Voir dans les ventes
              </Link>
              <Link
                to={`/ventes/${order.id}/pdf`}
                className="btn btn-ghost btn-sm btn-block gap-2 justify-start"
              >
                <Printer className="w-4 h-4" /> Télécharger PDF
              </Link>
            </div>
          </div>

          {/* Résumé paiement */}
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl shadow-md p-5 border border-primary/20">
            <div className="flex items-center gap-2 mb-3">
              <Wallet className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-primary">Paiement</h3>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Total</span>
                <span className="font-bold">{formatCurrency(order.total)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Payé</span>
                <span className="font-semibold text-success">
                  {formatCurrency(amountPaid)}
                </span>
              </div>
              {amountDue > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Reste</span>
                  <span className="font-bold text-warning">
                    {formatCurrency(amountDue)}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EcommerceOrderDetail;