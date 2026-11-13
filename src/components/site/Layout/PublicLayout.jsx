// src/components/site/Layout/PublicLayout.jsx
import React from 'react';
import { Outlet } from 'react-router-dom';
import PublicNavbar from './PublicNavbar';
import PublicFooter from './PublicFooter';

const PublicLayout = ({ children }) => (
  <div className="min-h-screen flex flex-col bg-base-100">
    <PublicNavbar />
    
    {/* 
      ✅ CORRECTION :
      On garde `pt-[140px]` pour compenser la navbar fixe complexe.
      Cela protège automatiquement toutes les pages (Contact, Panier, Checkout, etc.)
      qui n'ont pas de gestion de padding interne.
    */}
    <main className="flex-1 pt-[140px]">
      {children || <Outlet />}
    </main>
    
    <PublicFooter />
  </div>
);

export default PublicLayout;