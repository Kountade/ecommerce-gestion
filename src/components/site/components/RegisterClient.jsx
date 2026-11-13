// src/components/site/components/RegisterClient.jsx
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  UserPlus, Mail, Lock, Phone, MapPin, Calendar,
  AlertCircle, CheckCircle, ArrowRight, ShoppingBag,
} from 'lucide-react';

import PublicLayout from '../Layout/PublicLayout';
import MyTextField from '../../forms/MyTextField';
import MyPassField from '../../forms/MyPassField';
import AxiosInstance from '../../AxiosInstance';   // ✅ 3 niveaux

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis').max(200),
  password: yup.string()
    .required('Mot de passe requis')
    .min(8, '8 caractères minimum')
    .matches(/[A-Z]/, 'Doit contenir une majuscule')
    .matches(/[0-9]/, 'Doit contenir un chiffre'),
  password2: yup.string()
    .required('Confirmation requise')
    .oneOf([yup.ref('password')], 'Les mots de passe ne correspondent pas'),
  first_name: yup.string().max(200).optional(),
  last_name: yup.string().max(200).optional(),
  phone_number: yup.string()
    .required('Téléphone requis')
    .matches(/^[0-9+\-\s]{8,20}$/, 'Format invalide'),
  address: yup.string().optional(),
  birthday: yup.date().nullable().optional(),
});

function RegisterClientContent() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: {
      email: '', password: '', password2: '',
      first_name: '', last_name: '', phone_number: '',
      address: '', birthday: null,
    },
  });

  const submission = (data) => {
    setIsLoading(true);
    setMessage(null);

    const { password2, ...submitData } = data;
    submitData.role = 'client';

    Object.keys(submitData).forEach((key) => {
      if (submitData[key] === '' || submitData[key] === null) delete submitData[key];
    });

    AxiosInstance.post('/register/', submitData)
      .then(() => {
        setMessage({
          type: 'success',
          text: '✅ Compte créé avec succès ! Redirection vers la connexion...',
        });
        setTimeout(() => navigate('/login'), 2000);
      })
      .catch((error) => {
        let errorMessage = 'Échec de l\'inscription';
        const d = error.response?.data;

        if (d?.email) errorMessage = Array.isArray(d.email) ? d.email[0] : 'Cet email est déjà utilisé';
        else if (d?.phone_number) errorMessage = Array.isArray(d.phone_number) ? d.phone_number[0] : 'Numéro invalide';
        else if (d?.password) errorMessage = Array.isArray(d.password) ? d.password[0] : 'Mot de passe invalide';
        else if (d?.non_field_errors) errorMessage = d.non_field_errors[0];
        else if (error.request) errorMessage = 'Impossible de contacter le serveur.';

        setMessage({ type: 'error', text: errorMessage });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    <div className="min-h-screen bg-base-100 py-8 px-4 pt-[120px]">
      <div className="max-w-2xl mx-auto">

        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <UserPlus className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-base-content mb-2">Créer un compte</h1>
          <p className="text-base-content/60">
            Inscrivez-vous pour commander et suivre vos achats
          </p>
        </div>

        {message && (
          <div className={`mb-6 rounded-xl p-4 flex items-start gap-3 ${
            message.type === 'success'
              ? 'bg-success/10 border border-success/30 text-success'
              : 'bg-error/10 border border-error/30 text-error'
          }`}>
            {message.type === 'success'
              ? <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
              : <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />}
            <p className="text-sm font-medium">{message.text}</p>
          </div>
        )}

        <div className="bg-base-100 border border-base-200 rounded-2xl p-6 md:p-8 shadow-sm">
          <form onSubmit={handleSubmit(submission)} className="space-y-5">

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Mail className="h-4 w-4 text-primary" />
                  Email <span className="text-error">*</span>
                </span>
              </label>
              <MyTextField name="email" control={control} type="email" placeholder="votre@email.com" disabled={isLoading} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Mot de passe <span className="text-error">*</span>
                  </span>
                </label>
                <MyPassField name="password" control={control} placeholder="••••••••" disabled={isLoading} />
                <label className="label">
                  <span className="label-text-alt text-xs text-base-content/40">
                    Min. 8 car., 1 majuscule, 1 chiffre
                  </span>
                </label>
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium flex items-center gap-2">
                    <Lock className="h-4 w-4 text-primary" />
                    Confirmation <span className="text-error">*</span>
                  </span>
                </label>
                <MyPassField name="password2" control={control} placeholder="••••••••" disabled={isLoading} />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Prénom</span>
                </label>
                <MyTextField name="first_name" control={control} type="text" placeholder="Prénom" disabled={isLoading} />
              </div>
              <div className="form-control w-full">
                <label className="label">
                  <span className="label-text font-medium">Nom</span>
                </label>
                <MyTextField name="last_name" control={control} type="text" placeholder="Nom" disabled={isLoading} />
              </div>
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Phone className="h-4 w-4 text-primary" />
                  Téléphone <span className="text-error">*</span>
                </span>
              </label>
              <MyTextField name="phone_number" control={control} type="tel" placeholder="+221 77 123 45 67" disabled={isLoading} />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  Adresse
                </span>
              </label>
              <MyTextField name="address" control={control} type="text" placeholder="Ex: Cité Keur Gorgui, Villa 123" disabled={isLoading} />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  Date de naissance
                </span>
              </label>
              <MyTextField name="birthday" control={control} type="date" disabled={isLoading} />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-content font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Inscription en cours...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  Créer mon compte
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-base-200">
            <Link to="/login" className="text-sm text-primary hover:underline inline-flex items-center gap-1">
              Déjà un compte ? <span className="font-semibold">Se connecter</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function RegisterClient() {
  return (
    <PublicLayout>
      <RegisterClientContent />
    </PublicLayout>
  );
}