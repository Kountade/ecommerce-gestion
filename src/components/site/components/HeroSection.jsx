// src/components/site/HeroSection.jsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight, ChevronLeft, Timer, Zap, ArrowRight,
  Smartphone, Tv, Shirt, Home as HomeIcon, Dumbbell, Gamepad2,
  Star, Apple, Play, ShoppingCart, Heart, Sparkles, TrendingUp,
} from 'lucide-react';

import AxiosInstance from '../../AxiosInstance';

// ==========================================
// 1. SLIDES DU CARROUSEL
// ==========================================
const MAIN_SLIDES = [
  {
    id: 1,
    category: '• TVS & AUDIO',
    title: 'Les meilleures images aux meilleurs prix !',
    discount: "Jusqu'à -60%",
    bgColor: 'bg-gradient-to-r from-secondary to-primary',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?auto=format&fit=crop&q=80&w=800',
    link: '/boutique?cat=tv',
  },
  {
    id: 2,
    category: '• SMARTPHONES',
    title: 'Les dernières nouveautés sont arrivées !',
    discount: 'À partir de 49 900 FCFA',
    bgColor: 'bg-gradient-to-r from-primary to-[#0a5c8a]',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&q=80&w=800',
    link: '/boutique?cat=smartphones',
  },
  {
    id: 3,
    category: '• ÉLECTROMÉNAGER',
    title: 'Équipez votre maison à petit prix',
    discount: "Jusqu'à -40%",
    bgColor: 'bg-gradient-to-r from-secondary via-[#0a5c8a] to-primary',
    textColor: 'text-white',
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=800',
    link: '/boutique?cat=electromenager',
  },
];

// ==========================================
// 2. RACCOURCIS
// ==========================================
const SHORTCUT_CARDS = [
  { id: 1, title: 'Notre Catalogue', subtitle: '+10 000 Produits', bg: 'bg-primary', color: 'text-primary-content' },
  { id: 2, title: 'Climatisation', subtitle: 'OFFRE LIMITÉE', bg: 'bg-base-200', color: 'text-secondary', image: 'https://images.unsplash.com/photo-1595514535215-9a5e0e8e04be?auto=format&fit=crop&q=80&w=200' },
  { id: 3, title: 'Devenir Partenaire', subtitle: 'REJOIGNEZ-NOUS', bg: 'bg-accent', color: 'text-accent-content' },
  { id: 4, title: 'Déstockage', subtitle: "JUSQU'À -80%", bg: 'bg-error', color: 'text-error-content' },
  { id: 5, title: 'Smartphones', subtitle: 'TROUVEZ TOUT', bg: 'bg-base-200', color: 'text-primary', image: 'https://images.unsplash.com/photo-1605236453806-6ff36851218e?auto=format&fit=crop&q=80&w=200' },
  { id: 6, title: 'Nouveautés', subtitle: 'DÉCOUVRIR', bg: 'bg-base-300', color: 'text-secondary' },
];

// ==========================================
// 3. ICÔNES CATÉGORIES
// ==========================================
const CATEGORY_ICONS = {
  'Téléphones': Smartphone,
  'TV': Tv,
  'TV & Audio': Tv,
  'Mode': Shirt,
  'Maison': HomeIcon,
  'Sport': Dumbbell,
  'Sport & Loisirs': Dumbbell,
  'Gaming': Gamepad2,
  'Jeux Vidéo': Gamepad2,
};

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
          price: parseFloat(product.selling_price || 0),
          image: product.image_url || product.image,
          quantity,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch {
      // Ignore
    }
  },
};

