// src/components/site/BoutiquePage.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { SlidersHorizontal, ChevronLeft, ChevronRight, PackageSearch } from 'lucide-react';

import AxiosInstance from '../AxiosInstance';
import ProductCard, { ProductSkeleton } from './shared/ProductCard';
import FilterSidebar from './shared/FilterSidebar';

const SORT_OPTIONS = [
  { value: '-created_at', label: 'Nouveautés' },
  { value: 'selling_price', label: 'Prix croissant' },
  { value: '-selling_price', label: 'Prix décroissant' },
  { value: '-sales_count', label: 'Meilleures ventes' },
  { value: 'name', label: 'Nom (A-Z)' },
];

// Remplacer par un appel API pour les marques
const DEMO_BRANDS = [
  { id: 1, name: 'Samsung' },
  { id: 2, name: 'Apple' },
  { id: 3, name: 'HP' },
  { id: 4, name: 'Lenovo' },
  { id: 5, name: 'Asus' },
  { id: 6, name: 'Dell' },
  { id: 7, name: 'Sony' },
  { id: 8, name: 'Xiaomi' },
];

export default function BoutiquePage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // --- PARAMS URL ---
  const cat = searchParams.get('cat') || '';
  const q = searchParams.get('q') || '';
  const tri = searchParams.get('tri') || SORT_OPTIONS[0].value;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const brandsParam = searchParams.get('brands') || '';
  const ratingParam = searchParams.get('rating') || '';
  const inStockParam = searchParams.get('in_stock') === 'true';
  const minPrice = parseInt(searchParams.get('min_price') || '0', 10);
  const maxPrice = parseInt(searchParams.get('max_price') || '1000000', 10);

  // --- ÉTATS ---
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [searchInput, setSearchInput] = useState(q);
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const isAuthenticated = !!localStorage.getItem('Token');

  const selectedBrands = useMemo(() => brandsParam.split(',').filter(Boolean).map(Number), [brandsParam]);
  const selectedRating = ratingParam ? Number(ratingParam) : null;
  const priceRange = [minPrice, maxPrice];

  // ==========================================
  // MISE À JOUR URL
  // ==========================================
  const updateParams = useCallback((updates) => {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '' || v === false) next.delete(k);
      else next.set(k, String(v));
    });
    if (!('page' in updates)) next.delete('page');
    setSearchParams(next, { replace: true });
  }, [searchParams, setSearchParams]);

  // ==========================================
  // API
  // ==========================================
  useEffect(() => {
    let cancelled = false;
    AxiosInstance.get('/store/categories/')
      .then((res) => {
        if (!cancelled) {
          const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
          setCategories(list);
        }
      }).catch(() => setCategories([]));
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    const params = { page };
    if (cat) params.category = cat;
    if (q) params.search = q;
    if (tri) params.ordering = tri;
    if (selectedBrands.length) params.brand__in = selectedBrands.join(',');
    if (selectedRating) params.rating__gte = selectedRating;
    if (inStockParam) params.in_stock = true;
    if (minPrice) params.price__gte = minPrice;
    if (maxPrice < 1000000) params.price__lte = maxPrice;

    AxiosInstance.get('/store/products/', { params })
      .then((res) => {
        if (cancelled) return;
        const list = Array.isArray(res.data) ? res.data : (res.data?.results || []);
        setProducts(list);
        setTotalCount(res.data?.count ?? list.length);
        setTotalPages(res.data?.count ? Math.max(1, Math.ceil(res.data.count / 20)) : 1);
      })
      .catch(() => {
        if (!cancelled) { setProducts([]); setTotalCount(0); setTotalPages(1); }
      })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, [cat, q, tri, page, brandsParam, ratingParam, inStockParam, minPrice, maxPrice]);

  // Favoris
  useEffect(() => {
    if (!isAuthenticated) return;
    AxiosInstance.get('/store/favorites/ids/')
      .then((res) => setFavoriteIds(new Set(res.data?.product_ids || [])))
      .catch(() => setFavoriteIds(new Set()));
  }, [isAuthenticated]);

  // ==========================================
  // HANDLERS
  // ==========================================
  const handleToggleFavorite = useCallback(async (product) => {
    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
      return;
    }
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (next.has(product.id)) next.delete(product.id);
      else next.add(product.id);
      return next;
    });
    try {
      const res = await AxiosInstance.post('/store/favorites/toggle/', { product_id: product.id });
      const isFav = res.data?.is_favorite;
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFav) next.add(product.id);
        else next.delete(product.id);
        return next;
      });
    } catch { /* rollback ignore */ }
  }, [isAuthenticated, navigate]);

  const handleAddToCart = useCallback((product) => {
    try {
      const cart = JSON.parse(localStorage.getItem('cart') || '[]');
      const existing = cart.find((item) => item.product_id === product.id);
      if (existing) existing.quantity += 1;
      else cart.push({ product_id: product.id, name: product.name, price: parseFloat(product.selling_price || 0), image: product.image_url || product.image, quantity: 1 });
      localStorage.setItem('cart', JSON.stringify(cart));
      window.dispatchEvent(new Event('cart-updated'));
    } catch { /* ignore */ }
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim() || null });
  };

  const handleToggleBrand = (brandId) => {
    const next = selectedBrands.includes(brandId)
      ? selectedBrands.filter((id) => id !== brandId)
      : [...selectedBrands, brandId];
    updateParams({ brands: next.join(',') || null });
  };

  // ==========================================
  // RENDU
  // ==========================================
  return (
    <div className="bg-base-100 min-h-screen pb-16">
      
      {/* HEADER */}
      <div className="bg-base-200/50 border-b border-base-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-2xl md:text-3xl font-black text-base-content mb-2">
            {q ? `Résultats pour "${q}"` : cat ? 'Catégorie' : 'Toute la boutique'}
          </h1>
          <p className="text-base-content/60">
            {loading ? 'Chargement...' : `${totalCount} produit${totalCount > 1 ? 's' : ''} trouvé${totalCount > 1 ? 's' : ''}`}
          </p>
        </div>
      </div>

      {/* CONTENU PRINCIPAL */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-8">
        
        {/* SIDEBAR FILTRES (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0">
          <FilterSidebar
            categories={categories}
            selectedCat={cat}
            onSelectCat={(id) => updateParams({ cat: id })}
            brands={DEMO_BRANDS}
            selectedBrands={selectedBrands}
            onToggleBrand={handleToggleBrand}
            priceRange={priceRange}
            onPriceChange={(range) => updateParams({ min_price: range[0], max_price: range[1] })}
            selectedRating={selectedRating}
            onSelectRating={(r) => updateParams({ rating: r })}
            inStock={inStockParam}
            onToggleStock={() => updateParams({ in_stock: inStockParam ? null : 'true' })}
          />
        </aside>

        {/* GRILLE PRODUITS */}
        <main className="flex-1 min-w-0">
          
          {/* Barre de tri + Recherche */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <form onSubmit={handleSearchSubmit} className="relative w-full sm:max-w-xs">
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher..."
                className="w-full pl-4 pr-10 py-2 border border-base-300 rounded-lg outline-none focus:border-primary text-sm transition-colors"
              />
            </form>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowMobileFilters(true)}
                className="lg:hidden flex items-center gap-2 px-4 py-2 border border-base-300 rounded-lg text-sm font-medium hover:border-primary transition-colors"
              >
                <SlidersHorizontal className="w-4 h-4" /> Filtres
              </button>
              
              <select
                value={tri}
                onChange={(e) => updateParams({ tri: e.target.value })}
                className="w-full sm:w-auto bg-base-100 border border-base-300 rounded-lg px-3 py-2 text-sm outline-none cursor-pointer focus:border-primary transition-colors"
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* PRODUITS */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {[...Array(12)].map((_, i) => <ProductSkeleton key={i} />)}
            </div>
          ) : products.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <PackageSearch className="w-16 h-16 text-base-content/20 mb-4" />
              <h3 className="text-lg font-bold mb-2">Aucun produit trouvé</h3>
              <p className="text-base-content/60 mb-6">Essayez de modifier vos filtres ou votre recherche.</p>
              <button
                onClick={() => setSearchParams({}, { replace: true })}
                className="bg-primary text-primary-content px-6 py-2 rounded-lg font-medium hover:bg-primary/90 transition-colors"
              >
                Réinitialiser les filtres
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
              {products.map((prod) => (
                <ProductCard
                  key={prod.id}
                  product={prod}
                  isFavorite={favoriteIds.has(prod.id)}
                  onToggleFavorite={handleToggleFavorite}
                  onAddToCart={handleAddToCart}
                />
              ))}
            </div>
          )}

          {/* PAGINATION */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-10">
              <button
                onClick={() => updateParams({ page: page - 1 })}
                disabled={page <= 1}
                className="w-10 h-10 flex items-center justify-center border border-base-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              {[...Array(totalPages)].map((_, i) => {
                const p = i + 1;
                if (totalPages > 7 && p !== 1 && p !== totalPages && Math.abs(p - page) > 1) {
                  if (p === 2 || p === totalPages - 1) return <span key={p} className="px-2 text-base-content/50">...</span>;
                  return null;
                }
                return (
                  <button
                    key={p}
                    onClick={() => updateParams({ page: p })}
                    className={`w-10 h-10 flex items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      p === page
                        ? 'bg-primary text-primary-content border-primary'
                        : 'border-base-300 hover:border-primary'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => updateParams({ page: page + 1 })}
                disabled={page >= totalPages}
                className="w-10 h-10 flex items-center justify-center border border-base-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed hover:border-primary transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          )}
        </main>
      </div>

      {/* MODAL FILTRES MOBILE */}
      {showMobileFilters && (
        <div className="fixed inset-0 z-50 flex lg:hidden bg-black/50">
          <div className="bg-base-100 w-full max-w-sm ml-auto h-full overflow-y-auto flex flex-col">
            <div className="p-4 border-b border-base-200 flex justify-between items-center sticky top-0 bg-base-100 z-10">
              <h2 className="font-bold text-lg">Filtres</h2>
              <button onClick={() => setShowMobileFilters(false)} className="text-base-content/60 hover:text-base-content">Fermer</button>
            </div>
            <div className="p-4 flex-1">
              <FilterSidebar
                categories={categories}
                selectedCat={cat}
                onSelectCat={(id) => { updateParams({ cat: id }); setShowMobileFilters(false); }}
                brands={DEMO_BRANDS}
                selectedBrands={selectedBrands}
                onToggleBrand={handleToggleBrand}
                priceRange={priceRange}
                onPriceChange={(range) => updateParams({ min_price: range[0], max_price: range[1] })}
                selectedRating={selectedRating}
                onSelectRating={(r) => updateParams({ rating: r })}
                inStock={inStockParam}
                onToggleStock={() => updateParams({ in_stock: inStockParam ? null : 'true' })}
              />
            </div>
            <div className="p-4 border-t border-base-200 sticky bottom-0 bg-base-100">
              <button
                onClick={() => setShowMobileFilters(false)}
                className="w-full bg-primary text-primary-content font-bold py-3 rounded-lg hover:bg-primary/90 transition-colors"
              >
                Voir les {totalCount} résultats
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}