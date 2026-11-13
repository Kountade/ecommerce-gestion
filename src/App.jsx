// App.jsx - Version avec Site Web + ERP + Ecommerce complet
import './App.css';
import { Routes, Route, useLocation, Navigate } from 'react-router-dom';

// ============ LAYOUT PUBLIC (Navbar + Footer) ============
import PublicLayout from './components/site/Layout/PublicLayout';

// ============ COMPOSANTS SITE WEB (Pages Publiques) ============
import HomePage from './components/site/HomePage';
import BoutiquePage from './components/site/BoutiquePage';
import ProductDetailPage from './components/site/components/ProductDetailPage';
import PanierPage from './components/site/components/PanierPage';
import CheckoutPage from './components/site/components/CheckoutPage';
import OrderConfirmationPage from './components/site/components/OrderConfirmationPage';
import ClientAccountPage from './components/site/components/ClientAccountPage';
import LoginPage from './components/site/components/LoginPage';
import RegisterClient from './components/site/components/RegisterClient';
import AboutPage from './components/site/AboutPage';
import ProgrammesPage from './components/site/ProgrammesPage';
import ContactPage from './components/site/ContactPage';
import BlogPage from './components/site/BlogPage';
import BlogDetail from './components/site/BlogDetail';
import GalleryPage from './components/site/GalleryPage';
import EventsPage from './components/site/EventsPage';
import AdmissionsPage from './components/site/AdmissionsPage';
import TeamPage from './components/site/TeamPage';

// ============ COMPOSANTS AUTHENTIFICATION ============
import Register from './components/auth/Register';
import Login from './components/auth/Login';
import ClientsApproval from './components/users/ClientsApproval';
import PasswordResetRequest from './components/auth/PasswordResetRequest';
import PasswordReset from './components/auth/PasswordReset';

// ============ COMPOSANTS ERP ADMIN ============
import Navbar from './components/Navbar';
import ProtectedRoute from './components/common/ProtectedRoutes';
import EtablissementSettings from './components/settings/EtablissementSettings';

// ============ ECOMMERCE ============
import EcommerceOrders from './components/ecommerce/EcommerceOrders';
import EcommerceOrderDetail from './components/ecommerce/EcommerceOrderDetail';
import EcommercePlaceholder from './components/ecommerce/EcommercePlaceholder';
import AbandonedCarts from './components/ecommerce/AbandonedCarts';

// ============ Modules Logistique/Catégories ============
import Categories from './components/logistique/Categories';
import CategoryForm from './components/logistique/CategoryForm';
import CategoryDetails from './components/logistique/CategoryDetails';

// ============ Modules Produits ============
import ProductsList from './components/logistique/ProductsList';
import ProductForm from './components/logistique/ProductForm';
import ProductDetails from './components/logistique/ProductDetails';
import UnitesMesure from './components/logistique/UnitesMesure';
import UniteMesureForm from './components/logistique/UniteMesureForm';

// ============ Modules Stocks ============
import StocksList from './components/logistique/StocksList';
import LotsList from './components/logistique/LotsList';
import AddStockManual from './components/inventaire/AddStockManual';
import MouvementsStock from './components/logistique/MouvementsStock';
import EntrepotForm from './components/logistique/EntrepotForm';
import Entrepots from './components/logistique/Entrepots';
import EntrepotDetails from './components/logistique/EntrepotDetails';
import Transferts from './components/logistique/Transferts';
import TransfertForm from './components/logistique/TransfertForm';
import TransfertDetails from './components/logistique/TransfertDetails';

// ============ Modules Fournisseurs ============
import FournisseursList from './components/achatsfournisseurs/FournisseursList';
import FournisseursForm from './components/achatsfournisseurs/FournisseursForm';
import FournisseursDetails from './components/achatsfournisseurs/FournisseursDetails';

