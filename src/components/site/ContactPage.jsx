// src/components/site/ContactPage.jsx
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

// ✅ IMPORT DE VOTRE IMAGE LOCALE
import bannerImage from '../../assets/baniercontact.jpg';

const ContactPage = () => {
  const [formStatus, setFormStatus] = useState('idle'); // 'idle' | 'loading' | 'success' | 'error'

  const contactMethods = [
    {
      icon: MapPin,
      label: 'Notre Adresse',
      value: 'Sacré-Cœur 3, Dakar, Sénégal',
      description: 'Siège social',
      link: 'https://maps.google.com/?q=Sacre-Coeur+3+Dakar+Senegal',
    },
    {
      icon: Phone,
      label: 'Téléphone',
      value: '+221 77 123 45 67',
      description: 'Lun-Ven, 9h-18h',
      link: 'tel:+221771234567',
    },
    {
      icon: Mail,
      label: 'Email',
      value: 'contact@damaltech.sn',
      description: 'Réponse sous 24h',
      link: 'mailto:contact@damaltech.sn',
    },
    {
      icon: Clock,
      label: 'Horaires',
      value: 'Lun - Ven : 8h - 18h',
      description: 'Samedi : 9h - 13h',
    },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    setFormStatus('loading');
    // Simulation d'envoi (à connecter à votre API plus tard)
    setTimeout(() => {
      setFormStatus('success');
      e.target.reset();
      setTimeout(() => setFormStatus('idle'), 5000);
    }, 1500);
  };

  return (
    <div className="bg-base-200 min-h-screen pb-16">
      
      {/* HEADER / HERO SECTION AVEC L'IMAGE LOCALE */}
      <div className="relative py-20 md:py-32 overflow-hidden bg-secondary">
        
        {/* ✅ IMAGE DE FOND LOCALE */}
        <img 
          src={bannerImage} 
          alt="Bannière contact" 
          className="absolute inset-0 w-full h-full object-cover object-center"
        />
        
        {/* Overlay sombre pour lire le texte par-dessus l'image */}
        <div className="absolute inset-0 bg-black/60 z-0"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black mb-4 tracking-tight text-white drop-shadow-lg">
            Contactez-nous
          </h1>
          <p className="text-gray-200 text-lg max-w-2xl mx-auto drop-shadow-md">
            Une question, un projet ou une demande de partenariat ? Notre équipe à Dakar vous répond avec plaisir.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        
        {/* CARTES DE CONTACT */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-12">
          {contactMethods.map((item, index) => {
            const Icon = item.icon;
            const content = item.link ? (
              <a
                href={item.link}
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-base-content hover:text-primary transition-colors"
              >
                {item.value}
              </a>
            ) : (
              <span className="font-bold text-base-content">{item.value}</span>
            );

            return (
              <div
                key={index}
                className="bg-base-100 rounded-2xl p-6 shadow-sm border border-base-200 hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center group"
              >
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-sm font-semibold text-base-content/50 uppercase tracking-wider mb-2">
                  {item.label}
                </h3>
                <div className="text-base mb-1">{content}</div>
                <p className="text-xs text-base-content/60">{item.description}</p>
              </div>
            );
          })}
        </div>

        {/* FORMULAIRE & CARTE */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-12">
          
          {/* FORMULAIRE DE CONTACT */}
          <div className="bg-base-100 rounded-2xl p-6 md:p-8 shadow-sm border border-base-200">
            <h2 className="text-2xl font-bold text-base-content mb-2">Envoyez-nous un message</h2>
            <p className="text-base-content/60 text-sm mb-6">
              Remplissez le formulaire ci-dessous et nous vous répondrons dans les plus brefs délais.
            </p>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">Nom complet <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Mamadou Diop"
                    className="input input-bordered w-full focus:input-primary transition-colors bg-base-100"
                    required
                  />
                </div>
                <div className="form-control w-full">
                  <label className="label">
                    <span className="label-text font-medium text-base-content">Email <span className="text-error">*</span></span>
                  </label>
                  <input
                    type="email"
                    placeholder="Ex: mamadou@email.com"
                    className="input input-bordered w-full focus:input-primary transition-colors bg-base-100"
                    required
                  />
                </div>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content">Téléphone (optionnel)</span>
                </label>
                <input
                  type="tel"
                  placeholder="Ex: +221 77 000 00 00"
                  className="input input-bordered w-full focus:input-primary transition-colors bg-base-100"
                />
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content">Sujet <span className="text-error">*</span></span>
                </label>
                <select className="select select-bordered w-full focus:select-primary transition-colors bg-base-100" required defaultValue="">
                  <option value="" disabled>Sélectionnez un sujet</option>
                  <option value="commande">Question sur une commande</option>
                  <option value="produit">Renseignement produit</option>
                  <option value="partenariat">Partenariat / B2B</option>
                  <option value="autre">Autre demande</option>
                </select>
              </div>

              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium text-base-content">Message <span className="text-error">*</span></span>
                </label>
                <textarea
                  className="textarea textarea-bordered h-32 focus:textarea-primary transition-colors bg-base-100 resize-none"
                  placeholder="Décrivez votre demande en détail..."
                  required
                ></textarea>
              </div>

              {/* Bouton + Statut */}
              <div className="pt-2">
                <button 
                  type="submit" 
                  disabled={formStatus === 'loading' || formStatus === 'success'}
                  className="btn btn-primary w-full md:w-auto px-8"
                >
                  {formStatus === 'loading' ? (
                    <span className="loading loading-spinner loading-sm"></span>
                  ) : formStatus === 'success' ? (
                    <>
                      <CheckCircle2 className="w-5 h-5" /> Message envoyé !
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> Envoyer le message
                    </>
                  )}
                </button>

                {formStatus === 'success' && (
                  <p className="flex items-center gap-2 text-success text-sm mt-3 animate-fade-in">
                    <CheckCircle2 className="w-4 h-4" /> Merci ! Votre message a bien été envoyé.
                  </p>
                )}
                {formStatus === 'error' && (
                  <p className="flex items-center gap-2 text-error text-sm mt-3">
                    <AlertCircle className="w-4 h-4" /> Une erreur est survenue. Veuillez réessayer.
                  </p>
                )}
              </div>
            </form>
          </div>

          {/* CARTE & INFOS PRATIQUES */}
          <div className="space-y-6">
            <div className="bg-base-100 rounded-2xl p-2 shadow-sm border border-base-200 h-80 lg:h-96 overflow-hidden">
              <iframe
                title="Localisation Dakar"
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d15427.923631034449!2d-17.473660908398436!3d14.764504197800942!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xec1729c6f9fce53%3A0xedd1f3bfa55dc4d3!2sSacr%C3%A9-C%C5%93ur%203%2C%20Dakar%2C%20S%C3%A9n%C3%A9gal!5e0!3m2!1sfr!2s!4v1700000000000!5m2!1sfr!2s"
                width="100%"
                height="100%"
                style={{ border: 0, borderRadius: '0.75rem' }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>

            <div className="bg-secondary text-secondary-content rounded-2xl p-6 md:p-8 shadow-sm">
              <h3 className="text-xl font-bold mb-4">Notre engagement</h3>
              <p className="text-secondary-content/80 text-sm leading-relaxed mb-6">
                Basés au cœur de Dakar, nous mettons un point d'honneur à offrir un service client réactif et de qualité. 
                Que vous soyez un particulier ou une entreprise, nous sommes à votre écoute.
              </p>
              <div className="flex items-center gap-4 pt-4 border-t border-secondary-content/10">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-xs text-secondary-content/60 uppercase tracking-wider font-semibold">Besoin d'aide urgente ?</p>
                  <p className="font-bold text-lg">+221 33 800 00 00</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ContactPage;