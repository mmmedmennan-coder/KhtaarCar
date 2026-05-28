import { useEffect, useRef, useState } from "react";
import { MapPin, Sparkles, Navigation, Layers, Compass, ZoomIn, ZoomOut, Check } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import L from "leaflet";

interface MoroccoMapProps {
  selectedCity: string;
  onSelectCity: (city: string) => void;
  carCountsByCity: { [key: string]: number };
}

interface CityInfo {
  name: string;
  label: string;
  lat: number;
  lng: number;
  desc: string;
}

const CITIES_DATA: CityInfo[] = [
  { name: "Tangier", label: "Tanger (Tanja)", lat: 35.7595, lng: -5.8339, desc: "Porte de l'Europe & Detroit" },
  { name: "Fes", label: "Fès", lat: 34.0181, lng: -5.0078, desc: "Capitale Impériale & Historique" },
  { name: "Rabat", label: "Rabat", lat: 34.0208, lng: -6.8416, desc: "Capitale Administrative & Jardins" },
  { name: "Casablanca", label: "Casablanca", lat: 33.5731, lng: -7.5898, desc: "Pôle Économique & Métropole Cosmapolite" },
  { name: "Marrakech", label: "Marrakech", lat: 31.6295, lng: -7.9811, desc: "La Cité Ocre au pied de l'Atlas" },
  { name: "Agadir", label: "Agadir", lat: 30.4278, lng: -9.5981, desc: "Marina Dorée & Climat Ensoleillé" },
];

