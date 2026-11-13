// src/components/site/shared/FilterSidebar.jsx
import React, { useState } from 'react';
import { Search, Star, ChevronDown } from 'lucide-react';

const FilterSidebar = ({
  categories,
  selectedCat,
  onSelectCat,
  brands,
  selectedBrands,
  onToggleBrand,
  priceRange,
  onPriceChange,
  selectedRating,
  onSelectRating,
  inStock,
  onToggleStock,
}) => {
  const [brandSearch, setBrandSearch] = useState('');
  const [openSections, setOpenSections] = useState({
    category: true,
    brand: true,
    price: true,
    rating: true,
    availability: true,
  });

  const toggleSection = (section) => {
    setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const filteredBrands = brands.filter((b) =>
    b.name.toLowerCase().includes(brandSearch.toLowerCase())
  );

  return (
    <div className="w-full space-y-2">
      
      {/* --- CATÉGORIE --- */}
      <div className="border-b border-base-200 py-4">
        <button
          onClick={() => toggleSection('category')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold uppercase tracking-wide text-base-content"
        >
          Catégorie
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.category ? 'rotate-180' : ''}`} />
        </button>
        {openSections.category && (
          <ul className="space-y-2.5 mt-2">
            <li>
              <button
                onClick={() => onSelectCat('')}
                className={`text-sm text-left w-full transition-colors ${
                  !selectedCat ? 'font-semibold text-primary' : 'text-base-content/80 hover:text-primary'
                }`}
              >
                Toutes les catégories
              </button>
            </li>
            {categories.map((c) => (
              <li key={c.id}>
                <button
                  onClick={() => onSelectCat(String(c.id))}
                  className={`text-sm text-left w-full transition-colors ${
                    String(selectedCat) === String(c.id) ? 'font-semibold text-primary' : 'text-base-content/80 hover:text-primary'
                  }`}
                >
                  {c.name}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* --- MARQUE --- */}
      <div className="border-b border-base-200 py-4">
        <button
          onClick={() => toggleSection('brand')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold uppercase tracking-wide text-base-content"
        >
          Marque
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.brand ? 'rotate-180' : ''}`} />
        </button>
        {openSections.brand && (
          <div>
            <div className="relative mb-3">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-base-content/40" />
              <input
                type="text"
                placeholder="Rechercher une marque..."
                value={brandSearch}
                onChange={(e) => setBrandSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-base-300 rounded-md outline-none focus:border-primary bg-base-100 transition-colors"
              />
            </div>
            <div className="max-h-48 overflow-y-auto pr-1 space-y-2.5 custom-scrollbar">
              {filteredBrands.map((b) => (
                <label key={b.id} className="flex items-center gap-3 cursor-pointer group">
                  <input
                    type="checkbox"
                    checked={selectedBrands.includes(b.id)}
                    onChange={() => onToggleBrand(b.id)}
                    className="w-4 h-4 rounded border-base-300 text-primary focus:ring-primary cursor-pointer"
                  />
                  <span className="text-sm text-base-content/80 group-hover:text-primary transition-colors">
                    {b.name}
                  </span>
                </label>
              ))}
              {filteredBrands.length === 0 && (
                <p className="text-sm text-base-content/50 italic">Aucune marque trouvée</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* --- PRIX --- */}
      <div className="border-b border-base-200 py-4">
        <button
          onClick={() => toggleSection('price')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold uppercase tracking-wide text-base-content"
        >
          Prix
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.price ? 'rotate-180' : ''}`} />
        </button>
        {openSections.price && (
          <div>
            <div className="flex items-center gap-3 mb-4">
              <input
                type="number"
                value={priceRange[0]}
                onChange={(e) => onPriceChange([Number(e.target.value), priceRange[1]])}
                className="w-full px-3 py-2 text-sm border border-base-300 rounded-md outline-none focus:border-primary text-center"
                placeholder="Min"
              />
              <span className="text-base-content/40">-</span>
              <input
                type="number"
                value={priceRange[1]}
                onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
                className="w-full px-3 py-2 text-sm border border-base-300 rounded-md outline-none focus:border-primary text-center"
                placeholder="Max"
              />
            </div>
            <input
              type="range"
              min="0"
              max="1000000"
              step="5000"
              value={priceRange[1]}
              onChange={(e) => onPriceChange([priceRange[0], Number(e.target.value)])}
              className="w-full accent-primary cursor-pointer"
            />
          </div>
        )}
      </div>

      {/* --- ÉVALUATION --- */}
      <div className="border-b border-base-200 py-4">
        <button
          onClick={() => toggleSection('rating')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold uppercase tracking-wide text-base-content"
        >
          Évaluation
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.rating ? 'rotate-180' : ''}`} />
        </button>
        {openSections.rating && (
          <div className="space-y-2.5">
            {[4, 3, 2, 1].map((star) => (
              <label key={star} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="radio"
                  name="rating"
                  checked={selectedRating === star}
                  onChange={() => onSelectRating(selectedRating === star ? null : star)}
                  className="w-4 h-4 text-primary focus:ring-primary cursor-pointer"
                />
                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-3.5 h-3.5 ${
                        i < star ? 'fill-warning text-warning' : 'fill-base-200 text-base-200'
                      }`}
                    />
                  ))}
                  <span className="text-xs text-base-content/60 ml-2 group-hover:text-base-content transition-colors">et plus</span>
                </div>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* --- DISPONIBILITÉ --- */}
      <div className="py-4">
        <button
          onClick={() => toggleSection('availability')}
          className="flex items-center justify-between w-full mb-3 text-sm font-semibold uppercase tracking-wide text-base-content"
        >
          Disponibilité
          <ChevronDown className={`w-4 h-4 transition-transform ${openSections.availability ? 'rotate-180' : ''}`} />
        </button>
        {openSections.availability && (
          <label className="flex items-center gap-3 cursor-pointer group">
            <input
              type="checkbox"
              checked={inStock}
              onChange={onToggleStock}
              className="w-4 h-4 rounded border-base-300 text-primary focus:ring-primary cursor-pointer"
            />
            <span className="text-sm text-base-content/80 group-hover:text-primary transition-colors">
              En stock uniquement
            </span>
          </label>
        )}
      </div>

    </div>
  );
};

export default FilterSidebar;