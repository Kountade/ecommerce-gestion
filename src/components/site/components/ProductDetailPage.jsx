// src/components/site/components/ProductDetailPage.jsx
// ==========================================
// Page de détail d'un produit
// ==========================================
import React, { useState, useEffect, useCallback } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, Star, ShoppingCart, Heart, Minus, Plus,
  Truck, ShieldCheck, RefreshCw, Package, AlertCircle,
  ChevronLeft, Check, X, Share2, Sparkles,
} from 'lucide-react';

import PublicLayout from '../Layout/PublicLayout';           // ✅ Pour envelopper la page
import AxiosInstance from '../../AxiosInstance';             // ✅ GARDÉ COMME VOUS VOULEZ

// ==========================================
// HELPERS
// ==========================================
const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const cartStorage = {
  add: (product, quantity = 1) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item) => item.product_id === product.id);
      if (existing) {
        existing.quantity += quantity;
      } else {
        cart.push({
          product_id: product.id,
          name: product.name,
          price: parseFloat(product.promo_price || product.selling_price || 0),
          image: product.image_url || product.image,
          quantity,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      return true;
    } catch {
      return false;
    }
  },
};

// ==========================================
// SKELETON (avec padding top pour ne pas coller à la navbar)
// ==========================================
const DetailSkeleton = () => (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16">
    <div className="animate-pulse space-y-6">
      <div className="h-4 bg-base-200 rounded w-64" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-base-200 rounded-xl" />
        <div className="space-y-4">
          <div className="h-4 bg-base-200 rounded w-32" />
          <div className="h-8 bg-base-200 rounded w-3/4" />
          <div className="h-4 bg-base-200 rounded w-1/2" />
          <div className="h-12 bg-base-200 rounded w-1/3" />
          <div className="h-10 bg-base-200 rounded" />
          <div className="h-12 bg-base-200 rounded" />
        </div>
      </div>
    </div>
  </div>
);

// ==========================================
// COMPOSANT PRODUIT SIMILAIRE
// ==========================================
const RelatedProductCard = ({ product }) => {
  const imageUrl = product.image_url || product.image;
  const price = parseFloat(product.selling_price) || 0;
  const promoPrice = parseFloat(product.promo_price) || 0;

  return (
    <Link
      to={`/produit/${product.id}`}
      className="group bg-base-100 border border-base-200 rounded-xl p-3 hover:shadow-lg transition-all duration-300 flex flex-col"
    >
      <div className="relative aspect-square bg-base-200 rounded-lg mb-3 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/30">
            <Package className="w-8 h-8" />
          </div>
        )}
      </div>
      <h4 className="text-sm font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors">
        {product.name}
      </h4>
      <div className="mt-auto">
        <span className="text-lg font-black text-base-content">
          {formatPrice(promoPrice || price)} F
        </span>
        {promoPrice > 0 && price > promoPrice && (
          <span className="text-xs text-base-content/50 line-through ml-2">
            {formatPrice(price)} F
          </span>
        )}
      </div>
    </Link>
  );
};