// ============ Modules Commandes ============
import CommandesList from './components/achatsfournisseurs/CommandesList';
import CommandeForm from './components/achatsfournisseurs/CommandeForm';
import CommandeDetails from './components/achatsfournisseurs/CommandeDetails';
import CommandePdf from './components/achatsfournisseurs/CommandePdf';
import ReceptionsList from './components/achatsfournisseurs/ReceptionsList';
import ReceptionForm from './components/achatsfournisseurs/ReceptionForm';
import ReceptionDetails from './components/achatsfournisseurs/ReceptionDetails';
import ReceptionPdf from './components/achatsfournisseurs/ReceptionPdf';
import FacturesFournisseursList from './components/achatsfournisseurs/FacturesFournisseursList';
import FactureFournisseurDetail from './components/achatsfournisseurs/FactureFournisseurDetail';
import FactureFournisseurForm from './components/achatsfournisseurs/FactureFournisseurForm';
import PaiementFournisseurDetail from './components/achatsfournisseurs/PaiementFournisseurDetail';
import PaiementsFournisseursList from './components/achatsfournisseurs/PaiementsFournisseursList';
import PaiementFournisseurForm from './components/achatsfournisseurs/PaiementFournisseurForm';
import PurchaseAlerts from './components/achatsfournisseurs/PurchaseAlerts';
import PurchaseReturnsList from './components/achatsfournisseurs/PurchaseReturnsList';
import PurchaseReturnForm from './components/achatsfournisseurs/PurchaseReturnForm';
import PurchaseReturnDetail from './components/achatsfournisseurs/PurchaseReturnDetail';
import PurchaseReturnPdf from './components/achatsfournisseurs/PurchaseReturnPdf';

// ============ Modules Ventes/Clients ============
import ClientsList from './components/ventesclients/ClientsList';
import ClientForm from './components/ventesclients/ClientForm';
import ClientDetail from './components/ventesclients/ClientDetail';
import VentesList from './components/ventesclients/VentesList';
import VenteForm from './components/ventesclients/VenteForm';
import VenteDetail from './components/ventesclients/VenteDetail';
import VentePdf from './components/ventesclients/VentePdf';
import DevisList from './components/ventesclients/DevisList';
import DevisForm from './components/ventesclients/DevisForm';
import DevisDetail from './components/ventesclients/DevisDetail';
import DevisPdf from './components/ventesclients/DevisPdf';
import FacturesList from './components/ventesclients/FacturesList';
import FactureForm from './components/ventesclients/FactureForm';
import FactureDetail from './components/ventesclients/FactureDetail';
import FacturePdf from './components/ventesclients/FacturePdf';
import PaiementsList from './components/ventesclients/PaiementsList';
import PaiementForm from './components/ventesclients/PaiementForm';
import PaiementDetail from './components/ventesclients/PaiementDetail';
import PaiementPdf from './components/ventesclients/PaiementPdf';

// ============ Wallets ============
import WalletsList from './components/Wallets/WalletsList';
import WalletForm from './components/Wallets/WalletForm';
import WalletDeposit from './components/Wallets/WalletDeposit';
import WalletDetail from './components/Wallets/WalletDetail';
import WalletPay from './components/Wallets/WalletPay';

// ============ POS ============
import PosScanSimple from './components/ventesclients/PosScanSimple';
import PosForm from './components/ventesclients/PosForm';

// ============ Modules Trésorerie ============
import CaissesList from './components/tresorerie/CaissesList';
import CaissesForm from './components/tresorerie/CaissesForm';
import CaissesDetail from './components/tresorerie/CaissesDetail';

import ComptesBancairesList from './components/tresorerie/ComptesBancairesList';
import CompteBancaireForm from './components/tresorerie/ComptesBancairesForm';
import CompteBancaireDetail from './components/tresorerie/CompteBancaireDetail';

import MouvementsTresorerieList from './components/tresorerie/MouvementsTresorerieList';

import FraisList from './components/tresorerie/FraisList';
import FraisForm from './components/tresorerie/FraisForm';
import FraisDetail from './components/tresorerie/FraisDetail';

import PrevisionsList from './components/tresorerie/PrevisionsList';
import PrevisionsForm from './components/tresorerie/PrevisionsForm';
import PrevisionsDetail from './components/tresorerie/PrevisionsDetail';

import RapprochementBancaireList from './components/tresorerie/RapprochementBancaireList';
import RapprochementBancaireForm from './components/tresorerie/RapprochementBancaireForm';
import RapprochementBancaireDetail from './components/tresorerie/RapprochementBancaireDetail';

