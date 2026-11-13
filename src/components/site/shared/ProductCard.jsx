// src/components/site/shared/ProductCard.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Star, ShoppingCart, Heart, Plus } from 'lucide-react';

const formatPrice = (price) => {
  const num = parseFloat(price) || 0;
  return num.toLocaleString('fr-FR', { maximumFractionDigits: 0 });
};

const ProductCard = ({
  product,
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
    <div className="group relative bg-base-100 border border-base-200 rounded-xl hover:shadow-xl transition-all duration-300 flex flex-col h-full overflow-hidden">
      
      {/* HEADER BADGES */}
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
        {discount > 0 && (
          <span className="bg-error text-error-content text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm tracking-wide">
            -{discount}%
          </span>
        )}
        {product.is_new && (
          <span className="bg-primary text-primary-content text-[10px] font-bold px-2 py-1 rounded-sm shadow-sm uppercase tracking-wide">
            Nouveau
          </span>
        )}
      </div>

      {/* FAVORIS */}
      <button
        onClick={(e) => { e.preventDefault(); onToggleFavorite?.(product); }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm ${
          isFavorite
            ? 'bg-error text-error-content opacity-100'
            : 'bg-base-100/90 backdrop-blur-md text-base-content/50 hover:text-error opacity-0 group-hover:opacity-100'
        }`}
        aria-label="Favoris"
      >
        <Heart className={`w-4 h-4 ${isFavorite ? 'fill-current' : ''}`} />
      </button>

      {/* IMAGE */}
      <Link to={`/produit/${product.id}`} className="block relative aspect-square bg-base-200/50 p-4 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={product.name}
            className="w-full h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingCart className="w-10 h-10 text-base-content/20" />
          </div>
        )}
      </Link>

      {/* CONTENU */}
      <div className="p-4 flex-1 flex flex-col">
        {product.brand && (
          <span className="text-[10px] font-bold text-base-content/50 uppercase tracking-wider mb-1">
            {product.brand}
          </span>
        )}
        
        <Link to={`/produit/${product.id}`}>
          <h4 className="text-sm text-base-content font-medium line-clamp-2 mb-2 group-hover:text-primary transition-colors leading-snug">
            {product.name}
          </h4>
        </Link>

        {/* ÉTOILES */}
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star 
                key={i} 
                className={`w-3 h-3 ${
                  i < Math.floor(product.rating || 4) ? 'fill-warning text-warning' : 'fill-base-200 text-base-200'
                }`} 
              />
            ))}
          </div>
          <span className="text-xs text-base-content/50">
            ({product.reviews_count || 0})
          </span>
        </div>

        {/* PRIX */}
        <div className="mt-auto">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-lg font-black text-base-content tracking-tight">
              {formatPrice(promoPrice || price)} F
            </span>
            {promoPrice > 0 && price > promoPrice && (
              <span className="text-xs text-base-content/40 line-through">
                {formatPrice(price)} F
              </span>
            )}
          </div>
        </div>
      </div>

      {/* BOUTON AJOUT PANIER (+) */}
      <div className="absolute bottom-4 right-4">
        <button
          onClick={(e) => { e.preventDefault(); onAddToCart?.(product); }}
          className="w-10 h-10 bg-base-content text-base-100 rounded-full flex items-center justify-center shadow-lg hover:bg-primary hover:text-primary-content hover:scale-110 transition-all duration-300"
          aria-label="Ajouter au panier"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};

export const ProductSkeleton = () => (
  <div className="bg-base-100 border border-base-200 rounded-xl p-4 animate-pulse">
    <div className="aspect-square bg-base-200 rounded-lg mb-4" />
    <div className="h-3 bg-base-200 rounded w-1/3 mb-2" />
    <div className="h-4 bg-base-200 rounded mb-2" />
    <div className="h-4 bg-base-200 rounded w-2/3 mb-3" />
    <div className="h-6 bg-base-200 rounded w-1/2" />
  </div>
);

export { formatPrice };
export default ProductCard;