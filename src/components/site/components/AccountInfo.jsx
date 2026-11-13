// src/components/site/components/AccountInfo.jsx
import React from 'react';
import { User, Mail, Phone, MapPin, Shield } from 'lucide-react';

export default function AccountInfo() {
  // On récupère les données utilisateur stockées dans le localStorage
  const user = JSON.parse(localStorage.getItem('User') || '{}');

  return (
    <div className="bg-base-100 border border-base-200 rounded-xl overflow-hidden shadow-sm p-6">
      <div className="flex items-center gap-2 mb-6 pb-4 border-b border-base-200">
        <User className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold text-base-content">Mon compte</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Prénom / Nom */}
        <div>
          <p className="text-xs text-base-content/60 mb-1">Nom complet</p>
          <p className="font-semibold text-base-content flex items-center gap-2">
            <User className="w-4 h-4 text-base-content/40" />
            {user.first_name || user.last_name 
              ? `${user.first_name || ''} ${user.last_name || ''}`.trim() 
              : 'Non renseigné'}
          </p>
        </div>

        {/* Email */}
        <div>
          <p className="text-xs text-base-content/60 mb-1">Adresse email</p>
          <p className="font-semibold text-base-content flex items-center gap-2">
            <Mail className="w-4 h-4 text-base-content/40" />
            {user.email || 'Non renseigné'}
          </p>
        </div>

        {/* Téléphone */}
        <div>
          <p className="text-xs text-base-content/60 mb-1">Téléphone</p>
          <p className="font-semibold text-base-content flex items-center gap-2">
            <Phone className="w-4 h-4 text-base-content/40" />
            {user.phone_number || 'Non renseigné'}
          </p>
        </div>

        {/* Rôle */}
        <div>
          <p className="text-xs text-base-content/60 mb-1">Type de compte</p>
          <p className="font-semibold text-base-content flex items-center gap-2 capitalize">
            <Shield className="w-4 h-4 text-base-content/40" />
            {user.role || 'Client'}
          </p>
        </div>

        {/* Adresse */}
        <div className="md:col-span-2">
          <p className="text-xs text-base-content/60 mb-1">Adresse</p>
          <p className="font-semibold text-base-content flex items-center gap-2">
            <MapPin className="w-4 h-4 text-base-content/40" />
            {user.address || 'Non renseignée'}
          </p>
        </div>
      </div>

      <div className="mt-6 pt-4 border-t border-base-200 flex justify-end">
        <button className="btn btn-sm btn-outline btn-primary">
          Modifier mes informations
        </button>
      </div>
    </div>
  );
}