import TresorerieJournaliere from './components/tresorerie/TresorerieJournaliere';
import TresorerieJournaliereDetail from './components/tresorerie/TresorerieJournaliereDetail';

import DashboardTresorerie from './components/tresorerie/DashboardTresorerie';
import AlertesTresorerie from './components/tresorerie/AlertesTresorerie';

// ============ Dashboard ============
import Dashboard from './components/dashboard/Dashboard';
import Statistiques from './components/dashboard/Statistiques';
import Analyses from './components/dashboard/Analyses';
import ClientDashboard from './components/dashboard/ClientDashboard';

// ============ Utilisateurs ============
import Utilisateurs from './components/users/Utilisateurs';
import UtilisateurForm from './components/users/UtilisateurForm';
import UtilisateurDetails from './components/users/UtilisateurDetail';

// ==================== FINANCES ====================
import CompteDetail from './components/finances/CompteDetail';
import ComptesList from './components/finances/ComptesList';
import CompteForm from './components/finances/CompteForm';

import EcrituresList from './components/finances/EcrituresList';
import EcritureForm from './components/finances/EcritureForm';
import JournalComptable from './components/finances/JournalComptable';
import GrandLivre from './components/finances/GrandLivre';
import BalanceGenerale from './components/finances/BalanceGenerale';

import TresorerieListe from './components/finances/TresorerieListe';
import TresorerieForm from './components/finances/TresorerieForm';
import TresorerieDetail from './components/finances/TresorerieDetail';

import DepensesList from './components/finances/DepensesList';
import DepenseForm from './components/finances/DepenseForm';

import ConfigurationFinanciere from './components/finances/ConfigurationFinanciere';
import BudgetCategorieList from './components/finances/BudgetCategorieList';
import BudgetCategorieForm from './components/finances/BudgetCategorieForm';
import BudgetsList from './components/finances/BudgetsList';
import BudgetForm from './components/finances/BudgetForm';

import RapportsFinanciersList from './components/finances/RapportFinancierList';
import RapportFinancierForm from './components/finances/RapportFinancierForm';
import RapportFinancierDetail from './components/finances/RapportFinancierDetail';
import RapportPdf from './components/finances/RapportPdf';
import DashboardFinancier from './components/finances/DashboardFinancier';

// ============ Livraisons clients ============
import ClientDeliveriesList from './components/ventesclients/ClientDeliveriesList';
import ClientDeliveryForm from './components/ventesclients/ClientDeliveryForm';
import ClientDeliveryDetail from './components/ventesclients/ClientDeliveryDetail';
import MyDeliveries from './components/ventesclients/MyDeliveries';

// ============ Stocks clients ============
import ClientStocksList from './components/ventesclients/ClientStocksList';
import ClientStockDepositForm from './components/ventesclients/ClientStockDepositForm';
import ClientStockWithdrawForm from './components/ventesclients/ClientStockWithdrawForm';
import ClientStockDetail from './components/ventesclients/ClientStockDetail';
import ClientStockMovements from './components/ventesclients/ClientStockMovements';
import MyStock from './components/ventesclients/MyStock';
import MyStockMovements from './components/ventesclients/MyStockMovements';


