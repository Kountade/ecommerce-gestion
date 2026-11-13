// src/components/site/Layout/PublicNavbar.jsx
import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Building2, Menu, X, ChevronDown,
  Home, ShoppingBag, Tag, BookOpen, Mail,
  Search, ShoppingCart, User, LogIn,
  Phone, Tv, Smartphone, Shirt, Home as HomeIcon,
  Dumbbell, Gamepad2, Heart, Package, UserPlus, LogOut,
} from 'lucide-react';

import axiosInstance from '../../AxiosInstance';

// ============================================================
// DONNÉES DES CATÉGORIES
// ============================================================
const MEGA_MENU_DATA = [
  {
    id: 'high-tech', label: 'TV & High Tech', icon: Tv,
    columns: [
      { title: 'TV, VIDÉO & HOME CINÉMA', links: ['Télévisions', 'Smart TVs', 'TVs LED & LCD', 'Accessoires TVs', 'TV Box', 'Projecteurs'] },
      { title: 'AUDIO & HIFI', links: ['Home cinéma', 'Haut-parleurs', 'Barres de son', 'Casques audio', 'Enceintes portables'] },
      { title: 'ACCESSOIRES HIGH TECH', links: ['Accessoires Image & Son', 'Accessoires Photo et Caméscopes', 'Câbles & Adaptateurs'] },
      { title: 'SÉCURITÉ & SURVEILLANCE', links: ['Équipement vidéo de surveillance', 'Caméras de sécurité', 'Alarmes'] }
    ]
  },
  {
    id: 'telephones', label: 'Téléphones & Tablettes', icon: Smartphone,
    columns: [
      { title: 'TÉLÉPHONES PORTABLES', links: ['Smartphones', 'Téléphones basiques', 'Téléphones fixes'] },
      { title: 'TABLETTES', links: ['Tablettes Android', 'iPad', 'Accessoires Tablettes'] },
      { title: 'ACCESSOIRES TÉLÉPHONES', links: ['Coques & Étuis', 'Chargeurs', 'Écouteurs & Casques', 'Power Banks', 'Cartes SIM'] }
    ]
  },
  {
    id: 'electromenager', label: 'Électroménager', icon: HomeIcon,
    columns: [
      { title: 'GROS ÉLECTROMÉNAGER', links: ['Réfrigérateurs', 'Congélateurs', 'Machines à laver', 'Climatiseurs', 'Cuisinières'] },
      { title: 'PETIT ÉLECTROMÉNAGER', links: ['Micro-ondes', 'Bouilloires', 'Friteuses', 'Mixeurs & Blenders', 'Cafetières'] }
    ]
  },
  {
    id: 'mode', label: 'Mode', icon: Shirt,
    columns: [
      { title: 'FEMME', links: ['Vêtements', 'Chaussures', 'Sacs & Accessoires', 'Bijoux', 'Montres'] },
      { title: 'HOMME', links: ['Vêtements', 'Chaussures', 'Montres', 'Portefeuilles', 'Lunettes'] },
      { title: 'ENFANT', links: ['Vêtements Fille', 'Vêtements Garçon', 'Chaussures', 'Jouets'] }
    ]
  },
  {
    id: 'sport', label: 'Sport & Loisirs', icon: Dumbbell,
    columns: [
      { title: 'SPORTS COLLECTIFS', links: ['Football', 'Basketball', 'Tennis', 'Volleyball'] },
      { title: 'FITNESS & MUSCULATION', links: ['Haltères', 'Tapis de course', 'Vélos d\'appartement', 'Accessoires Fitness'] }
    ]
  },
  {
    id: 'gaming', label: 'Jeux Vidéo', icon: Gamepad2,
    columns: [
      { title: 'CONSOLES', links: ['PlayStation', 'Xbox', 'Nintendo Switch', 'Consoles Rétro'] },
      { title: 'JEUX VIDÉO', links: ['Jeux PS', 'Jeux Xbox', 'Jeux Nintendo', 'Jeux PC'] },
      { title: 'ACCESSOIRES GAMING', links: ['Manettes', 'Casques Gaming', 'Chaises Gaming', 'Souris & Claviers'] }
    ]
  }
];

