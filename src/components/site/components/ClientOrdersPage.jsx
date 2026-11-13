// src/components/site/components/ClientOrdersPage.jsx
// ==========================================
// Page "Mon Compte / Mes commandes" (Style Jumia)
// ==========================================
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, ChevronRight, Search, Loader2, AlertCircle,
  Eye, XCircle, CheckCircle, Clock, Truck, CreditCard, Calendar,
  ShoppingBag, ArrowLeft, RefreshCw, X, User, Heart,
  Inbox, MessageSquare, Ticket, Store, History, MapPin,
  Settings, LogOut, Menu,
} from 'lucide-react';

import PublicLayout from '../Layout/PublicLayout';
import AxiosInstance from '../../AxiosInstance';

// ==========================================
// HELPERS
// ==========================================
const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// ==========================================
// BADGES
// ==========================================
const getStatusBadge = (status) => {
  const configs = {
    draft: { label: 'En cours', icon: Clock, color: 'bg-warning text-warning-content' },
    confirmed: { label: 'Confirmée', icon: CheckCircle, color: 'bg-info text-info-content' },
    paid: { label: 'Payée', icon: CreditCard, color: 'bg-success text-success-content' },
    delivered: { label: 'Livrée', icon: Truck, color: 'bg-success text-success-content' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'bg-error text-error-content' },
    returned: { label: 'Retournée', icon: XCircle, color: 'bg-neutral text-neutral-content' },
  };
  const cfg = configs[status] || configs.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded uppercase tracking-wide ${cfg.color}`}>
      <Icon className="w-3 h-3" />
      {cfg.label}
    </span>
  );
};

// ==========================================
// SIDEBAR MENU
// ==========================================
const SidebarMenu = ({ onLogout }) => {
  const menuItems = [
    { label: 'Mon compte', icon: User, active: false },
    { label: 'Mes commandes', icon: Package, active: true },
    { label: 'Boîte de réception', icon: Inbox, active: false, badge: 2 },
    { label: 'Vos avis en attente', icon: MessageSquare, active: false },
    { label: 'Bons d\'achat', icon: Ticket, active: false },
    { label: 'Favoris', icon: Heart, active: false },
    { label: 'Vendeurs suivis', icon: Store, active: false },
    { label: 'Vus récemment', icon: History, active: false },
  ];

  const accountItems = [
    { label: 'Adresses', icon: MapPin },
    { label: 'Préférences de communication', icon: Settings },
  ];

  return (
    <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-base-200 flex items-center gap-3">
        <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
          <User className="w-5 h-5 text-primary" />
        </div>
        <div>
          <p className="text-xs text-base-content/60">Bienvenue</p>
          <p className="text-sm font-bold text-base-content">Mon compte</p>
        </div>
      </div>

      <ul className="py-2">
        {menuItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <li key={idx}>
              <Link
                to="#"
                className={`flex items-center justify-between px-4 py-3 text-sm transition-colors ${
                  item.active
                    ? 'bg-base-200 text-primary font-bold border-l-4 border-primary'
                    : 'text-base-content/70 hover:bg-base-200 hover:text-base-content border-l-4 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="bg-primary text-primary-content text-[10px] font-bold px-2 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      <div className="border-t border-base-200 py-2">
        <p className="px-4 text-xs font-bold text-base-content/40 uppercase py-2">Gérez votre compte</p>
        {accountItems.map((item, idx) => {
          const Icon = item.icon;
          return (
            <li key={idx} className="list-none">
              <Link
                to="#"
                className="flex items-center gap-3 px-4 py-3 text-sm text-base-content/70 hover:bg-base-200 hover:text-base-content transition-colors"
              >
                <Icon className="w-4 h-4" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </div>

      <div className="border-t border-base-200 p-4">
        <button
          onClick={onLogout}
          className="w-full text-center text-sm font-semibold text-error hover:bg-error/10 py-2 rounded-lg transition-colors"
        >
          Déconnexion
        </button>
      </div>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
function ClientOrdersContent() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('current'); // 'current' | 'closed'
  const [searchTerm, setSearchTerm] = useState('');
  const [notification, setNotification] = useState(null);
  const [cancelling, setCancelling] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const isAuthenticated = !!localStorage.getItem('Token');

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/client/orders');
    }
  }, [isAuthenticated, navigate]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await AxiosInstance.get('/store/checkout/my-orders/');
      const data = res.data?.results || res.data || [];
      setOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Impossible de charger vos commandes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) fetchOrders();
  }, [isAuthenticated]);

  // Séparation en cours / fermées
  const currentOrders = orders.filter(o => ['draft', 'confirmed', 'paid'].includes(o.status));
  const closedOrders = orders.filter(o => ['delivered', 'cancelled', 'returned'].includes(o.status));

  const displayedOrders = (activeTab === 'current' ? currentOrders : closedOrders).filter(o => {
    if (!searchTerm) return true;
    return o.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleCancel = async (orderId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette commande ?')) return;
    setCancelling(orderId);
    try {
      await AxiosInstance.post(`/store/checkout/my-orders/${orderId}/cancel/`);
      setNotification({ type: 'success', message: 'Commande annulée' });
      fetchOrders();
    } catch (err) {
      setNotification({ type: 'error', message: 'Erreur lors de l\'annulation' });
    } finally {
      setCancelling(null);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('User');
    window.location.href = '/';
  };

  if (loading && orders.length === 0) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[120px] pb-16">
      
      {/* Notification */}
      {notification && (
        <div className="fixed top-24 right-4 z-50">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl`}>
            <span>{notification.message}</span>
          </div>
        </div>
      )}

      {/* Bouton Sidebar Mobile */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="lg:hidden btn btn-outline btn-sm mb-4 gap-2"
      >
        <Menu className="w-4 h-4" /> Menu du compte
      </button>

      <div className="flex flex-col lg:flex-row gap-6">
        
        {/* ========== SIDEBAR ========== */}
        <aside className={`w-full lg:w-64 shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
          <SidebarMenu onLogout={handleLogout} />
        </aside>

        {/* ========== CONTENU PRINCIPAL ========== */}
        <main className="flex-1 min-w-0">
          <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm">
            
            {/* En-tête */}
            <div className="p-6 border-b border-base-200">
              <h1 className="text-2xl font-black text-base-content mb-6">Vos commandes</h1>
              
              {/* Onglets */}
              <div className="flex items-center gap-6 border-b border-base-200 -mb-6">
                <button
                  onClick={() => setActiveTab('current')}
                  className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors relative ${
                    activeTab === 'current' ? 'text-primary' : 'text-base-content/50 hover:text-base-content'
                  }`}
                >
                  En cours / Livrées ({currentOrders.length})
                  {activeTab === 'current' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('closed')}
                  className={`pb-3 text-sm font-bold uppercase tracking-wide transition-colors relative ${
                    activeTab === 'closed' ? 'text-primary' : 'text-base-content/50 hover:text-base-content'
                  }`}
                >
                  Commandes fermées ({closedOrders.length})
                  {activeTab === 'closed' && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
                  )}
                </button>
              </div>
            </div>

            {/* Barre de recherche */}
            <div className="p-4 bg-base-200/30 border-b border-base-200">
              <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
                <input
                  type="text"
                  placeholder="Rechercher par numéro de commande..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input input-sm input-bordered w-full pl-9 bg-base-100"
                />
              </div>
            </div>

            {/* Liste des commandes */}
            <div className="divide-y divide-base-200">
              {displayedOrders.length === 0 ? (
                <div className="p-12 text-center">
                  <Package className="w-16 h-16 text-base-content/20 mx-auto mb-4" />
                  <p className="text-base-content/60">Aucune commande dans cette catégorie.</p>
                </div>
              ) : (
                displayedOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-base-200/30 transition-colors">
                    <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                      
                      {/* Image placeholder */}
                      <div className="w-20 h-20 bg-base-200 rounded-lg flex items-center justify-center shrink-0 border border-base-300">
                        <Package className="w-8 h-8 text-base-content/30" />
                      </div>

                      {/* Infos */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-1 flex-wrap">
                          <p className="font-bold text-base-content">Commande {order.invoice_number}</p>
                          {getStatusBadge(order.status)}
                        </div>
                        
                        <p className="text-xs text-base-content/60 mb-1">
                          Passée le {formatDate(order.sale_date)}
                        </p>

                        <div className="flex items-center gap-4 mt-2">
                          <div>
                            <p className="text-xs text-base-content/50">Total</p>
                            <p className="font-black text-primary">{formatPrice(order.total)} F</p>
                          </div>
                          {parseFloat(order.amount_due) > 0 && (
                            <div>
                              <p className="text-xs text-base-content/50">Reste à payer</p>
                              <p className="font-bold text-warning">{formatPrice(order.amount_due)} F</p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto shrink-0">
                        <Link
                          to={`/commande/confirmation/${order.invoice_number}`}
                          state={{ orderNumber: order.invoice_number, total: order.total }}
                          className="btn btn-sm btn-ghost text-primary hover:bg-primary/10 font-bold"
                        >
                          Détails
                        </Link>
                        {order.status === 'draft' && (
                          <button
                            onClick={() => handleCancel(order.id)}
                            disabled={cancelling === order.id}
                            className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                          >
                            {cancelling === order.id ? '...' : 'Annuler'}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

// ==========================================
// EXPORT avec PublicLayout
// ==========================================
export default function ClientOrdersPage() {
  return (
    <PublicLayout>
      <ClientOrdersContent />
    </PublicLayout>
  );
}