// ==========================================
// CARTE PRODUIT
// ==========================================
const ProductCard = ({
  product,
  showBadge = false,
  isFavorite = false,
  onToggleFavorite,
  onAddToCart,
}) => {
  const imageUrl = product.image_url || product.image;
  const price = parseFloat(product.selling_price) || 0;
  const promoPrice = parseFloat(product.promo_price) || 0;
  const discount = promoPrice && price
    ? Math.round(((price - promoPrice) / price) * 100)
    : 0;

  return (
    <div className="group relative bg-base-100 border border-base-200 rounded-xl p-3 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] transition-all duration-300 flex flex-col h-full">
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1 items-start">
        {discount > 0 && (
          <span className="bg-error text-error-content text-[10px] font-bold px-2 py-1 rounded-md shadow-sm">
            -{discount}%
          </span>
        )}
        {showBadge && product.is_featured && (
          <span className="bg-secondary text-secondary-content text-[10px] font-bold px-2 py-1 rounded-md shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Vedette
          </span>
        )}
      </div>

      <button
        onClick={(e) => { e.preventDefault(); onToggleFavorite?.(product); }}
        className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center shadow-sm transition-all
          ${isFavorite
            ? 'bg-error text-error-content'
            : 'bg-base-100/80 backdrop-blur-sm text-base-content/40 hover:text-error opacity-0 group-hover:opacity-100'
          }`}
        aria-label={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      <Link to={`/produit/${product.id}`} className="block relative aspect-square bg-base-200 rounded-lg mb-3 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain p-2 group-hover:scale-110 transition-transform duration-500 ease-out"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-base-content/30">
            <ShoppingCart className="w-8 h-8" />
          </div>
        )}
      </Link>

      <div className="flex-1 flex flex-col">
        <Link to={`/produit/${product.id}`}>
          <h4 className="text-sm text-base-content font-medium line-clamp-2 mb-1 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h4>
        </Link>

        <div className="flex items-center gap-1 mb-2">
          <div className="flex text-warning">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className={`w-3 h-3 ${i < 4 ? 'fill-warning' : 'fill-base-300 text-base-300'}`} />
            ))}
          </div>
          <span className="text-[11px] font-medium text-base-content/60">
            ({product.current_stock ?? '—'})
          </span>
        </div>

        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-black text-base-content">
              {formatPrice(promoPrice || price)} F
            </span>
            {promoPrice > 0 && price > promoPrice && (
              <span className="text-xs text-base-content/50 line-through">
                {formatPrice(price)} F
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="absolute bottom-3 right-3 md:opacity-0 md:group-hover:opacity-100 transition-all duration-300 transform translate-y-2 group-hover:translate-y-0">
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart?.(product); }}
          className="w-9 h-9 bg-primary text-primary-content rounded-full flex items-center justify-center shadow-lg hover:bg-primary/90 hover:scale-110 transition-all"
          aria-label="Ajouter au panier"
        >
          <ShoppingCart className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

// ==========================================
// SKELETON
// ==========================================
const ProductSkeleton = () => (
  <div className="bg-base-100 border border-base-200 rounded-xl p-3 animate-pulse">
    <div className="aspect-square bg-base-200 rounded-lg mb-3" />
    <div className="h-3 bg-base-200 rounded mb-2" />
    <div className="h-3 bg-base-200 rounded w-2/3 mb-2" />
    <div className="h-4 bg-base-200 rounded w-1/2" />
  </div>
);

// ==========================================
// COMPTE À REBOURS
// ==========================================
const CountdownTimer = () => {
  const [timeLeft, setTimeLeft] = useState({ h: 13, m: 34, s: 7 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        let { h, m, s } = prev;
        if (h === 0 && m === 0 && s === 0) return prev;
        if (s > 0) s--;
        else {
          s = 59;
          if (m > 0) m--;
          else {
            m = 59;
            if (h > 0) h--;
          }
        }
        return { h, m, s };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const format = (num) => String(num).padStart(2, '0');
  return (
    <div className="flex items-center gap-1 text-sm font-bold bg-black/20 px-3 py-1.5 rounded-lg">
      <Timer className="w-4 h-4 text-white" />
      <span className="text-white tracking-wider">
        {format(timeLeft.h)}h : {format(timeLeft.m)}m : {format(timeLeft.s)}s
      </span>
    </div>
  );
};

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
export default function HeroSection() {
  const navigate = useNavigate();

  const [currentSlide, setCurrentSlide] = useState(0);
  const [featured, setFeatured] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());

  const [loading, setLoading] = useState({
    featured: true,
    newArrivals: true,
    bestSellers: true,
    categories: true,
  });

  const isAuthenticated = !!localStorage.getItem('Token');

  // Carrousel auto
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % MAIN_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextSlide = () => setCurrentSlide((p) => (p + 1) % MAIN_SLIDES.length);
  const prevSlide = () => setCurrentSlide((p) => (p - 1 + MAIN_SLIDES.length) % MAIN_SLIDES.length);
  const slide = MAIN_SLIDES[currentSlide];

  // ==========================================
  // CHARGEMENT DES DONNÉES
  // ==========================================
  useEffect(() => {
    let cancelled = false;

    const handleResponse = (res, setter, key) => {
      if (!cancelled) {
        console.log(`✅ ${key}:`, res.data);
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setter(list);
      }
    };

    const handleError = (err, key, setter) => {
      console.error(`❌ Erreur ${key}:`, err?.response?.status, err?.response?.data);
      if (!cancelled) setter([]);
    };

    AxiosInstance.get('/store/products/new-arrivals/')
      .then((res) => handleResponse(res, setNewArrivals, 'Nouveautés'))
      .catch((err) => handleError(err, 'Nouveautés', setNewArrivals))
      .finally(() => { if (!cancelled) setLoading((l) => ({ ...l, newArrivals: false })); });

    AxiosInstance.get('/store/products/best-sellers/')
      .then((res) => handleResponse(res, setBestSellers, 'Best-sellers'))
      .catch((err) => handleError(err, 'Best-sellers', setBestSellers))
      .finally(() => { if (!cancelled) setLoading((l) => ({ ...l, bestSellers: false })); });

    AxiosInstance.get('/store/products/featured/')
      .then((res) => handleResponse(res, setFeatured, 'Featured'))
      .catch((err) => handleError(err, 'Featured', setFeatured))
      .finally(() => { if (!cancelled) setLoading((l) => ({ ...l, featured: false })); });

    AxiosInstance.get('/store/categories/')
      .then((res) => {
        if (!cancelled) {
          console.log('✅ Catégories:', res.data);
          const cats = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setCategories(cats.slice(0, 6));
        }
      })
      .catch((err) => handleError(err, 'Catégories', setCategories))
      .finally(() => { if (!cancelled) setLoading((l) => ({ ...l, categories: false })); });

    return () => { cancelled = true; };
  }, []);

  // Favoris
  useEffect(() => {
    if (!isAuthenticated) return;
    AxiosInstance.get('/store/favorites/ids/')
      .then((res) => {
        const ids = res.data?.product_ids || [];
        setFavoriteIds(new Set(ids));
      })
      .catch(() => setFavoriteIds(new Set()));
  }, [isAuthenticated]);

  // Handlers
  const handleToggleFavorite = useCallback(async (product) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/');
      return;
    }
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    try {
      const res = await AxiosInstance.post(
        '/store/favorites/toggle/',
        { product_id: product.id }
      );
      const isFav = res.data?.is_favorite;
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
    } catch {
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (next.has(product.id)) next.delete(product.id);
        else next.add(product.id);
        return next;
      });
    }
  }, [isAuthenticated, navigate]);

  const handleAddToCart = useCallback((product) => {
    cartStorage.add(product, 1);
  }, []);

  // ==========================================
  // RENDU
  // ==========================================
  return (
    /* 
      ✅ CORRECTION RADICALE :
      On annule presque tout le padding du Layout (140px).
      - Mobile : -mt-[115px] (reste 5px d'espace)
      - Desktop : -mt-[135px] (reste 5px d'espace)
    */
    <div className="bg-base-100 min-h-screen pb-16 -mt-[115px] md:-mt-[135px]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">

        {/* 1. CARROUSEL */}
        <div className={`relative rounded-xl overflow-hidden shadow-sm ${slide.bgColor} transition-colors duration-500`}>
          <div className="flex flex-col md:flex-row items-center justify-between min-h-[300px] md:min-h-[350px] p-8 md:p-12">
            <div className={`md:w-1/2 ${slide.textColor} z-10`}>
              <span className="inline-block text-xs font-bold uppercase tracking-wider mb-4 opacity-90">{slide.category}</span>
              <h2 className="text-3xl md:text-5xl font-black mb-6 leading-tight">{slide.title}</h2>
              <div className="inline-block bg-white text-secondary rounded-full px-6 py-2 font-bold text-lg mb-8 shadow-sm">
                {slide.discount}
              </div>
              <div>
                <Link to={slide.link} className="inline-flex items-center gap-2 font-bold hover:gap-3 transition-all bg-black/20 px-6 py-3 rounded-full backdrop-blur-sm">
                  J'achète maintenant <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative mt-8 md:mt-0 h-[200px] md:h-[300px]">
              <img src={slide.image} alt={slide.title} className="w-full h-full object-contain drop-shadow-2xl" />
            </div>
          </div>

          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hidden md:flex">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 bg-white/30 hover:bg-white/50 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all hidden md:flex">
            <ChevronRight className="w-6 h-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {MAIN_SLIDES.map((_, idx) => (
              <button key={idx} onClick={() => setCurrentSlide(idx)} className={`h-2 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`} />
            ))}
          </div>
        </div>

        {/* 2. RACCOURCIS */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {SHORTCUT_CARDS.map((card) => (
            <Link key={card.id} to="/boutique" className={`relative overflow-hidden rounded-xl p-4 flex flex-col items-center justify-center text-center h-28 ${card.bg} shadow-sm hover:shadow-md transition-shadow group`}>
              <div className={`relative z-10 ${card.color}`}>
                <h3 className="font-bold text-sm leading-tight mb-1">{card.title}</h3>
                {card.subtitle && <p className="text-[10px] font-bold uppercase opacity-80 mb-1">{card.subtitle}</p>}
                {card.desc && <p className="text-xs font-bold">{card.desc}</p>}
              </div>
              {card.image && <img src={card.image} alt={card.title} className="absolute -right-4 -bottom-4 w-20 h-20 object-cover opacity-90 group-hover:scale-110 transition-transform duration-500" />}
            </Link>
          ))}
        </div>

        {/* 3. VENTES FLASH - 10 PRODUITS */}
        <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden border border-base-200">
          <div className="bg-secondary px-6 py-4 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <h3 className="text-secondary-content text-xl font-bold flex items-center gap-2">
                <Zap className="w-5 h-5 fill-primary text-primary" /> Ventes flash
              </h3>
              <CountdownTimer />
            </div>
            <Link to="/boutique?tri=featured" className="text-secondary-content text-sm font-bold flex items-center gap-1 hover:underline">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading.featured
              ? [...Array(10)].map((_, i) => <ProductSkeleton key={i} />)
              : featured.length > 0
                ? featured.slice(0, 10).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      isFavorite={favoriteIds.has(prod.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                : <p className="col-span-full text-center text-base-content/50 py-6">Aucun produit en vedette pour le moment.</p>
            }
          </div>
        </div>

        {/* 4. NOUVEAUTÉS - 10 PRODUITS */}
        <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden border border-base-200">
          <div className="px-6 py-4 flex items-center justify-between border-b border-base-200">
            <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-primary" /> Nouveautés
            </h3>
            <Link to="/boutique?tri=nouveautes" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Voir tout <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading.newArrivals
              ? [...Array(10)].map((_, i) => <ProductSkeleton key={i} />)
              : newArrivals.length > 0
                ? newArrivals.slice(0, 10).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      showBadge
                      isFavorite={favoriteIds.has(prod.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                : <p className="col-span-full text-center text-base-content/50 py-6">Aucun nouveau produit.</p>
            }
          </div>
        </div>

        {/* 5. BANNIÈRES MILIEU */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/boutique?cat=electromenager" className="relative rounded-xl overflow-hidden bg-secondary h-48 group flex items-center p-8 shadow-sm">
            <div className="relative z-10 w-2/3 text-secondary-content">
              <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Nouvelle Collection</p>
              <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">Tout pour la maison</h3>
              <span className="inline-flex items-center gap-2 font-bold group-hover:gap-3 transition-all bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm text-sm">Découvrir <ArrowRight className="w-4 h-4" /></span>
            </div>
            <img src="https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&q=80&w=400" alt="Maison" className="absolute -right-8 -bottom-8 w-56 h-56 object-cover opacity-80 rounded-full border-4 border-white/20 group-hover:scale-105 transition-transform duration-500" />
          </Link>

          <Link to="/boutique?cat=mode" className="relative rounded-xl overflow-hidden bg-primary h-48 group flex items-center p-8 shadow-sm">
            <div className="relative z-10 w-2/3 text-primary-content">
              <p className="text-xs font-bold uppercase tracking-wider mb-2 opacity-80">Tendance</p>
              <h3 className="text-2xl md:text-3xl font-black mb-4 leading-tight">La mode à prix cassés</h3>
              <span className="inline-flex items-center gap-2 font-bold group-hover:gap-3 transition-all bg-white/20 px-4 py-2 rounded-full backdrop-blur-sm text-sm">J'en profite <ArrowRight className="w-4 h-4" /></span>
            </div>
            <img src="https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&q=80&w=400" alt="Mode" className="absolute -right-8 -bottom-8 w-56 h-56 object-cover opacity-80 rounded-full border-4 border-white/20 group-hover:scale-105 transition-transform duration-500" />
          </Link>
        </div>

        {/* 6. CATÉGORIES */}
        <div className="bg-base-100 rounded-xl shadow-sm p-6 border border-base-200">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-base-content">Explorer nos catégories</h3>
            <Link to="/boutique" className="text-sm font-bold text-primary hover:underline">Voir tout</Link>
          </div>
          <div className="grid grid-cols-3 md:grid-cols-6 gap-4">
            {loading.categories
              ? [...Array(6)].map((_, i) => (
                  <div key={i} className="flex flex-col items-center gap-3 animate-pulse">
                    <div className="w-16 h-16 rounded-full bg-base-200" />
                    <div className="h-3 w-16 bg-base-200 rounded" />
                  </div>
                ))
              : categories.length > 0
                ? categories.map((cat) => {
                    const Icon = CATEGORY_ICONS[cat.name] || ShoppingCart;
                    return (
                      <Link key={cat.id} to={`/boutique?cat=${cat.id}`} className="flex flex-col items-center gap-3 group">
                        <div className="w-16 h-16 rounded-full bg-base-200 flex items-center justify-center group-hover:scale-110 group-hover:shadow-md transition-all duration-300">
                          <Icon className="w-8 h-8 text-secondary group-hover:text-primary transition-colors" />
                        </div>
                        <span className="text-sm font-medium text-base-content group-hover:text-primary transition-colors text-center">
                          {cat.name}
                        </span>
                      </Link>
                    );
                  })
                : <p className="col-span-full text-center text-base-content/50 py-6">Aucune catégorie disponible.</p>
            }
          </div>
        </div>

        {/* 7. MEILLEURES VENTES - 10 PRODUITS */}
        <div className="bg-base-100 rounded-xl shadow-sm overflow-hidden border border-base-200">
          <div className="px-6 py-4 flex items-center justify-between border-b border-base-200">
            <h3 className="text-lg font-bold text-base-content flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" /> Les meilleures ventes
            </h3>
            <Link to="/boutique?tri=best-sellers" className="text-sm font-bold text-primary hover:underline flex items-center gap-1">
              Voir plus <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="p-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {loading.bestSellers
              ? [...Array(10)].map((_, i) => <ProductSkeleton key={i} />)
              : bestSellers.length > 0
                ? bestSellers.slice(0, 10).map((prod) => (
                    <ProductCard
                      key={prod.id}
                      product={prod}
                      showBadge
                      isFavorite={favoriteIds.has(prod.id)}
                      onToggleFavorite={handleToggleFavorite}
                      onAddToCart={handleAddToCart}
                    />
                  ))
                : <p className="col-span-full text-center text-base-content/50 py-6">Aucune vente enregistrée.</p>
            }
          </div>
        </div>

        {/* 8. MARQUES */}
        <div className="bg-base-100 rounded-xl shadow-sm p-6 border border-base-200">
          <h3 className="text-lg font-bold text-base-content mb-6 text-center">Les marques officielles</h3>
          <div className="flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500 cursor-pointer">
            <span className="text-3xl font-black italic tracking-tighter">SAMSUNG</span>
            <span className="text-3xl font-bold font-serif">Sony</span>
            <span className="text-3xl font-semibold">hp</span>
            <span className="text-3xl font-black text-secondary">NOKIA</span>
            <span className="text-3xl font-bold text-error">Canon</span>
            <span className="text-3xl font-bold">LG</span>
          </div>
        </div>

        {/* 9. NEWSLETTER */}
        <div className="bg-secondary rounded-xl overflow-hidden shadow-lg">
          <div className="flex flex-col md:flex-row">
            <div className="p-8 md:p-12 md:w-2/3 flex flex-col justify-center">
              <h3 className="text-2xl md:text-3xl font-bold text-secondary-content mb-3">Ne ratez aucune promotion !</h3>
              <p className="text-secondary-content/70 mb-6 text-sm">Inscrivez-vous à notre newsletter pour recevoir nos meilleures offres en avant-première.</p>
              <form className="flex flex-col sm:flex-row gap-3 max-w-md" onSubmit={(e) => e.preventDefault()}>
                <input type="email" placeholder="Votre adresse email" className="flex-1 px-4 py-3 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary border border-secondary-content/20 bg-secondary-content/10 text-white placeholder-secondary-content/50" />
                <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-content font-bold px-6 py-3 rounded-lg text-sm transition-colors whitespace-nowrap">S'inscrire</button>
              </form>
            </div>
            <div className="bg-black/20 p-8 md:p-12 md:w-1/3 flex flex-col items-center justify-center text-center border-t md:border-t-0 md:border-l border-white/10">
              <h4 className="text-secondary-content font-bold mb-4">Téléchargez l'application</h4>
              <div className="flex flex-col gap-3 w-full max-w-[200px]">
                <button className="flex items-center justify-center gap-2 bg-black border border-gray-600 hover:border-white text-white px-4 py-2 rounded-lg transition-colors w-full">
                  <Apple className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase opacity-80">Télécharger sur</div>
                    <div className="text-sm font-bold leading-none">App Store</div>
                  </div>
                </button>
                <button className="flex items-center justify-center gap-2 bg-black border border-gray-600 hover:border-white text-white px-4 py-2 rounded-lg transition-colors w-full">
                  <Play className="w-5 h-5" />
                  <div className="text-left">
                    <div className="text-[9px] uppercase opacity-80">Disponible sur</div>
                    <div className="text-sm font-bold leading-none">Google Play</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}