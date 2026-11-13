// src/components/site/components/ClientOrdersContent.jsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Package, Search, Loader2, XCircle, CheckCircle, Clock,
  Truck, CreditCard, Calendar
} from 'lucide-react';
import AxiosInstance from '../../AxiosInstance';

const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return dateStr; }
};

const getStatusBadge = (status) => {
  const configs = {
    draft: { label: 'En cours', icon: Clock, color: 'bg-warning text-warning-content' },
    confirmed: { label: 'Confirmée', icon: CheckCircle, color: 'bg-info text-info-content' },
    paid: { label: 'Payée', icon: CreditCard, color: 'bg-success text-success-content' },
    delivered: { label: 'Livrée', icon: Truck, color: 'bg-success text-success-content' },
    cancelled: { label: 'Annulée', icon: XCircle, color: 'bg-error text-error-content' },
  };
  const cfg = configs[status] || configs.draft;
  const Icon = cfg.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wide ${cfg.color}`}>
      <Icon className="w-3 h-3" /> {cfg.label}
    </span>
  );
};

export default function ClientOrdersContent() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  const [searchTerm, setSearchTerm] = useState('');
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    AxiosInstance.get('/store/checkout/my-orders/')
      .then((res) => {
        const data = res.data?.results || res.data || [];
        setOrders(Array.isArray(data) ? data : []);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const currentOrders = orders.filter(o => ['draft', 'confirmed', 'paid'].includes(o.status));
  const closedOrders = orders.filter(o => ['delivered', 'cancelled', 'returned'].includes(o.status));

  const displayedOrders = (activeTab === 'current' ? currentOrders : closedOrders).filter(o => 
    !searchTerm || o.invoice_number?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCancel = async (orderId) => {
    if (!window.confirm('Voulez-vous vraiment annuler cette commande ?')) return;
    setCancelling(orderId);
    try {
      await AxiosInstance.post(`/store/checkout/my-orders/${orderId}/cancel/`);
      // Rafraichir
      const res = await AxiosInstance.get('/store/checkout/my-orders/');
      setOrders(res.data?.results || res.data || []);
    } catch (err) {
      alert('Erreur lors de l\'annulation');
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20"><Loader2 className="w-10 h-10 text-primary animate-spin mx-auto" /></div>;
  }

  return (
    <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm">
      
      {/* En-tête & Onglets */}
      <div className="p-6 border-b border-base-200">
        <h1 className="text-2xl font-black text-base-content mb-6">Vos commandes</h1>
        
        <div className="flex items-center gap-6 border-b border-base-200 -mb-6">
          <button
            onClick={() => setActiveTab('current')}
            className={`pb-3 text-sm font-bold uppercase tracking-wide relative ${
              activeTab === 'current' ? 'text-primary' : 'text-base-content/50 hover:text-base-content'
            }`}
          >
            En cours / Livrées ({currentOrders.length})
            {activeTab === 'current' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
          <button
            onClick={() => setActiveTab('closed')}
            className={`pb-3 text-sm font-bold uppercase tracking-wide relative ${
              activeTab === 'closed' ? 'text-primary' : 'text-base-content/50 hover:text-base-content'
            }`}
          >
            Commandes fermées ({closedOrders.length})
            {activeTab === 'closed' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />}
          </button>
        </div>
      </div>

      {/* Recherche */}
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

      {/* Liste */}
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
                
                <div className="w-16 h-16 bg-base-200 rounded-lg flex items-center justify-center shrink-0 border border-base-300">
                  <Package className="w-6 h-6 text-base-content/30" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3 mb-1 flex-wrap">
                    <p className="font-bold text-base-content">Commande {order.invoice_number}</p>
                    {getStatusBadge(order.status)}
                  </div>
                  <p className="text-xs text-base-content/60 mb-2">
                    Passée le {formatDate(order.sale_date)}
                  </p>
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-[10px] text-base-content/50 uppercase">Total</p>
                      <p className="font-black text-primary">{formatPrice(order.total)} F</p>
                    </div>
                    {parseFloat(order.amount_due) > 0 && (
                      <div>
                        <p className="text-[10px] text-base-content/50 uppercase">Reste à payer</p>
                        <p className="font-bold text-warning">{formatPrice(order.amount_due)} F</p>
                      </div>
                    )}
                  </div>
                </div>

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
  );
}