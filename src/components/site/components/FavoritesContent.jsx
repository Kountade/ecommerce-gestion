// src/components/site/components/FavoritesContent.jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Loader2, AlertCircle, ShoppingCart, Package } from 'lucide-react';
import AxiosInstance from '../../AxiosInstance';

const formatCurrency = (amount) => {
  const num = parseFloat(amount) || 0;
  return `${num.toLocaleString('fr-FR')} FCFA`;
};

export default function FavoritesContent() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Charger les favoris
  const fetchFavorites = () => {
    setLoading(true);
    AxiosInstance.get('/store/favorites/')
      .then(res => {
        const data = res.data?.results || res.data || [];
        setFavorites(data);
        setError(null);
      })
      .catch(err => {
        console.error('Erreur favoris:', err);
        setError('Impossible de charger vos favoris.');
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchFavorites();
  }, []);

  // Retirer un favori
  const handleRemove = async (productId) => {
    if (!window.confirm('Retirer ce produit de vos favoris ?')) return;
    try {
      await AxiosInstance.post('/store/favorites/toggle/', { product_id: productId });
      // Mise à jour locale instantanée
      setFavorites(prev => prev.filter(fav => fav.product_id !== productId));
    } catch (err) {
      console.error('Erreur retrait favori:', err);
      alert('Erreur lors du retrait du favori');
    }
  };

  // Ajouter au panier (logique simplifiée)
  const handleAddToCart = (product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find(item => item.product_id === product.product_id);
      
      if (existing) {
        existing.quantity += 1;
      } else {
        cart.push({
          product_id: product.product_id,
          name: product.product_name,
          price: product.product_price,
          image: product.product_image,
          quantity: 1,
        });
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
      alert('Produit ajouté au panier !');
    } catch (err) {
      console.error(err);
    }
  };

  // Rendu
  if (loading) {
    return (
      <div className="text-center py-20">
        <Loader2 className="animate-spin mx-auto text-primary w-8 h-8" />
        <p className="mt-2 text-sm text-base-content/60">Chargement de vos favoris...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-20 bg-base-100 rounded-xl border border-base-200 p-6">
        <AlertCircle className="w-12 h-12 text-error mx-auto mb-4" />
        <p className="text-error font-medium">{error}</p>
        <button onClick={fetchFavorites} className="btn btn-primary btn-sm mt-4">
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6">
        <Heart className="w-6 h-6 text-error" />
        <h2 className="text-xl font-bold text-base-content">Mes Favoris</h2>
        <span className="badge badge-ghost ml-auto">{favorites.length} produit(s)</span>
      </div>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="w-16 h-16 mx-auto mb-4 text-base-content/20" />
          <p className="text-base-content/60 mb-4">Vous n'avez aucun produit dans vos favoris.</p>
          <Link to="/boutique" className="btn btn-primary btn-sm">
            Découvrir la boutique
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {favorites.map((fav) => (
            <div key={fav.id} className="card bg-base-100 border border-base-200 shadow-sm hover:shadow-md transition-shadow">
              <figure className="h-40 bg-base-200/50 overflow-hidden">
                {fav.product_image ? (
                  <img src={fav.product_image} alt={fav.product_name} className="w-full h-full object-contain" />
                ) : (
                  <Package className="w-16 h-16 text-base-content/20 m-auto" />
                )}
              </figure>
              
              <div className="card-body p-4">
                <h3 className="card-title text-sm line-clamp-2">{fav.product_name}</h3>
                <p className="text-xs text-base-content/50">Code: {fav.product_code}</p>
                
                <div className="flex items-center justify-between mt-2">
                  <div>
                    {fav.product_promo_price ? (
                      <div>
                        <p className="text-lg font-bold text-error">{formatCurrency(fav.product_promo_price)}</p>
                        <p className="text-xs line-through text-base-content/40">{formatCurrency(fav.product_price)}</p>
                      </div>
                    ) : (
                      <p className="text-lg font-bold text-primary">{formatCurrency(fav.product_price)}</p>
                    )}
                  </div>
                  <span className={`badge badge-sm ${fav.in_stock ? 'badge-success' : 'badge-error'}`}>
                    {fav.in_stock ? 'En stock' : 'Rupture'}
                  </span>
                </div>
                
                <div className="card-actions justify-between mt-3">
                  <button
                    onClick={() => handleAddToCart(fav)}
                    disabled={!fav.in_stock}
                    className="btn btn-sm btn-primary gap-1 flex-1"
                  >
                    <ShoppingCart className="w-3 h-3" /> Ajouter
                  </button>
                  <button
                    onClick={() => handleRemove(fav.product_id)}
                    className="btn btn-sm btn-ghost text-error hover:bg-error/10"
                    title="Retirer des favoris"
                  >
                    <Heart className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}