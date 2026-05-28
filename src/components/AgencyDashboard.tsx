import { useState } from "react";
import { Plus, Check, X, ShieldAlert, Car, TrendingUp, Users, CalendarDays, Coins, PlusCircle, CheckCircle, AlertOctagon } from "lucide-react";
import { motion } from "motion/react";
import { Booking, Car as CarType } from "../types";

interface AgencyDashboardProps {
  currentUser: any;
  cars: CarType[];
  bookings: Booking[];
  onOpenAddCarModal: () => void;
  onUpdateBookingStatus: (bookingId: string, status: 'confirmed' | 'cancelled') => void;
}

export default function AgencyDashboard({ currentUser, cars, bookings, onOpenAddCarModal, onUpdateBookingStatus }: AgencyDashboardProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'bookings' | 'fleet'>('overview');

  // Filter cars owned by this agency
  const agencyId = currentUser?.agencyId || "agency_1";
  const myCars = cars.filter(c => c.agencyId === agencyId);
  const myBookings = bookings.filter(b => b.agencyId === agencyId);

  // Stats calculate
  const totalRevenue = myBookings
    .filter(b => b.status === 'confirmed' || b.status === 'active' || b.status === 'completed')
    .reduce((sum, b) => sum + b.totalPrice, 0);

  const activeRentals = myBookings.filter(b => b.status === 'confirmed').length;

  const getReviewBadgeColor = (rating: number) => {
    if (rating >= 4.7) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
    if (rating >= 4.0) return "text-amber-400 bg-amber-500/10 border-amber-500/15";
    return "text-rose-400 bg-rose-500/10 border-rose-500/20";
  };

  return (
    <div id="agency_dashboard_root" className="flex flex-col gap-6">
      
      {/* Top Banner section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 bg-slate-900 border border-slate-800 rounded-3xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div>
          <span className="text-[10px] uppercase font-mono tracking-wider text-brand-gold-500">
            Espace Propriétaire de Véhicule • Atlas Drive
          </span>
          <h2 className="font-display font-black text-2xl text-slate-100 mt-1">
            Console d'Administration {currentUser?.name}
          </h2>
          <p className="text-xs text-slate-400 mt-1">Gérez votre parc automobile, supervisez les négociations intelligentes de l'IA et sécurisez vos réservations.</p>
        </div>

        <button
          onClick={onOpenAddCarModal}
          className="bg-brand-gold-500 hover:bg-brand-gold-600 active:scale-95 text-slate-950 font-display font-extrabold text-xs py-3 px-5 rounded-xl transition-all flex items-center gap-2 cursor-pointer self-start md:self-auto shadow-md"
        >
          <PlusCircle className="w-4 h-4 text-slate-950 stroke-[3]" />
          <span>Ajouter une Voiture</span>
        </button>
      </div>

      {/* Tabs navigation */}
      <div className="flex gap-2 border-b border-slate-850 pb-px">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-5 py-3 text-xs font-display font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'overview'
              ? "border-brand-gold-500 text-brand-gold-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Vue d'ensemble Analytics
        </button>
        <button
          onClick={() => setActiveTab('bookings')}
          className={`px-5 py-3 text-xs font-display font-bold transition-all border-b-2 cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'bookings'
              ? "border-brand-gold-500 text-brand-gold-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          <span>Demandes de Réservations</span>
          {myBookings.filter(b => b.status === 'pending').length > 0 && (
            <span className="w-2 h-2 rounded-full bg-brand-gold-500 block animate-pulse" />
          )}
        </button>
        <button
          onClick={() => setActiveTab('fleet')}
          className={`px-5 py-3 text-xs font-display font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === 'fleet'
              ? "border-brand-gold-500 text-brand-gold-500"
              : "border-transparent text-slate-400 hover:text-slate-200"
          }`}
        >
          Parc de Véhicules ({myCars.length})
        </button>
      </div>

      {/* Screen Panels */}
      {activeTab === 'overview' && (
        <div className="flex flex-col gap-6">
          {/* Section 1: Dynamic Bento Grid KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* KPI 1 */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-brand-gold-500/10 text-brand-gold-500">
                <Coins className="w-5 h-5 text-brand-gold-500" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Chiffre d'Affaires</span>
                <strong className="text-xl font-mono text-slate-100">{totalRevenue} MAD</strong>
              </div>
            </div>

            {/* KPI 2 */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle className="w-5 h-5 text-emerald-300" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Locations Approuvées</span>
                <strong className="text-xl font-mono text-slate-100">{activeRentals}</strong>
              </div>
            </div>

            {/* KPI 3 */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10 text-purple-400">
                <Car className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Flotte Active</span>
                <strong className="text-xl font-mono text-slate-100">{myCars.length} Véhicules</strong>
              </div>
            </div>

            {/* KPI 4 */}
            <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-400">
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">Note Moyenne</span>
                <strong className="text-xl font-mono text-slate-100">4.8 / 5.0</strong>
              </div>
            </div>

          </div>

          {/* Inline SVG Charts (Visual revenue and occupancy) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Chart Left: Revenue Trend Over Time */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-display font-semibold text-sm text-slate-100">Performance financière mensuelle (MAD)</h3>
                <span className="text-[10px] text-[10px] text-slate-500 font-mono border border-slate-800 px-2 py-0.5 rounded">MAD (Dirhams)</span>
              </div>

              {/* Custom SVG Bar Chart */}
              <div className="w-full h-44 flex items-end justify-between px-2 pt-6 gap-3">
                {/* Jan */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono text-slate-400">12k</div>
                  <div className="w-full bg-slate-800 rounded-t-md hover:bg-slate-700 transition-all cursor-pointer" style={{ height: '35%' }} />
                  <span className="text-[10px] font-mono text-slate-500">Jan</span>
                </div>
                {/* Feb */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono text-slate-400">18k</div>
                  <div className="w-full bg-slate-800 rounded-t-md hover:bg-slate-700 transition-all cursor-pointer" style={{ height: '52%' }} />
                  <span className="text-[10px] font-mono text-slate-500">Fév</span>
                </div>
                {/* Mar */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono text-slate-400">25k</div>
                  <div className="w-full bg-slate-800 rounded-t-md hover:bg-slate-700 transition-all cursor-pointer" style={{ height: '70%' }} />
                  <span className="text-[10px] font-mono text-slate-500">Mar</span>
                </div>
                {/* Apr */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono text-slate-400">31k</div>
                  <div className="w-full bg-slate-800 rounded-t-md hover:bg-slate-700 transition-all cursor-pointer" style={{ height: '82%' }} />
                  <span className="text-[10px] font-mono text-slate-500">Avr</span>
                </div>
                {/* May (Actual) */}
                <div className="flex-1 flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] font-mono text-brand-gold-500 font-bold">{totalRevenue > 0 ? `${(totalRevenue / 1000).toFixed(1)}k` : '38k'}</div>
                  <div className="w-full bg-brand-gold-500 rounded-t-md shadow-lg shadow-brand-gold-500/20" style={{ height: '94%' }} />
                  <span className="text-[10px] font-mono text-brand-gold-500 font-bold">Mai</span>
                </div>
              </div>
            </div>

            {/* Chart Right: Fleet Occupancy Meter */}
            <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl">
              <h3 className="font-display font-semibold text-sm text-slate-100 mb-4">Répartition Catégorielle & Demande</h3>
              
              <div className="flex flex-col gap-3.5 justify-center pt-2">
                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>SUV (Range Rover, Touareg...)</span>
                    <span className="font-mono text-slate-200">65% de taux de rotation</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-brand-gold-500 h-full rounded-full" style={{ width: '65%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Crossovers & Citadines Énergétiques</span>
                    <span className="font-mono text-slate-200">80% de taux de rotation</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-brand-gold-500 h-full rounded-full" style={{ width: '80%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs text-slate-400 mb-1">
                    <span>Électriques (Tesla...)</span>
                    <span className="font-mono text-slate-200 text-brand-gold-500">Premium Growing Fast 🚀</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div className="bg-emerald-400 h-full rounded-full" style={{ width: '92%' }} />
                  </div>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Screen Tab: Bookings approvals */}
      {activeTab === 'bookings' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <h3 className="font-display font-semibold text-base text-slate-105 mb-2">Demandes de locations entrantes</h3>
          
          {myBookings.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-850 rounded-2xl bg-slate-950/20">
              <CalendarDays className="w-8 h-8 text-slate-600 mx-auto mb-2" />
              <p className="text-xs text-slate-400">Aucune demande reçue pour l'instant.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {myBookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-slate-950/60 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"
                >
                  <div className="flex gap-4">
                    <img src={b.carImage} alt={b.carModel} className="w-16 h-12 object-cover rounded-xl border border-slate-800 shadow" />
                    <div>
                      <h4 className="font-display font-semibold text-sm text-slate-200">{b.carModel}</h4>
                      <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                        <span>Locataire : <strong className="text-slate-300">{b.renterName}</strong></span>
                        <span>•</span>
                        <span>Du {b.startDate} au {b.endDate}</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                        Mode de règlement : <span className="uppercase text-brand-gold-500">{b.paymentMethod}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-start sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-900 pt-3 sm:pt-0 gap-3">
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500 font-mono block">Revenu Net</span>
                      <strong className="text-brand-gold-500 font-mono text-sm">{b.totalPrice} MAD</strong>
                    </div>

                    <div className="flex items-center gap-2">
                      {b.status === 'pending' ? (
                        <>
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'confirmed')}
                            className="bg-brand-gold-500 hover:bg-brand-gold-600 active:scale-95 text-slate-950 p-1.5 rounded-lg cursor-pointer"
                            title="Confirmer la réservation"
                          >
                            <Check className="w-4 h-4 stroke-[3]" />
                          </button>
                          <button
                            onClick={() => onUpdateBookingStatus(b.id, 'cancelled')}
                            className="bg-rose-500/10 hover:bg-rose-550 hover:text-white border border-rose-500/20 text-rose-400 p-1.5 rounded-lg cursor-pointer"
                            title="Rejeter la réservation"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold ${
                          b.status === 'confirmed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25' : 'bg-slate-800 text-slate-400 border border-slate-700'
                        }`}>
                          {b.status === 'confirmed' ? "Confirmé ✓" : b.status}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Screen Tab: Fleet registry */}
      {activeTab === 'fleet' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-display font-semibold text-base text-slate-100">Véhicules de mon agence</h3>
            <span className="text-xs bg-slate-950 border border-slate-850 px-3 py-1 rounded-full text-slate-400 font-mono">
              Total : {myCars.length} autos
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCars.map((c) => (
              <div
                key={c.id}
                className="bg-slate-950/40 border border-slate-850/80 rounded-2xl overflow-hidden hover:border-slate-800 transition-colors"
              >
                <img src={c.imageUrl} alt={c.model} className="w-full h-32 object-cover border-b border-slate-900" />
                <div className="p-4 flex flex-col gap-2">
                  <div>
                    <span className="text-[9px] uppercase font-mono bg-brand-gold-500/10 text-brand-gold-500 px-2 py-0.5 rounded border border-brand-gold-500/20 font-bold">
                      {c.category}
                    </span>
                    <h4 className="font-display font-bold text-sm text-slate-100 mt-1.5">{c.make} {c.model}</h4>
                    <p className="text-[10px] text-slate-400">Région : {c.city}</p>
                  </div>

                  <div className="border-t border-slate-900/50 pt-2 flex items-center justify-between mt-1 text-xs">
                    <div>
                      <span className="text-[9px] text-slate-500 font-mono block">Tarif Catalogue</span>
                      <strong className="text-slate-300 font-mono">{c.basePrice} MAD<span className="text-[10px] text-slate-400">/j</span></strong>
                    </div>
                    <div>
                      <span className="text-[9px] text-brand-gold-500 font-semibold font-mono block">Plancher Négociation IA</span>
                      <strong className="text-brand-gold-500 font-mono">{c.minPrice} MAD<span className="text-[10px] font-normal text-slate-400">/j</span></strong>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