export default function MoroccoMap({ selectedCity, onSelectCity, carCountsByCity }: MoroccoMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const [hoveredCityData, setHoveredCityData] = useState<CityInfo | null>(null);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize the Map object helper
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapRef.current) {
      // Set boundary bounds for Morocco to avoid drifting too far
      const southWest = L.latLng(20.0, -18.0);
      const northEast = L.latLng(38.0, -1.0);
      const bounds = L.latLngBounds(southWest, northEast);

      const map = L.map(mapContainerRef.current, {
        center: [31.7917, -7.0926], // Centered beautifully in central Morocco
        zoom: 5.5,
        minZoom: 4.8,
        maxZoom: 12,
        zoomControl: false, // We'll render custom high-fidelity zoom controls
        attributionControl: false,
        maxBounds: bounds,
        maxBoundsViscosity: 0.8,
      });

      // Add CartoDB Dark Matter tile layer aligning perfectly with the slate aesthetic
      L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
        maxZoom: 14,
        attribution: '&copy; CartoDB &copy; OpenStreetMap'
      }).addTo(map);

      mapRef.current = map;
      setMapLoaded(true);
    }

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = {};
        setMapLoaded(false);
      }
    };
  }, []);

  // Update dynamic custom markers when variables shift
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    // Clear previous elements
    (Object.values(markersRef.current) as L.Marker[]).forEach((marker) => marker.remove());
    markersRef.current = {};

    CITIES_DATA.forEach((city) => {
      const isSelected = selectedCity === city.name;
      const count = carCountsByCity[city.name] || 0;

      // Construct customizable HTML for the Marker using Tailwind styling
      const pulseHtml = `
        <div class="relative flex items-center justify-center cursor-pointer pointer-events-auto" style="transform: translate(-10px, -10px);">
          <!-- Wave Rings for Active/Selected selection -->
          ${isSelected ? `
            <div class="absolute w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 animate-ping" style="animation-duration: 2.2s;"></div>
            <div class="absolute w-8 h-8 rounded-full bg-amber-500/15 border border-amber-500/30 animate-pulse" style="animation-duration: 1.6s;"></div>
          ` : count > 0 ? `
            <div class="absolute w-6 h-6 rounded-full bg-emerald-500/5 animate-pulse" style="animation-duration: 3s;"></div>
          ` : ''}

          <!-- Outer Gold Indicator Ring -->
          <div class="relative flex items-center justify-center w-5 h-5 rounded-full transition-all duration-300 ${
            isSelected 
              ? 'bg-amber-500 border-2 border-slate-950 shadow-[0_0_15px_rgba(186,117,23,0.8)] scale-125 z-[100]' 
              : count > 0 
                ? 'bg-emerald-600 border border-slate-900 hover:bg-amber-500 hover:scale-110 shadow-md' 
                : 'bg-slate-800 border border-slate-700 hover:bg-slate-600 hover:scale-115'
          }">
            <!-- Inner white dot or car number indicator -->
            ${count > 0 ? `
              <span class="text-[8px] font-mono font-black text-white px-0.5 leading-none">${count}</span>
            ` : `
              <div class="w-1.5 h-1.5 ${isSelected ? 'bg-slate-950' : 'bg-slate-400'} rounded-full transition-colors"></div>
            `}
          </div>

          <!-- Premium gold badge container -->
          <div class="absolute top-6 flex flex-col items-center select-none">
            <div class="whitespace-nowrap px-2 py-0.5 rounded-lg border text-[10px] font-bold tracking-tight shadow-lg transition-all duration-300 ${
              isSelected
                ? 'bg-amber-500 text-slate-950 border-amber-400 font-black scale-105 z-[120]'
                : 'bg-slate-950/90 text-slate-350 border-slate-850 hover:bg-slate-800 hover:text-white'
            }">
              <span>${city.name}</span>
            </div>
          </div>
        </div>
      `;

      const customIcon = L.divIcon({
        html: pulseHtml,
        className: `custom-app-city-pin-${city.name}`, // clean identifier
        iconSize: [20, 20],
        iconAnchor: [10, 10],
      });

      const marker = L.marker([city.lat, city.lng], { icon: customIcon }).addTo(map);

      // Link event callbacks
      marker.on("click", () => {
        onSelectCity(city.name);
      });

      marker.on("mouseover", () => {
        setHoveredCityData(city);
      });

      markersRef.current[city.name] = marker;
    });
  }, [selectedCity, carCountsByCity, mapLoaded]);

  // Handle flying-camera movements and viewport boundaries on selection
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !mapLoaded) return;

    if (selectedCity === "Toutes les villes") {
      map.flyTo([31.7917, -7.0926], 5.5, {
        animate: true,
        duration: 1.2,
      });
    } else {
      const city = CITIES_DATA.find((c) => c.name === selectedCity);
      if (city) {
        map.flyTo([city.lat, city.lng], 8.2, {
          animate: true,
          duration: 1.4,
        });
      }
    }
  }, [selectedCity, mapLoaded]);

  // Map view trigger controls
  const handleZoomIn = () => {
    mapRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapRef.current?.zoomOut();
  };

  const handleResetMap = () => {
    onSelectCity("Toutes les villes");
  };

  return (
    <div id="morocco_map_wrapper" className="relative bg-brand-dark-600/40 border border-slate-800 rounded-3xl p-4 sm:p-6 overflow-hidden backdrop-blur-md flex flex-col items-center">
      {/* Dynamic Header */}
      <div className="w-full flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-brand-gold-500 animate-ping shrink-0" />
          <h3 className="font-display font-semibold text-lg text-slate-100 flex items-center gap-1.5">
            Carte Interactive Réelle
          </h3>
        </div>
        <div className="text-[10px] sm:text-xs bg-brand-gold-500/10 text-brand-gold-100 flex items-center gap-1 px-2.5 py-1 rounded-full border border-brand-gold-500/20 font-bold shrink-0">
          <Sparkles className="w-3 h-3 text-brand-gold-500" />
          <span>Morocco Live</span>
        </div>
      </div>

      <p className="text-xs text-slate-400 mb-4 text-center lg:text-left self-stretch">
        Explorez de véritables coordonnées géographiques. Cliquez sur un pôle régional marocain pour focaliser l'offre disponible.
      </p>

      {/* Real Map Stage Frame */}
      <div className="relative w-full h-[360px] rounded-2xl overflow-hidden border border-slate-850/80 bg-slate-950/90 shadow-inner group">
        
        {/* Leaflet container */}
        <div ref={mapContainerRef} className="w-full h-full z-0 pointer-events-auto" />

        {/* Dynamic Compass / Tech Overlay icon */}
        <div className="absolute top-3 right-3 p-2 bg-slate-900/90 border border-slate-800 rounded-xl pointer-events-none z-[400] flex items-center justify-center shadow-lg">
          <Compass className="w-4 h-4 text-brand-gold-500/80 animate-spin-slow" style={{ animationDuration: '10s' }} />
        </div>

        {/* Premium Interactive Map Controls */}
        <div className="absolute bottom-3 left-3 z-[410] flex flex-col gap-1.5 pointer-events-auto">
          <button
            onClick={handleZoomIn}
            className="w-8 h-8 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800 hover:border-brand-gold-500/30 font-semibold text-sm flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
            title="Zoom +"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="w-8 h-8 rounded-lg bg-slate-900/95 border border-slate-800 text-slate-350 hover:text-white hover:bg-slate-800 hover:border-brand-gold-500/30 font-semibold text-sm flex items-center justify-center cursor-pointer transition-all shadow-md active:scale-95"
            title="Zoom -"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
        </div>

        {/* Hovered marker description panel */}
        <AnimatePresence>
          {hoveredCityData && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              transition={{ duration: 0.2 }}
              onMouseLeave={() => setHoveredCityData(null)}
              className="absolute bottom-3 right-3 left-13 sm:left-auto sm:max-w-xs bg-slate-900/95 border border-slate-800 p-3 rounded-xl shadow-2xl backdrop-blur z-[420] pointer-events-auto flex flex-col transition-all cursor-pointer"
              onClick={() => onSelectCity(hoveredCityData.name)}
            >
              <div className="flex justify-between items-center mb-1">
                <span className="font-display font-extrabold text-xs text-amber-500 uppercase tracking-wide flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {hoveredCityData.label}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {carCountsByCity[hoveredCityData.name] || 0} voiture{(carCountsByCity[hoveredCityData.name] || 0) !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-[10px] text-slate-300 leading-snug">{hoveredCityData.desc}</p>
              <span className="text-[9px] text-amber-500/60 font-mono mt-1.5 block hover:text-amber-400 transition-colors">
                ⚡ Cliquer pour filtrer les véhicules disponibles
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Selected City Panel (if chosen) */}
        {selectedCity !== "Toutes les villes" && (
          <div className="absolute top-3 left-3 bg-slate-900/95 border border-slate-800/80 px-3 py-1.5 rounded-xl text-[10.5px] font-medium text-slate-300 flex items-center gap-2 z-[400] shadow-md animate-fade-in backdrop-blur">
            <span className="w-1.5 h-1.5 bg-amber-500 rounded-full animate-pulse" />
            <span>Focalisé sur <strong>{selectedCity}</strong></span>
          </div>
        )}
      </div>

      {/* Control bar / Reset option */}
      <div className="w-full flex justify-between items-center mt-3.5 gap-2 flex-wrap">
        <span className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
          Double-cliquez pour faire glisser la carte
        </span>
        {selectedCity !== "Toutes les villes" && (
          <button
            onClick={handleResetMap}
            className="text-[11px] font-bold text-brand-gold-500 hover:text-white transition-colors flex items-center gap-1.5 bg-brand-gold-500/5 hover:bg-brand-gold-500/10 px-3 py-1.5 rounded-xl border border-brand-gold-500/15 cursor-pointer"
          >
            <span>Réinitialiser la carte des villes 🇲🇦</span>
          </button>
        )}
      </div>
    </div>
  );
}
