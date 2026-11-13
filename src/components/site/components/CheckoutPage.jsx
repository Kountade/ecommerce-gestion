// src/components/site/components/CheckoutPage.jsx
// ==========================================
// Page de validation de commande (Checkout) - PRO
// ==========================================
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  CreditCard, Truck, MapPin, Phone, Check, AlertCircle,
  ArrowRight, ArrowLeft, ShieldCheck, Wallet, Package,
  Loader2, ShoppingBag, MessageSquare,
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

const cartStorage = {
  get: () => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]');
    } catch {
      return [];
    }
  },
  clear: () => {
    localStorage.removeItem('cart');
    window.dispatchEvent(new Event('cart-updated'));
  },
};

// ==========================================
// MÉTHODES DE PAIEMENT
// ==========================================
const PAYMENT_METHODS = [
  { id: 'mobile_money', label: 'Mobile Money', description: 'Orange Money, Wave, Free Money', icon: Phone },
  { id: 'cash', label: 'Paiement à la livraison', description: 'Payez en espèces à la réception', icon: Truck },
  { id: 'wallet', label: 'Porte-monnaie', description: 'Utilisez votre solde disponible', icon: Wallet },
  { id: 'card', label: 'Carte bancaire', description: 'Visa, Mastercard', icon: CreditCard },
];