const PublicNavbar = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);

  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [accountDropdownOpen, setAccountDropdownOpen] = useState(false);
  const timeoutRef = useRef(null);
  const accountTimeoutRef = useRef(null);

  const [etablissement, setEtablissement] = useState(null);
  const [loadingEtab, setLoadingEtab] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);

  // ============================================================
  // SCROLL
  // ============================================================
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ============================================================
  // AUTHENTIFICATION — Recharge à chaque changement de route + events
  // ============================================================
  const syncAuth = () => {
    const token = localStorage.getItem('Token');
    const userStr = localStorage.getItem('User');
    setIsAuthenticated(!!token);
    if (userStr) {
      try { setUser(JSON.parse(userStr)); } catch { setUser(null); }
    } else {
      setUser(null);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    setHoveredCategory(null);
    setAccountDropdownOpen(false);
    syncAuth();
  }, [location.pathname]);

  useEffect(() => {
    const onChange = () => syncAuth();
    window.addEventListener('storage', onChange);       // autre onglet
    window.addEventListener('auth-changed', onChange);  // même onglet
    return () => {
      window.removeEventListener('storage', onChange);
      window.removeEventListener('auth-changed', onChange);
    };
  }, []);

  // ============================================================
  // ÉTABLISSEMENT
  // ============================================================
  useEffect(() => {
    let cancelled = false;
    const fetchEtab = async () => {
      try {
        const res = await axiosInstance.get('/etablissements/unique/');
        if (!cancelled && res?.data) {
          setEtablissement(res.data);
          if (res.data.logo) {
            const logoPath = res.data.logo;
            const base = axiosInstance?.defaults?.baseURL || '';
            const url = logoPath.startsWith('http')
              ? logoPath
              : `${base}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
            setLogoUrl(url);
          }
        }
      } catch (e) { /* silencieux */ } finally {
        if (!cancelled) setLoadingEtab(false);
      }
    };
    fetchEtab();
    return () => { cancelled = true; };
  }, []);

  // ============================================================
  // PANIER
  // ============================================================
  useEffect(() => {
    const update = () => {
      try {
        const cart = JSON.parse(localStorage.getItem('cart') || '[]');
        setCartCount(cart.reduce((s, i) => s + (i.quantity || 1), 0));
      } catch { setCartCount(0); }
    };
    update();
    window.addEventListener('storage', update);
    window.addEventListener('cart-updated', update);
    return () => {
      window.removeEventListener('storage', update);
      window.removeEventListener('cart-updated', update);
    };
  }, []);

  const nomEtablissement = !loadingEtab && etablissement?.nom ? etablissement.nom : 'Ma Boutique';

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    const q = searchQuery.trim();
    if (!q) return;
    navigate(`/boutique?q=${encodeURIComponent(q)}`); // ✅ SPA
  };

  const handleMouseEnterCategory = (catId) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setHoveredCategory(catId);
  };

  const handleMouseLeaveCategory = () => {
    timeoutRef.current = setTimeout(() => { setHoveredCategory(null); }, 200);
  };

  const handleMouseEnterAccount = () => {
    if (accountTimeoutRef.current) clearTimeout(accountTimeoutRef.current);
    setAccountDropdownOpen(true);
  };

  const handleMouseLeaveAccount = () => {
    accountTimeoutRef.current = setTimeout(() => { setAccountDropdownOpen(false); }, 200);
  };

  // ============================================================
  // DÉCONNEXION
  // ============================================================
  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('User');
    setIsAuthenticated(false);
    setUser(null);
    setAccountDropdownOpen(false);
    setIsOpen(false);
    window.dispatchEvent(new Event('auth-changed')); // ✅ notifie même onglet
    navigate('/');                                   // ✅ SPA
  };

  // Lien direct vers l'espace client (utilisé dans la navbar)
  const goToAccount = () => {
    setAccountDropdownOpen(false);
    setIsOpen(false);
    navigate('/compte');
  };

  const navLinks = [
    { to: '/', label: 'Accueil', icon: Home },
    { to: '/boutique', label: 'Boutique', icon: ShoppingBag },
    { to: '/blog', label: 'Blog', icon: BookOpen },
    { to: '/contact', label: 'Contact', icon: Mail },
  ];

  const isActive = (path) => location.pathname === path;

  const displayName =
    user?.first_name ||
    user?.username ||
    user?.email?.split('@')[0] ||
    'Client';

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-base-100 ${
        scrolled ? 'shadow-lg border-b border-base-200' : 'shadow-md'
      }`}
      onMouseLeave={handleMouseLeaveCategory}
    >
      {/* ================= BARRE 1 ================= */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20 gap-4">

          {/* LOGO */}
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="relative w-10 h-10 bg-primary rounded-lg flex items-center justify-center overflow-hidden">
              {!loadingEtab && logoUrl ? (
                <img src={logoUrl} alt={nomEtablissement} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = 'none'; }} />
              ) : (
                <Building2 className="w-6 h-6 text-primary-content" />
              )}
            </div>
            <div className="hidden sm:block">
              <h1 className="text-base font-bold text-base-content leading-tight">
                {loadingEtab ? 'Chargement…' : nomEtablissement}
              </h1>
            </div>
          </Link>

          {/* RECHERCHE */}
          <form onSubmit={handleSearchSubmit} className="hidden md:flex flex-1 max-w-2xl relative">
            <div className="flex w-full rounded-lg border-2 border-primary overflow-hidden">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-base-content/40 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cherchez un produit, une marque ou une catégorie"
                  className="w-full pl-10 pr-4 py-2.5 text-sm outline-none bg-base-100 text-base-content"
                />
              </div>
              <button type="submit" className="bg-primary hover:bg-primary/90 text-primary-content px-6 font-medium text-sm transition-colors">
                Rechercher
              </button>
            </div>
          </form>

          {/* ACTIONS DESKTOP */}
          <div className="hidden lg:flex items-center gap-6 shrink-0 text-sm font-medium text-base-content">

            {/* COMPTE */}
            <div
              className="relative"
              onMouseEnter={handleMouseEnterAccount}
              onMouseLeave={handleMouseLeaveAccount}
            >
              <button className="flex items-center gap-2 hover:text-primary py-4 transition-colors">
                <User className="w-5 h-5" />
                {isAuthenticated ? `Bonjour ${displayName}` : 'Se connecter'}
                <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${accountDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {accountDropdownOpen && (
                <div className="absolute top-full right-0 mt-1 w-60 bg-base-100 rounded-xl shadow-xl border border-base-200 py-2 z-50 overflow-hidden">
                  <div className="h-0.5 bg-gradient-to-r from-primary via-secondary to-primary/50 absolute top-0 left-0 right-0"></div>

                  {!isAuthenticated ? (
                    <>
                      <Link to="/login" className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                        <LogIn className="w-4 h-4 text-primary" />
                        <span>Se connecter</span>
                      </Link>
                      <Link to="/register-client" className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors" onClick={() => setAccountDropdownOpen(false)}>
                        <UserPlus className="w-4 h-4 text-primary" />
                        <span>Créer un compte</span>
                      </Link>
                    </>
                  ) : (
                    <>
                      {/* ✅ Lien principal : Espace client */}
                      <Link
                        to="/compte"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/10 text-primary font-semibold transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <User className="w-4 h-4" />
                        <span>Mon espace client</span>
                      </Link>
                      <div className="border-t border-base-200 my-1"></div>

                      <Link
                        to="/compte?tab=orders"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <Package className="w-4 h-4 text-base-content/60" />
                        <span>Mes commandes</span>
                      </Link>
                      <Link
                        to="/compte?tab=favorites"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <Heart className="w-4 h-4 text-base-content/60" />
                        <span>Mes favoris</span>
                      </Link>
                      <Link
                        to="/compte?tab=addresses"
                        className="flex items-center gap-3 px-4 py-2.5 hover:bg-base-200 transition-colors"
                        onClick={() => setAccountDropdownOpen(false)}
                      >
                        <HomeIcon className="w-4 h-4 text-base-content/60" />
                        <span>Mes adresses</span>
                      </Link>

                      <div className="border-t border-base-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 text-error transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Déconnexion</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            <Link to="/contact" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="w-5 h-5" /> Aide
            </Link>

            <Link to="/panier" className="flex items-center gap-2 hover:text-primary transition-colors relative">
              <ShoppingCart className="w-5 h-5" /> Panier
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-3 min-w-[18px] h-4 px-1 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center">
                  {cartCount > 99 ? '99+' : cartCount}
                </span>
              )}
            </Link>
          </div>

          {/* BURGER MOBILE */}
          <div className="lg:hidden flex items-center gap-3">
            {/* ✅ Bouton rapide "Mon compte" visible si connecté */}
            {isAuthenticated && (
              <button
                onClick={goToAccount}
                className="relative p-1 text-primary"
                aria-label="Mon espace client"
              >
                <User className="w-6 h-6" />
              </button>
            )}
            <Link to="/panier" className="relative text-base-content">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 rounded-full bg-primary text-primary-content text-[10px] font-bold flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} className="text-base-content p-1">
              {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
            </button>
          </div>
        </div>
      </div>

      {/* RECHERCHE MOBILE */}
      <div className="md:hidden px-4 pb-3">
        <form onSubmit={handleSearchSubmit} className="flex rounded-lg border border-base-300 overflow-hidden bg-base-100">
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher..."
            className="flex-1 px-4 py-2 text-sm outline-none bg-base-100 text-base-content"
          />
          <button type="submit" className="bg-primary text-primary-content px-4">
            <Search className="w-4 h-4" />
          </button>
        </form>
      </div>

      {/* BARRE 2 : CATÉGORIES */}
      <div className="hidden lg:block border-t border-base-200 bg-base-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center h-12 gap-6 overflow-x-auto">
          <Link to="/boutique" className="flex items-center gap-2 text-sm font-medium text-base-content hover:text-primary whitespace-nowrap">
            <ShoppingBag className="w-4 h-4" /> Toutes les catégories
          </Link>
          <div className="h-5 w-px bg-base-300" />
          {MEGA_MENU_DATA.map((cat) => {
            const Icon = cat.icon;
            const isHovered = hoveredCategory === cat.id;
            return (
              <div
                key={cat.id}
                onMouseEnter={() => handleMouseEnterCategory(cat.id)}
                className={`flex items-center gap-2 text-sm font-medium whitespace-nowrap cursor-pointer transition-colors ${
                  isHovered ? 'text-primary' : 'text-base-content hover:text-primary'
                }`}
              >
                <Icon className="w-4 h-4" />
                {cat.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* MEGA MENU */}
      {hoveredCategory && (
        <div
          className="hidden lg:block absolute top-full left-0 w-full bg-base-100 border-t border-base-200 shadow-2xl z-40"
          onMouseEnter={() => handleMouseEnterCategory(hoveredCategory)}
          onMouseLeave={handleMouseLeaveCategory}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="grid grid-cols-4 gap-8">
              {MEGA_MENU_DATA.find(c => c.id === hoveredCategory)?.columns.map((col, idx) => (
                <div key={idx} className="flex flex-col gap-3">
                  <h3 className="text-xs font-bold text-secondary uppercase tracking-wider mb-2">
                    {col.title}
                  </h3>
                  <ul className="space-y-2">
                    {col.links.map((link, i) => (
                      <li key={i}>
                        <Link
                          to={`/boutique?cat=${hoveredCategory}&sub=${encodeURIComponent(link)}`}
                          className="text-sm text-base-content/70 hover:text-primary transition-colors"
                        >
                          {link}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MENU MOBILE */}
      <div className={`lg:hidden overflow-y-auto transition-all duration-300 ${isOpen ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0 hidden'}`}>
        <div className="bg-base-100 border-t border-base-200">
          <div className="px-4 py-4 space-y-2">

            {/* Compte mobile */}
            {isAuthenticated ? (
              <>
                <div className="bg-primary/5 border border-primary/20 rounded-lg p-3 mb-2">
                  <p className="text-xs text-base-content/60">Connecté en tant que</p>
                  <p className="font-bold text-base-content">{displayName}</p>
                  <button
                    onClick={goToAccount}
                    className="mt-2 w-full btn btn-sm btn-primary"
                  >
                    <User className="w-4 h-4" /> Mon espace client
                  </button>
                </div>

                <Link
                  to="/compte?tab=orders"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-base-content hover:bg-base-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Package className="w-5 h-5" /> Mes commandes
                </Link>
                <Link
                  to="/compte?tab=favorites"
                  className="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-base-content hover:bg-base-200"
                  onClick={() => setIsOpen(false)}
                >
                  <Heart className="w-5 h-5" /> Mes favoris
                </Link>

                <div className="border-t border-base-200 my-2"></div>
              </>
            ) : (
              <div className="flex gap-2 mb-2">
                <Link to="/login" className="flex-1 bg-primary text-primary-content text-center py-2 rounded-lg font-semibold" onClick={() => setIsOpen(false)}>
                  Connexion
                </Link>
                <Link to="/register-client" className="flex-1 border border-primary text-primary text-center py-2 rounded-lg font-semibold" onClick={() => setIsOpen(false)}>
                  Inscription
                </Link>
              </div>
            )}

            {navLinks.map((link) => {
              const Icon = link.icon;
              const active = isActive(link.to);
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium ${
                    active ? 'bg-primary/10 text-primary' : 'text-base-content hover:bg-base-200'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <Icon className="w-5 h-5" /> {link.label}
                </Link>
              );
            })}

            {isAuthenticated && (
              <>
                <div className="border-t border-base-200 my-2"></div>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium text-error hover:bg-error/10"
                >
                  <LogOut className="w-5 h-5" /> Déconnexion
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PublicNavbar;