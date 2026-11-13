// src/components/site/components/PanierPage.jsx
// ==========================================
// Page Panier
// ==========================================
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ShoppingCart, Trash2, Plus, Minus, ArrowRight, ArrowLeft,
  Tag, Truck, ShieldCheck, AlertCircle, Package, X, Check,
  RefreshCw,
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
  save: (cart) => {
    localStorage.setItem('cart', JSON.stringify(cart));
    window.dispatchEvent(new Event('cart-updated'));
  },
  remove: (productId) => {
    const cart = cartStorage.get().filter((item) => item.product_id !== productId);
    cartStorage.save(cart);
    return cart;
  },
  updateQuantity: (productId, newQty) => {
    const cart = cartStorage.get().map((item) =>
      item.product_id === productId ? { ...item, quantity: newQty } : item
    );
    cartStorage.save(cart);
    return cart;
  },
  clear: () => {
    cartStorage.save([]);
  },
};

// ==========================================
// SKELETON
// ==========================================
const PanierSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16">
    <div className="animate-pulse space-y-6">
      <div className="h-8 bg-base-200 rounded w-48" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-base-200 rounded-xl h-32" />
          ))}
        </div>
        <div className="bg-base-200 rounded-xl h-64" />
      </div>
    </div>
  </div>
);

