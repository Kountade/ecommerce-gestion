// src/components/site/components/InboxContent.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Package, Loader2, RefreshCw, AlertCircle } from 'lucide-react';
import AxiosInstance from '../../AxiosInstance';

const formatDate = (d) => {
  if (!d) return '';
  try {
    return new Date(d).toLocaleDateString('fr-FR', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    });
  } catch { return d; }
};

export default function InboxContent() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [error, setError] = useState(null);

  // 1. Charger la liste des commandes du client
  const fetchOrders = useCallback(() => {
    setLoading(true);
    setError(null);
    console.log('📩 [Inbox] Chargement des commandes...');
    
    AxiosInstance.get('/store/checkout/my-orders/')
      .then(res => {
        const data = res.data?.results || res.data || [];
        console.log('📩 [Inbox] Commandes reçues:', data.length);
        setOrders(data);
        if (data.length > 0) {
          const current = data.find(o => o.id === selectedOrder?.id);
          setSelectedOrder(current || data[0]);
        }
      })
      .catch(err => {
        console.error('❌ [Inbox] Erreur chargement commandes:', err);
        setError('Impossible de charger vos commandes.');
      })
      .finally(() => setLoading(false));
  }, [selectedOrder]);

  useEffect(() => {
    fetchOrders();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Fonction pour charger les messages (isolée pour pouvoir la réutiliser)
  const fetchMessages = useCallback(() => {
    if (!selectedOrder?.id) return;

    setLoadingMessages(true);
    console.log(`📩 [Inbox] Chargement des messages pour la commande #${selectedOrder.id}...`);

    // ✅ NOUVELLE URL : /store/checkout/{id}/messages/
    AxiosInstance.get(`/store/checkout/${selectedOrder.id}/messages/?t=${Date.now()}`)
      .then(res => {
        console.log('📩 [Inbox] Messages reçus:', res.data);
        setMessages(res.data.messages || []);
      })
      .catch(err => {
        console.error('❌ [Inbox] Erreur chargement messages:', err);
        setMessages([]);
      })
      .finally(() => setLoadingMessages(false));
  }, [selectedOrder]);

  // 3. Charger les messages automatiquement quand on change de commande
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // 4. Rendu
  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="animate-spin mx-auto text-primary w-8 h-8" />
        <p className="mt-2 text-sm text-base-content/60">Chargement de vos messages...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-base-100 rounded-xl border border-base-200 p-6">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error font-medium">{error}</p>
        <button onClick={fetchOrders} className="btn btn-primary btn-sm mt-4">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm flex flex-col md:flex-row h-auto md:h-[600px]">
      
      {/* Liste des commandes (Gauche) */}
      <div className="w-full md:w-1/3 border-b md:border-b-0 md:border-r border-base-200 overflow-y-auto max-h-[300px] md:max-h-full bg-base-50">
        <div className="p-4 bg-base-200/50 border-b border-base-200 font-bold flex justify-between items-center sticky top-0 z-10">
          <span>Vos commandes</span>
          <button onClick={fetchOrders} className="btn btn-xs btn-ghost btn-circle" title="Rafraîchir les commandes">
            <RefreshCw className="w-3 h-3" />
          </button>
        </div>
        
        {orders.length === 0 ? (
          <div className="p-8 text-center text-base-content/50 text-sm">
            Vous n'avez pas encore de commande.
          </div>
        ) : (
          orders.map(order => (
            <button
              key={order.id}
              onClick={() => setSelectedOrder(order)}
              className={`w-full text-left p-4 border-b border-base-200 transition-colors hover:bg-base-200/50 ${
                selectedOrder?.id === order.id ? 'bg-primary/5 border-l-4 border-l-primary' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-bold text-sm text-primary">{order.invoice_number}</span>
                <Package className="w-4 h-4 text-base-content/40" />
              </div>
              <p className="text-xs text-base-content/60">{formatDate(order.sale_date)}</p>
              <div className="mt-2">
                <span className="badge badge-sm badge-ghost">{order.status_display || order.status}</span>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Messages (Droite) */}
      <div className="w-full md:w-2/3 flex flex-col h-full bg-base-100">
        <div className="p-4 bg-base-200/50 border-b border-base-200 font-bold flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            Messages - {selectedOrder?.invoice_number || 'Sélectionnez une commande'}
          </div>
          {/* ✅ BOUTON ACTUALISER LES MESSAGES */}
          {selectedOrder && (
            <button 
              onClick={fetchMessages} 
              className="btn btn-xs btn-ghost gap-1" 
              disabled={loadingMessages}
              title="Actualiser les messages"
            >
              <RefreshCw className={`w-3 h-3 ${loadingMessages ? 'animate-spin' : ''}`} />
              Actualiser
            </button>
          )}
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {!selectedOrder ? (
            <div className="text-center mt-20 text-base-content/50">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Sélectionnez une commande pour voir ses messages.</p>
            </div>
          ) : loadingMessages ? (
            <div className="text-center py-10">
              <Loader2 className="animate-spin mx-auto text-primary w-6 h-6" />
              <p className="text-xs text-base-content/50 mt-2">Chargement des messages...</p>
            </div>
          ) : messages.length === 0 ? (
            <div className="text-center mt-20 text-base-content/50">
              <MessageSquare className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p>Aucun message pour cette commande.</p>
              <p className="text-xs mt-1">Les messages apparaîtront ici dès que le statut changera.</p>
            </div>
          ) : (
            messages.map((msg, idx) => (
              <div key={msg.id || idx} className="chat chat-start">
                <div className="chat-header text-xs text-base-content/50 mb-1">
                  Statut de la commande
                </div>
                <div className="chat-bubble chat-bubble-primary text-white">
                  {msg.text}
                </div>
                <div className="chat-footer text-[10px] text-base-content/40 mt-1">
                  {formatDate(msg.date)}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}