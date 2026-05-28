import { useState, useEffect, useRef } from "react";
import { X, Send, Coins, MessageSquare, ShieldCheck, Check, Sparkles } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Car, Negotiation, Message } from "../types";

interface NegotiationModalProps {
  car: Car;
  currentUser: any;
  onClose: () => void;
  onNegotiationSuccess: (negotiation: Negotiation) => void;
}

export default function NegotiationModal({ car, currentUser, onClose, onNegotiationSuccess }: NegotiationModalProps) {
  const [biddingRate, setBiddingRate] = useState<number>(Math.round(car.basePrice * 0.85));
  const [typedMessage, setTypedMessage] = useState<string>("");
  const [negotiation, setNegotiation] = useState<Negotiation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [chatPending, setChatPending] = useState<boolean>(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load existing negotiation if active for this car
  useEffect(() => {
    // Check if there is an in-memory negotiation for this car and this user
    fetch(`/api/bookings`)
      .then(res => res.json())
      .then(bookings => {
        // Find existing ones
      })
      .catch(e => console.error(e));
  }, [car.id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, chatPending]);

  const handleStartNegotiation = async () => {
    if (biddingRate <= 0) return;
    setIsLoading(true);
    try {
      const res = await fetch("/api/negotiations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer stub-token-${currentUser?.id || 'usr_renter'}`
        },
        body: JSON.stringify({
          carId: car.id,
          offeredPrice: biddingRate
        })
      });

      if (!res.ok) throw new Error("Erreur serveur negotiation initiation");
      const data: Negotiation = await res.json();
      setNegotiation(data);

      // Load initial chat messages
      const mRes = await fetch(`/api/messages/${data.id}`);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMessages(mData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendOffer = async (customPrice?: number) => {
    if (!negotiation) return;
    const bid = customPrice || biddingRate;
    setChatPending(true);

    try {
      const res = await fetch(`/api/negotiations/${negotiation.id}/counter`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer stub-token-${currentUser?.id || 'usr_renter'}`
        },
        body: JSON.stringify({
          offeredPrice: bid,
          message: typedMessage || `Je propose un prix de ${bid} MAD par jour.`
        })
      });

      if (!res.ok) throw new Error("Proposer prix error");
      const updatedNeg: Negotiation = await res.json();
      setNegotiation(updatedNeg);
      setTypedMessage("");

      // Fetch fresh chat history
      const mRes = await fetch(`/api/messages/${negotiation.id}`);
      if (mRes.ok) {
        const mData = await mRes.json();
        setMessages(mData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setChatPending(false);
    }
  };

  const handleAcceptAgencyOffer = async () => {
    if (!negotiation) return;
    setIsLoading(true);
    try {
      const res = await fetch(`/api/negotiations/${negotiation.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: "accepted" })
      });
      if (res.ok) {
        const data = await res.json();
        setNegotiation(data);
        onNegotiationSuccess(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const getBiddingQualityColor = () => {
    if (biddingRate >= car.basePrice) return "text-emerald-400";
    if (biddingRate >= car.minPrice) return "text-amber-400";
    return "text-rose-400";
  };

  const getBiddingProgressPercent = () => {
    const range = car.basePrice - car.minPrice;
    if (range <= 0) return 100;
    const diff = biddingRate - car.minPrice;
    const percent = Math.round((diff / range) * 100);
    return Math.min(100, Math.max(0, percent));
  };

  return (
    <div id="negotiation_modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[85vh]"
      >
        {/* Modal Top Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-850 bg-slate-900/50 backdrop-blur">
          <div className="flex items-center gap-3">
            <Coins className="w-6 h-6 text-brand-gold-500 shrink-0" />
            <div>
              <h2 className="font-display font-bold text-base sm:text-xl text-slate-100 flex items-center gap-2">
                Négociation Directe <span className="text-[10px] sm:text-xs bg-brand-gold-500/10 text-brand-gold-500 font-mono px-2 py-0.5 rounded border border-brand-gold-500/20">KhtaarCar Live</span>
              </h2>
              <p className="text-[10.5px] sm:text-xs text-slate-400">Pour la {car.make} {car.model} de l'agence <span className="text-slate-300 font-medium">{car.agencyName}</span></p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all cursor-pointer"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>

        {/* Core Screen */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          
          {/* Section 1: Vehicle Price Sheet */}
          <div className="bg-slate-850/40 p-4 rounded-2xl border border-slate-800 flex flex-wrap sm:flex-nowrap gap-4 items-center justify-between">
            <div className="flex items-center gap-4">
              <img src={car.imageUrl} alt={car.model} className="w-20 h-14 object-cover rounded-xl border border-slate-700/50 shadow" />
              <div>
                <span className="text-xs text-brand-gold-500 font-medium tracking-wider uppercase font-display">{car.category}</span>
                <h4 className="font-display font-semibold text-base text-slate-100">{car.make} {car.model}</h4>
                <p className="text-xs text-slate-400">Ville : {car.city}</p>
              </div>
            </div>
            <div className="flex gap-6 sm:text-right pr-2">
              <div className="flex flex-col">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest font-mono">Tarif Standard</span>
                <span className="font-display font-bold text-lg text-slate-300">{car.basePrice} MAD<span className="text-xs font-normal text-slate-400">/j</span></span>
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-brand-gold-500 uppercase tracking-widest font-mono">Notre Seuil IA</span>
                <span className="font-display font-normal text-xs text-brand-gold-500 bg-brand-gold-500/5 px-2 py-0.5 rounded border border-brand-gold-500/10 mt-1">Négociation Possible</span>
              </div>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {!negotiation ? (
              // STEP 1: Enter price and submit first offer
              <motion.div
                key="step-initial"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="flex flex-col gap-6"
              >
                <div className="text-center py-4">
                  <h3 className="font-display font-bold text-lg text-slate-100 mb-1">Combien proposez-vous ?</h3>
                  <p className="text-xs text-slate-400">Fixez votre propre tarif journalier. Notre système analysera l'offre instantanément.</p>
                </div>

                {/* Slider and Input wrapper */}
                <div className="flex flex-col items-center justify-center p-6 bg-slate-950/40 rounded-3xl border border-slate-800 gap-4">
                  <div className="flex items-baseline gap-2">
                    <span className={`font-display font-extrabold text-5xl tracking-tight ${getBiddingQualityColor()}`}>
                      {biddingRate}
                    </span>
                    <span className="text-slate-400 text-lg font-medium">MAD / jour</span>
                  </div>

                  {/* Range Slider */}
                  <div className="w-full mt-4">
                    <input
                      type="range"
                      min={Math.round(car.basePrice * 0.5)}
                      max={Math.round(car.basePrice * 1.2)}
                      step={10}
                      value={biddingRate}
                      onChange={(e) => setBiddingRate(Number(e.target.value))}
                      className="w-full accent-brand-gold-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg appearance-none"
                    />
                    <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
                      <span>{Math.round(car.basePrice * 0.5)} MAD (Bas)</span>
                      <span className="text-brand-gold-500 font-semibold">{car.basePrice} MAD (Standard)</span>
                      <span>{Math.round(car.basePrice * 1.2)} MAD (Haut)</span>
                    </div>
                  </div>

                  {/* Feedback on Bid Quality */}
                  <div className="w-full border-t border-slate-800/80 pt-4 text-center">
                    {biddingRate < car.minPrice ? (
                      <p className="text-xs text-rose-400 flex items-center justify-center gap-1.5">
                        ⚠️ Cette offre est très basse. L'agence risque de la refuser catégoriquement. Le seuil estimé est plus élevé.
                      </p>
                    ) : biddingRate >= car.basePrice * 0.9 ? (
                      <p className="text-xs text-emerald-400 flex items-center justify-center gap-1.5">
                        ✨ Excellente offre ! L'agence l'acceptera très probablement immédiatement pour sécuriser le véhicule.
                      </p>
                    ) : (
                      <p className="text-xs text-amber-400 flex items-center justify-center gap-1.5">
                        🤝 Offre raisonnable. Prêt pour un échange amical pour convenir d'un compromis idéal.
                      </p>
                    )}
                  </div>
                </div>

                {/* Submission CTA */}
                <button
                  onClick={handleStartNegotiation}
                  disabled={isLoading}
                  className="w-full bg-brand-gold-500 hover:bg-brand-gold-600 disabled:bg-slate-800 text-slate-950 font-display font-extrabold py-4 px-6 rounded-2xl shadow-lg hover:shadow-brand-gold-500/10 cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <span className="w-5 h-5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4 text-slate-950 fill-slate-950" />
                      <span>Lancer la Négociation Directe</span>
                    </>
                  )}
                </button>
              </motion.div>
            ) : (
              // STEP 2: Live chat feed with negotiation logs
              <motion.div
                key="step-chat"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col flex-1 min-h-[300px]"
              >
                {/* Chat window panel */}
                <div 
                  ref={scrollRef}
                  className="flex-1 bg-slate-950/40 p-3 sm:p-4 rounded-2xl border border-slate-850 h-[185px] sm:h-[300px] overflow-y-auto flex flex-col gap-3 mb-4"
                >
                  {messages.map((m) => {
                    const isUser = m.senderId === currentUser?.id || m.senderId === 'usr_renter';
                    if (m.isSystem) {
                      return (
                        <div key={m.id} className="text-center my-1.5">
                          <span className="inline-block text-[10px] text-brand-gold-500/90 font-mono bg-brand-gold-500/5 px-3 py-1 rounded-full border border-brand-gold-500/10">
                            📢 {m.text}
                          </span>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={m.id}
                        className={`flex flex-col max-w-[80%] rounded-2xl p-3 text-xs leading-relaxed ${
                          isUser
                            ? "bg-brand-gold-500 text-slate-950 ml-auto rounded-tr-none font-medium"
                            : "bg-slate-800 text-slate-100 rounded-tl-none border border-slate-700/40"
                        }`}
                      >
                        <span className="font-display font-medium text-[9px] uppercase tracking-wider opacity-60 mb-1">
                          {m.senderName}
                        </span>
                        <span>{m.text}</span>
                        <span className="text-[8px] opacity-40 text-right block mt-1">
                          {new Date(m.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    );
                  })}

                  {/* Typing Loader wrapper */}
                  {chatPending && (
                    <div className="bg-slate-850/80 max-w-[70%] border border-slate-800 text-slate-300 rounded-2xl rounded-tl-none p-3.5 mr-auto flex gap-2 items-center text-xs">
                      <span className="text-[10px] text-slate-400 font-display italic font-semibold">{car.agencyName} réfléchit...</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-brand-gold-500 rounded-full animate-bounce delay-100" />
                        <span className="w-1.5 h-1.5 bg-brand-gold-500 rounded-full animate-bounce delay-200" />
                        <span className="w-1.5 h-1.5 bg-brand-gold-500 rounded-full animate-bounce delay-300" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Sub-status actions bar */}
                {negotiation.status === 'open' && (
                  <div className="bg-slate-850/40 p-3 sm:p-4 rounded-xl border border-slate-800 flex flex-wrap gap-2 items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <Coins className="w-4 h-4 text-brand-gold-500" />
                      <span className="text-xs text-slate-300">
                        Dernier prix : <strong className="text-brand-gold-500 text-sm font-semibold">{negotiation.offeredPrice} MAD</strong> / jour
                      </span>
                    </div>

                    {negotiation.currentOfferBy === 'agency' ? (
                      <div className="flex gap-2">
                        <button
                          onClick={handleAcceptAgencyOffer}
                          className="bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 font-display font-bold py-1.5 px-3 rounded-lg text-xs cursor-pointer flex items-center gap-1"
                        >
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                          Accepter l'offre
                        </button>
                      </div>
                    ) : (
                      <span className="text-[10px] font-mono text-slate-400 px-2 py-1 bg-slate-900 rounded border border-slate-800">
                        En attente de réponse
                      </span>
                    )}
                  </div>
                )}

                {negotiation.status === 'accepted' && (
                  <div className="bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/25 flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1 text-slate-950 bg-emerald-400 rounded-full">
                        <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                      </div>
                      <div>
                        <span className="text-xs text-emerald-400 font-bold block">Accord Trouvé ! 🎉</span>
                        <p className="text-[10px] text-slate-400">Le tarif de <strong className="text-emerald-300">{negotiation.offeredPrice} MAD/jour</strong> est approuvé.</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onNegotiationSuccess(negotiation)}
                      className="bg-emerald-400 hover:bg-emerald-500 text-slate-950 font-display font-extrabold text-xs py-2 px-4 rounded-xl cursor-pointer"
                    >
                      Finaliser la Réservation
                    </button>
                  </div>
                )}

                {negotiation.status === 'declined' && (
                  <div className="bg-rose-500/10 p-4 rounded-xl border border-rose-500/25 text-center mb-4">
                    <span className="text-xs text-rose-400 font-bold block mb-1">Négociation Refusée ❌</span>
                    <p className="text-[10px] text-slate-400">Cette offre n'a pas pu être acceptée par le propriétaire de ce véhicule. Essayez une proposition plus réaliste.</p>
                  </div>
                )}

                {/* Send action inputs */}
                {negotiation.status === 'open' && (
                  <div className="flex gap-2">
                    <div className="flex-1 bg-slate-950 border border-slate-800 rounded-xl flex items-center px-3 gap-2">
                      <input
                        type="text"
                        placeholder="Tapez un message amical ou proposez un compromis..."
                        value={typedMessage}
                        onChange={(e) => setTypedMessage(e.target.value)}
                        className="flex-1 bg-transparent text-xs text-slate-200 outline-none placeholder:text-slate-500 py-3"
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSendOffer();
                        }}
                      />
                      
                      {/* Counter Bids numeric micro adjustments inside chat */}
                      <button 
                        onClick={() => {
                          const steps = [20, 30, 50];
                          const randomStep = steps[Math.floor(Math.random() * steps.length)];
                          const adjBid = negotiation.offeredPrice + randomStep;
                          setBiddingRate(adjBid);
                          handleSendOffer(adjBid);
                        }}
                        className="text-[10px] font-mono text-brand-gold-500 bg-brand-gold-500/10 hover:bg-brand-gold-500 hover:text-slate-950 px-2.5 py-1 rounded-lg border border-brand-gold-500/20 transition-all cursor-pointer font-bold"
                        title="Changer d'offre en proposant plus"
                      >
                        + Surenchérir
                      </button>
                    </div>
                    
                    <button
                      onClick={() => handleSendOffer()}
                      className="bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 p-3 rounded-xl cursor-pointer flex items-center justify-center shadow"
                    >
                      <Send className="w-5 h-5 text-slate-950" />
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Info protection footer banner */}
        <div className="p-4 bg-slate-950/80 border-t border-slate-850 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span className="text-[10px] text-slate-400">Contrat scellé sous l'égide de la charte de confiance KhtaarCar Maroc.</span>
        </div>
      </motion.div>
    </div>
  );
}
