import { useState } from "react";
import { User, FileText, Check, ShieldCheck, Clock, Calendar, MessageSquare, AlertCircle, Trash2, HelpCircle } from "lucide-react";
import { motion } from "motion/react";
import { Booking, Negotiation, Car } from "../types";

interface RenterDashboardProps {
  currentUser: any;
  bookings: Booking[];
  negotiations: Negotiation[];
  cars: Car[];
  onOpenNegotiationChat: (car: Car) => void;
  onCancelBooking: (bookingId: string) => void;
}

export default function RenterDashboard({ currentUser, bookings, negotiations, cars, onOpenNegotiationChat, onCancelBooking }: RenterDashboardProps) {
  const [docUploadState, setDocUploadState] = useState<'verified' | 'uploaded' | 'missing'>('verified');

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "confirmed":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">Confirmé ✓</span>;
      case "pending":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">En attente ...</span>;
      case "cancelled":
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 font-mono">Annulé ✗</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold bg-slate-800 text-slate-300 border border-slate-700">{status}</span>;
    }
  };

  return (
    <div id="renter_dashboard_scope" className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      {/* Col Left: Profile Info & Document KYC Panel */}
      <div className="lg:col-span-1 flex flex-col gap-6">
        {/* Profile Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 relative overflow-hidden backdrop-blur-md">
          <div className="absolute top-0 right-0 w-24 h-24 bg-brand-gold-500/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-brand-gold-500/10 border border-brand-gold-500/20 flex items-center justify-center text-brand-gold-500 font-display font-extrabold text-lg">
              {currentUser?.name ? currentUser.name[0] : "R"}
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-100">{currentUser?.name || "Invité"}</h3>
              <p className="text-xs text-slate-400">Rôle : Client Locataire</p>
            </div>
          </div>

          <div className="border-t border-slate-850 mt-4 pt-4 flex flex-col gap-3 text-xs text-slate-400">
            <div className="flex justify-between">
              <span>E-mail</span>
              <span className="text-slate-200">{currentUser?.email}</span>
            </div>
            <div className="flex justify-between">
              <span>Tél</span>
              <span className="text-slate-200">{currentUser?.phone}</span>
            </div>
            <div className="flex justify-between items-center">
              <span>Vérification d'identité</span>
              <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded font-medium text-[10px]">
                ✓ KYC Validée
              </span>
            </div>
          </div>
        </div>

        {/* KYC Upload Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-brand-gold-500" />
            <h4 className="font-display font-semibold text-sm text-slate-200">Documents Requis Maroc</h4>
          </div>
          
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Pour louer un véhicule au Maroc, la CIN (Carte Nationale d'Identité) et le Permis de Conduire original sont légalement obligatoires.
          </p>

          <div className="flex flex-col gap-3 mt-1">
            {/* National identity card upload field */}
            <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-brand-gold-500/10 text-brand-gold-500 rounded-lg">🪪</span>
                <span className="text-slate-300 font-medium">Carte Nationale d'Identité (CIN)</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Validé
              </div>
            </div>

            {/* Driving license upload field */}
            <div className="p-3 bg-slate-950 border border-slate-850/80 rounded-xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span className="p-1.5 bg-brand-gold-500/10 text-brand-gold-500 rounded-lg">🚗</span>
                <span className="text-slate-300 font-medium">Permis de Conduire Original</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-semibold bg-emerald-500/5 px-2 py-1 rounded border border-emerald-500/10">
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Validé
              </div>
            </div>
          </div>

          <div className="bg-slate-950 border border-slate-850/60 p-3.5 rounded-xl flex items-start gap-2.5 text-[10px] text-slate-400 leading-normal">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>Tous vos fichiers sont chiffrés conformément aux règles de la CNDP marocaine sur la protection des données personnelles.</span>
          </div>
        </div>
      </div>

      {/* Col Right list bookings & neg list */}
      <div className="lg:col-span-2 flex flex-col gap-6">
        
        {/* List of active reservations */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-brand-gold-500" />
              <h3 className="font-display font-semibold text-base text-slate-100">Mes Réservations</h3>
            </div>
            <span className="text-[10px] text-slate-400 tracking-wider uppercase font-mono bg-slate-950 px-2 py-1 rounded border border-slate-850">
              {bookings.length} Demandes
            </span>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-10 border border-dashed border-slate-850 rounded-2xl bg-slate-950/20">
              <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucune réservation active pour le moment.</p>
              <p className="text-[10px] text-slate-500 mt-1">Négociez un prix imbattable et louez votre première voiture !</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {bookings.map((booking) => (
                <div
                  key={booking.id}
                  className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex gap-4">
                    <img src={booking.carImage} alt={booking.carModel} className="w-16 h-12 object-cover rounded-xl border border-slate-800 shadow" />
                    <div>
                      <h4 className="font-display font-semibold text-sm text-slate-200">{booking.carModel}</h4>
                      <p className="text-[11px] text-slate-400">Agence : {booking.agencyName}</p>
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-500 mt-1">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        <span>Du {booking.startDate} au {booking.endDate}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0 gap-2">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">Tarif Total Séjour</span>
                      <strong className="text-brand-gold-500 font-mono text-sm">{booking.totalPrice} MAD</strong>
                    </div>

                    <div className="flex items-center gap-3">
                      {getStatusBadge(booking.status)}
                      
                      {booking.status === "pending" && (
                        <button
                          onClick={() => onCancelBooking(booking.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/5 rounded-lg transition-all cursor-pointer"
                          title="Annuler ma demande"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* List of active direct proposals chats */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-brand-gold-500" />
              <h3 className="font-display font-semibold text-base text-slate-100 font-semibold">Négociations en cours (Direct Bidding)</h3>
            </div>
            <span className="text-[10px] text-emerald-400 tracking-wider bg-emerald-500/5 px-2 py-0.5 rounded border border-emerald-500/10 font-bold font-mono">
              Live AI Panel
            </span>
          </div>

          {negotiations.length === 0 ? (
            <div className="text-center py-8 border border-dashed border-slate-850 rounded-2xl bg-slate-950/20">
              <HelpCircle className="w-6 h-6 text-slate-600 mx-auto mb-1.5" />
              <p className="text-xs text-slate-400">Aucune discussion tarifaire en cours.</p>
              <p className="text-[10px] text-slate-500 mt-1">Baissez les prix catalogues d'affichage en lançant une négociation KhtaarCar Chat !</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {negotiations.map((neg) => {
                const associatedCar = cars.find(c => c.id === neg.carId);
                return (
                  <div
                    key={neg.id}
                    className="p-4 bg-slate-950/40 rounded-xl border border-slate-850 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 hover:border-slate-800 transition-colors"
                  >
                    <div>
                      <span className="text-[10px] uppercase font-mono font-medium tracking-wider text-brand-gold-500">
                        Négociation ID: {neg.id.substr(0, 8)}
                      </span>
                      <h4 className="font-display font-bold text-sm text-slate-100 mt-0.5">
                        {associatedCar ? `${associatedCar.make} ${associatedCar.model}` : "Véhicule KhtaarCar"}
                      </h4>
                      <div className="flex gap-4 text-[11px] text-slate-400 mt-1 font-mono">
                        <span>Original: {neg.initialPrice} MAD/j</span>
                        <span>Dernier bid : <strong className="text-brand-gold-500 font-semibold">{neg.offeredPrice} MAD/j</strong></span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {neg.status === 'accepted' ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
                          Tarif Approuvé 🎉
                        </span>
                      ) : neg.status === 'declined' ? (
                        <span className="px-2.5 py-1 text-[10px] font-bold text-rose-400 bg-rose-500/10 rounded-full border border-rose-500/20">
                          Refusé ✗
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 text-[10px] font-bold text-amber-400 bg-amber-500/15 rounded-full border border-amber-500/20 animate-pulse">
                          Échange en Cours ...
                        </span>
                      )}

                      {associatedCar && (
                        <button
                          onClick={() => onOpenNegotiationChat(associatedCar)}
                          className="px-3 py-1.5 bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 font-display font-bold text-xs rounded-lg cursor-pointer"
                        >
                          {neg.status === 'accepted' ? "Finaliser" : "Ouvrir Chat"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
