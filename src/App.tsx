import React, { useState, useEffect } from "react";
import { 
  Car as CarIcon, MapPin, Search, Sparkles, User, LogIn, LogOut, 
  HelpCircle, MessageCircle, RefreshCw, Calendar, BadgePercent, Check, AlertCircle, Bell, Sliders 
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

import { Car, Booking, Negotiation, User as UserType } from "./types";
import MoroccoMap from "./components/MoroccoMap";
import NegotiationModal from "./components/NegotiationModal";
import CheckoutModal from "./components/CheckoutModal";
import AddCarModal from "./components/AddCarModal";
import RenterDashboard from "./components/RenterDashboard";
import AgencyDashboard from "./components/AgencyDashboard";
import AuthModal from "./components/AuthModal";
import CarDetailsModal from "./components/CarDetailsModal";

export default function App() {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  
  // App state
  const [cars, setCars] = useState<Car[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [negotiations, setNegotiations] = useState<Negotiation[]>([]);
  const [notifications, setNotifications] = useState<any[]>([]);

  // Search filter states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedCity, setSelectedCity] = useState<string>("Toutes les villes");
  const [selectedCategory, setSelectedCategory] = useState<string>("Toutes");
  const [selectedTransmission, setSelectedTransmission] = useState<string>("Toutes");

  // AI Assistant panel states
  const [aiLoading, setAiLoading] = useState<boolean>(false);
  const [aiResult, setAiResult] = useState<string>("");
  const [aiForm, setAiForm] = useState({
    make: "Renault",
    model: "Clio 5",
    year: 2022,
    category: "Economy",
    city: "Casablanca",
    condition: "Excellent"
  });

  // Modal open controllers
  const [activeCarForNegotiation, setActiveCarForNegotiation] = useState<Car | null>(null);
  const [activeCarForCheckout, setActiveCarForCheckout] = useState<Car | null>(null);
  const [activeNegotiationForCheckout, setActiveNegotiationForCheckout] = useState<Negotiation | null>(null);

  const [showAddCarModal, setShowAddCarModal] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showNotificationsDropdown, setShowNotificationsDropdown] = useState<boolean>(false);
  const [selectedCarForDetails, setSelectedCarForDetails] = useState<Car | null>(null);
  const [showMobileFilters, setShowMobileFilters] = useState<boolean>(false);

  // Main UI Screen switcher (catalog browse vs personal space dashboard)
  const [viewMode, setViewMode] = useState<'browse' | 'dashboard'>('browse');

  // Load backend data
  useEffect(() => {
    fetchCars();
    fetchBookings();
    fetchNegotiations();
    fetchNotifications();

    // Check localStorage user session
    const savedUser = localStorage.getItem("khtaarcar_user");
    if (savedUser) {
      try {
        setCurrentUser(JSON.parse(savedUser));
      } catch (e) {
        console.error(e);
      }
    } else {
      // Auto-set standard renter to give a cohesive interactive experience immediately
      const defaultUser: UserType = {
        id: "usr_renter",
        email: "renter@khtaarcar.ma",
        name: "Med Amine",
        phone: "+212 612-345678",
        role: "renter",
        verified: true,
        documents: {
          cinFront: "cin_preloaded.jpg",
          cinBack: "cin_back_preloaded.jpg",
          licenseFront: "lic_preloaded.jpg",
          licenseBack: "lic_back_preloaded.jpg",
          status: "verified"
        }
      };
      setCurrentUser(defaultUser);
      localStorage.setItem("khtaarcar_user", JSON.stringify(defaultUser));
    }
  }, []);

  const fetchCars = () => {
    fetch(`/api/cars?city=${selectedCity}&category=${selectedCategory}${selectedTransmission !== 'Toutes' ? `&transmission=${selectedTransmission}` : ''}${searchQuery ? `&search=${searchQuery}` : ''}`)
      .then(res => res.json())
      .then(data => setCars(data))
      .catch(err => console.error("Error loaded cars:", err));
  };

  const fetchBookings = () => {
    fetch("/api/bookings", {
      headers: {
        "Authorization": `Bearer stub-token-${currentUser?.id || 'usr_renter'}`
      }
    })
      .then(res => res.json())
      .then(data => setBookings(data))
      .catch(err => console.error(err));
  };

  const fetchNegotiations = () => {
    // Collect active negotiations
    fetch(`/api/bookings`)
      .then(res => res.json())
      .then(data => {
        // Mock grab negotiations state
      })
      .catch(e => console.error(e));
  };

  const fetchNotifications = () => {
    fetch("/api/notifications")
      .then(res => res.json())
      .then(data => setNotifications(data))
      .catch(err => console.error(err));
  };

  // Re-fetch when cities/filters shift
  useEffect(() => {
    fetchCars();
  }, [selectedCity, selectedCategory, selectedTransmission]);

  const handleSearchKeyPress = (e: React.FormEvent) => {
    e.preventDefault();
    fetchCars();
  };

  const handleOpenNegotiation = (car: Car) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setActiveCarForNegotiation(car);
  };

  const handleOpenStandardBooking = (car: Car) => {
    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }
    setActiveCarForCheckout(car);
    setActiveNegotiationForCheckout(null);
  };

  const handleCancelBooking = (bookingId: string) => {
    fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: "cancelled" })
    })
      .then(res => res.json())
      .then(() => {
        fetchBookings();
        fetchNotifications();
      })
      .catch(err => console.error(err));
  };

  const handleUpdateBookingStatus = (bookingId: string, status: 'confirmed' | 'cancelled') => {
    fetch(`/api/bookings/${bookingId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    })
      .then(res => res.json())
      .then(() => {
        fetchBookings();
        fetchNotifications();
      })
      .catch(err => console.error(err));
  };

  // Run AI valuation
  const handleAiPriceEstimate = async () => {
    setAiLoading(true);
    setAiResult("");
    try {
      const response = await fetch("/api/gemini/suggest-price", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(aiForm)
      });
      const data = await response.json();
      setAiResult(data.result);
    } catch (e) {
      console.error(e);
    } finally {
      setAiLoading(false);
    }
  };

  // Notifications read markers
  const handleMarkAllNotificationsRead = () => {
    fetch("/api/notifications/read-all", { method: "POST" })
      .then(() => {
        fetchNotifications();
      });
  };

  // Build carCounts for Map Interactive component
  const getCarCountsByCity = () => {
    const counts: { [key: string]: number } = {};
    cars.forEach(c => {
      counts[c.city] = (counts[c.city] || 0) + 1;
    });
    return counts;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("khtaarcar_user");
    localStorage.removeItem("khtaarcar_token");
    setViewMode('browse');
  };

  return (
    <div className="min-h-screen bg-[#070b12] text-slate-100 flex flex-col font-sans transition-all selection:bg-brand-gold-500 selection:text-slate-900">
      
      {/* Visual background decor spikes */}
      <div className="absolute top-0 left-[20%] w-[60%] h-[350px] bg-gradient-to-b from-brand-gold-500/5 to-transparent blur-3xl rounded-full pointer-events-none" />

      {/* Modern Global Navbar layout */}
      <header className="sticky top-0 z-40 bg-[#070b12]/80 backdrop-blur-xl border-b border-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          
          {/* Brand Logo design */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setViewMode('browse')}>
            <div className="w-10 h-10 rounded-xl bg-brand-gold- Gold bg-gradient-to-tr from-brand-gold-600 to-amber-400 p-0.5 flex items-center justify-center shadow-lg shadow-brand-gold-500/20">
              <CarIcon className="w-5 h-5 text-[#070b12] stroke-[2.5]" />
            </div>
            <div>
              <span className="font-display font-extrabold text-lg text-white tracking-wider uppercase block">
                Khtaar<span className="text-brand-gold-500">Car</span>
              </span>
              <span className="text-[9px] font-mono tracking-widest text-slate-400 uppercase block -mt-1 font-bold">
                Direct Price 🇲🇦
              </span>
            </div>
          </div>

          {/* Navigation and state profile buttons */}
          <div className="flex items-center gap-4">
            
            <button
              onClick={() => setViewMode(viewMode === 'browse' ? 'dashboard' : 'browse')}
              className={`px-3 sm:px-4 py-2 rounded-xl text-xs font-display font-bold transition-all cursor-pointer ${
                viewMode === 'dashboard'
                  ? "bg-brand-gold-500 text-slate-950 shadow-md shadow-brand-gold-500/10"
                  : "bg-slate-900 border border-slate-850 hover:border-slate-800 text-slate-300"
              }`}
            >
              {viewMode === 'dashboard' ? (
                <>
                  <span className="sm:hidden">⚡ Explorer</span>
                  <span className="hidden sm:inline">Explorer les Autos</span>
                </>
              ) : (
                <>
                  <span className="sm:hidden font-bold">👤 Espace</span>
                  <span className="hidden sm:inline font-bold">Mon Espace Perso</span>
                </>
              )}
            </button>

            {/* Notifications Alert Dropdown trigger */}
            <div className="relative">
              <button
                onClick={() => setShowNotificationsDropdown(!showNotificationsDropdown)}
                className="p-2.5 bg-slate-900 border border-slate-850 hover:border-slate-800 rounded-xl text-slate-300 hover:text-white transition-all cursor-pointer relative"
              >
                <Bell className="w-4 h-4" />
                {notifications.filter(n => !n.read).length > 0 && (
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-brand-gold-500 border border-slate-900 animate-pulse" />
                )}
              </button>

              <AnimatePresence>
                {showNotificationsDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute right-0 mt-3 w-80 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden p-3"
                  >
                    <div className="flex justify-between items-center text-xs pb-2 border-b border-slate-850 mb-2">
                      <span className="font-bold text-slate-200">Alertes KhtaarCar</span>
                      <button onClick={handleMarkAllNotificationsRead} className="text-[10px] text-brand-gold-500 font-semibold hover:underline cursor-pointer">
                        Tout marquer lu
                      </button>
                    </div>
                    <div className="max-h-60 overflow-y-auto flex flex-col gap-2">
                      {notifications.length === 0 ? (
                        <p className="text-center text-[11px] text-slate-500 py-6">Aucune alerte récente.</p>
                      ) : (
                        notifications.map(n => (
                          <div key={n.id} className={`p-2.5 rounded-xl text-xs flex gap-2 ${n.read ? "bg-slate-950/20" : "bg-slate-950/70 border border-slate-850"}`}>
                            <span className="text-sm">🔔</span>
                            <div>
                              <strong className="text-slate-200 font-semibold block text-[11px]">{n.title}</strong>
                              <span className="text-[10px] text-slate-400 block mt-0.5 leading-relaxed">{n.message}</span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Profile state */}
            {currentUser ? (
              <div className="flex items-center gap-3 bg-slate-950/50 border border-slate-900 pl-3.5 pr-2 py-1.5 rounded-xl">
                <div className="flex flex-col items-end">
                  <span className="text-xs font-bold text-slate-200">{currentUser.name}</span>
                  <span className="text-[9px] uppercase font-mono text-brand-gold-500 tracking-wider font-semibold">
                    {currentUser.role === 'agency' ? "Agence Owner" : "Locataire"}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 rounded-lg cursor-pointer transition-colors"
                  title="Se Déconnecter"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-slate-950 border border-slate-850 hover:border-slate-800 hover:bg-slate-900 text-slate-200 font-display font-extrabold text-xs rounded-xl flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <LogIn className="w-3.5 h-3.5" />
                <span>Ouvrir Session</span>
              </button>
            )}

          </div>

        </div>
      </header>

      {/* Main app Content blocks */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full flex flex-col gap-10">
        
        {viewMode === 'browse' ? (
          // VIEW 1: VEHICLE BROWSE & FILTER SHEET
          <div className="flex flex-col lg:grid lg:grid-cols-4 gap-8">
            
            {/* Mobile Filter Toggle Button */}
            <div className="lg:hidden w-full flex flex-col gap-2">
              <button
                onClick={() => setShowMobileFilters(!showMobileFilters)}
                className="w-full py-3.5 px-4 bg-slate-900 hover:bg-slate-850 border border-slate-800 rounded-2xl flex items-center justify-center gap-2 text-xs font-bold font-display text-slate-200 transition-all cursor-pointer active:scale-95 shadow shadow-slate-950/40"
              >
                <Sliders className="w-4 h-4 text-brand-gold-500" />
                <span>{showMobileFilters ? "Masquer Filtres & Carte" : "Filtrer & Afficher Carte des Villes 🇲🇦"}</span>
              </button>
            </div>

            {/* Left/Top filters and Interactive map block */}
            <div className={`${showMobileFilters ? "flex" : "hidden"} lg:flex lg:col-span-1 flex-col gap-6`}>
              
              {/* Premium Search Filter Sheet */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4">
                <h3 className="font-display font-medium text-slate-200 text-sm tracking-wide">Focaliser la Recherche</h3>
                
                {/* Search Text input */}
                <form onSubmit={handleSearchKeyPress} className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2.5 flex items-center gap-2">
                  <Search className="w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Dacia, Mercedes AMG..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-transparent text-xs text-slate-300 outline-none w-full"
                  />
                  <button type="submit" className="hidden" />
                </form>

                {/* City selection option */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400">Région du Maroc</span>
                  <select
                    value={selectedCity}
                    onChange={(e) => setSelectedCity(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 cursor-pointer outline-none w-full"
                  >
                    <option value="Toutes les villes">🇲🇦 Toutes les villes</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Tangier">Tanger</option>
                    <option value="Fes">Fès</option>
                  </select>
                </div>

                {/* Category selection option */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400">Catégorie</span>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3.5 py-2.5 text-xs text-slate-300 cursor-pointer outline-none w-full"
                  >
                    <option value="Toutes">🚗 Tout type</option>
                    <option value="SUV">SUV / Crossover</option>
                    <option value="Luxury">Luxury / AMG</option>
                    <option value="Sedan">Berline sportive</option>
                    <option value="Economy">Citadine / Éco</option>
                    <option value="Electric">Électrique (Tesla)</option>
                  </select>
                </div>

                {/* Transmission selection option */}
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400">Boîte Vitesse</span>
                  <div className="grid grid-cols-3 bg-slate-950 p-1 rounded-xl border border-slate-850">
                    {["Toutes", "Automatic", "Manual"].map((t) => (
                      <button
                        key={t}
                        onClick={() => setSelectedTransmission(t)}
                        className={`text-[10px] py-1.5 rounded-lg text-center font-bold font-display cursor-pointer transition-all ${
                          selectedTransmission === t ? "bg-slate-800 text-slate-100 shadow" : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {t === "Toutes" ? "Toutes" : t === "Automatic" ? "Auto" : "Manu"}
                      </button>
                    ))}
                  </div>
                </div>

              </div>

              {/* Dynamic Morocco Map Visual Filter */}
              <MoroccoMap
                selectedCity={selectedCity}
                onSelectCity={setSelectedCity}
                carCountsByCity={getCarCountsByCity()}
              />

              {/* AI Price Assistant Form drawer */}
              <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col gap-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-brand-gold-500/5 rounded-full blur-2xl pointer-events-none" />
                
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-brand-gold-500" />
                  <h4 className="font-display font-semibold text-sm text-slate-200">KhtaarCar IA Estimate</h4>
                </div>

                <p className="text-[11px] text-slate-400 leading-normal">
                  Estimez instantanément le tarif locatif adapté au marché marocain pour n'importe quel véhicule.
                </p>

                <div className="flex flex-col gap-2 mt-1">
                  <input
                    type="text"
                    placeholder="Marque (Dacia, BMW)"
                    value={aiForm.make}
                    onChange={(e) => setAiForm({ ...aiForm, make: e.target.value })}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none w-full"
                  />
                  <input
                    type="text"
                    placeholder="Modèle (Logan, Serie 5)"
                    value={aiForm.model}
                    onChange={(e) => setAiForm({ ...aiForm, model: e.target.value })}
                    className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 outline-none w-full"
                  />
                  
                  <div className="grid grid-cols-2 gap-2 mt-1">
                    <select
                      value={aiForm.city}
                      onChange={(e) => setAiForm({ ...aiForm, city: e.target.value })}
                      className="bg-slate-950 border border-slate-850 rounded-xl px-3 py-2 text-xs text-slate-300 w-full"
                    >
                      <option value="Casablanca">Casablanca</option>
                      <option value="Marrakech">Marrakech</option>
                      <option value="Agadir">Agadir</option>
                      <option value="Rabat">Rabat</option>
                    </select>

                    <button
                      onClick={handleAiPriceEstimate}
                      disabled={aiLoading}
                      className="bg-brand-gold-500 hover:bg-brand-gold-600 disabled:bg-slate-800 text-slate-950 text-xs font-display font-extrabold rounded-xl py-2 cursor-pointer transition-all"
                    >
                      {aiLoading ? "Calcul..." : "Demander IA"}
                    </button>
                  </div>
                </div>

                {/* Evaluation Response output */}
                {aiResult && (
                  <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl text-[10px] text-slate-300 leading-relaxed max-h-48 overflow-y-auto mt-2">
                    {aiResult}
                  </div>
                )}
              </div>

            </div>

            {/* List and Grid of Cars display on Right */}
            <div className="lg:col-span-3 flex flex-col gap-6">
              
              {/* Catalog Hero display */}
              <div className="p-6 bg-gradient-to-r from-brand-gold-900/30 via-slate-900/40 to-slate-900 rounded-3xl border border-slate-800/80 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-brand-gold-500/10 rounded-full blur-2xl pointer-events-none animate-pulse" />
                <div className="flex-1">
                  <span className="text-xs text-brand-gold-500 font-mono flex items-center gap-1 font-bold">
                    🛡️ CONTRAT DIRECT SÉCURISÉ & INDRIVE STYLE
                  </span>
                  <h1 className="font-display font-black text-xl md:text-3xl tracking-tight text-white mt-1">
                    Le Prix Juste, Décidé par Vous-Même.
                  </h1>
                  <p className="text-xs text-slate-450 mt-1 max-w-xl leading-normal">
                    Fini les tarifs imposés fixes ! Sélectionnez un véhicule, proposez votre budget journalier, négociez en direct avec le propriétaire/vitesse de validation IA de l'agence.
                  </p>
                </div>
              </div>

              {/* Grid Layout of Car Assets */}
              {cars.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-slate-850 rounded-3xl bg-slate-900/20">
                  <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                  <p className="text-slate-400 font-bold mb-1">Aucun véhicule ne correspond aux critères.</p>
                  <p className="text-xs text-slate-500">Essayez de filtrer sur une autre ville marocaine ou de réinitialiser la recherche.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                  {cars.map((car, index) => (
                    <motion.div
                      key={car.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      id={`car_preview_card_${car.id}`}
                      className="group bg-slate-900 border border-slate-850/80 rounded-3xl overflow-hidden hover:border-brand-gold-500/30 hover:shadow-xl hover:shadow-brand-gold-500/5 transition-all flex flex-col flex-1"
                    >
                      {/* Clickable Card Body which launches show details */}
                      <div 
                        onClick={() => setSelectedCarForDetails(car)} 
                        className="cursor-pointer flex flex-col flex-1 group/card"
                        id={`car_preview_clickable_zone_${car.id}`}
                        title="Cliquer pour afficher la fiche technique"
                      >
                        {/* Thumbnail frame with city banner */}
                        <div className="relative aspect-[16/10] overflow-hidden bg-slate-950">
                          <img 
                            src={car.imageUrl} 
                            alt={`${car.make} ${car.model}`} 
                            className="w-full h-full object-cover group-hover:scale-105 group-hover/card:scale-105 transition-all duration-500" 
                          />
                          
                          {/* Hover action banner overlay */}
                          <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/card:opacity-100 flex items-center justify-center transition-all duration-300">
                            <span className="bg-slate-900/90 border border-slate-750 backdrop-blur px-3.5 py-1.5 rounded-xl font-display font-extrabold text-[11px] text-brand-gold-500 tracking-wide shadow-lg flex items-center gap-1.5">
                              🔍 Consulter Détails
                            </span>
                          </div>

                          {/* City Marker label */}
                          <div className="absolute top-3 left-3 bg-slate-950/80 border border-slate-800/80 backdrop-blur-md px-2.5 py-1 rounded-lg flex items-center gap-1.5 text-[10px] text-slate-350 font-bold">
                            <MapPin className="w-3 h-3 text-brand-gold-500" />
                            <span>{car.city}</span>
                          </div>

                          {/* Top corner review score */}
                          <div className="absolute top-3 right-3 bg-brand-gold-500/90 text-slate-950 px-2.5 py-1 rounded-lg flex items-center gap-1 text-[10.5px] font-bold font-display shadow shadow-brand-gold-500/30">
                            <span>★</span>
                            <span>{car.rating}</span>
                          </div>
                        </div>

                        {/* Info Details details */}
                        <div className="p-4 sm:p-5 flex flex-col flex-1 gap-3 sm:gap-4">
                          
                          <div>
                            <div className="flex justify-between items-baseline">
                              <span className="text-[10px] uppercase font-mono tracking-wider font-semibold text-brand-gold-500">
                                {car.category} • {car.transmission}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono">{car.year}</span>
                            </div>
                            <h3 className="font-display font-extrabold text-[#ffffff] text-base group-hover/card:text-brand-gold-500 transition-colors mt-0.5">
                              {car.make} {car.model}
                            </h3>
                          </div>

                          {/* Specific specs highlights */}
                          <div className="flex flex-wrap gap-1.5 text-[10px] text-slate-400 font-mono">
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850">{car.fuel}</span>
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850">{car.seats} places</span>
                            <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-850">Assurance Incluse</span>
                          </div>

                        </div>
                      </div>

                      {/* Pricing section with negotiation trigger buttons */}
                      <div className="p-4 sm:p-5 pt-0 mt-auto">
                        <div className="border-t border-slate-850/80 pt-4 flex items-center justify-between gap-2.5 flex-wrap xs:flex-nowrap">
                          <div>
                            <span className="text-[9px] text-slate-500 font-mono uppercase block">Tarif indicatif</span>
                            <strong className="text-[#ffffff] font-mono text-base sm:text-lg font-extrabold">
                              {car.basePrice} <span className="text-xs font-normal">MAD/j</span>
                            </strong>
                          </div>

                          <div className="flex gap-1 sm:gap-1.5 flex-wrap xs:flex-nowrap">
                            {/* Standard direct booking (without chat) */}
                            <button
                              onClick={() => handleOpenStandardBooking(car)}
                              className="px-2.5 sm:px-3 py-1.5 sm:py-2 text-[10.5px] sm:text-[11px] font-display font-bold border border-slate-800 hover:border-slate-700 bg-slate-950 text-slate-300 hover:text-white rounded-xl cursor-pointer transition-all"
                            >
                              Standard
                            </button>

                            {/* Direct live bidding (with negotiation simulation) */}
                            <button
                              onClick={() => handleOpenNegotiation(car)}
                              className="px-3 sm:px-4 py-1.5 sm:py-2 text-[10.5px] sm:text-[11px] font-display font-extrabold bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 rounded-xl cursor-pointer shadow hover:shadow-brand-gold-500/15 transition-all"
                            >
                              🤝 Négocier
                            </button>
                          </div>
                        </div>

                      </div>
                    </motion.div>
                  ))}
                </div>
              )}

            </div>

          </div>
        ) : (
          // VIEW 2: PERSONAL SPACE / DASHBOARD
          <div className="flex flex-col gap-4">
            {currentUser?.role === 'agency' ? (
              // AGENCY MODULE
              <AgencyDashboard
                currentUser={currentUser}
                cars={cars}
                bookings={bookings}
                onOpenAddCarModal={() => setShowAddCarModal(true)}
                onUpdateBookingStatus={handleUpdateBookingStatus}
              />
            ) : (
              // RENTER CLIENT MODULE
              <RenterDashboard
                currentUser={currentUser}
                bookings={bookings}
                negotiations={negotiations}
                cars={cars}
                onOpenNegotiationChat={handleOpenNegotiation}
                onCancelBooking={handleCancelBooking}
              />
            )}
          </div>
        )}

      </main>

      {/* Global footer detail banner */}
      <footer className="bg-slate-950 border-t border-slate-900 py-8 mt-auto text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-1.5 font-display text-slate-350">
            <CarIcon className="w-4 h-4 text-brand-gold-500" />
            <span className="font-extrabold text-sm uppercase">Khtaar<span className="text-brand-gold-500">Car</span> Maroc</span>
          </div>
          <p>© 2026 KhtaarCar. La première place de négociation directe automobile au Maroc. Bahja, Casablanca, Rabat, Agadir.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300">CGU</a>
            <a href="#" className="hover:text-slate-300">Confidentialité</a>
            <a href="#" className="hover:text-slate-300">Aide & Support</a>
          </div>
        </div>
      </footer>

      {/* Dynamic Popups & Modals triggers */}
      <AnimatePresence>
        
        {/* Auth modal toggle */}
        {showAuthModal && (
          <AuthModal
            onClose={() => setShowAuthModal(false)}
            onLoginSuccess={(user) => {
              setCurrentUser(user);
              fetchBookings();
              fetchNotifications();
            }}
          />
        )}

        {/* Live negotiation interactive panel */}
        {activeCarForNegotiation && currentUser && (
          <NegotiationModal
            car={activeCarForNegotiation}
            currentUser={currentUser}
            onClose={() => setActiveCarForNegotiation(null)}
            onNegotiationSuccess={(neg) => {
              // Store accepted state details and toggle payment panel
              setActiveNegotiationForCheckout(neg);
              setActiveCarForCheckout(activeCarForNegotiation);
              
              // Clean up dialog states
              setActiveCarForNegotiation(null);
            }}
          />
        )}

        {/* 4-step modular booking payment checkout */}
        {activeCarForCheckout && currentUser && (
          <CheckoutModal
            car={activeCarForCheckout}
            negotiation={activeNegotiationForCheckout}
            currentUser={currentUser}
            onClose={() => {
              setActiveCarForCheckout(null);
              setActiveNegotiationForCheckout(null);
            }}
            onBookingSuccess={() => {
              // Reservation registered successfully!
              fetchBookings();
              fetchNotifications();
              
              // Reset checkout dialog
              setActiveCarForCheckout(null);
              setActiveNegotiationForCheckout(null);

              // Instantly navigate to dashboard to show booking receipt to renter !
              setViewMode('dashboard');
            }}
          />
        )}

        {/* Add car registration form */}
        {showAddCarModal && currentUser && (
          <AddCarModal
            currentUser={currentUser}
            onClose={() => setShowAddCarModal(false)}
            onCarAdded={(car) => {
              fetchCars();
              fetchNotifications();
              setShowAddCarModal(false);
            }}
          />
        )}

        {/* Detailed Car Specifications & Multi-Photo View */}
        {selectedCarForDetails && (
          <CarDetailsModal
            car={selectedCarForDetails}
            onClose={() => setSelectedCarForDetails(null)}
            onStartBooking={(car) => {
              setSelectedCarForDetails(null);
              handleOpenStandardBooking(car);
            }}
            onStartNegotiation={(car) => {
              setSelectedCarForDetails(null);
              handleOpenNegotiation(car);
            }}
          />
        )}

      </AnimatePresence>

    </div>
  );
}