// ==========================================
// CONTENU
// ==========================================
function PanierContent() {
  const navigate = useNavigate();

  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stockErrors, setStockErrors] = useState({});
  const [promoCode, setPromoCode] = useState('');
  const [promoApplied, setPromoApplied] = useState(false);
  const [promoDiscount, setPromoDiscount] = useState(0);
  const [notification, setNotification] = useState(null);

  const isAuthenticated = !!localStorage.getItem('Token');

  // Chargement initial + écoute des mises à jour du panier
  useEffect(() => {
    const loadCart = () => {
      const rawCart = cartStorage.get();
      setCart(rawCart);
      setLoading(false);
      validateStock(rawCart);
    };

    loadCart();

    const handler = () => loadCart();
    window.addEventListener('cart-updated', handler);
    window.addEventListener('storage', handler);

    return () => {
      window.removeEventListener('cart-updated', handler);
      window.removeEventListener('storage', handler);
    };
  }, []);

  // ==========================================
  // VÉRIFIER LE STOCK via API
  // ==========================================
  const validateStock = async (cartItems) => {
    if (!cartItems.length) {
      setStockErrors({});
      return;
    }
    try {
      const items = cartItems.map((i) => ({
        product_id: i.product_id,
        quantity: i.quantity,
      }));
      const res = await AxiosInstance.post('/store/checkout/validate-cart/', { items });
      const errors = {};
      const validItems = res.data?.items || [];
      validItems.forEach((item) => {
        if (!item.is_available) {
          errors[item.product_id] = item.errors || 'Stock insuffisant';
        }
      });
      setStockErrors(errors);
    } catch (err) {
      // Le panier vide côté backend ou erreur réseau — on ignore
      console.warn('⚠️ Validation panier échouée:', err?.response?.status);
    }
  };

  // ==========================================
  // HANDLERS
  // ==========================================
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleIncrement = (item) => {
    const newQty = item.quantity + 1;
    const updated = cartStorage.updateQuantity(item.product_id, newQty);
    setCart(updated);
    validateStock(updated);
  };

  const handleDecrement = (item) => {
    if (item.quantity <= 1) return;
    const newQty = item.quantity - 1;
    const updated = cartStorage.updateQuantity(item.product_id, newQty);
    setCart(updated);
    validateStock(updated);
  };

  const handleRemove = (item) => {
    const updated = cartStorage.remove(item.product_id);
    setCart(updated);
    showNotification(`${item.name} retiré du panier`, 'success');
    validateStock(updated);
  };

  const handleClear = () => {
    if (!window.confirm('Voulez-vous vraiment vider votre panier ?')) return;
    cartStorage.clear();
    setCart([]);
    setStockErrors({});
    showNotification('Panier vidé', 'success');
  };

  const handleApplyPromo = () => {
    if (!promoCode.trim()) return;
    // Placeholder : à relier à une vraie API si besoin
    showNotification('Code promo invalide', 'error');
    setPromoCode('');
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/checkout');
      return;
    }
    if (Object.keys(stockErrors).length > 0) {
      showNotification('Certains articles ne sont plus disponibles', 'error');
      return;
    }
    navigate('/checkout');
  };

  // ==========================================
  // CALCULS
  // ==========================================
  const subtotal = cart.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0) * (item.quantity || 1),
    0
  );
  const taxRate = 0; // TVA incluse dans les prix
  const taxAmount = subtotal * (taxRate / 100);
  const shipping = subtotal > 50000 ? 0 : 2000; // Livraison gratuite > 50 000 F
  const discount = promoApplied ? promoDiscount : 0;
  const total = subtotal + taxAmount + shipping - discount;

  const hasStockErrors = Object.keys(stockErrors).length > 0;

  // ==========================================
  // RENDU
  // ==========================================
  if (loading) return <PanierSkeleton />;

  // Panier vide
  if (cart.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-12 max-w-2xl mx-auto text-center">
          <div className="w-24 h-24 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-6">
            <ShoppingCart className="w-12 h-12 text-base-content/30" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Votre panier est vide</h1>
          <p className="text-base-content/60 mb-6">
            Découvrez nos produits et ajoutez-les à votre panier pour passer commande.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/boutique" className="btn btn-primary gap-2">
              <ArrowLeft className="w-4 h-4" />
              Continuer mes achats
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 space-y-6">

      {/* Notification toast */}
      {notification && (
        <div className="fixed top-24 right-4 z-50">
          <div className={`alert ${notification.type === 'success' ? 'alert-success' : 'alert-error'} shadow-xl rounded-xl max-w-sm`}>
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
              <span className="font-medium text-sm">{notification.message}</span>
            </div>
          </div>
        </div>
      )}

      {/* En-tête */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-base-content flex items-center gap-2">
            <ShoppingCart className="w-7 h-7 text-primary" />
            Mon panier
          </h1>
          <p className="text-sm text-base-content/60 mt-1">
            {cart.length} article{cart.length > 1 ? 's' : ''} dans votre panier
          </p>
        </div>
        <button
          onClick={handleClear}
          className="btn btn-ghost btn-sm gap-2 text-error"
        >
          <Trash2 className="w-4 h-4" />
          Vider le panier
        </button>
      </div>

      {/* Bannière erreur stock */}
      {hasStockErrors && (
        <div className="bg-error/10 border border-error/30 rounded-xl p-4 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-error shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-error">Certains articles ne sont plus disponibles</p>
            <p className="text-sm text-base-content/70">
              Vérifiez les quantités ou retirez les articles concernés avant de valider votre commande.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ==========================================
            LISTE DES ARTICLES
            ========================================== */}
        <div className="lg:col-span-2 space-y-3">
          {cart.map((item) => {
            const hasError = !!stockErrors[item.product_id];
            const lineTotal = (parseFloat(item.price) || 0) * (item.quantity || 1);

            return (
              <div
                key={item.product_id}
                className={`bg-base-100 border rounded-xl p-4 flex gap-4 ${
                  hasError ? 'border-error' : 'border-base-200'
                }`}
              >
                {/* Image */}
                <Link
                  to={`/produit/${item.product_id}`}
                  className="w-20 h-20 sm:w-24 sm:h-24 bg-base-200 rounded-lg overflow-hidden shrink-0"
                >
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-contain p-2"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-base-content/30">
                      <Package className="w-8 h-8" />
                    </div>
                  )}
                </Link>

                {/* Infos + quantités */}
                <div className="flex-1 flex flex-col min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <Link
                      to={`/produit/${item.product_id}`}
                      className="font-semibold text-base-content hover:text-primary transition-colors line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <button
                      onClick={() => handleRemove(item)}
                      className="btn btn-ghost btn-sm btn-circle text-error shrink-0"
                      aria-label="Retirer"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {hasError && (
                    <p className="text-xs text-error mt-1">
                      ⚠️ {typeof stockErrors[item.product_id] === 'string' 
                        ? stockErrors[item.product_id] 
                        : 'Stock insuffisant'}
                    </p>
                  )}

                  <div className="mt-auto flex items-center justify-between gap-2 pt-2">
                    {/* Quantité */}
                    <div className="flex items-center bg-base-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => handleDecrement(item)}
                        disabled={item.quantity <= 1}
                        className="w-8 h-8 flex items-center justify-center hover:bg-base-300 transition-colors disabled:opacity-30"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-8 text-center text-sm font-bold">{item.quantity}</span>
                      <button
                        onClick={() => handleIncrement(item)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-base-300 transition-colors"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    {/* Prix */}
                    <div className="text-right">
                      <p className="text-xs text-base-content/50">
                        {formatPrice(item.price)} F × {item.quantity}
                      </p>
                      <p className="font-black text-primary">
                        {formatPrice(lineTotal)} F
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Continuer mes achats */}
          <Link
            to="/boutique"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline pt-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Continuer mes achats
          </Link>
        </div>

        {/* ==========================================
            RÉCAPITULATIF
            ========================================== */}
        <div className="lg:col-span-1">
          <div className="bg-base-100 border border-base-200 rounded-2xl p-5 space-y-4 lg:sticky lg:top-[160px]">
            <h2 className="text-lg font-bold">Récapitulatif</h2>

            {/* Code promo */}
            <div>
              <label className="text-xs font-semibold text-base-content/60 flex items-center gap-1 mb-1">
                <Tag className="w-3 h-3" /> Code promo
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  placeholder="Entrez votre code"
                  className="input input-bordered input-sm flex-1"
                />
                <button onClick={handleApplyPromo} className="btn btn-primary btn-sm">
                  Appliquer
                </button>
              </div>
            </div>

            <div className="border-t border-base-200 pt-3 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-base-content/70">Sous-total</span>
                <span className="font-semibold">{formatPrice(subtotal)} F</span>
              </div>
              <div className="flex justify-between">
                <span className="text-base-content/70">Livraison</span>
                <span className="font-semibold text-success">
                  {shipping === 0 ? 'Gratuite' : `${formatPrice(shipping)} F`}
                </span>
              </div>
              {promoApplied && promoDiscount > 0 && (
                <div className="flex justify-between text-success">
                  <span>Remise code promo</span>
                  <span className="font-semibold">-{formatPrice(promoDiscount)} F</span>
                </div>
              )}
            </div>

            <div className="border-t border-base-200 pt-3 flex justify-between items-baseline">
              <span className="text-base font-bold">Total</span>
              <div className="text-right">
                <span className="text-2xl font-black text-primary">
                  {formatPrice(total)} F
                </span>
                <p className="text-[10px] text-base-content/50">TTC (TVA incluse)</p>
              </div>
            </div>

            {subtotal < 50000 && (
              <div className="bg-info/10 border border-info/20 rounded-lg p-2 text-xs text-info flex items-start gap-2">
                <Truck className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                  Ajoutez {formatPrice(50000 - subtotal)} F pour bénéficier de la <b>livraison gratuite</b> !
                </span>
              </div>
            )}

            <button
              onClick={handleCheckout}
              disabled={hasStockErrors}
              className="w-full bg-primary hover:bg-primary/90 text-primary-content font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAuthenticated ? 'Passer commande' : 'Se connecter pour commander'}
              <ArrowRight className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-2 gap-2 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                <ShieldCheck className="w-3.5 h-3.5 text-primary" />
                <span>Paiement sécurisé</span>
              </div>
              <div className="flex items-center gap-1.5 text-xs text-base-content/60">
                <Truck className="w-3.5 h-3.5 text-primary" />
                <span>Livraison 48h</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EXPORT
// ==========================================
export default function PanierPage() {
  return (
    <PublicLayout>
      <PanierContent />
    </PublicLayout>
  );
}