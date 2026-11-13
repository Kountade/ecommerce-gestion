// src/components/Navbar.jsx
// ============================================================
// Navbar ERP unifiée - Station Services, Approbations & Config Boutique retirés
// ============================================================

import React, { useState, useEffect, useMemo } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, ShoppingBag, Users, Package, Building2, Tags,
  LogOut, UserCircle, Settings, Warehouse, ShoppingCart, Receipt,
  FileText, ChevronDown, ChevronUp, Menu, X, Bell, Moon, Sun,
  Shield, Clock, Calendar, TrendingUp, CreditCard, Boxes,
  Search, HelpCircle, History, Truck, ArrowLeftRight, DollarSign,
  Ruler, ClipboardCheck, MoveHorizontal, Calculator, PackageCheck,
  Layers, ArrowLeftRight as ReturnIcon, AlertOctagon, Wallet,
  BookOpen, PiggyBank, Cog, Database, BellRing, Printer, UserCog,
  Award, BarChart3, Landmark, Coins, ReceiptText,
  CalendarDays, CheckCircle, ClipboardList, Gauge, AlertCircle,
  Banknote, TrendingDown, ScrollText, Scale, FileSpreadsheet,
  RotateCcw, Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon, BarChart, Clipboard,
  AlertCircle as AlertCircleIcon, PackageOpen,
  Truck as TruckIcon, Map, UserCheck, Route, PackagePlus, PlusCircle,
  BadgeDollarSign, Barcode, GraduationCap, UserPlus, FilePlus,
  CreditCard as CreditCardPlus, Plus, Grid3x3, TableProperties,
  // === ECOMMERCE ===
  Store, MessageSquare, Ticket, Percent, Image as ImageIcon,
  Star, Sparkles, Megaphone, LayoutGrid,
} from 'lucide-react';

import axiosInstance from './AxiosInstance';

// ============================================================
// RÔLES
// ============================================================
const ROLE_CONFIG = {
  admin:        { label: 'Administrateur', color: 'error',     icon: Shield,       level: 100 },
  gestionnaire: { label: 'Gestionnaire',   color: 'warning',   icon: UserCog,      level: 80  },
  vendeur:      { label: 'Vendeur',        color: 'primary',   icon: ShoppingBag,  level: 60  },
  magasinier:   { label: 'Magasinier',     color: 'success',   icon: Package,      level: 70  },
  comptable:    { label: 'Comptable',      color: 'secondary', icon: Calculator,   level: 90  },
};

// ============================================================
// HELPER — badge de section
// ============================================================
const computeSectionBadge = (sectionName, counters) => {
  switch (sectionName) {
    case 'VENTES':
      return counters.ventesImpayees || 0;
    case 'ECOMMERCE':
      return (counters.commandesEnLigneEnAttente || 0) + (counters.paniersAbandonnes || 0);
    case 'PRODUITS & STOCKS':
      return (counters.stocksFaibles || 0) + (counters.lotsExpirant || 0);
    case 'ACHATS & FOURNISSEURS':
      return (counters.commandesEnAttente || 0) + (counters.receptionsEnAttente || 0) + (counters.retoursEnAttente || 0);
    case 'FINANCES':
      return (counters.depensesEnAttente || 0) + (counters.ecrituresBrouillon || 0);
    case 'TRÉSORERIE':
      return counters.tresorerieAlerte || 0;
    case 'PARAMÈTRES':
      return counters.notificationsCount || 0;
    case 'MON ESPACE':
      return counters.notificationsCount || 0;
    default:
      return 0;
  }
};

// ============================================================
// HELPER — actif (tolère query strings)
// ============================================================
const isPathActive = (currentPath, itemPath) => {
  if (!itemPath || itemPath === '#') return false;
  const cleanItemPath = itemPath.split('?')[0];
  return currentPath === cleanItemPath || currentPath.startsWith(cleanItemPath + '/');
};