// ==========================================
// CONTENU (sans PublicLayout pour éviter le remontage)
// ==========================================
function ProductDetailContent() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [product, setProduct] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isFavorite, setIsFavorite] = useState(false);
  const [activeImage, setActiveImage] = useState(0);
  const [activeTab, setActiveTab] = useState('description');
  const [notification, setNotification] = useState(null);

  const isAuthenticated = !!localStorage.getItem('Token');

  // CHARGEMENT DU PRODUIT
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    AxiosInstance.get(`/store/products/${id}/`)
      .then((res) => {
        if (!cancelled) setProduct(res.data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err?.response?.status === 404
              ? 'Ce produit est introuvable ou n\'est plus disponible.'
              : 'Impossible de charger le produit. Vérifiez votre connexion.'
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    setActiveImage(0);
    setQuantity(1);
    setActiveTab('description');

    return () => { cancelled = true; };
  }, [id]);

  // CHARGEMENT DES PRODUITS SIMILAIRES
  useEffect(() => {
    if (!product) return;
    let cancelled = false;

    AxiosInstance.get(`/store/products/${id}/related/`)
      .then((res) => {
        if (!cancelled) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setRelated(list);
        }
      })
      .catch(() => {
        if (!cancelled) setRelated([]);
      });

    return () => { cancelled = true; };
  }, [product, id]);

  // STATUT FAVORI
  useEffect(() => {
    if (!isAuthenticated || !id) return;
    AxiosInstance.get('/store/favorites/ids/')
      .then((res) => {
        const ids = res.data?.product_ids || [];
        setIsFavorite(ids.includes(parseInt(id)));
      })
      .catch(() => setIsFavorite(false));
  }, [isAuthenticated, id]);

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleToggleFavorite = useCallback(async () => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/produit/' + id);
      return;
    }
    setIsFavorite((prev) => !prev);
    try {
      const res = await AxiosInstance.post('/store/favorites/toggle/', {
        product_id: product.id,
      });
      setIsFavorite(!!res.data?.is_favorite);
      showNotification(
        res.data?.is_favorite ? 'Ajouté aux favoris' : 'Retiré des favoris',
        'success'
      );
    } catch {
      setIsFavorite((prev) => !prev);
      showNotification('Erreur lors du traitement', 'error');
    }
  }, [isAuthenticated, product, id, navigate]);

  const handleAddToCart = () => {
    if (!product) return;
    const ok = cartStorage.add(product, quantity);
    if (ok) {
      showNotification(`${quantity} × ${product.name} ajouté au panier`, 'success');
    } else {
      showNotification('Erreur lors de l\'ajout au panier', 'error');
    }
  };

  const incrementQty = () => {
    if (product && quantity < (product.current_stock || 999)) {
      setQuantity((q) => q + 1);
    }
  };

  const decrementQty = () => {
    if (quantity > 1) setQuantity((q) => q - 1);
  };

  // LOADING
  if (loading) return <DetailSkeleton />;

  // ERREUR
  if (error) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center px-4 pt-[140px]">
        <div className="bg-base-100 border border-base-200 rounded-xl shadow-md p-8 max-w-md w-full text-center">
          <AlertCircle className="w-16 h-16 text-error mx-auto mb-4" />
          <h2 className="text-xl font-bold mb-2">Oups !</h2>
          <p className="text-base-content/70 mb-6">{error}</p>
          <div className="flex gap-3 justify-center">
            <Link to="/boutique" className="btn btn-primary">Retour à la boutique</Link>
            <button onClick={() => window.location.reload()} className="btn btn-ghost">Réessayer</button>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  const imageUrl = product.image_url || product.image;
  const gallery = product.gallery && product.gallery.length > 0 ? product.gallery : [];
  const allImages = [imageUrl, ...gallery].filter(Boolean);

  const price = parseFloat(product.selling_price) || 0;
  const promoPrice = parseFloat(product.promo_price) || 0;
  const finalPrice = promoPrice > 0 ? promoPrice : price;
  const discount = promoPrice > 0 && price > promoPrice
    ? Math.round(((price - promoPrice) / price) * 100)
    : 0;

  const stock = product.current_stock || 0;
  const inStock = stock > 0;

  return (
    // ✅ pt-[140px] AJOUTÉ ICI : descend le contenu sous la navbar
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 space-y-8">

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

      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-base-content/60 flex-wrap">
        <Link to="/" className="hover:text-primary transition-colors">Accueil</Link>
        <ChevronRight className="w-4 h-4" />
        <Link to="/boutique" className="hover:text-primary transition-colors">Boutique</Link>
        {product.category_name && (
          <>
            <ChevronRight className="w-4 h-4" />
            <Link to={`/boutique?cat=${product.category}`} className="hover:text-primary transition-colors">
              {product.category_name}
            </Link>
          </>
        )}
        <ChevronRight className="w-4 h-4" />
        <span className="text-base-content font-medium truncate max-w-xs">{product.name}</span>
      </nav>

      {/* BLOC PRINCIPAL */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* GALERIE */}
        <div className="space-y-4">
          <div className="relative aspect-square bg-base-200 rounded-2xl overflow-hidden border border-base-200">
            {allImages.length > 0 && allImages[activeImage] ? (
              <img src={allImages[activeImage]} alt={product.name} className="w-full h-full object-contain p-6" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-base-content/30">
                <Package className="w-20 h-20" />
              </div>
            )}
            {discount > 0 && (
              <div className="absolute top-4 left-4">
                <span className="bg-error text-error-content text-sm font-bold px-3 py-1.5 rounded-lg shadow-md">
                  -{discount}%
                </span>
              </div>
            )}
            {product.is_featured && (
              <div className="absolute top-4 right-4">
                <span className="bg-secondary text-secondary-content text-xs font-bold px-3 py-1.5 rounded-lg shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Vedette
                </span>
              </div>
            )}
          </div>
          {allImages.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {allImages.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`aspect-square bg-base-200 rounded-lg overflow-hidden border-2 transition-all ${
                    activeImage === idx ? 'border-primary scale-105' : 'border-transparent hover:border-base-300'
                  }`}
                >
                  <img src={img} alt={`${product.name} - ${idx + 1}`} className="w-full h-full object-contain p-2" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* INFOS */}
        <div className="flex flex-col space-y-5">
          <div className="flex items-center gap-3 text-sm">
            {product.category_name && (
              <span className="bg-primary/10 text-primary font-semibold px-3 py-1 rounded-full">
                {product.category_name}
              </span>
            )}
            <span className="text-base-content/50">Réf. {product.code}</span>
          </div>

          <h1 className="text-2xl md:text-3xl font-black text-base-content leading-tight">{product.name}</h1>

          <div className="flex items-center gap-2">
            <div className="flex text-warning">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className={`w-4 h-4 ${i < 4 ? 'fill-warning' : 'fill-base-300 text-base-300'}`} />
              ))}
            </div>
            <span className="text-sm text-base-content/60">(24 avis)</span>
          </div>

          <div className="bg-base-200/50 rounded-xl p-4">
            <div className="flex items-baseline gap-3 flex-wrap">
              <span className="text-3xl md:text-4xl font-black text-primary">
                {formatPrice(finalPrice)} <span className="text-lg">FCFA</span>
              </span>
              {promoPrice > 0 && price > promoPrice && (
                <span className="text-lg text-base-content/50 line-through">{formatPrice(price)} FCFA</span>
              )}
              {discount > 0 && (
                <span className="bg-error text-error-content text-xs font-bold px-2 py-1 rounded">
                  Économisez {formatPrice(price - promoPrice)} F
                </span>
              )}
            </div>
            <p className="text-xs text-base-content/60 mt-1">Prix TTC (TVA incluse)</p>
          </div>

          <div className="flex items-center gap-2">
            {inStock ? (
              <>
                <div className="w-3 h-3 rounded-full bg-success animate-pulse" />
                <span className="text-success font-semibold text-sm">
                  En stock ({stock} disponible{stock > 1 ? 's' : ''})
                </span>
              </>
            ) : (
              <>
                <div className="w-3 h-3 rounded-full bg-error" />
                <span className="text-error font-semibold text-sm">Rupture de stock</span>
              </>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-3 items-stretch">
            <div className="flex items-center bg-base-200 rounded-xl overflow-hidden">
              <button onClick={decrementQty} disabled={quantity <= 1} className="w-12 h-12 flex items-center justify-center hover:bg-base-300 transition-colors disabled:opacity-30">
                <Minus className="w-4 h-4" />
              </button>
              <span className="w-14 text-center font-bold text-lg">{quantity}</span>
              <button onClick={incrementQty} disabled={!inStock || quantity >= stock} className="w-12 h-12 flex items-center justify-center hover:bg-base-300 transition-colors disabled:opacity-30">
                <Plus className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleAddToCart}
              disabled={!inStock}
              className="flex-1 bg-primary hover:bg-primary/90 text-primary-content font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShoppingCart className="w-5 h-5" />
              Ajouter au panier
            </button>
            <button
              onClick={handleToggleFavorite}
              className={`w-12 h-12 rounded-xl flex items-center justify-center border-2 transition-all ${
                isFavorite ? 'bg-error border-error text-error-content' : 'border-base-300 hover:border-error hover:text-error'
              }`}
              aria-label="Ajouter aux favoris"
            >
              <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
            </button>
            <button
              onClick={() => {
                if (navigator.share) {
                  navigator.share({ title: product.name, url: window.location.href });
                } else {
                  navigator.clipboard.writeText(window.location.href);
                  showNotification('Lien copié !', 'success');
                }
              }}
              className="w-12 h-12 rounded-xl flex items-center justify-center border-2 border-base-300 hover:border-primary hover:text-primary transition-all"
              aria-label="Partager"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="flex gap-3">
            <Link to="/panier" className="flex-1 text-center border-2 border-primary text-primary hover:bg-primary hover:text-primary-content font-bold py-3 rounded-xl transition-all">
              Voir mon panier
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-base-200">
            <div className="flex items-center gap-2 text-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base-content">Livraison rapide</p>
                <p className="text-xs text-base-content/60">Sous 48h</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base-content">Garantie</p>
                <p className="text-xs text-base-content/60">12 mois</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="font-semibold text-base-content">Retour</p>
                <p className="text-xs text-base-content/60">Sous 14 jours</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ONGLETS */}
      <div className="bg-base-100 border border-base-200 rounded-2xl overflow-hidden">
        <div className="flex border-b border-base-200 overflow-x-auto">
          {[
            { key: 'description', label: 'Description' },
            { key: 'caracteristiques', label: 'Caractéristiques' },
            { key: 'livraison', label: 'Livraison & Retour' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-6 py-4 font-semibold text-sm whitespace-nowrap transition-colors ${
                activeTab === tab.key
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-base-content/60 hover:text-base-content'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="p-6">
          {activeTab === 'description' && (
            <div className="prose max-w-none">
              {product.description ? (
                <p className="text-base-content/80 leading-relaxed whitespace-pre-line">{product.description}</p>
              ) : (
                <p className="text-base-content/50 italic">Aucune description disponible pour ce produit.</p>
              )}
            </div>
          )}
          {activeTab === 'caracteristiques' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-base-200/50 rounded-lg p-3">
                <p className="text-xs text-base-content/60 mb-1">Code produit</p>
                <p className="font-semibold">{product.code}</p>
              </div>
              {product.barcode && (
                <div className="bg-base-200/50 rounded-lg p-3">
                  <p className="text-xs text-base-content/60 mb-1">Code-barres</p>
                  <p className="font-semibold">{product.barcode}</p>
                </div>
              )}
              {product.category_name && (
                <div className="bg-base-200/50 rounded-lg p-3">
                  <p className="text-xs text-base-content/60 mb-1">Catégorie</p>
                  <p className="font-semibold">{product.category_name}</p>
                </div>
              )}
              {product.unit_symbol && (
                <div className="bg-base-200/50 rounded-lg p-3">
                  <p className="text-xs text-base-content/60 mb-1">Unité</p>
                  <p className="font-semibold">{product.unit_symbol}</p>
                </div>
              )}
              <div className="bg-base-200/50 rounded-lg p-3">
                <p className="text-xs text-base-content/60 mb-1">Type</p>
                <p className="font-semibold">{product.type_display || product.type}</p>
              </div>
              <div className="bg-base-200/50 rounded-lg p-3">
                <p className="text-xs text-base-content/60 mb-1">TVA</p>
                <p className="font-semibold">{product.tax_rate || 0}%</p>
              </div>
              {product.has_expiry && (
                <div className="bg-warning/10 rounded-lg p-3 col-span-full">
                  <p className="text-xs text-warning mb-1">Produit périssable</p>
                  <p className="font-semibold text-sm">Ce produit a une date d'expiration. Vérifiez auprès du vendeur.</p>
                </div>
              )}
            </div>
          )}
          {activeTab === 'livraison' && (
            <div className="space-y-4 text-base-content/80">
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <Truck className="w-5 h-5 text-primary" /> Livraison
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                  <li>Livraison à domicile sous 48h à Dakar</li>
                  <li>Livraison en régions sous 3 à 5 jours ouvrés</li>
                  <li>Frais de livraison calculés au moment du paiement</li>
                  <li>Suivi de commande par SMS et email</li>
                </ul>
              </div>
              <div>
                <h4 className="font-bold mb-2 flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-primary" /> Retour & Remboursement
                </h4>
                <ul className="list-disc list-inside space-y-1 text-sm ml-2">
                  <li>Retour accepté sous 14 jours après réception</li>
                  <li>Produit dans son emballage d'origine</li>
                  <li>Remboursement sous 7 jours ouvrables</li>
                  <li>Contactez notre service client pour toute réclamation</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* PRODUITS SIMILAIRES */}
      {related.length > 0 && (
        <div className="bg-base-100 border border-base-200 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-base-content mb-6 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" /> Vous aimerez aussi
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {related.slice(0, 5).map((prod) => (
              <RelatedProductCard key={prod.id} product={prod} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// EXPORT avec PublicLayout
// ==========================================
export default function ProductDetailPage() {
  return (
    <PublicLayout>
      <ProductDetailContent />
    </PublicLayout>
  );
}