// ==========================================
// CONTENU
// ==========================================
function CheckoutContent() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);  // ✅ NOUVEAU
  const [notification, setNotification] = useState(null);

  const [form, setForm] = useState({
    delivery_address: '',
    delivery_city: '',
    delivery_phone: '',
    delivery_notes: '',
    payment_method: 'mobile_money',
  });

  const [errors, setErrors] = useState({});
  const isAuthenticated = !!localStorage.getItem('Token');

  // ==========================================
  // CHARGEMENT PANIER
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }

    const items = cartStorage.get();
    if (items.length === 0) {
      navigate('/panier');
      return;
    }
    setCart(items);
    setLoading(false);
  }, [isAuthenticated, navigate]);

  // ==========================================
  // PRÉ-REMPLIR DEPUIS LE PROFIL
  // ==========================================
  useEffect(() => {
    if (!isAuthenticated) return;
    AxiosInstance.get('/profile/')
      .then((res) => {
        const profile = res.data || {};
        setForm((prev) => ({
          ...prev,
          delivery_address: prev.delivery_address || profile.address || '',
          delivery_phone: prev.delivery_phone || profile.phone_number || '',
        }));
      })
      .catch(() => {
        // Silencieux
      });
  }, [isAuthenticated]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!form.delivery_address.trim()) {
      newErrors.delivery_address = 'L\'adresse de livraison est requise';
    }
    if (!form.delivery_phone.trim()) {
      newErrors.delivery_phone = 'Le téléphone est requis';
    } else if (!/^[0-9+\s()-]{8,}$/.test(form.delivery_phone.trim())) {
      newErrors.delivery_phone = 'Numéro de téléphone invalide';
    }
    if (!form.payment_method) {
      newErrors.payment_method = 'Choisissez une méthode de paiement';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      showNotification('Veuillez corriger les erreurs', 'error');
      return;
    }

    setSubmitting(true);
    setError(null);
    setErrorDetails(null);

    try {
      const items = cart.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
      }));

      const notesCombined = [
        form.delivery_notes,
        form.delivery_city ? `Ville: ${form.delivery_city}` : '',
      ].filter(Boolean).join(' | ');

      const payload = {
        items,
        delivery_address: form.delivery_address,
        delivery_method: 'livraison',
        payment_method: form.payment_method,
        notes: notesCombined,
      };

      const res = await AxiosInstance.post('/store/checkout/checkout/', payload);

      if (res.data?.status === 'success') {
        cartStorage.clear();
        navigate(`/commande/confirmation/${res.data.order_number}`, {
          state: {
            orderId: res.data.order_id,
            orderNumber: res.data.order_number,
            total: res.data.total,
            estimatedDelivery: res.data.estimated_delivery,
          },
        });
      } else {
        setError(res.data?.error || 'Une erreur est survenue');
      }
    } catch (err) {
      // ✅ LOG DÉTAILLÉ POUR DIAGNOSTIC
      console.error('❌ Erreur checkout complète:', {
        status: err?.response?.status,
        data: err?.response?.data,
        message: err?.message,
      });

      let msg = 'Impossible de créer la commande.';
      let details = null;
      const data = err?.response?.data;

      if (data?.error) {
        msg = data.error;
      } else if (data?.details && Array.isArray(data.details)) {
        msg = data.details[0];
        details = data.details;
      } else if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const firstVal = data[firstKey];
        msg = `${firstKey}: ${Array.isArray(firstVal) ? firstVal[0] : firstVal}`;
      } else if (err?.response?.status === 401) {
        msg = 'Session expirée. Reconnectez-vous.';
      } else if (err?.response?.status === 403) {
        msg = 'Accès refusé (CSRF). Reconnectez-vous ou contactez le support.';
      } else if (err?.response?.status === 404) {
        msg = 'Endpoint introuvable.';
      } else if (err?.response?.status === 500) {
        msg = 'Erreur serveur. Regardez le terminal Django.';
      } else if (err?.message) {
        msg = err.message;
      }

      setError(msg);
      setErrorDetails(details);
      showNotification(msg, 'error');
    } finally {
      setSubmitting(false);
    }
  };

  // ==========================================
  // CALCULS
  // ==========================================
  const subtotal = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
    0
  );
  const shipping = subtotal > 50000 ? 0 : 2000;
  const total = subtotal + shipping;

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-base-content/60">Chargement...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDU PRINCIPAL
  // ==========================================
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 space-y-6">

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-24 right-4 z-50">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl rounded-xl max-w-sm`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              <span className="font-medium text-sm">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* Breadcrumb + Header */}
      <div>
        <nav className="flex items-center gap-2 text-sm text-base-content/60 mb-4 flex-wrap">
          <Link to="/" className="hover:text-primary">Accueil</Link>
          <ArrowRight className="w-3 h-3" />
          <Link to="/panier" className="hover:text-primary">Panier</Link>
          <ArrowRight className="w-3 h-3" />
          <span className="text-base-content font-medium">Commande</span>
        </nav>

        <h1 className="text-2xl md:text-3xl font-black text-base-content flex items-center gap-2">
          <ShieldCheck className="w-7 h-7 text-primary" />
          Validation de la commande
        </h1>
        <p className="text-sm text-base-content/60 mt-1">
          Vérifiez vos informations puis validez le paiement
        </p>
      </div>

      {/* Erreur globale + détails */}
      {error && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 space-y-2">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-error">Erreur</p>
              <p className="text-sm text-base-content/70">{error}</p>
            </div>
          </div>
          {errorDetails && errorDetails.length > 0 && (
            <ul className="ml-8 text-xs text-base-content/60 list-disc space-y-1">
              {errorDetails.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* COLONNE GAUCHE */}
          <div className="lg:col-span-2 space-y-6">

            {/* LIVRAISON */}
            <div className="bg-base-100 border border-base-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 pb-3 border-b border-base-200">
                <MapPin className="w-5 h-5 text-primary" />
                Adresse de livraison
              </h2>

              <div>
                <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                  Adresse complète *
                </label>
                <textarea
                  name="delivery_address"
                  value={form.delivery_address}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Ex: Cité Keur Gorgui, Rue 15, Villa 123"
                  className={`textarea textarea-bordered w-full ${errors.delivery_address ? 'textarea-error' : ''}`}
                />
                {errors.delivery_address && (
                  <p className="text-xs text-error mt-1">{errors.delivery_address}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                    Ville
                  </label>
                  <input
                    type="text"
                    name="delivery_city"
                    value={form.delivery_city}
                    onChange={handleChange}
                    placeholder="Dakar"
                    className="input input-bordered w-full"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-base-content/60 mb-1 block">
                    Téléphone *
                  </label>
                  <input
                    type="tel"
                    name="delivery_phone"
                    value={form.delivery_phone}
                    onChange={handleChange}
                    placeholder="+221 77 123 45 67"
                    className={`input input-bordered w-full ${errors.delivery_phone ? 'input-error' : ''}`}
                  />
                  {errors.delivery_phone && (
                    <p className="text-xs text-error mt-1">{errors.delivery_phone}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-base-content/60 mb-1 flex items-center gap-1">
                  <MessageSquare className="w-3 h-3" />
                  Notes (optionnel)
                </label>
                <textarea
                  name="delivery_notes"
                  value={form.delivery_notes}
                  onChange={handleChange}
                  rows={2}
                  placeholder="Instructions spéciales pour la livraison..."
                  className="textarea textarea-bordered w-full"
                />
              </div>
            </div>

            {/* PAIEMENT */}
            <div className="bg-base-100 border border-base-200 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-bold flex items-center gap-2 pb-3 border-b border-base-200">
                <CreditCard className="w-5 h-5 text-primary" />
                Méthode de paiement
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = form.payment_method === method.id;
                  return (
                    <button
                      type="button"
                      key={method.id}
                      onClick={() => setForm((prev) => ({ ...prev, payment_method: method.id }))}
                      className={`text-left p-4 rounded-xl border-2 transition-all ${
                        isSelected
                          ? 'border-primary bg-primary/5 shadow-sm'
                          : 'border-base-200 hover:border-base-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                          isSelected ? 'bg-primary text-primary-content' : 'bg-base-200'
                        }`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm text-base-content">{method.label}</p>
                          <p className="text-xs text-base-content/60 mt-0.5">{method.description}</p>
                        </div>
                        {isSelected && (
                          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
                            <Check className="w-3 h-3 text-primary-content" />
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {errors.payment_method && (
                <p className="text-xs text-error">{errors.payment_method}</p>
              )}

              {form.payment_method === 'mobile_money' && (
                <div className="bg-info/10 border border-info/20 rounded-lg p-3 text-xs text-info">
                  💡 Vous recevrez une notification sur votre téléphone pour finaliser le paiement.
                </div>
              )}

              {form.payment_method === 'cash' && (
                <div className="bg-warning/10 border border-warning/20 rounded-lg p-3 text-xs text-warning">
                  ⚠️ Le paiement sera effectué à la réception du colis.
                </div>
              )}
            </div>
          </div>

          {/* COLONNE DROITE */}
          <div className="lg:col-span-1">
            <div className="bg-base-100 border border-base-200 rounded-2xl p-5 space-y-4 lg:sticky lg:top-[160px]">
              <h2 className="text-lg font-bold flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-primary" />
                Récapitulatif
              </h2>

              <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
                {cart.map((item) => (
                  <div key={item.product_id} className="flex gap-2 text-sm">
                    <div className="w-10 h-10 bg-base-200 rounded-lg overflow-hidden shrink-0 flex items-center justify-center">
                      {item.image ? (
                        <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Package className="w-4 h-4 text-base-content/40" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium line-clamp-1">{item.name}</p>
                      <p className="text-[10px] text-base-content/50">× {item.quantity}</p>
                    </div>
                    <p className="text-xs font-semibold shrink-0">
                      {formatPrice(item.price * item.quantity)} F
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-base-200 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/70">Sous-total</span>
                  <span className="font-semibold">{formatPrice(subtotal)} F</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/70">Livraison</span>
                  <span className={`font-semibold ${shipping === 0 ? 'text-success' : ''}`}>
                    {shipping === 0 ? 'Gratuite' : `${formatPrice(shipping)} F`}
                  </span>
                </div>
              </div>

              <div className="border-t border-base-200 pt-3 flex justify-between items-baseline">
                <span className="text-base font-bold">Total</span>
                <div className="text-right">
                  <span className="text-2xl font-black text-primary">
                    {formatPrice(total)} F
                  </span>
                  <p className="text-[10px] text-base-content/50">TTC</p>
                </div>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-content font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Traitement en cours...
                  </>
                ) : (
                  <>
                    Confirmer la commande
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>

              <Link
                to="/panier"
                className="w-full text-center border-2 border-base-300 hover:border-primary hover:text-primary font-semibold py-2.5 rounded-xl transition-all text-sm flex items-center justify-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Retour au panier
              </Link>

              <div className="flex items-center gap-2 text-[10px] text-base-content/50 justify-center pt-2">
                <ShieldCheck className="w-3 h-3" />
                Paiement sécurisé • Livraison 48h
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

// ==========================================
// EXPORT avec PublicLayout
// ==========================================
export default function CheckoutPage() {
  return (
    <PublicLayout>
      <CheckoutContent />
    </PublicLayout>
  );
}