import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, 
  ChevronLeft, 
  ChevronRight, 
  MapPin, 
  Calendar, 
  Users, 
  Fuel, 
  ShieldCheck, 
  Check, 
  Sparkles, 
  Star, 
  Heart, 
  Info,
  Car as CarIcon,
  HelpCircle
} from "lucide-react";
import { Car } from "../types";

interface CarDetailsModalProps {
  car: Car;
  onClose: () => void;
  onStartBooking: (car: Car) => void;
  onStartNegotiation: (car: Car) => void;
}

export default function CarDetailsModal({ 
  car, 
  onClose, 
  onStartBooking, 
  onStartNegotiation 
}: CarDetailsModalProps) {
  // Extract images array, enforcing 3 - 5 photos constraint
  // Fallback to various high-quality Unsplash ones if images list is deficient.
  const galleryImages = car.images && car.images.length >= 3 
    ? car.images.slice(0, 5) 
    : [
        car.imageUrl,
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000"
      ].slice(0, Math.max(3, Math.min(5, car.images?.length || 3)));

  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isLiked, setIsLiked] = useState<boolean>(false);

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev + 1) % galleryImages.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setActiveIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length);
  };

  return (
    <div 
      id="car-details-modal-overlay" 
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        id={`car-details-card-${car.id}`}
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className="relative w-full max-w-4xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col md:flex-row my-4 md:my-8"
        onClick={(e) => e.stopPropagation()}
      >
        {/* LEFT COLUMN: Premium Multiphoto Gallery */}
        <div className="w-full md:w-1/2 flex flex-col bg-slate-950/40 p-4 sm:p-5 border-b md:border-b-0 md:border-r border-slate-850">
          
          {/* Main Display Image Frame */}
          <div className="relative aspect-[4/3] w-full rounded-2xl overflow-hidden bg-slate-950 border border-slate-850 group">
            <AnimatePresence mode="wait">
              <motion.img
                key={activeIndex}
                src={galleryImages[activeIndex]}
                alt={`${car.make} ${car.model} view ${activeIndex + 1}`}
                initial={{ opacity: 0, filter: "blur(4px)" }}
                animate={{ opacity: 1, filter: "blur(0)" }}
                exit={{ opacity: 0, filter: "blur(4px)" }}
                transition={{ duration: 0.2 }}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </AnimatePresence>

            {/* Float badges */}
            <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800 backdrop-blur px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] text-slate-350 font-bold font-mono">
              <MapPin className="w-3 h-3 text-brand-gold-500" />
              <span>{car.city}</span>
            </div>

            <button
              id="car-details-like-btn"
              onClick={() => setIsLiked(!isLiked)}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-slate-950/80 border border-slate-800 flex items-center justify-center backdrop-blur hover:bg-slate-900 transition-all text-slate-300 hover:text-red-400 cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${isLiked ? "fill-red-500 text-red-500" : ""}`} />
            </button>

            {/* Carousel navigation controls (Min 44px target sizes for accessibility) */}
            <button
              id="car-details-gallery-prev"
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/75 border border-slate-800/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-900 transition-all cursor-pointer shadow-lg"
              title="Image précédente"
            >
              <ChevronLeft className="w-5 h-5 pointer-events-none" />
            </button>

            <button
              id="car-details-gallery-next"
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-slate-950/75 border border-slate-800/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 hover:bg-slate-900 transition-all cursor-pointer shadow-lg"
              title="Image suivante"
            >
              <ChevronRight className="w-5 h-5 pointer-events-none" />
            </button>

            {/* Photo Counter */}
            <div className="absolute bottom-3 right-3 bg-slate-950/80 border border-slate-800 px-3 py-1 rounded-full backdrop-blur-md text-[9px] text-slate-400 font-mono tracking-wider font-bold">
              PHOTO {activeIndex + 1} / {galleryImages.length}
            </div>
          </div>

          {/* Interactive Thumbnails Selector Grid (Enforces 3-5 images beautifully) */}
          <div className="grid grid-cols-5 gap-2 mt-4">
            {galleryImages.map((img, idx) => (
              <button
                key={idx}
                id={`car-details-thumb-${idx}`}
                onClick={() => setActiveIndex(idx)}
                className={`relative aspect-[4/3] rounded-lg overflow-hidden border-2 transition-all bg-slate-950 ${
                  activeIndex === idx 
                    ? "border-brand-gold-500 ring-2 ring-brand-gold-500/20" 
                    : "border-slate-850 opacity-60 hover:opacity-100"
                }`}
              >
                <img 
                  src={img} 
                  alt="thumbnail" 
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </button>
            ))}
          </div>

          <div className="bg-slate-950/40 p-4 border border-slate-850 rounded-2xl flex gap-3 text-[11px] leading-relaxed text-slate-400 mt-4">
            <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
            <span>
              <strong>Note de protection KhtaarCar:</strong> Assurance Tous Risques de base incluse, avec franchise ajustable de 0 MAD lors de l'étape finale.
            </span>
          </div>
        </div>

        {/* RIGHT COLUMN: Car details & specifications */}
        <div className="w-full md:w-1/2 flex flex-col p-4 sm:p-6 md:max-h-[80vh] md:overflow-y-auto justify-between gap-6">
          
          {/* Close Action Button */}
          <button
            id="car-details-close-btn"
            onClick={onClose}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-850 border border-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition-all cursor-pointer z-10"
            title="Fermer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Core metadata headers */}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-brand-gold-500 font-mono font-bold uppercase tracking-widest bg-brand-gold-500/10 border border-brand-gold-500/20 px-2.5 py-0.5 rounded-md">
                {car.category}
              </span>
              <span className="text-xs text-slate-500 font-mono">{car.year} • Modèle Certifié</span>
            </div>

            <h2 className="font-display font-black text-2xl text-slate-100 mt-2.5 tracking-tight">
              {car.make} {car.model}
            </h2>

            {/* Rating summary */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
              <div className="flex text-brand-gold-500">
                <Star className="w-3.5 h-3.5 fill-brand-gold-500" />
                <span className="ml-1 text-slate-200 font-bold font-mono">{car.rating}</span>
              </div>
              <span>•</span>
              <span className="underline hover:text-slate-350 cursor-pointer">{car.reviewsCount} évaluations d'utilisateurs</span>
            </div>

            {/* Specs Sheets Grid */}
            <div className="grid grid-cols-2 gap-2 mt-5">
              <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-gold-500">
                  <CarIcon className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Transmission</span>
                  <span className="text-xs font-bold text-slate-200 font-display">{car.transmission === 'Automatic' ? "Automatique" : "Manuelle"}</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-gold-500">
                  <Fuel className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Carburant</span>
                  <span className="text-xs font-bold text-slate-200 font-display">{car.fuel}</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-gold-500">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Capacité</span>
                  <span className="text-xs font-bold text-slate-200 font-display">{car.seats} Places</span>
                </div>
              </div>

              <div className="bg-slate-950/40 border border-slate-850 p-2.5 rounded-xl flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-brand-gold-500">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase block font-mono">Année</span>
                  <span className="text-xs font-bold text-slate-200 font-display">{car.year}</span>
                </div>
              </div>
            </div>

            {/* Equipments & Conveniences */}
            <div className="mt-5">
              <h4 className="text-[11px] font-mono uppercase tracking-wider text-slate-500 font-bold mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-brand-gold-500" /> ÉQUIPEMENTS DE CONFORT
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {car.features.map((feature, idx) => (
                  <span 
                    key={idx} 
                    className="px-2.5 py-1 text-[11px] font-medium rounded-lg bg-slate-950 text-slate-350 border border-slate-850/80 flex items-center gap-1"
                  >
                    <Check className="w-3 h-3 text-emerald-400 stroke-[3]" />
                    {feature}
                  </span>
                ))}
              </div>
            </div>

            {/* Renting agency credibility banner */}
            <div className="mt-5 p-3.5 bg-slate-950/60 border border-slate-850 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[9px] text-slate-500 font-mono uppercase block">Partenaire Vérifié</span>
                <span className="text-xs font-bold text-slate-200 block">{car.agencyName}</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Disponibilité garantie • Clés prêtes en agence</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-[#ffffff] font-mono bg-emerald-500/10 text-emerald-400 px-2 py-0.5 border border-emerald-500/20 rounded-md">
                  ★ 4.9 PRO
                </span>
                <span className="text-[9px] text-slate-500 block mt-1">Maroc renting standard</span>
              </div>
            </div>
          </div>

          {/* Pricing information & CTAs area */}
          <div className="border-t border-slate-850 pt-5 mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Tarif journalier conseillé</span>
              <div className="flex items-baseline gap-1.5">
                <strong className="text-white text-2xl font-mono font-black">{car.basePrice} MAD</strong>
                <span className="text-xs text-slate-400">/ jour</span>
              </div>
              <span className="text-[9px] text-slate-400 block mt-0.5">Seuil minimal de négociation confidentiel.</span>
            </div>

            <div className="flex gap-2.5 w-full sm:w-auto">
              {/* Trigger standard checkout */}
              <button
                id={`car-details-book-standard-${car.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartBooking(car);
                }}
                className="flex-1 sm:flex-none px-4 py-3.5 text-xs font-display font-semibold border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all text-center"
              >
                Standard
              </button>

              {/* Trigger direct negotiation popup */}
              <button
                id={`car-details-negotiate-direct-${car.id}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onStartNegotiation(car);
                }}
                className="flex-[2] sm:flex-none px-6 py-3.5 text-xs font-display font-extrabold bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 rounded-xl cursor-pointer shadow hover:shadow-brand-gold-500/25 transition-all flex items-center justify-center gap-1.5"
              >
                🤝 Lancer Négociation
              </button>
            </div>
          </div>

        </div>

      </motion.div>
    </div>
  );
}
