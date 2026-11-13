// src/components/site/Layout/PublicFooter.jsx - Charte Bourok (Bleu Marine & Vert)
import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Clock, ChevronRight } from 'lucide-react';

const PublicFooter = () => {
  const currentYear = new Date().getFullYear();

  // Liens rapides : ajoutez `disabled: true` pour bloquer un lien
  const quickLinks = [
    { to: '/', label: 'Accueil', disabled: false },
    { to: '/about', label: 'À propos', disabled: true },
    { to: '/services', label: 'Services', disabled: true },
    { to: '/boutique', label: 'Boutique', disabled: false }, // Remplacé /produits par /boutique
    { to: '/contact', label: 'Contact', disabled: true }
  ];

  // Nos services : tous bloqués car pas encore de pages
  const services = [
    { to: '/services/distribution', label: 'Distribution & Négoce', disabled: true },
    { to: '/services/import-export', label: 'Import & Export', disabled: true },
    { to: '/services/logistique', label: 'Logistique & Livraison', disabled: true },
    { to: '/services/conseil', label: 'Conseil stratégique', disabled: true },
    { to: '/services/marketing', label: 'Marketing & Communication', disabled: true }
  ];

  // Composant interne pour rendre un lien ou un texte bloqué proprement
  const FooterLink = ({ to, label, disabled }) => {
    if (disabled) {
      return (
        <div className="flex items-center gap-2 text-sm text-secondary-content/40 cursor-not-allowed select-none">
          <span>{label}</span>
          <span className="text-[9px] font-bold uppercase bg-secondary-content/10 px-1.5 py-0.5 rounded">
            Bientôt
          </span>
        </div>
      );
    }

    return (
      <Link
        to={to}
        className="group flex items-center gap-2 text-sm text-secondary-content/60 hover:text-primary transition-all"
      >
        <span className="relative">
          {label}
          <span className="absolute -bottom-0.5 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300"></span>
        </span>
        <ChevronRight className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
      </Link>
    );
  };

  return (
    <footer className="bg-secondary text-secondary-content border-t border-secondary/20 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        <div className="py-10 grid grid-cols-1 md:grid-cols-4 gap-6 border-b border-secondary-content/10">

          {/* Logo & Description */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <Building2 className="w-6 h-6 text-primary-content" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Nom Agence</h3>
                <p className="text-[10px] text-secondary-content/50 font-medium tracking-[0.2em] uppercase">
                  Agence Commerciale
                </p>
              </div>
            </div>
            <p className="text-sm text-secondary-content/70 leading-relaxed">
              Votre partenaire commercial pour la distribution, le négoce et l'import-export. Retrouvez nos meilleurs produits dans notre boutique en ligne.
            </p>
          </div>

          {/* Liens */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-secondary-content/90 uppercase tracking-wider">Liens Utiles</h4>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <FooterLink {...link} />
                </li>
              ))}
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-secondary-content/90 uppercase tracking-wider">Nos services</h4>
            <ul className="space-y-3">
              {services.map((service) => (
                <li key={service.label}>
                  <FooterLink {...service} />
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold mb-4 text-secondary-content/90 uppercase tracking-wider">Contact</h4>
            <ul className="space-y-3 text-sm text-secondary-content/60">
              <li className="flex items-start gap-3 hover:text-primary transition-all">
                <Phone className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>+221 77 123 45 67</span>
              </li>
              <li className="flex items-start gap-3 hover:text-primary transition-all">
                <Mail className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>contact@agence.com</span>
              </li>
              <li className="flex items-start gap-3 hover:text-primary transition-all">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Dakar, Sénégal</span>
              </li>
              <li className="flex items-start gap-3 hover:text-primary transition-all">
                <Clock className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <span>Lun - Ven : 8h - 18h</span>
              </li>
            </ul>
          </div>

        </div>

        {/* Copyright */}
        <div className="py-6 text-center text-sm text-secondary-content/50 flex flex-col md:flex-row justify-between items-center gap-2">
          <p>&copy; {currentYear} Nom Agence. Tous droits réservés.</p>
          <div className="flex gap-4">
            <span className="cursor-not-allowed text-secondary-content/30">Mentions légales</span>
            <span className="cursor-not-allowed text-secondary-content/30">CGV</span>
            <span className="cursor-not-allowed text-secondary-content/30">Cookies</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default PublicFooter;