import { useState } from "react";
import { X, Sliders, CheckSquare, Plus, Check, Info, Sparkles, Trash } from "lucide-react";
import { Car } from "../types";

interface AddCarModalProps {
  currentUser: any;
  onClose: () => void;
  onCarAdded: (car: Car) => void;
}

export default function AddCarModal({ currentUser, onClose, onCarAdded }: AddCarModalProps) {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Form states
  const [make, setMake] = useState<string>("Volkswagen");
  const [model, setModel] = useState<string>("T-Roc");
  const [year, setYear] = useState<number>(2023);
  const [category, setCategory] = useState<'SUV' | 'Luxury' | 'Sedan' | 'Economy' | 'Electric'>('SUV');
  const [transmission, setTransmission] = useState<'Automatic' | 'Manual'>('Automatic');
  const [fuel, setFuel] = useState<'Diesel' | 'Gasoline' | 'Electric' | 'Hybrid'>('Diesel');
  const [seats, setSeats] = useState<number>(5);
  const [city, setCity] = useState<string>("Casablanca");
  
  const [basePrice, setBasePrice] = useState<number>(500);
  const [minPrice, setMinPrice] = useState<number>(400);
  
  const [imageUrl, setImageUrl] = useState<string>("https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1000");
  const [images, setImages] = useState<string[]>([
    "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
    "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000"
  ]);
  
  const [featuresList, setFeaturesList] = useState<{ [key: string]: boolean }>({
    "Climatisation": true,
    "GPS Maroc": true,
    "Assurance Tous Risques": true,
    "Bluetooth": true,
    "Apple CarPlay": true,
    "Toit Panoramique": false,
    "Caméra de Recul": false,
  });

  const handleToggleFeature = (f: string) => {
    setFeaturesList({ ...featuresList, [f]: !featuresList[f] });
  };

  const handleNextStep = () => {
    if (step < 4) setStep(step + 1);
  };

  const handlePrevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleAddSubmit = async () => {
    setIsLoading(true);
    const selectedFeaturesArray = Object.keys(featuresList).filter(k => featuresList[k]);
    try {
      const response = await fetch("/api/cars", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          make,
          model,
          year,
          category,
          transmission,
          fuel,
          seats,
          city,
          basePrice,
          minPrice,
          imageUrl,
          images,
          features: selectedFeaturesArray,
          agencyId: currentUser?.agencyId || "agency_1",
          agencyName: currentUser?.name || "Atlas Drive Maroc"
        })
      });

      if (!response.ok) throw new Error("Erreur de sauvegarde de voiture");
      const addedData: Car = await response.json();
      onCarAdded(addedData);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="add_car_modal" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header Block */}
        <div className="p-6 border-b border-slate-850 bg-slate-900/50 backdrop-blur flex justify-between items-center flex-wrap gap-4">
          <div>
            <span className="text-xs text-brand-gold-500 font-mono tracking-wider">
              ENREGISTRER FLOTTE • ÉTAPE {step} DE 4
            </span>
            <h2 className="font-display font-bold text-lg text-slate-100 mt-1">
              {step === 1 && "Fiche Technique du Véhicule"}
              {step === 2 && "Politique Tarifaire & Seuil IA"}
              {step === 3 && "Équipements & Options de Confort"}
              {step === 4 && "Photos & Validation KhtaarCar"}
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
                  step >= i ? "bg-brand-gold-500" : "bg-slate-850"
                }`}
              />
            ))}
          </div>
        </div>

        {/* Form Body Container */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-5 text-sm">
          
          {step === 1 && (
            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Marque</span>
                  <input
                    type="text"
                    value={make}
                    onChange={(e) => setMake(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Modèle</span>
                  <input
                    type="text"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Année de mise en circulation</span>
                  <input
                    type="number"
                    value={year}
                    onChange={(e) => setYear(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Ville de dépôt</span>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-200 outline-none cursor-pointer"
                  >
                    <option value="Casablanca">Casablanca</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Agadir">Agadir</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Tangier">Tanger</option>
                    <option value="Fes">Fès</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Transmission</span>
                  <select
                    value={transmission}
                    onChange={(e) => setTransmission(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300 outline-none cursor-pointer text-xs"
                  >
                    <option value="Automatic">Automatique</option>
                    <option value="Manual">Manuelle</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Carburant</span>
                  <select
                    value={fuel}
                    onChange={(e) => setFuel(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300 outline-none cursor-pointer text-xs"
                  >
                    <option value="Diesel">Diesel</option>
                    <option value="Gasoline">Essence</option>
                    <option value="Electric">Électrique</option>
                    <option value="Hybrid">Hybride</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1">
                  <span className="text-xs text-slate-400">Catégorie</span>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-slate-300 outline-none cursor-pointer text-xs"
                  >
                    <option value="SUV">SUV</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Sedan">Berline</option>
                    <option value="Economy">Économique</option>
                    <option value="Electric">Électrique</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="flex flex-col gap-4">
              <div className="bg-slate-950/60 p-4 border border-slate-800/80 rounded-2xl flex gap-3 text-xs leading-relaxed text-slate-400">
                <Info className="w-5 h-5 text-brand-gold-500 shrink-0" />
                <span>
                  <strong>La Négociation Directe de KhtaarCar</strong> fonctionne à l'aide d'un double seuil. Indiquez le prix d'affichage standard (tarifs conseillés), et le prix confidentiel d'acceptation automatique de notre IA de négociation.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-slate-400 font-semibold">Prix D'affichage Standard (MAD/jour)</span>
                  <input
                    type="number"
                    value={basePrice}
                    onChange={(e) => setBasePrice(Number(e.target.value))}
                    className="bg-slate-950 border border-slate-850 font-mono text-brand-gold-500 font-bold rounded-xl px-3 py-3"
                  />
                  <span className="text-[10px] text-slate-500">Exposé publiquement dans le catalogue standard de recherche.</span>
                </div>
                <div className="flex flex-col gap-1.5">
                  <span className="text-xs text-brand-gold-500 font-bold flex items-center gap-1">
                    🔒 Prix Seuil Minimum IA Confidential
                  </span>
                  <input
                    type="number"
                    value={minPrice}
                    onChange={(e) => setMinPrice(Number(e.target.value))}
                    className="bg-slate-950 border-brand-gold-500/20 font-mono text-emerald-400 font-bold rounded-xl px-3 py-3 border"
                  />
                  <span className="text-[10px] text-slate-500">Le prix le plus bas que KhtaarCar Bot acceptera automatiquement dans les chats.</span>
                </div>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="flex flex-col gap-4">
              <span className="text-xs text-slate-400">Cochez les options incluses d'origine :</span>
              <div className="grid grid-cols-2 gap-3">
                {Object.keys(featuresList).map((feature) => (
                  <div
                    key={feature}
                    onClick={() => handleToggleFeature(feature)}
                    className={`p-3.5 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${
                      featuresList[feature]
                        ? "bg-brand-gold-500/10 border-brand-gold-500/40 text-slate-200"
                        : "bg-slate-950 border-slate-850/80 text-slate-500"
                    }`}
                  >
                    <span className="text-xs font-medium">{feature}</span>
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      featuresList[feature] ? "bg-brand-gold-500 border-brand-gold-500 text-slate-950" : "border-slate-800"
                    }`}>
                      {featuresList[feature] && <Check className="w-3 h-3 stroke-[3]" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="flex flex-col gap-4 overflow-y-auto max-h-[50vh] pr-1">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-slate-350 tracking-wider">PHOTOS DU VÉHICULE (3 à 5 ALBUMS)</span>
                <span className="text-[10px] font-mono text-brand-gold-500 font-bold">{images.length} / 5 PHOTOS</span>
              </div>
              
              <div className="flex flex-col gap-3">
                {images.map((img, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <div className="bg-slate-950 border border-slate-800 text-slate-400 text-[10px] font-mono rounded-xl w-8 h-8 flex items-center justify-center shrink-0 font-bold">
                      #{idx + 1}
                    </div>
                    <input
                      type="text"
                      value={img}
                      placeholder={`URL de la Photo ${idx + 1}`}
                      onChange={(e) => {
                        const updated = [...images];
                        updated[idx] = e.target.value;
                        setImages(updated);
                        if (idx === 0) setImageUrl(e.target.value);
                      }}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 font-mono flex-1 min-w-0"
                    />
                    {images.length > 3 && (
                      <button
                        type="button"
                        onClick={() => {
                          const updated = images.filter((_, i) => i !== idx);
                          setImages(updated);
                          if (idx === 0 && updated.length > 0) setImageUrl(updated[0]);
                        }}
                        className="p-2 bg-red-950/20 hover:bg-red-950/40 border border-red-900/30 text-red-400 rounded-xl cursor-pointer shrink-0 animate-fade-in"
                        title="Supprimer cette photo"
                      >
                        <Trash className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                ))}
              </div>

              {images.length < 5 && (
                <button
                  type="button"
                  onClick={() => {
                    setImages([...images, "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000"]);
                  }}
                  className="py-2.5 px-3 border border-dashed border-brand-gold-500/20 bg-brand-gold-500/5 hover:bg-brand-gold-500/10 text-brand-gold-500 text-xs font-bold rounded-xl cursor-pointer text-center transition-all"
                >
                  + Ajouter une Photo Additionnelle
                </button>
              )}

              <div className="mt-2 text-center border-2 border-dashed border-slate-850 p-4 rounded-2xl bg-slate-950/40 animate-fade-in">
                <div className="flex justify-center gap-1.5 flex-wrap">
                  {images.map((img, idx) => (
                    <img 
                      key={idx} 
                      src={img} 
                      alt={`preview_${idx}`} 
                      className="h-12 w-16 object-cover rounded-lg border border-slate-800 shadow" 
                      referrerPolicy="no-referrer"
                    />
                  ))}
                </div>
                <span className="text-[10px] text-slate-500 font-mono block mt-2">Vérification de cadrage KhtaarCar - OK</span>
              </div>
            </div>
          )}

        </div>

        {/* Actions Bar */}
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
              className="px-6 py-3 text-xs font-display font-medium rounded-xl bg-brand-gold-500 hover:bg-brand-gold-600 text-slate-950 cursor-pointer shadow hover:shadow-brand-gold-500/10 transition-all ml-auto"
            >
              Suivant
            </button>
          ) : (
            <button
              onClick={handleAddSubmit}
              disabled={isLoading}
              className="px-8 py-3.5 text-xs font-display font-extrabold rounded-xl bg-emerald-400 hover:bg-emerald-500 text-slate-950 cursor-pointer shadow-lg shadow-emerald-500/20 transition-all ml-auto flex items-center gap-1.5"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>Enregistrer l'Auto</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