function App() {
  const location = useLocation();

  // ============================================================
  // DÉTECTION DES TYPES DE ROUTES
  // ============================================================

  const authOnlyRoutes = [
    "/register",
    "/login-erp",
    "/request/password_reset",
  ];

  // ✅ FIX CRITIQUE : includes (exact) au lieu de startsWith
  // Sinon "/register-client".startsWith("/register") → true → page blanche
  const isAuthOnly =
    authOnlyRoutes.includes(location.pathname) ||
    location.pathname.startsWith("/password-reset/");

  const publicExactRoutes = [
    "/compte",
  ];

  const publicRoutePrefixes = [
    "/boutique", "/produit/", "/panier", "/checkout",
    "/commande/confirmation/", "/client/orders",
    "/about", "/programmes", "/contact", "/blog", "/gallery",
    "/events", "/admissions", "/team",
    "/register-client", "/login",
  ];

  const isPublicRoute =
    location.pathname === "/" ||
    publicExactRoutes.includes(location.pathname) ||
    publicRoutePrefixes.some(
      (p) => location.pathname === p || location.pathname.startsWith(p)
    );

  // ============================================================
  // 1. ROUTES AUTH SEULES
  // ============================================================
  if (isAuthOnly) {
    return (
      <Routes>
        <Route path="/register" element={<Register />} />
        <Route path="/login-erp" element={<Login />} />
        <Route path="/request/password_reset" element={<PasswordResetRequest />} />
        <Route path="/password-reset/:token" element={<PasswordReset />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    );
  }

  // ============================================================
  // 2. ROUTES PUBLIQUES
  // ============================================================
  if (isPublicRoute) {
    return (
      <PublicLayout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/boutique" element={<BoutiquePage />} />
          <Route path="/produit/:id" element={<ProductDetailPage />} />
          <Route path="/panier" element={<PanierPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/commande/confirmation/:orderNumber" element={<OrderConfirmationPage />} />
          <Route path="/compte" element={<ClientAccountPage />} />
          <Route path="/client/orders" element={<Navigate to="/compte" replace />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/programmes" element={<ProgrammesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/blog" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/gallery" element={<GalleryPage />} />
          <Route path="/events" element={<EventsPage />} />
          <Route path="/admissions" element={<AdmissionsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/register-client" element={<RegisterClient />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </PublicLayout>
    );
  }

  // ============================================================
  // 3. ROUTES ERP
  // ============================================================
  return (
    <Navbar
      content={
        <Routes>
          <Route element={<ProtectedRoute />}>
            {/* DASHBOARD */}
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/statistiques" element={<Statistiques />} />
            <Route path="/analyses" element={<Analyses />} />
            <Route path="/client/dashboard" element={<ClientDashboard />} />

            {/* PARAMÉTRAGE */}
            <Route path="/company-config" element={<EtablissementSettings />} />
            <Route path="/clients-approval" element={<ClientsApproval />} />
            <Route path="/utilisateurs" element={<Utilisateurs />} />
            <Route path="/utilisateurs/ajouter" element={<UtilisateurForm />} />
            <Route path="/utilisateurs/:id" element={<UtilisateurDetails />} />
            <Route path="/utilisateurs/:id/modifier" element={<UtilisateurForm />} />

            {/* LIVRAISONS */}
            <Route path="/client-deliveries" element={<ClientDeliveriesList />} />
            <Route path="/client-deliveries/nouveau" element={<ClientDeliveryForm />} />
            <Route path="/client-deliveries/:id" element={<ClientDeliveryDetail />} />
            <Route path="/client/deliveries" element={<MyDeliveries />} />

            {/* STOCKS CLIENT */}
            <Route path="/client-stocks" element={<ClientStocksList />} />
            <Route path="/client-stocks/depot" element={<ClientStockDepositForm />} />
            <Route path="/client-stocks/retrait" element={<ClientStockWithdrawForm />} />
            <Route path="/client-stocks/mouvements" element={<ClientStockMovements />} />
            <Route path="/client-stocks/:clientId/detail" element={<ClientStockDetail />} />
            <Route path="/client/stock" element={<MyStock />} />
            <Route path="/client/stock/movements" element={<MyStockMovements />} />

            {/* ==================== FINANCES ==================== */}
            <Route path="/tresorerie" element={<TresorerieListe />} />
            <Route path="/tresorerie/nouveau" element={<TresorerieForm />} />
            <Route path="/tresorerie/:id" element={<TresorerieDetail />} />
            <Route path="/tresorerie/:id/modifier" element={<TresorerieForm />} />

            <Route path="/config-financiere" element={<ConfigurationFinanciere />} />

            <Route path="/budget-categories" element={<BudgetCategorieList />} />
            <Route path="/budget-categories/nouveau" element={<BudgetCategorieForm />} />
            <Route path="/budget-categories/:id/modifier" element={<BudgetCategorieForm />} />

            <Route path="/budgets" element={<BudgetsList />} />
            <Route path="/budgets/nouveau" element={<BudgetForm />} />
            <Route path="/budgets/:id" element={<BudgetForm />} />
            <Route path="/budgets/:id/modifier" element={<BudgetForm />} />

            <Route path="/rapports-financiers" element={<RapportsFinanciersList />} />
            <Route path="/rapports-financiers/nouveau" element={<RapportFinancierForm />} />
            <Route path="/rapports-financiers/:id" element={<RapportFinancierDetail />} />
            <Route path="/rapports-financiers/:id/pdf" element={<RapportPdf />} />

            <Route path="/dashboard-finances" element={<DashboardFinancier />} />

            <Route path="/comptes" element={<ComptesList />} />
            <Route path="/comptes/nouveau" element={<CompteForm />} />
            <Route path="/comptes/:id" element={<CompteDetail />} />
            <Route path="/comptes/:id/modifier" element={<CompteForm />} />

            <Route path="/comptes-comptables" element={<ComptesList />} />
            <Route path="/comptes-comptables/nouveau" element={<CompteForm />} />
            <Route path="/comptes-comptables/:id" element={<CompteDetail />} />
            <Route path="/comptes-comptables/:id/modifier" element={<CompteForm />} />

            <Route path="/ecritures-comptables" element={<EcrituresList />} />
            <Route path="/ecritures-comptables/nouveau" element={<EcritureForm />} />
            <Route path="/ecritures-comptables/:id/modifier" element={<EcritureForm />} />

            <Route path="/journal-comptable" element={<JournalComptable />} />
            <Route path="/grand-livre" element={<GrandLivre />} />
            <Route path="/balance-generale" element={<BalanceGenerale />} />

            <Route path="/depenses" element={<DepensesList />} />
            <Route path="/depenses/nouveau" element={<DepenseForm />} />
            <Route path="/depenses/:id/modifier" element={<DepenseForm />} />

            {/* ==================== TRÉSORERIE — CAISSES ==================== */}
            <Route path="/caisses" element={<CaissesList />} />
            <Route path="/caisses/nouveau" element={<CaissesForm />} />
            <Route path="/caisses/:id" element={<CaissesDetail />} />
            <Route path="/caisses/:id/modifier" element={<CaissesForm />} />

            {/* ==================== TRÉSORERIE — COMPTES BANCAIRES ==================== */}
            <Route path="/comptes-bancaires" element={<ComptesBancairesList />} />
            <Route path="/comptes-bancaires/nouveau" element={<CompteBancaireForm />} />
            <Route path="/comptes-bancaires/:id" element={<CompteBancaireDetail />} />
            <Route path="/comptes-bancaires/:id/modifier" element={<CompteBancaireForm />} />

            {/* ==================== TRÉSORERIE — MOUVEMENTS ==================== */}
            <Route path="/mouvements-tresorerie" element={<MouvementsTresorerieList />} />

            {/* ==================== TRÉSORERIE — FRAIS ==================== */}
            <Route path="/frais" element={<FraisList />} />
            <Route path="/frais/nouveau" element={<FraisForm />} />
            <Route path="/frais/:id" element={<FraisDetail />} />
            <Route path="/frais/:id/modifier" element={<FraisForm />} />

            {/* ==================== TRÉSORERIE — PRÉVISIONS ==================== */}
            <Route path="/previsions" element={<PrevisionsList />} />
            <Route path="/previsions/nouveau" element={<PrevisionsForm />} />
            <Route path="/previsions/:id" element={<PrevisionsDetail />} />
            <Route path="/previsions/:id/modifier" element={<PrevisionsForm />} />

            {/* ==================== TRÉSORERIE — RAPPROCHEMENT ==================== */}
            <Route path="/rapprochement-bancaire" element={<RapprochementBancaireList />} />
            <Route path="/rapprochement-bancaire/nouveau" element={<RapprochementBancaireForm />} />
            <Route path="/rapprochement-bancaire/:id" element={<RapprochementBancaireDetail />} />
            <Route path="/rapprochement-bancaire/:id/modifier" element={<RapprochementBancaireForm />} />

            {/* ==================== TRÉSORERIE — JOURNALIÈRE ==================== */}
            <Route path="/tresorerie-journaliere" element={<TresorerieJournaliere />} />
            <Route path="/tresorerie-journaliere/:id" element={<TresorerieJournaliereDetail />} />

            {/* ==================== TRÉSORERIE — DASHBOARD & ALERTES ==================== */}
            <Route path="/dashboard-tresorerie" element={<DashboardTresorerie />} />
            <Route path="/alertes-tresorerie" element={<AlertesTresorerie />} />

            {/* ==================== CATÉGORIES ==================== */}
            <Route path="/categories" element={<Categories />} />
            <Route path="/categories/nouveau" element={<CategoryForm />} />
            <Route path="/categories/:id/modifier" element={<CategoryForm />} />
            <Route path="/categories/:id" element={<CategoryDetails />} />

            {/* PRODUITS */}
            <Route path="/produits" element={<ProductsList />} />
            <Route path="/produits/nouveau" element={<ProductForm />} />
            <Route path="/produits/:id/modifier" element={<ProductForm />} />
            <Route path="/produits/:id" element={<ProductDetails />} />

            {/* STOCKS */}
            <Route path="/stocks" element={<StocksList />} />
            <Route path="/lots" element={<LotsList />} />
            <Route path="/unites-mesure" element={<UnitesMesure />} />
            <Route path="/unites-mesure/nouveau" element={<UniteMesureForm />} />
            <Route path="/unites-mesure/:id/modifier" element={<UniteMesureForm />} />
            <Route path="/add-stock-manual" element={<AddStockManual />} />
            <Route path="/mouvements-stock" element={<MouvementsStock />} />
            <Route path="/entrepots" element={<Entrepots />} />
            <Route path="/entrepots/nouveau" element={<EntrepotForm />} />
            <Route path="/entrepots/:id/modifier" element={<EntrepotForm />} />
            <Route path="/entrepots/:id" element={<EntrepotDetails />} />
            <Route path="/transferts" element={<Transferts />} />
            <Route path="/transferts/nouveau" element={<TransfertForm />} />
            <Route path="/transferts/:id" element={<TransfertDetails />} />

            {/* VENTES */}
            <Route path="/ventes" element={<VentesList />} />
            <Route path="/ventes/nouveau" element={<VenteForm />} />
            <Route path="/ventes/:id" element={<VenteDetail />} />
            <Route path="/ventes/:id/modifier" element={<VenteForm />} />
            <Route path="/ventes/:id/pdf" element={<VentePdf />} />

            <Route path="/devis" element={<DevisList />} />
            <Route path="/devis/nouveau" element={<DevisForm />} />
            <Route path="/devis/:id" element={<DevisDetail />} />
            <Route path="/devis/:id/modifier" element={<DevisForm />} />
            <Route path="/devis/:id/pdf" element={<DevisPdf />} />

            <Route path="/clients" element={<ClientsList />} />
            <Route path="/clients/nouveau" element={<ClientForm />} />
            <Route path="/clients/:id/modifier" element={<ClientForm />} />
            <Route path="/clients/:id" element={<ClientDetail />} />

            <Route path="/factures" element={<FacturesList />} />
            <Route path="/factures/nouvelle" element={<FactureForm />} />
            <Route path="/factures/:id" element={<FactureDetail />} />
            <Route path="/factures/:id/modifier" element={<FactureForm />} />
            <Route path="/factures/:id/pdf" element={<FacturePdf />} />

            <Route path="/pos-scan" element={<PosScanSimple />} />
            <Route path="/point-de-vente" element={<PosForm />} />

            <Route path="/paiements" element={<PaiementsList />} />
            <Route path="/paiements/nouveau" element={<PaiementForm />} />
            <Route path="/paiements/:id" element={<PaiementDetail />} />
            <Route path="/paiements/:id/modifier" element={<PaiementForm />} />
            <Route path="/paiements/:id/pdf" element={<PaiementPdf />} />

            {/* WALLETS */}
            <Route path="/wallets" element={<WalletsList />} />
            <Route path="/wallets/nouveau" element={<WalletForm />} />
            <Route path="/wallets/:id/deposit" element={<WalletDeposit />} />
            <Route path="/wallets/:id" element={<WalletDetail />} />
            <Route path="/wallets/:walletId/pay" element={<WalletPay />} />

            {/* FOURNISSEURS */}
            <Route path="/fournisseurs" element={<FournisseursList />} />
            <Route path="/fournisseurs/nouveau" element={<FournisseursForm />} />
            <Route path="/fournisseurs/:id/modifier" element={<FournisseursForm />} />
            <Route path="/fournisseurs/:id" element={<FournisseursDetails />} />

            <Route path="/commandes-fournisseurs" element={<CommandesList />} />
            <Route path="/commandes-fournisseurs/nouveau" element={<CommandeForm />} />
            <Route path="/commandes-fournisseurs/:id/modifier" element={<CommandeForm />} />
            <Route path="/commandes-fournisseurs/:id" element={<CommandeDetails />} />
            <Route path="/commandes-fournisseurs/:id/pdf" element={<CommandePdf />} />

            <Route path="/receptions" element={<ReceptionsList />} />
            <Route path="/receptions/nouveau" element={<ReceptionForm />} />
            <Route path="/receptions/:id" element={<ReceptionDetails />} />
            <Route path="/receptions/:id/pdf" element={<ReceptionPdf />} />

            <Route path="/purchase-alerts" element={<PurchaseAlerts />} />

            <Route path="/factures-fournisseurs" element={<FacturesFournisseursList />} />
            <Route path="/factures-fournisseurs/nouveau" element={<FactureFournisseurForm />} />
            <Route path="/factures-fournisseurs/:id" element={<FactureFournisseurDetail />} />
            <Route path="/factures-fournisseurs/:id/modifier" element={<FactureFournisseurForm />} />
            <Route path="/factures-fournisseurs/:id/paiement" element={<FactureFournisseurDetail />} />

            <Route path="/paiements-fournisseurs" element={<PaiementsFournisseursList />} />
            <Route path="/paiements-fournisseurs/nouveau" element={<PaiementFournisseurForm />} />
            <Route path="/paiements-fournisseurs/:id" element={<PaiementFournisseurDetail />} />

            <Route path="/retours-fournisseurs" element={<PurchaseReturnsList />} />
            <Route path="/retours-fournisseurs/nouveau" element={<PurchaseReturnForm />} />
            <Route path="/retours-fournisseurs/:id" element={<PurchaseReturnDetail />} />
            <Route path="/retours-fournisseurs/:id/pdf" element={<PurchaseReturnPdf />} />

            {/* ECOMMERCE */}
            <Route path="/ecommerce/commandes" element={<EcommerceOrders />} />
            <Route path="/ecommerce/commandes/:id" element={<EcommerceOrderDetail />} />
            <Route path="/ecommerce/dashboard" element={<Dashboard />} />
            <Route path="/ecommerce/paniers-abandonnes" element={<AbandonedCarts />} />
            <Route path="/ecommerce/produits" element={<ProductsList />} />
            <Route path="/ecommerce/produits/nouveau" element={<ProductForm />} />
            <Route path="/ecommerce/categories" element={<Categories />} />
            <Route path="/ecommerce/clients" element={<ClientsList />} />
            <Route path="/ecommerce/clients-approval" element={<ClientsApproval />} />
            <Route path="/ecommerce/livraisons" element={<ClientDeliveriesList />} />
            <Route path="/ecommerce/configuration" element={<EtablissementSettings />} />
            <Route path="/ecommerce/marques" element={<EcommercePlaceholder title="Marques" />} />
            <Route path="/ecommerce/avis" element={<EcommercePlaceholder title="Avis & Notes" />} />
            <Route path="/ecommerce/coupons" element={<EcommercePlaceholder title="Coupons & Bons d'achat" />} />
            <Route path="/ecommerce/promotions" element={<EcommercePlaceholder title="Promotions" />} />
            <Route path="/ecommerce/bannieres" element={<EcommercePlaceholder title="Bannières & Sliders" />} />
            <Route path="/ecommerce/zones-livraison" element={<EcommercePlaceholder title="Zones de Livraison" />} />
          </Route>
        </Routes>
      }
    />
  );
}

export default App;