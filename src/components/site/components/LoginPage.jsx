// src/components/site/components/LoginPage.jsx
import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import {
  LogIn, Mail, Lock, AlertCircle, CheckCircle, ArrowRight,
  ShoppingBag, Shield,
} from 'lucide-react';

import PublicLayout from '../Layout/PublicLayout';
import MyTextField from '../../forms/MyTextField';
import MyPassField from '../../forms/MyPassField';
import AxiosInstance from '../../AxiosInstance';

const schema = yup.object({
  email: yup.string().email('Email invalide').required('Email requis'),
  password: yup.string().required('Mot de passe requis'),
});

function LoginContent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const redirectTo = searchParams.get('redirect') || '/compte';

  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const { handleSubmit, control } = useForm({
    resolver: yupResolver(schema),
    defaultValues: { email: '', password: '' },
  });

  const submission = (data) => {
    setIsLoading(true);
    setMessage(null);

    AxiosInstance.post('/login/', data)
      .then((res) => {
        const { token, user } = res.data;

        if (!token || !user) {
          setMessage({ type: 'error', text: 'Réponse du serveur invalide' });
          return;
        }

        localStorage.setItem('Token', token);
        localStorage.setItem('User', JSON.stringify(user));
        window.dispatchEvent(new Event('auth-changed'));

        setMessage({
          type: 'success',
          text: `Bienvenue ${user.first_name || user.email} !`,
        });

        setTimeout(() => {
          if (user.role === 'client') {
            navigate(redirectTo, { replace: true });
          } else if (user.role === 'admin' || user.role === 'vendeur') {
            navigate('/dashboard');
          } else {
            navigate(redirectTo, { replace: true });
          }
        }, 700);
      })
      .catch((error) => {
        const data = error.response?.data;
        let errorMessage = 'Identifiants invalides';

        if (data?.error) errorMessage = data.error;
        else if (data?.non_field_errors) errorMessage = data.non_field_errors[0];
        else if (data?.email) errorMessage = Array.isArray(data.email) ? data.email[0] : data.email;
        else if (data?.password) errorMessage = Array.isArray(data.password) ? data.password[0] : data.password;
        else if (error.response?.status === 401) errorMessage = 'Email ou mot de passe incorrect';
        else if (error.request) errorMessage = 'Impossible de contacter le serveur.';

        setMessage({ type: 'error', text: errorMessage });
      })
      .finally(() => setIsLoading(false));
  };

  return (
    // ✅ SEUL CHANGEMENT : padding vertical réduit (py-8 → py-2)
    // ❌ Avant : min-h-screen py-8 px-4 pt-[120px]
    // ✅ Après : py-2 px-4   (tout le reste = design pro intact)
    <div className="py-2 px-4">
      <div className="max-w-md mx-auto">

        {/* ===== DESIGN PRO INTACT ===== */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-2xl mb-4">
            <LogIn className="w-8 h-8 text-primary" />
          </div>
          <h1 className="text-3xl font-black text-base-content mb-2">Connexion</h1>
          <p className="text-base-content/60">
            Accédez à votre compte pour commander et suivre vos achats
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
                  Email
                </span>
              </label>
              <MyTextField
                name="email"
                control={control}
                type="email"
                placeholder="votre@email.com"
                disabled={isLoading}
              />
            </div>

            <div className="form-control w-full">
              <label className="label">
                <span className="label-text font-medium flex items-center gap-2">
                  <Lock className="h-4 w-4 text-primary" />
                  Mot de passe
                </span>
              </label>
              <MyPassField
                name="password"
                control={control}
                placeholder="••••••••"
                disabled={isLoading}
              />
            </div>

            <div className="text-right">
              <Link
                to="/request/password_reset"
                className="text-xs text-primary hover:underline"
              >
                Mot de passe oublié ?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary/90 text-primary-content font-bold px-6 py-3 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg hover:shadow-xl disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <span className="loading loading-spinner loading-sm"></span>
                  Connexion...
                </>
              ) : (
                <>
                  <ShoppingBag className="h-5 w-5" />
                  Se connecter
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-6 mt-6 border-t border-base-200">
            <Link
              to={`/register-client?redirect=${encodeURIComponent(redirectTo)}`}
              className="text-sm text-primary hover:underline inline-flex items-center gap-1"
            >
              Pas encore de compte ? <span className="font-semibold">S'inscrire</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        <div className="mt-6 bg-base-200/50 border border-base-200 rounded-xl p-4 text-center">
          <p className="text-xs text-base-content/60 mb-2">
            Vous êtes un vendeur ou un administrateur ?
          </p>
          <Link
            to="/login-erp"
            className="inline-flex items-center gap-2 text-xs font-semibold text-primary hover:underline"
          >
            <Shield className="w-3 h-3" />
            Accès back-office admin
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <PublicLayout>
      <LoginContent />
    </PublicLayout>
  );
}