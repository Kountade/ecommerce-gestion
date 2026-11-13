// src/components/site/components/OrderConfirmationPage.jsx
// ==========================================
// Page de confirmation de commande
// ==========================================
import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation, useNavigate } from 'react-router-dom';
import {
  CheckCircle, Package, Truck, ArrowRight, ShoppingBag,
  Home, Phone, MapPin, CreditCard, Calendar, Loader2,
  Copy, Check, Clock, User,
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

const formatDate = (dateStr) => {
  if (!dateStr) return null;
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
};

// ==========================================
// CONTENU
// ==========================================
function ConfirmationContent() {
  const { orderNumber } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const state = location.state || {};

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  const isAuthenticated = !!localStorage.getItem('Token');

  // ==========================================
  // CHARGER LA COMMANDE
  // ==========================================
  useEffect(() => {
    if (!orderNumber) {
      setError('Numéro de commande manquant');
      setLoading(false);
      return;
    }

    if (state.orderNumber === orderNumber && state.total) {
      setOrder({
        order_number: state.orderNumber,
        total: state.total,
        estimated_delivery: state.estimatedDelivery,
      });
      setLoading(false);
      return;
    }

    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    AxiosInstance.get('/store/checkout/my-orders/')
      .then((res) => {
        const orders = res.data?.results || res.data || [];
        const found = orders.find((o) => o.invoice_number === orderNumber);
        if (found) {
          setOrder(found);
        } else {
          setError('Commande introuvable');
        }
      })
      .catch(() => {
        setError('Impossible de charger la commande');
      })
      .finally(() => setLoading(false));
  }, [orderNumber, isAuthenticated, state]);

  // ==========================================
  // COPIER LE NUMÉRO
  // ==========================================
  const handleCopy = () => {
    if (!orderNumber) return;
    navigator.clipboard.writeText(orderNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ==========================================
  // LOADING
  // ==========================================
  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto" />
          <p className="mt-4 text-base-content/60">Chargement de la commande...</p>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERREUR
  // ==========================================
  if (error) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16">
        <div className="bg-base-100 border border-base-200 rounded-2xl p-12 text-center">
          <div className="w-20 h-20 bg-error/10 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-error" />
          </div>
          <h1 className="text-2xl font-bold mb-2">Commande introuvable</h1>
          <p className="text-base-content/60 mb-6">
            {error}. Vérifiez votre numéro de commande ou consultez vos commandes.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/boutique" className="btn btn-primary gap-2">
              <ShoppingBag className="w-4 h-4" />
              Retour à la boutique
            </Link>
            {/* ✅ CORRECTION : /compte au lieu de /client/orders */}
            <Link to="/compte" className="btn btn-ghost gap-2">
              <Package className="w-4 h-4" />
              Mes commandes
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDU PRINCIPAL
  // ==========================================
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16 space-y-6">

      {/* ========== BLOC PRINCIPAL ========== */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-8 md:p-12 text-center space-y-6">

        {/* Icône succès animée */}
        <div className="w-24 h-24 bg-success/10 rounded-full flex items-center justify-center mx-auto animate-pulse">
          <CheckCircle className="w-14 h-14 text-success" />
        </div>

        {/* Titre */}
        <div>
          <h1 className="text-3xl md:text-4xl font-black text-base-content mb-3">
            Merci pour votre commande ! 🎉
          </h1>
          <p className="text-base-content/70 max-w-lg mx-auto">
            Votre commande a bien été enregistrée. Notre équipe va la traiter
            dans les plus brefs délais et vous contactera pour la livraison.
          </p>
        </div>

        {/* Numéro de commande avec bouton copier */}
        {orderNumber && (
          <div className="bg-base-200/50 rounded-xl p-5 inline-flex items-center gap-3">
            <div>
              <p className="text-xs text-base-content/60 mb-1">
                Numéro de commande
              </p>
              <p className="text-xl font-black text-primary tracking-wide">
                {orderNumber}
              </p>
            </div>
            <button
              onClick={handleCopy}
              className="btn btn-ghost btn-sm btn-circle"
              title="Copier"
            >
              {copied ? (
                <Check className="w-4 h-4 text-success" />
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        )}

        {/* 3 cartes info */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-4">

          {/* Statut */}
          <div className="bg-base-200/30 rounded-lg p-4 border border-base-200">
            <Package className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-base-content/60 mb-1">Statut</p>
            <p className="font-semibold text-sm text-base-content">
              En attente de confirmation
            </p>
          </div>

          {/* Livraison estimée */}
          <div className="bg-base-200/30 rounded-lg p-4 border border-base-200">
            <Truck className="w-5 h-5 text-primary mb-2" />
            <p className="text-xs text-base-content/60 mb-1">
              Livraison estimée
            </p>
            <p className="font-semibold text-sm text-base-content">
              {order?.estimated_delivery
                ? formatDate(order.estimated_delivery)
                : 'Sous 48h'}
            </p>
          </div>

          {/* Montant */}
          {order?.total && (
            <div className="bg-base-200/30 rounded-lg p-4 border border-base-200">
              <CreditCard className="w-5 h-5 text-primary mb-2" />
              <p className="text-xs text-base-content/60 mb-1">Montant total</p>
              <p className="font-semibold text-sm text-primary">
                {formatPrice(order.total)} FCFA
              </p>
            </div>
          )}
        </div>

        {/* Message email */}
        <div className="bg-info/10 border border-info/20 rounded-lg p-4 text-sm text-info flex items-start gap-3">
          <Clock className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            Un email de confirmation vous sera envoyé à l'adresse{' '}
            <strong>associée à votre compte</strong>. Vous pouvez suivre votre
            commande depuis votre espace client à tout moment.
          </p>
        </div>

        {/* Boutons d'action */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
          <Link
            to="/boutique"
            className="btn btn-primary gap-2"
          >
            <ShoppingBag className="w-4 h-4" />
            Continuer mes achats
          </Link>
          {/* ✅ CORRECTION : /compte au lieu de /client/orders */}
          <Link
            to="/compte"
            className="btn btn-outline btn-primary gap-2"
          >
            <Package className="w-4 h-4" />
            Voir mes commandes
          </Link>
          <Link
            to="/"
            className="btn btn-ghost gap-2"
          >
            <Home className="w-4 h-4" />
            Accueil
          </Link>
        </div>
      </div>

      {/* ========== BLOC AIDE / CONTACT ========== */}
      <div className="bg-base-100 border border-base-200 rounded-2xl p-6">
        <h2 className="font-bold text-base-content mb-4 flex items-center gap-2">
          <Phone className="w-5 h-5 text-primary" />
          Une question sur votre commande ?
        </h2>
        <p className="text-sm text-base-content/60 mb-4">
          Notre service client est disponible pour vous accompagner.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="flex items-center gap-3 bg-base-200/30 rounded-lg p-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/60">Téléphone</p>
              <p className="font-semibold text-sm text-base-content">
                +221 77 123 45 67
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 bg-base-200/30 rounded-lg p-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="text-xs text-base-content/60">Retrait en magasin</p>
              <p className="font-semibold text-sm text-base-content">
                Dakar, Sénégal
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ========== NOTE DE BAS DE PAGE ========== */}
      <p className="text-center text-xs text-base-content/40 pt-2">
        Conservez votre numéro de commande <strong>{orderNumber}</strong> pour
        tout suivi. Vous pouvez également retrouver toutes vos commandes dans
        votre espace client.
      </p>

    </div>
  );
}

// ==========================================
// EXPORT avec PublicLayout
// ==========================================
export default function OrderConfirmationPage() {
  return (
    <PublicLayout>
      <ConfirmationContent />
    </PublicLayout>
  );
}