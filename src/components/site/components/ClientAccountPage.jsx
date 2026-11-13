// src/components/site/components/ClientAccountPage.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User, Package, Inbox, MessageSquare, Heart,
  MapPin, Settings, LogOut, Menu, X
} from 'lucide-react';

import PublicLayout from '../Layout/PublicLayout';
import AxiosInstance from '../../AxiosInstance';
import ClientOrdersContent from './ClientOrdersContent';
import InboxContent from './InboxContent';
import FavoritesContent from './FavoritesContent';
import AccountInfo from './AccountInfo';

// ==========================================
// SOUS-COMPOSANTS POUR LES AUTRES ONGLETS
// ==========================================
const PlaceholderContent = ({ title, description }) => (
  <div className="bg-base-100 border border-base-200 rounded-xl p-12 text-center shadow-sm">
    <div className="w-16 h-16 bg-base-200 rounded-full flex items-center justify-center mx-auto mb-4">
      <Settings className="w-8 h-8 text-base-content/30" />
    </div>
    <h2 className="text-xl font-bold mb-2">{title}</h2>
    <p className="text-base-content/60">{description}</p>
  </div>
);

// ==========================================
// COMPOSANT PRINCIPAL
// ==========================================
export default function ClientAccountPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // État pour l'onglet actif
  const [activeTab, setActiveTab] = useState('orders');
  
  // État pour le compteur de messages non lus
  const [unreadCount, setUnreadCount] = useState(0);

  const isAuthenticated = !!localStorage.getItem('Token');
  const user = JSON.parse(localStorage.getItem('User') || '{}');

  // Redirection si non connecté
  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login?redirect=/compte');
    }
  }, [isAuthenticated, navigate]);

  // Récupération du vrai nombre de messages non lus
  useEffect(() => {
    if (isAuthenticated) {
      AxiosInstance.get('/store/checkout/unread-messages-count/')
        .then(res => {
          setUnreadCount(res.data.unread_count || 0);
        })
        .catch(err => {
          console.error('Erreur chargement compteur messages:', err);
        });
    }
  }, [isAuthenticated, activeTab]);

  // ✅ MENU MIS À JOUR (sans Bons d'achat)
  const menuItems = [
    { id: 'account', label: 'Mon compte', icon: User },
    { id: 'orders', label: 'Mes commandes', icon: Package },
    { id: 'inbox', label: 'Boîte de réception', icon: Inbox, badge: unreadCount },
    { id: 'reviews', label: 'Vos avis en attente', icon: MessageSquare },
    { id: 'favorites', label: 'Favoris', icon: Heart },
  ];

  // Liens Compte
  const accountItems = [
    { id: 'addresses', label: 'Adresses', icon: MapPin },
  ];

  const handleLogout = () => {
    localStorage.removeItem('Token');
    localStorage.removeItem('User');
    window.location.href = '/';
  };

  // Rendu du contenu selon l'onglet actif
  const renderContent = () => {
    switch (activeTab) {
      case 'account':
        return <AccountInfo />;
      case 'orders':
        return <ClientOrdersContent />;
      case 'inbox':
        return <InboxContent />;
      case 'favorites':
        return <FavoritesContent />;
      case 'addresses':
        return <PlaceholderContent title="Mes Adresses" description="Gérez vos adresses de livraison ici." />;
      default:
        return <PlaceholderContent title="Bientôt disponible" description="Cette fonctionnalité sera bientôt accessible." />;
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-[140px] pb-16">
        
        {/* Bouton Menu Mobile */}
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="lg:hidden btn btn-outline btn-sm mb-4 gap-2"
        >
          {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          Menu du compte
        </button>

        <div className="flex flex-col lg:flex-row gap-6">
          
          {/* ========== SIDEBAR ========== */}
          <aside className={`w-full lg:w-64 shrink-0 ${sidebarOpen ? 'block' : 'hidden lg:block'}`}>
            <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm">
              
              {/* En-tête Profil */}
              <div className="p-4 border-b border-base-200 flex items-center gap-3 bg-base-200/30">
                <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-base-content/60">Bienvenue</p>
                  <p className="text-sm font-bold text-base-content truncate">
                    {user.first_name || user.email || 'Mon compte'}
                  </p>
                </div>
              </div>

              {/* Liens Principaux */}
              <ul className="py-2">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors border-l-4 ${
                          isActive
                            ? 'bg-base-200 text-primary font-bold border-primary'
                            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content border-transparent'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className="w-4 h-4" />
                          <span>{item.label}</span>
                        </div>
                        {item.badge > 0 && (
                          <span className="bg-primary text-primary-content text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {item.badge > 9 ? '9+' : item.badge}
                          </span>
                        )}
                      </button>
                    </li>
                  );
                })}
              </ul>

              {/* Liens Compte */}
              <div className="border-t border-base-200 py-2">
                <p className="px-4 text-[10px] font-bold text-base-content/40 uppercase py-2 tracking-wider">
                  Gérez votre compte
                </p>
                {accountItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <li key={item.id} className="list-none">
                      <button
                        onClick={() => {
                          setActiveTab(item.id);
                          setSidebarOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-sm transition-colors border-l-4 ${
                          isActive
                            ? 'bg-base-200 text-primary font-bold border-primary'
                            : 'text-base-content/70 hover:bg-base-200 hover:text-base-content border-transparent'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </button>
                    </li>
                  );
                })}
              </div>

              {/* Déconnexion */}
              <div className="border-t border-base-200 p-4">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center justify-center gap-2 text-sm font-bold text-error hover:bg-error/10 py-2 rounded-lg transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            </div>
          </aside>

          {/* ========== CONTENU PRINCIPAL ========== */}
          <main className="flex-1 min-w-0">
            {renderContent()}
          </main>
        </div>
      </div>
    </PublicLayout>
  );
}