// ============================================================
// COMPOSANT
// ============================================================
const Navbar = ({ content, mode, toggleColorMode }) => {
  const location = useLocation();
  const path = location.pathname || '/';
  const navigate = useNavigate();

  // --- UI ---
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // --- Sections ouvertes ---
  const [openSections, setOpenSections] = useState({
    'TABLEAU DE BORD': true,
    'VENTES': true,
    'ECOMMERCE': false,
    'PORTE-MONNAIE CLIENTS': false,
    'PRODUITS & STOCKS': true,
    'ACHATS & FOURNISSEURS': false,
    'FINANCES': true,
    'TRÉSORERIE': false,
    'LIVRAISONS': false,
    'PARAMÈTRES': false,
    'MON ESPACE': false,
  });

  const [userInitial, setUserInitial] = useState('U');
  const [userFullName, setUserFullName] = useState('Utilisateur');
  const [currentTime, setCurrentTime] = useState(new Date());

  const [etablissement, setEtablissement] = useState(null);
  const [loadingEtab, setLoadingEtab] = useState(true);
  const [logoUrl, setLogoUrl] = useState(null);

  // --- Compteurs ---
  const [counters, setCounters] = useState({
    ventesImpayees: 0,
    notificationsCount: 0,
    commandesEnAttente: 0,
    stocksFaibles: 0,
    alertesStockCount: 0,
    lotsExpirant: 0,
    inventairesEnCours: 0,
    facturesImpayees: 0,
    receptionsEnAttente: 0,
    retoursEnAttente: 0,
    paiementsFournisseursEnAttente: 0,
    depensesEnAttente: 0,
    budgetsAlertes: 0,
    ecrituresBrouillon: 0,
    tresorerieAlerte: 0,
    categoriesBudgetCount: 0,
    // Ecommerce
    commandesEnLigneEnAttente: 0,
    avisEnAttente: 0,
    clientsEnAttente: 0,
    paniersAbandonnes: 0,
    produitsBoutiqueActifs: 0,
    couponsActifs: 0,
  });

  const updateCounters = (patch) => setCounters((c) => ({ ...c, ...patch }));

  // --- User ---
  const user = (() => {
    try { return JSON.parse(localStorage.getItem('User') || 'null'); }
    catch { return null; }
  })();

  const role = user?.role || 'vendeur';
  const userEmail = user?.email || '';
  const firstName = user?.first_name || '';
  const lastName  = user?.last_name || '';
  const userName  = firstName || lastName || user?.username || userEmail?.split('@')[0] || 'Utilisateur';

  // --- Permissions ---
  const isAdmin        = role === 'admin';
  const isGestionnaire = role === 'gestionnaire' || isAdmin;
  const isVendeur      = role === 'vendeur';
  const isMagasinier   = role === 'magasinier' || isGestionnaire;
  const isComptable    = role === 'comptable' || isAdmin;

  const roleConfig = ROLE_CONFIG[role] || ROLE_CONFIG.vendeur;
  const RoleIcon   = roleConfig.icon;

  // --- Horloge + initiales ---
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (firstName && lastName) {
      setUserInitial(`${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase());
      setUserFullName(`${firstName} ${lastName}`);
    } else if (userName) {
      setUserInitial(userName.charAt(0).toUpperCase());
      setUserFullName(userName);
    }
  }, [firstName, lastName, userName]);

  const formattedTime = currentTime.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const formattedDate = currentTime.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });

  // --- Logo ---
  const getLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    if (logoPath.startsWith('http')) return logoPath;
    const baseURL = axiosInstance.defaults.baseURL || '';
    if (logoPath.startsWith('/media/') || logoPath.startsWith('/static/')) return `${baseURL}${logoPath}`;
    return `${baseURL}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`;
  };

  // --- Établissement ---
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await axiosInstance.get('/etablissements/unique/');
        if (!cancelled && res?.data) {
          setEtablissement(res.data);
          if (res.data.logo) setLogoUrl(getLogoUrl(res.data.logo));
        }
      } catch { /* silencieux */ }
      finally { if (!cancelled) setLoadingEtab(false); }
    })();
    return () => { cancelled = true; };
  }, []);

  // --- Compteurs ---
  useEffect(() => {
    const token = localStorage.getItem('Token');
    if (!token) return;

    const load = async () => {
      const headers = { Authorization: `Token ${token}` };
      const safeGet = async (url, fallback) => {
        try { const r = await axiosInstance.get(url, { headers }); return r.data; }
        catch { return fallback; }
      };
      const len = (data) => Array.isArray(data) ? data.length : (data?.results?.length || 0);

      if (isAdmin || isGestionnaire) {
        const cmd      = await safeGet('/store/checkout/my-orders/?status=draft', []);
        const avis     = await safeGet('/store/reviews/?status=pending', []);
        const cliApp   = await safeGet('/clients/pending/', []);
        const paniers  = await safeGet('/store/checkout/abandoned/', []);
        const produits = await safeGet('/produits/?published=true', []);
        const coupons  = await safeGet('/store/coupons/?active=true', []);

        updateCounters({
          commandesEnLigneEnAttente: len(cmd),
          avisEnAttente: len(avis),
          clientsEnAttente: len(cliApp),
          paniersAbandonnes: len(paniers),
          produitsBoutiqueActifs: len(produits),
          couponsActifs: len(coupons),
        });
      }

      if (isAdmin || isComptable) {
        const catBudget = await safeGet('/budget-categories/', []);
        updateCounters({ categoriesBudgetCount: len(catBudget) });
      }
    };

    load();
  }, [role, isAdmin, isGestionnaire, isComptable]);

  // --- Toggle / Logout ---
  const handleSectionToggle = (sectionName) => {
    setOpenSections((prev) => ({ ...prev, [sectionName]: !prev[sectionName] }));
  };

  const logoutUser = () => {
    setIsUserMenuOpen(false);
    localStorage.removeItem('Token');
    localStorage.removeItem('User');
    window.dispatchEvent(new Event('auth-change'));
    navigate('/');
  };

  // ============================================================
  // SECTIONS
  // ============================================================
  const menuSections = useMemo(() => {
    const sections = [];

    // 1. TABLEAU DE BORD
    sections.push({
      name: 'TABLEAU DE BORD',
      icon: LayoutDashboard,
      items: [
        { id: 'dashboard',    text: 'Tableau de Bord', icon: LayoutDashboard, path: '/dashboard',    permission: true },
        { id: 'statistiques', text: 'Statistiques',    icon: TrendingUp,      path: '/statistiques', permission: isAdmin || isGestionnaire },
        { id: 'analyses',     text: 'Analyses',        icon: BarChart3,       path: '/analyses',     permission: isAdmin || isGestionnaire },
      ],
    });

    // 2. VENTES
    sections.push({
      name: 'VENTES',
      icon: ShoppingCart,
      items: [
        { id: 'ventes',           text: 'Ventes',              icon: ShoppingCart, path: '/ventes',        permission: isAdmin || isGestionnaire || isVendeur, badge: counters.ventesImpayees },
        { id: 'nouvelle-vente',   text: 'Nouvelle Vente',      icon: PlusCircle,   path: '/ventes/nouveau', permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'sep-ventes-1',     text: '',                    icon: null,         path: '#',              permission: true, separator: true },
        { id: 'clients',          text: 'Clients',             icon: Users,        path: '/clients',        permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'nouveau-client',   text: 'Nouveau Client',      icon: UserPlus,     path: '/clients/nouveau', permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'sep-ventes-2',     text: '',                    icon: null,         path: '#',              permission: true, separator: true },
        { id: 'devis',            text: 'Devis',               icon: FileText,     path: '/devis',          permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'nouveau-devis',    text: 'Nouveau Devis',       icon: FilePlus,     path: '/devis/nouveau',  permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'sep-ventes-3',     text: '',                    icon: null,         path: '#',              permission: true, separator: true },
        { id: 'factures',         text: 'Factures Clients',    icon: Receipt,      path: '/factures',       permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'paiements',        text: 'Paiements Clients',   icon: CreditCard,   path: '/paiements',      permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'nouveau-paiement', text: 'Nouveau Paiement',    icon: CreditCardPlus, path: '/paiements/nouveau', permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'sep-ventes-4',     text: '',                    icon: null,         path: '#',              permission: true, separator: true },
        { id: 'pos',              text: 'Point de Vente',      icon: ShoppingBag,  path: '/point-de-vente', permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'pos-scan',         text: 'Scan & Vente',        icon: Barcode,      path: '/pos-scan',       permission: isAdmin || isGestionnaire || isVendeur },
        { id: 'retours-clients',  text: 'Retours Clients',     icon: ReturnIcon,   path: '/retours-clients', permission: isAdmin || isGestionnaire },
      ],
    });

    // 3. ECOMMERCE
    if (isAdmin || isGestionnaire) {
      sections.push({
        name: 'ECOMMERCE',
        icon: Store,
        items: [
          { id: 'ecommerce-dashboard',       text: 'Tableau de Bord Boutique',  icon: BarChart3,     path: '/ecommerce/dashboard',              permission: true },
          { id: 'sep-ecommerce-1',           text: '',                          icon: null,          path: '#',                                 permission: true, separator: true },
          { id: 'ecommerce-orders',          text: 'Commandes en Ligne',        icon: ClipboardList, path: '/ecommerce/commandes',              permission: true, badge: counters.commandesEnLigneEnAttente },
          { id: 'ecommerce-orders-pending',  text: 'Commandes à Traiter',       icon: Clock,         path: '/ecommerce/commandes?status=draft', permission: true },
          { id: 'ecommerce-abandoned',       text: 'Paniers Abandonnés',        icon: ShoppingCart,  path: '/ecommerce/paniers-abandonnes',     permission: true, badge: counters.paniersAbandonnes },
          { id: 'sep-ecommerce-2',           text: '',                          icon: null,          path: '#',                                 permission: true, separator: true },
          { id: 'ecommerce-products',        text: 'Produits Boutique',         icon: Package,       path: '/ecommerce/produits',               permission: true, badge: counters.produitsBoutiqueActifs },
          { id: 'ecommerce-product-new',     text: 'Nouveau Produit Boutique',  icon: PlusCircle,    path: '/ecommerce/produits/nouveau',       permission: true },
          { id: 'ecommerce-categories',      text: 'Catégories Boutique',       icon: Tags,          path: '/ecommerce/categories',             permission: true },
          { id: 'ecommerce-brands',          text: 'Marques',                   icon: Award,         path: '/ecommerce/marques',                permission: true },
          { id: 'sep-ecommerce-3',           text: '',                          icon: null,          path: '#',                                 permission: true, separator: true },
          { id: 'ecommerce-clients',         text: 'Clients Boutique',          icon: Users,         path: '/ecommerce/clients',                permission: true },
          { id: 'sep-ecommerce-4',           text: '',                          icon: null,          path: '#',                                 permission: true, separator: true },
          { id: 'ecommerce-reviews',         text: 'Avis & Notes',              icon: Star,          path: '/ecommerce/avis',                   permission: true, badge: counters.avisEnAttente },
          { id: 'ecommerce-coupons',         text: "Coupons & Bons d'achat",    icon: Ticket,        path: '/ecommerce/coupons',                permission: true, badge: counters.couponsActifs },
          { id: 'ecommerce-promotions',      text: 'Promotions',                icon: Percent,       path: '/ecommerce/promotions',             permission: true },
          { id: 'ecommerce-banners',         text: 'Bannières & Sliders',       icon: ImageIcon,     path: '/ecommerce/bannieres',              permission: true },
          { id: 'sep-ecommerce-5',           text: '',                          icon: null,          path: '#',                                 permission: true, separator: true },
          { id: 'ecommerce-deliveries',      text: 'Livraisons Boutique',       icon: Truck,         path: '/ecommerce/livraisons',             permission: true },
          { id: 'ecommerce-shipping-zones',  text: 'Zones de Livraison',        icon: Map,           path: '/ecommerce/zones-livraison',        permission: true },
          // ❌ SUPPRIMÉ : Configuration Boutique
        ],
      });
    }

    // 4. PORTE-MONNAIE CLIENTS
    sections.push({
      name: 'PORTE-MONNAIE CLIENTS',
      icon: Wallet,
      items: [
        { id: 'wallets',             text: 'Gestion des Porte-monnaie',    icon: Wallet,     path: '/wallets',              permission: isAdmin || isGestionnaire },
        { id: 'wallet-deposit',      text: 'Dépôt Client',                 icon: Plus,       path: '/wallets/depot',        permission: isAdmin || isGestionnaire },
        { id: 'wallet-transactions', text: 'Historique des Transactions', icon: History,    path: '/wallets/transactions', permission: isAdmin || isGestionnaire },
        { id: 'wallet-pay',          text: 'Paiement avec Porte-monnaie',  icon: CreditCard, path: '/wallets/paiement',     permission: isAdmin || isGestionnaire },
      ],
    });

    // 5. PRODUITS & STOCKS
    sections.push({
      name: 'PRODUITS & STOCKS',
      icon: Package,
      items: [
        { id: 'categories',       text: 'Catégories',         icon: Tags,           path: '/categories',       permission: isAdmin || isGestionnaire },
        { id: 'unites-mesure',    text: 'Unités de Mesure',   icon: Ruler,          path: '/unites-mesure',    permission: isAdmin },
        { id: 'produits',         text: 'Produits',           icon: Package,        path: '/produits',         permission: isAdmin || isGestionnaire || isMagasinier },
        { id: 'add-stock-manual', text: 'Ajout Manuel Stock', icon: PackagePlus,    path: '/add-stock-manual', permission: isAdmin || isGestionnaire || isMagasinier },
        { id: 'stocks',           text: 'Stocks',             icon: Boxes,          path: '/stocks',           permission: isAdmin || isGestionnaire || isMagasinier, badge: counters.stocksFaibles },
        { id: 'entrepots',        text: 'Entrepôts',          icon: Warehouse,      path: '/entrepots',        permission: isAdmin || isGestionnaire },
        { id: 'lots',             text: 'Lots',               icon: Layers,         path: '/lots',             permission: isAdmin || isGestionnaire || isMagasinier, badge: counters.lotsExpirant },
        { id: 'mouvements-stock', text: 'Mouvements Stock',   icon: MoveHorizontal, path: '/mouvements-stock', permission: isAdmin || isGestionnaire || isMagasinier },
        { id: 'alertes-stock',    text: 'Alertes Stock',      icon: AlertOctagon,   path: '/alertes-stock',    permission: isAdmin || isGestionnaire, badge: counters.alertesStockCount },
        { id: 'inventaires',      text: 'Inventaires',        icon: ClipboardCheck, path: '/inventaires',      permission: isAdmin || isGestionnaire, badge: counters.inventairesEnCours },
        { id: 'transferts',       text: 'Transferts',         icon: ArrowLeftRight, path: '/transferts',       permission: isAdmin || isGestionnaire },
      ],
    });

    // 6. ACHATS & FOURNISSEURS
    if (isAdmin || isGestionnaire) {
      sections.push({
        name: 'ACHATS & FOURNISSEURS',
        icon: ShoppingBag,
        items: [
          { id: 'fournisseurs',           text: 'Fournisseurs',           icon: Building2,      path: '/fournisseurs',           permission: true },
          { id: 'commandes-fournisseurs', text: 'Commandes Fournisseurs', icon: FileText,       path: '/commandes-fournisseurs', permission: true, badge: counters.commandesEnAttente },
          { id: 'receptions',             text: 'Réceptions',             icon: PackageCheck,   path: '/receptions',             permission: true, badge: counters.receptionsEnAttente },
          { id: 'retours-fournisseurs',   text: 'Retours Fournisseurs',   icon: RotateCcw,      path: '/retours-fournisseurs',   permission: true, badge: counters.retoursEnAttente },
          { id: 'factures-fournisseurs',  text: 'Factures Fournisseurs',  icon: ReceiptIcon,    path: '/factures-fournisseurs',  permission: isAdmin || isGestionnaire || isComptable, badge: counters.facturesImpayees },
          { id: 'paiements-fournisseurs', text: 'Paiements Fournisseurs', icon: CreditCardIcon, path: '/paiements-fournisseurs', permission: isAdmin || isGestionnaire || isComptable, badge: counters.paiementsFournisseursEnAttente },
          { id: 'dashboard-achats',       text: 'Dashboard Achats',       icon: BarChart,       path: '/dashboard-achats',       permission: true },
        ],
      });
    }

    // 7. FINANCES
    if (isAdmin || isGestionnaire) {
      sections.push({
        name: 'FINANCES',
        icon: DollarSign,
        items: [
          { id: 'dashboard-finances',        text: 'Tableau de Bord Finances', icon: Gauge,           path: '/dashboard-finances',        permission: isAdmin || isComptable },
          { id: 'comptes-comptables',        text: 'Plan Comptable',           icon: Grid3x3,         path: '/comptes-comptables',        permission: isAdmin || isComptable },
          { id: 'ecritures-comptables',      text: 'Écritures Comptables',     icon: BookOpen,        path: '/ecritures-comptables',      permission: isAdmin || isComptable, badge: counters.ecrituresBrouillon },
          { id: 'journal-comptable',         text: 'Journal Comptable',        icon: ScrollText,      path: '/journal-comptable',         permission: isAdmin || isComptable },
          { id: 'grand-livre',               text: 'Grand Livre',              icon: Scale,           path: '/grand-livre',               permission: isAdmin || isComptable },
          { id: 'balance-generale',          text: 'Balance Générale',         icon: TableProperties, path: '/balance-generale',          permission: isAdmin || isComptable },
          { id: 'sep-finances-1',            text: '',                         icon: null,            path: '#',                          permission: true, separator: true },
          { id: 'depenses',                  text: 'Dépenses',                 icon: TrendingDown,    path: '/depenses',                  permission: isAdmin || isComptable, badge: counters.depensesEnAttente },
          { id: 'nouvelle-depense',          text: 'Nouvelle Dépense',         icon: PlusCircle,      path: '/depenses/nouveau',          permission: isAdmin || isComptable },
          { id: 'sep-finances-2',            text: '',                         icon: null,            path: '#',                          permission: true, separator: true },
          { id: 'budget-categories',         text: 'Catégories de Budget',     icon: Tags,            path: '/budget-categories',         permission: isAdmin || isComptable, badge: counters.categoriesBudgetCount },
          { id: 'nouvelle-budget-categorie', text: 'Nouvelle Catégorie Budget', icon: PlusCircle,     path: '/budget-categories/nouveau', permission: isAdmin || isComptable },
          { id: 'sep-finances-3',            text: '',                         icon: null,            path: '#',                          permission: true, separator: true },
          { id: 'budgets',                   text: 'Budgets',                  icon: PiggyBank,       path: '/budgets',                   permission: isAdmin || isComptable, badge: counters.budgetsAlertes },
          { id: 'nouveau-budget',            text: 'Nouveau Budget',           icon: PlusCircle,      path: '/budgets/nouveau',           permission: isAdmin || isComptable },
          { id: 'sep-finances-4',            text: '',                         icon: null,            path: '#',                          permission: true, separator: true },
          { id: 'rapports-financiers',       text: 'Rapports Financiers',      icon: FileSpreadsheet, path: '/rapports-financiers',       permission: isAdmin || isComptable },
          { id: 'config-financiere',         text: 'Configuration Financière', icon: Cog,             path: '/config-financiere',         permission: isAdmin },
          { id: 'sep-finances-5',            text: '',                         icon: null,            path: '#',                          permission: true, separator: true },
          { id: 'nouvelle-ecriture',         text: 'Nouvelle Écriture',        icon: PlusCircle,      path: '/ecritures-comptables/nouveau', permission: isAdmin || isComptable },
        ],
      });
    }

    // 8. TRÉSORERIE
    if (isAdmin || isGestionnaire) {
      sections.push({
        name: 'TRÉSORERIE',
        icon: Wallet,
        items: [
          { id: 'dashboard-tresorerie',   text: 'Tableau de Bord Trésorerie', icon: Gauge,           path: '/dashboard-tresorerie',   permission: isAdmin || isComptable, badge: counters.tresorerieAlerte },
          { id: 'caisses',                text: 'Caisses',                     icon: Banknote,        path: '/caisses',                permission: isAdmin || isComptable },
          { id: 'comptes-bancaires',      text: 'Comptes Bancaires',           icon: Landmark,        path: '/comptes-bancaires',      permission: isAdmin || isComptable },
          { id: 'mouvements-tresorerie',  text: 'Mouvements Trésorerie',       icon: Coins,           path: '/mouvements-tresorerie',  permission: isAdmin || isComptable },
          { id: 'frais',                  text: 'Frais & Dépenses',            icon: ReceiptText,     path: '/frais',                  permission: isAdmin || isComptable },
          { id: 'previsions',             text: 'Prévisions',                  icon: CalendarDays,    path: '/previsions',             permission: isAdmin || isComptable },
          { id: 'rapprochement-bancaire', text: 'Rapprochement Bancaire',      icon: CheckCircle,     path: '/rapprochement-bancaire', permission: isAdmin || isComptable },
          { id: 'tresorerie-journaliere', text: 'Trésorerie Journalière',      icon: ClipboardList,   path: '/tresorerie-journaliere', permission: isAdmin || isComptable },
          { id: 'alertes-tresorerie',     text: 'Alertes Trésorerie',          icon: AlertCircleIcon, path: '/alertes-tresorerie',     permission: isAdmin || isComptable },
        ],
      });
    }

    // 9. LIVRAISONS
    if (isAdmin || isGestionnaire) {
      sections.push({
        name: 'LIVRAISONS',
        icon: Truck,
        items: [
          { id: 'livraisons',       text: 'Livraisons',       icon: TruckIcon, path: '/livraisons',       permission: true },
          { id: 'tournees',         text: 'Tournées',         icon: Route,     path: '/tournees',         permission: true },
          { id: 'livreurs',         text: 'Livreurs',         icon: UserCheck, path: '/livreurs',         permission: true },
          { id: 'suivi-livraisons', text: 'Suivi Livraisons', icon: Map,       path: '/suivi-livraisons', permission: true },
        ],
      });
    }

    // 10. PARAMÈTRES
    if (isAdmin || isGestionnaire) {
      sections.push({
        name: 'PARAMÈTRES',
        icon: Settings,
        items: [
          { id: 'company-config',     text: 'Configuration Établissement', icon: Building2, path: '/company-config',     permission: isAdmin },
          { id: 'notifications',      text: 'Notifications',               icon: Bell,      path: '/notifications',      permission: isAdmin || isGestionnaire, badge: counters.notificationsCount },
          { id: 'system-settings',    text: 'Paramètres Système',          icon: Cog,       path: '/system-settings',    permission: isAdmin },
          { id: 'document-templates', text: 'Modèles Documents',           icon: Printer,   path: '/document-templates', permission: isAdmin || isGestionnaire },
          { id: 'backups',            text: 'Sauvegardes',                 icon: Database,  path: '/backups',            permission: isAdmin },
          { id: 'audit',              text: "Journal d'audit",             icon: History,   path: '/audit',              permission: isAdmin },
          { id: 'utilisateurs',       text: 'Utilisateurs',                icon: Users,     path: '/utilisateurs',       permission: isAdmin },
          { id: 'roles',              text: 'Rôles & Permissions',         icon: Shield,    path: '/roles',              permission: isAdmin },
        ],
      });
    }

    // 11. MON ESPACE
    sections.push({
      name: 'MON ESPACE',
      icon: UserCircle,
      items: [
        { id: 'profile',          text: 'Mon Profil',        icon: UserCircle, path: '/profile',          permission: true },
        { id: 'my-notifications', text: 'Mes Notifications', icon: BellRing,   path: '/my-notifications', permission: true, badge: counters.notificationsCount },
        { id: 'my-preferences',   text: 'Mes Préférences',   icon: Settings,   path: '/my-preferences',   permission: true },
        { id: 'support',          text: 'Support',           icon: HelpCircle, path: '/support',          permission: true },
      ],
    });

    return sections;
  }, [counters, isAdmin, isGestionnaire, isComptable, isMagasinier, isVendeur]);

  const visibleSections = useMemo(
    () => menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.permission === true),
      }))
      .filter((section) => section.items.length > 0),
    [menuSections]
  );

  // --- Recherche Ctrl+K ---
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
      if (e.key === 'Escape') {
        setIsSearchOpen(false);
        setSearchQuery('');
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchResults = useMemo(() => {
    if (searchQuery.length <= 1) return [];
    return visibleSections.flatMap((section) =>
      section.items
        .filter((item) =>
          item.text.toLowerCase().includes(searchQuery.toLowerCase()) ||
          section.name.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((item) => ({ ...item, section: section.name }))
    );
  }, [searchQuery, visibleSections]);

  // --- Rendu item ---
  const renderMenuItem = (item) => {
    if (item.separator) {
      return <div key={item.id} className="border-t border-primary/20 my-2 mx-1" />;
    }

    const ItemIcon = item.icon;
    const isActive = isPathActive(path, item.path);
    const isNewItem = item.id && /^(nouveau-|nouvelle-)|new/.test(item.id);

    return (
      <Link
        key={item.id}
        to={item.path}
        className={`
          flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all duration-200
          ${isActive
            ? 'bg-primary text-primary-content shadow-md'
            : 'text-base-content/60 hover:bg-primary/10 hover:text-primary'}
          ${isNewItem && !isActive ? 'border-l-2 border-primary pl-3' : ''}
        `}
      >
        {ItemIcon && <ItemIcon className="w-4 h-4" />}
        <span className="flex-1">{item.text}</span>
        {isNewItem && !isActive && (
          <span className="badge badge-success badge-xs">Nouveau</span>
        )}
        {item.badge > 0 && (
          <span className={`badge badge-error badge-xs ${isActive ? 'badge-outline' : ''}`}>
            {item.badge > 99 ? '99+' : item.badge}
          </span>
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen bg-base-200">
      {/* OVERLAY RECHERCHE */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm" onClick={() => setIsSearchOpen(false)}>
          <div className="flex items-start justify-center pt-20 px-4" onClick={(e) => e.stopPropagation()}>
            <div className="w-full max-w-2xl bg-base-100 rounded-2xl shadow-2xl overflow-hidden border border-primary/20">
              <div className="p-4 border-b border-base-200">
                <div className="flex items-center gap-3">
                  <Search className="w-5 h-5 text-primary" />
                  <input
                    type="text"
                    placeholder="Rechercher un menu... (Ctrl+K)"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent outline-none text-base-content placeholder:text-base-content/40"
                    autoFocus
                  />
                  <button onClick={() => setIsSearchOpen(false)} className="p-1 rounded-lg hover:bg-base-200">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <div className="max-h-96 overflow-y-auto p-2">
                {searchResults.length > 0 ? (
                  searchResults.map((item) => (
                    <Link
                      key={item.id}
                      to={item.path}
                      onClick={() => setIsSearchOpen(false)}
                      className="flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-primary/10 transition-colors"
                    >
                      {item.icon && <item.icon className="w-5 h-5 text-primary" />}
                      <div>
                        <p className="text-sm font-medium text-base-content">{item.text}</p>
                        <p className="text-xs text-base-content/40">{item.section}</p>
                      </div>
                    </Link>
                  ))
                ) : searchQuery.length > 1 ? (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Aucun résultat pour "{searchQuery}"</p>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-base-content/40">Tapez pour rechercher un menu</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* BARRE SUPÉRIEURE */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-primary to-primary/90 shadow-lg border-b-2 border-accent">
        <div className="px-4 sm:px-6 lg:pl-72">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:flex p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
              >
                {sidebarOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
              </button>

              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg text-primary-content hover:bg-primary-content/10 transition-colors"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>

              <Link to="/dashboard" className="hidden lg:flex items-center gap-3">
                <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center shadow-lg border-2 border-accent overflow-hidden">
                  {!loadingEtab && logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-6 h-6 text-primary" />
                  )}
                </div>
                <div>
                  <h1 className="text-primary-content font-bold text-lg">
                    {!loadingEtab ? (etablissement?.nom || 'SODEPCI ERP') : 'Chargement…'}
                  </h1>
                  <p className="text-primary-content/60 text-[10px]">
                    {!loadingEtab ? (etablissement?.sigle || 'ERP Management') : ''}
                  </p>
                </div>
              </Link>

              <div className="lg:hidden flex items-center gap-2">
                <div className="w-8 h-8 bg-base-100 rounded-lg flex items-center justify-center border-2 border-accent overflow-hidden">
                  {!loadingEtab && logoUrl ? (
                    <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                  ) : (
                    <GraduationCap className="w-5 h-5 text-primary" />
                  )}
                </div>
                <span className="text-primary-content font-bold text-sm">
                  {!loadingEtab ? (etablissement?.nom || 'SODEPCI ERP') : 'Chargement…'}
                </span>
              </div>
            </div>

            <div className="hidden lg:flex items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10">
                <Calendar className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedDate}</span>
                <div className="w-px h-4 bg-primary-content/30 mx-1" />
                <Clock className="w-4 h-4 text-primary-content/80" />
                <span className="text-sm font-medium text-primary-content">{formattedTime}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsSearchOpen(true)}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10"
                title="Rechercher (Ctrl+K)"
              >
                <Search className="w-5 h-5" />
              </button>

              <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary-content/10">
                <RoleIcon className="w-4 h-4 text-primary-content" />
                <span className="text-primary-content text-xs font-medium">{roleConfig.label}</span>
              </div>

              <button
                onClick={toggleColorMode}
                className="p-2 rounded-lg text-primary-content hover:bg-primary-content/10"
              >
                {mode === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              </button>

              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 p-1 rounded-full hover:bg-primary-content/10"
                >
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary to-primary/70 flex items-center justify-center text-primary-content font-bold border-2 border-primary-content">
                    {userInitial}
                  </div>
                  <ChevronDown className="w-4 h-4 text-primary-content hidden sm:block" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsUserMenuOpen(false)} />
                    <div className="absolute right-0 mt-2 w-80 bg-base-100 rounded-xl shadow-xl z-50 border border-primary/20 overflow-hidden">
                      <div className="p-4 bg-gradient-to-r from-primary to-primary/80 text-primary-content">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-full bg-primary-content/20 flex items-center justify-center text-xl font-bold">
                            {userInitial}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold truncate">{userFullName}</p>
                            <p className="text-xs text-primary-content/70 truncate">{userEmail}</p>
                            <span className={`badge badge-${roleConfig.color} badge-sm mt-1`}>{roleConfig.label}</span>
                          </div>
                        </div>
                      </div>
                      <div className="py-2">
                        <Link to="/profile" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5">
                          <UserCircle className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm">Mon profil</span>
                        </Link>
                        <Link to="/my-preferences" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5">
                          <Settings className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm">Mes préférences</span>
                        </Link>
                        <Link to="/support" onClick={() => setIsUserMenuOpen(false)} className="flex items-center gap-3 px-4 py-2.5 hover:bg-primary/5">
                          <HelpCircle className="w-5 h-5 text-base-content/40" />
                          <span className="text-sm">Support</span>
                        </Link>
                        <div className="border-t border-base-200 my-1" />
                        <button onClick={logoutUser} className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-error/10 text-error">
                          <LogOut className="w-5 h-5" />
                          <span className="text-sm">Déconnexion</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* SIDEBAR DESKTOP */}
      <aside className={`
        fixed left-0 top-16 bottom-0 z-30
        bg-base-100 shadow-xl border-r border-primary/20
        transition-all duration-300 ease-in-out
        ${sidebarOpen ? 'w-72' : 'w-20'}
        hidden lg:block
      `}>
        <div className="h-full flex flex-col">
          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'} bg-gradient-to-r from-primary/5 to-transparent`}>
            <div className={`flex items-center ${!sidebarOpen && 'justify-center'} gap-3`}>
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-primary/80 rounded-xl flex items-center justify-center overflow-hidden">
                {!loadingEtab && logoUrl ? (
                  <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                ) : (
                  <GraduationCap className="w-6 h-6 text-white" />
                )}
              </div>
              {sidebarOpen && (
                <div className="min-w-0">
                  <h2 className="font-bold text-base-content text-sm truncate">
                    {!loadingEtab ? (etablissement?.nom || 'SODEPCI ERP') : 'Chargement…'}
                  </h2>
                  <p className="text-xs text-base-content/50 truncate">
                    {!loadingEtab ? (etablissement?.sigle || 'ERP Management') : ''}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className={`p-4 border-b border-primary/20 ${!sidebarOpen && 'text-center'}`}>
            <div className={`flex items-center ${!sidebarOpen && 'flex-col'} gap-3`}>
              <div className={`bg-gradient-to-br from-primary to-primary/80 text-primary-content rounded-xl ${sidebarOpen ? 'w-12 h-12' : 'w-10 h-10'} flex items-center justify-center font-bold ${sidebarOpen ? 'text-xl' : 'text-lg'}`}>
                {userInitial}
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{userFullName}</p>
                  <p className="text-xs text-base-content/50 truncate">{userEmail}</p>
                  <span className={`badge badge-${roleConfig.color} badge-sm mt-1`}>{roleConfig.label}</span>
                </div>
              )}
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
            {visibleSections.map((section, idx) => {
              const SectionIcon = section.icon;
              const isOpen = !!openSections[section.name];
              const sectionBadge = computeSectionBadge(section.name, counters);

              return (
                <div key={idx} className="mb-1">
                  <button
                    onClick={() => handleSectionToggle(section.name)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all
                      ${!sidebarOpen && 'justify-center'}
                      ${isOpen ? 'bg-primary/10 text-primary' : 'text-base-content/70 hover:bg-primary/5 hover:text-primary'}
                    `}
                  >
                    <SectionIcon className="w-5 h-5" />
                    {sidebarOpen && (
                      <>
                        <span className="flex-1 text-left text-xs font-semibold uppercase tracking-wide">{section.name}</span>
                        {sectionBadge > 0 && (
                          <span className="badge badge-error badge-xs">{sectionBadge > 99 ? '99+' : sectionBadge}</span>
                        )}
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </>
                    )}
                  </button>

                  {sidebarOpen && isOpen && (
                    <div className="ml-6 mt-2 space-y-1 border-l-2 border-primary pl-4">
                      {section.items.map(renderMenuItem)}
                    </div>
                  )}
                </div>
              );
            })}
          </nav>

          <div className="p-4 border-t border-primary/20">
            {sidebarOpen ? (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                  <span className="text-xs text-base-content/50">v2.4.0</span>
                </div>
                <span className="badge badge-primary badge-sm">
                  {!loadingEtab ? (etablissement?.sigle || 'SODEPCI') : 'SODEPCI'}
                </span>
              </div>
            ) : (
              <div className="text-center">
                <div className="w-1.5 h-1.5 bg-success rounded-full animate-pulse mx-auto" />
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* CONTENU PRINCIPAL */}
      <main className={`transition-all duration-300 pt-16 ${sidebarOpen ? 'lg:pl-72' : 'lg:pl-20'}`}>
        <div className="p-4 sm:p-6">
          {content || (
            <div className="flex items-center justify-center h-64">
              <p className="text-base-content/50">Aucun contenu à afficher</p>
            </div>
          )}
        </div>
      </main>

      {/* MENU MOBILE */}
      {isMobileMenuOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-50 lg:hidden" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed top-0 left-0 bottom-0 w-80 bg-base-100 z-50 shadow-2xl lg:hidden overflow-y-auto">
            <div className="bg-gradient-to-br from-primary to-primary/80 p-5">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-base-100 rounded-xl flex items-center justify-center p-1 overflow-hidden">
                    {!loadingEtab && logoUrl ? (
                      <img src={logoUrl} alt="logo" className="w-full h-full object-cover" />
                    ) : (
                      <GraduationCap className="w-6 h-6 text-primary" />
                    )}
                  </div>
                  <div>
                    <h2 className="text-primary-content font-bold text-lg">
                      {!loadingEtab ? (etablissement?.nom || 'SODEPCI ERP') : 'Chargement…'}
                    </h2>
                    <p className="text-primary-content/70 text-xs">{roleConfig.label}</p>
                  </div>
                </div>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-primary-content p-2 rounded-lg hover:bg-primary-content/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex items-center gap-3 p-3 bg-primary-content/10 rounded-xl">
                <div className="w-10 h-10 rounded-full bg-primary-content/20 flex items-center justify-center text-primary-content font-bold">
                  {userInitial}
                </div>
                <div>
                  <p className="text-primary-content font-medium text-sm">{userFullName}</p>
                  <p className="text-primary-content/60 text-xs">{userEmail}</p>
                </div>
              </div>
            </div>

            <div className="py-4 px-3 space-y-1">
              {visibleSections.map((section, idx) => {
                const SectionIcon = section.icon;
                const isOpen = !!openSections[section.name];
                return (
                  <div key={idx} className="mb-2">
                    <button
                      onClick={() => handleSectionToggle(section.name)}
                      className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg hover:bg-primary/10 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <SectionIcon className="w-5 h-5 text-primary" />
                        <span className="text-xs font-bold uppercase">{section.name}</span>
                      </div>
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    {isOpen && (
                      <div className="ml-6 mt-2 space-y-1 border-l-2 border-primary pl-4">
                        {section.items.map(renderMenuItem)}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Navbar;