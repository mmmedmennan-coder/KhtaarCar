import { useState } from "react";
import { X, Calendar, User, FileText, CreditCard, ShieldCheck, Check, Info, Sparkles, Sliders } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Car, Negotiation } from "../types";

interface CheckoutModalProps {
  car: Car;
  negotiation: Negotiation | null;
  currentUser: any;
  onClose: () => void;
  onBookingSuccess: () => void;
}

export default function CheckoutModal({ car, negotiation, currentUser, onClose, onBookingSuccess }: CheckoutModalProps) {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form states
  const [startDate, setStartDate] = useState<string>("2026-06-01");
  const [endDate, setEndDate] = useState<string>("2026-06-05");
  const [options, setOptions] = useState({
    gps: false,
    childSeat: false,
    fullInsurance: true,
  });

  const [driverName, setDriverName] = useState<string>(currentUser?.name || "Med Amine");
  const [driverPhone, setDriverPhone] = useState<string>(currentUser?.phone || "+212 612-345678");
  const [driverLicense, setDriverLicense] = useState<string>("12/345678");

  const [paymentMethod, setPaymentMethod] = useState<'cash' | 'card' | 'bank_transfer'>('cash');
  const [cardDetails, setCardDetails] = useState({ number: "", expiry: "", cvc: "" });

  const rentalPricePerDay = negotiation ? negotiation.offeredPrice : car.basePrice;

  const calculateDays = () => {
    const s = new Date(startDate);
    const e = new Date(endDate);
    const diff = e.getTime() - s.getTime();
    return Math.max(1, Math.ceil(diff / (1000 * 3600 * 24)));
  };

  const days = calculateDays();
  const optionsCost = (options.gps ? 40 : 0) + (options.childSeat ? 50 : 0) + (options.fullInsurance ? 100 : 0);
  const subtotal = rentalPricePerDay * days;
  const total = subtotal + (optionsCost * days);

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFinalBooking = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer stub-token-${currentUser?.id || 'usr_renter'}`
        },
        body: JSON.stringify({
          carId: car.id,
          startDate,
          endDate,
          pricePerDay: rentalPricePerDay,
          paymentMethod
        })
      });

      if (!res.ok) throw new Error("Erreur de réservation, veuillez réessayer");
      
      // Successfully registered booking
      onBookingSuccess();
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="checkout_modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header Block with progress steps */}
        <div className="p-6 border-b border-slate-850 bg-slate-900/50 backdrop-blur flex justify-between items-center flex-wrap gap-4">
          <div>
            <span className="text-xs text-brand-gold-500 font-mono flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-brand-gold-500" /> Étapes {step} sur 4
            </span>
            <h2 className="font-display font-bold text-xl text-slate-100 mt-1">
              {step === 1 && "1. Dates & Options de Confort"}
              {step === 2 && "2. Coordonnées & Permis"}
              {step === 3 && "3. Mode de Paiement Direct"}
              {step === 4 && "4. Résumé & Validation Final"}
            </h2>
          </div>
          
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Steps Visual Tracker */}
          <div className="w-full flex gap-1.5 mt-2">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={`bar-${i}`}
                className={`h-1.5 flex-1 rounded-full transition-all ${
                  step >= i ? "bg-brand-gold-500" : "bg-slate-800"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Content Panel */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <AnimatePresence mode="wait">
            
            {/* STEP 1: Dates & Choices */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-5"
              >
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Début Location</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-gold-500" />
                      <input
                        type="date"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        className="bg-transparent text-sm text-slate-200 outline-none w-full"
                      />
                    </div>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs text-slate-400 font-medium">Fin Location</label>
                    <div className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 flex items-center gap-2">
                      <Calendar className="w-4 h-4 text-brand-gold-500" />
                      <input
                        type="date"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        className="bg-transparent text-sm text-slate-200 outline-none w-full"
                      />
                    </div>
                  </div>
                </div>

                <div className="text-sm font-semibold text-slate-300 mt-2">Options Additionnelles (MAD/jour)</div>
                <div className="flex flex-col gap-3">
                  {/* GPS Navigation */}
                  <div
                    onClick={() => setOptions({ ...options, gps: !options.gps })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      options.gps ? "bg-brand-gold-500/5 border-brand-gold-500/50" : "bg-slate-950 border-slate-850"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Navigateur GPS Maroc Intégré (+40 MAD)</span>
                      <span className="text-[10px] text-slate-400">Cartographie complète offline, indispensable pour Marrakech & l'Atlas.</span>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.gps ? "border-brand-gold-500 bg-brand-gold-500 text-slate-950" : "border-slate-800"}`}>
                      {options.gps && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Child Seat */}
                  <div
                    onClick={() => setOptions({ ...options, childSeat: !options.childSeat })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      options.childSeat ? "bg-brand-gold-500/5 border-brand-gold-500/50" : "bg-slate-950 border-slate-850"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Siège Bébé Premium (+50 MAD)</span>
                      <span className="text-[10px] text-slate-400">Norme européenne certifiée pour la sécurité de vos enfants.</span>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.childSeat ? "border-brand-gold-500 bg-brand-gold-500 text-slate-950" : "border-slate-800"}`}>
                      {options.childSeat && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>

                  {/* Insurance */}
                  <div
                    onClick={() => setOptions({ ...options, fullInsurance: !options.fullInsurance })}
                    className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-center ${
                      options.fullInsurance ? "bg-brand-gold-500/20 border-brand-gold-500/80" : "bg-slate-950 border-slate-850"
                    }`}
                  >
                    <div>
                      <span className="text-xs font-semibold text-slate-100 flex items-center gap-1">
                        🛡️ Assurance Tous Risques Élite KhtaarCar (+100 MAD)
                      </span>
                      <span className="text-[10px] text-slate-400">Zéro franchise en cas de rayure ou accident. Sécurité maximale.</span>
                    </div>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center ${options.fullInsurance ? "border-brand-gold-500 bg-brand-gold-500 text-slate-950" : "border-slate-800"}`}>
                      {options.fullInsurance && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 2: Driver detailed specs */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-4"
              >
                <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl flex gap-3 text-xs leading-relaxed text-slate-400 mb-2">
                  <Info className="w-5 h-5 text-brand-gold-500 shrink-0" />
                  <span>
                    Conformément à la réglementation des transports au Maroc, les informations du conducteur doivent correspondre à votre Permis de Conduire national ou international.
                  </span>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Nom complet du conducteur principal</label>
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-brand-gold-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Numéro de téléphone (+212...)</label>
                  <input
                    type="text"
                    value={driverPhone}
                    onChange={(e) => setDriverPhone(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-brand-gold-500"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs text-slate-400 font-medium">Numéro de Permis de Conduire marocain / international</label>
                  <input
                    type="text"
                    value={driverLicense}
                    onChange={(e) => setDriverLicense(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:border-brand-gold-500"
                    placeholder="Ex: 56/12345"
                  />
                </div>

                <div className="bg-slate-850/40 p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs mt-2">
                  <span className="text-slate-300">Statut KYC de vos documents (CIN / Permis)</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                    ✓ Profil Vérifié (2 Documents)
                  </span>
                </div>
              </motion.div>
            )}

            {/* STEP 3: Payment modes */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-4"
              >
                <div className="text-sm font-semibold text-slate-300 mb-2">Sélectionnez votre mode de règlement préféré</div>

                {/* Cash option (Pick up or check-in) */}
                <div
                  onClick={() => setPaymentMethod('cash')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start ${
                    paymentMethod === 'cash' ? "bg-brand-gold-500/5 border-brand-gold-500/50" : "bg-slate-950 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">💵</span>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Paiement en Espèces à la Livraison</span>
                      <span className="text-[10px] text-slate-400">Réglez l'intégralité du tarif de location directement à l'agent de livraison contre reçu.</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'cash' ? "border-brand-gold-500 bg-brand-gold-500" : "border-slate-850"}`}>
                    {paymentMethod === 'cash' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>

                {/* Credit Card option */}
                <div
                  onClick={() => setPaymentMethod('card')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start ${
                    paymentMethod === 'card' ? "bg-brand-gold-500/5 border-brand-gold-500/50" : "bg-slate-950 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">💳</span>
                    <div className="flex-1">
                      <span className="text-xs font-semibold text-slate-200 block">Carte Bancaire Marocaine ou Internationale (3D Secure)</span>
                      <span className="text-[10px] text-slate-400">Paiement ultra sécurisé par CMI. Enregistrez un acompte ou réglez le total.</span>
                      
                      {/* Sub-card fields on select */}
                      {paymentMethod === 'card' && (
                        <div className="mt-4 grid grid-cols-2 gap-3" onClick={(e) => e.stopPropagation()}>
                          <div className="col-span-2 flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400">Numéro de carte</span>
                            <input
                              type="text"
                              value={cardDetails.number}
                              onChange={(e) => setCardDetails({ ...cardDetails, number: e.target.value })}
                              placeholder="4242 4242 4242 4242"
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none w-full"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400">Exp. MM/AA</span>
                            <input
                              type="text"
                              value={cardDetails.expiry}
                              onChange={(e) => setCardDetails({ ...cardDetails, expiry: e.target.value })}
                              placeholder="12/28"
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                            />
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-slate-400">CVV</span>
                            <input
                              type="text"
                              value={cardDetails.cvc}
                              onChange={(e) => setCardDetails({ ...cardDetails, cvc: e.target.value })}
                              placeholder="123"
                              className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 outline-none"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'card' ? "border-brand-gold-500 bg-brand-gold-500" : "border-slate-850"}`}>
                    {paymentMethod === 'card' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>

                {/* Bank Wire option */}
                <div
                  onClick={() => setPaymentMethod('bank_transfer')}
                  className={`p-4 rounded-xl border transition-all cursor-pointer flex justify-between items-start ${
                    paymentMethod === 'bank_transfer' ? "bg-brand-gold-500/5 border-brand-gold-500/50" : "bg-slate-950 border-slate-850 hover:border-slate-800"
                  }`}
                >
                  <div className="flex gap-3">
                    <span className="text-xl">🏦</span>
                    <div>
                      <span className="text-xs font-semibold text-slate-200 block">Virement Bancaire (R.I.B Direct)</span>
                      <span className="text-[10px] text-slate-400">Idéal pour les locations longue durée de société. Rib Atlas fourni après validation.</span>
                    </div>
                  </div>
                  <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${paymentMethod === 'bank_transfer' ? "border-brand-gold-500 bg-brand-gold-500" : "border-slate-850"}`}>
                    {paymentMethod === 'bank_transfer' && <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />}
                  </div>
                </div>
              </motion.div>
            )}

            {/* STEP 4: Checkout preview invoice */}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-5 text-sm"
              >
                <div className="bg-slate-950/60 p-5 rounded-3xl border border-slate-850 flex flex-col gap-3">
                  <div className="text-xs font-mono uppercase tracking-wider text-brand-gold-500 border-b border-slate-800 pb-2">
                    📄 FACTURE EN DUPLICATA - KHTAARCAR MAROC
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Véhicule loué</span>
                    <span className="text-slate-200 font-semibold">{car.make} {car.model}</span>
                  </div>
                  
                  <div className="flex justify-between">
                    <span className="text-slate-400">Ville du contrat</span>
                    <span className="text-slate-200 font-semibold">{car.city}</span>
                  </div>

                  <div className="flex justify-between">
                    <span className="text-slate-400">Durée du séjour</span>
                    <span className="text-slate-200 font-semibold">{days} jour{days > 1 ? "s" : ""}</span>
                  </div>

                  <div className="flex justify-between border-t border-slate-800 pt-3">
                    <span className="text-slate-400">Loyer négocié par jour</span>
                    <span className="text-brand-gold-500 font-mono font-bold">{rentalPricePerDay} MAD/jour</span>
                  </div>

                  {optionsCost > 0 && (
                    <div className="flex justify-between text-xs text-slate-400">
                      <span>Assurance & options confort</span>
                      <span>+{optionsCost * days} MAD total</span>
                    </div>
                  )}

                  <div className="flex justify-between border-t border-slate-800 pt-3 text-base">
                    <span className="text-slate-100 font-bold">MONTANT TOTAL À RÉGLER</span>
                    <span className="text-emerald-400 font-mono font-extrabold">{total} MAD</span>
                  </div>

                  <div className="flex justify-between text-[11px] text-slate-500 border-t border-slate-900 pt-2 font-mono">
                    <span>Mode de Règlement sélectionné</span>
                    <span className="uppercase font-semibold">
                      {paymentMethod === 'cash' && "Espèces à la réception"}
                      {paymentMethod === 'card' && "Carte Bancaire Secure"}
                      {paymentMethod === 'bank_transfer' && "Virement RIB Maroc"}
                    </span>
                  </div>
                </div>

                {/* Confirm banner */}
                <div className="bg-slate-850/30 p-4 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs text-slate-400 leading-normal">
                  <ShieldCheck className="w-10 h-10 text-emerald-400 shrink-0" />
                  <span>
                    Chaque réservation inclut l'assistance routière 24h/24 KhtaarCar partout au Maroc. Votre dépôt d'empreinte est couvert à hauteur de 100% par l'assurance élite.
                  </span>
                </div>
              </motion.div>
            )}
            
          </AnimatePresence>
        </div>

        {/* Modal Bottom Actions Bar */}
        <div className="p-6 border-t border-slate-850 bg-slate-900/50 backdrop-blur flex justify-between gap-4">
          <button
            onClick={handlePrevStep}
            disabled={step === 1 || isLoading}
            className="px-5 py-3 text-xs font-semibold rounded-xl border border-slate-850 hover:border-slate-800 bg-slate-950 text-slate-400 hover:text-white cursor-pointer transition-all disabled:opacity-45"
          >
            Retour
          </button>

          {step < 4 ? (
            <button
              onClick={handleNextStep}
              className="px-6 py-3 text-xs font-display font-bold rounded-xl bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 cursor-pointer shadow hover:shadow-brand-gold-500/10 transition-all ml-auto"
            >
              Étape suivante
            </button>
          ) : (
            <button
              onClick={handleFinalBooking}
              disabled={isLoading}
              className="px-8 py-3.5 text-xs font-display font-extrabold rounded-xl bg-emerald-400 hover:bg-emerald-500 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all ml-auto flex items-center gap-1.5"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Confirmer & Réserver</span>
                </>
              )}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
