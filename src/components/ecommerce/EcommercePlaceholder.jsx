// src/components/ecommerce/EcommercePlaceholder.jsx
import React from 'react';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EcommercePlaceholder({ title = 'Module en construction' }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
      <div className="bg-base-100 border border-base-200 rounded-2xl p-12 max-w-lg w-full text-center shadow-sm">
        <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-warning/10 flex items-center justify-center">
          <Construction className="w-10 h-10 text-warning" />
        </div>
        <h1 className="text-2xl font-bold text-base-content mb-2">{title}</h1>
        <p className="text-base-content/60 mb-6">
          Cette fonctionnalité est en cours de développement.
          Revenez bientôt pour la découvrir.
        </p>
        <Link to="/ecommerce/dashboard" className="btn btn-primary gap-2">
          <ArrowLeft className="w-4 h-4" />
          Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}