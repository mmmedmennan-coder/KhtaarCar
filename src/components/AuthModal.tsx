import React, { useState } from "react";
import { X, Lock, Mail, User, Phone, Sparkles, Building, Key } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface AuthModalProps {
  onClose: () => void;
  onLoginSuccess: (user: any) => void;
}

export default function AuthModal({ onClose, onLoginSuccess }: AuthModalProps) {
  const [isLogin, setIsLogin] = useState<boolean>(true);
  const [role, setRole] = useState<'renter' | 'agency'>('renter');
  
  const [email, setEmail] = useState<string>("renter@khtaarcar.ma");
  const [password, setPassword] = useState<string>("password123");
  const [name, setName] = useState<string>("Amine Belkhidir");
  const [phone, setPhone] = useState<string>("+212 612-345678");
  const [agencyName, setAgencyName] = useState<string>("Atlas Drive Maroc");

  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorText, setErrorText] = useState<string>("");

  const handleShortcutClick = (preset: 'renter' | 'agency') => {
    if (preset === 'renter') {
      setEmail("renter@khtaarcar.ma");
      setRole("renter");
    } else {
      setEmail("agency@khtaarcar.ma");
      setRole("agency");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorText("");

    try {
      const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";
      const payload = isLogin 
        ? { email, password } 
        : { email, name: role === 'agency' ? agencyName : name, phone, role };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || "Échec d'authentification");
      }

      const data = await response.json();
      
      // Save Stub JWT directly
      localStorage.setItem("khtaarcar_token", data.token);
      localStorage.setItem("khtaarcar_user", JSON.stringify(data.user));
      
      onLoginSuccess(data.user);
      onClose();
    } catch (e: any) {
      setErrorText(e.message || "Une erreur s'est produite lors de la connexion.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="auth_modal_back" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col p-6"
      >
        {/* Close Button Pin */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white bg-slate-800/40 hover:bg-slate-800 rounded-full transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Section Header */}
        <div className="text-center mt-2 mb-6">
          <span className="text-xs text-brand-gold-500 font-mono flex justify-center items-center gap-1.5 uppercase tracking-wider font-bold">
            <Sparkles className="w-3.5 h-3.5" /> KhtaarCar Maroc
          </span>
          <h2 className="font-display font-black text-2xl text-slate-100 mt-1">
            {isLogin ? "Heureux de vous revoir" : "Créez votre compte gratuit"}
          </h2>
          <p className="text-xs text-slate-400 mt-1">La première plateforme marocaine de négociation directe de véhicules.</p>
        </div>

        {/* Quick Demo Accounts Toggle */}
        {isLogin && (
          <div className="bg-slate-950/65 p-3.5 rounded-2xl border border-slate-850 flex flex-col gap-2 mb-5">
            <span className="text-[10px] text-brand-gold-500 font-mono uppercase tracking-widest font-semibold block">Presets de test rapide :</span>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleShortcutClick('renter')}
                className={`py-2 px-3 rounded-lg font-medium border text-left cursor-pointer transition-all ${
                  email === 'renter@khtaarcar.ma' 
                    ? "bg-brand-gold-500/10 border-brand-gold-500/30 text-brand-gold-500 font-bold" 
                    : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                👤 Client Amine (Renter)
              </button>
              <button
                type="button"
                onClick={() => handleShortcutClick('agency')}
                className={`py-2 px-3 rounded-lg font-medium border text-left cursor-pointer transition-all ${
                  email === 'agency@khtaarcar.ma' 
                    ? "bg-brand-gold-500/10 border-brand-gold-500/30 text-brand-gold-500 font-bold" 
                    : "bg-slate-900 border-slate-850 text-slate-400 hover:text-slate-200"
                }`}
              >
                🏢 Agence Atlas (Owner)
              </button>
            </div>
          </div>
        )}

        {/* Form Block */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {errorText && (
            <div className="p-3 rounded-xl bg-rose-500/10 text-rose-450 border border-rose-550 text-xs">
              ⚠️ {errorText}
            </div>
          )}

          {/* Registration specific fields */}
          {!isLogin && (
            <>
              {/* Role Toggle selector */}
              <div className="grid grid-cols-2 bg-slate-950 p-1 rounded-xl border border-slate-850 mb-1">
                <button
                  type="button"
                  onClick={() => setRole('renter')}
                  className={`py-2 text-xs font-semibold rounded-lg text-center cursor-pointer ${
                    role === 'renter' ? "bg-slate-850 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Client Voyageur
                </button>
                <button
                  type="button"
                  onClick={() => setRole('agency')}
                  className={`py-2 text-xs font-semibold rounded-lg text-center cursor-pointer ${
                    role === 'agency' ? "bg-slate-850 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                  }`}
                >
                  Agence / Propriétaire
                </button>
              </div>

              {role === 'agency' ? (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400">Raison Sociale de l'Agence</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                    <Building className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={agencyName}
                      onChange={(e) => setAgencyName(e.target.value)}
                      className="bg-transparent text-sm text-slate-200 outline-none w-full"
                      placeholder="Ex: Bahja Rent Cars"
                      required
                    />
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400">Votre Nom Complet</span>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                    <User className="w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="bg-transparent text-sm text-slate-200 outline-none w-full"
                      placeholder="Ex: Med Amine"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <span className="text-xs text-slate-400">Numéro de Téléphone (+212)</span>
                <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="bg-transparent text-sm text-slate-200 outline-none w-full"
                    placeholder="Ex: +212 612-345678"
                    required
                  />
                </div>
              </div>
            </>
          )}

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Adresse e-mail valide</span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
              <Mail className="w-4 h-4 text-slate-500" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent text-sm text-slate-200 outline-none w-full"
                placeholder="nom@example.ma"
                required
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <span className="text-xs text-slate-400">Mot de passe de sécurité</span>
            <div className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 flex items-center gap-2">
              <Lock className="w-4 h-4 text-slate-500" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-transparent text-sm text-slate-200 outline-none w-full"
                placeholder="Minimum 6 caractères"
                required
              />
            </div>
          </div>

          {/* Submit Action CTA */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-gold-500 hover:bg-brand-gold-600 active:scale-95 text-slate-950 font-display font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg mt-2 cursor-pointer transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <span>{isLogin ? "Se connecter" : "Créer mon Compte"}</span>
            )}
          </button>

          {/* Auth mode toggle */}
          <p className="text-center text-xs text-slate-400 mt-3">
            {isLogin ? "Nouveau sur KhtaarCar ?" : "Déjà membre ?"}{" "}
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-brand-gold-500 font-semibold hover:underline cursor-pointer"
            >
              {isLogin ? "Créer un profil" : "Ouvrir votre session"}
            </button>
          </p>

        </form>
      </motion.div>
    </div>
  );
}
