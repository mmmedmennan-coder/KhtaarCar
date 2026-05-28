import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import { User, Agency, Car, Booking, Negotiation, Message, Review, Notification } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State for Full Demo Persistence
let db = {
  users: [
    {
      id: "usr_renter",
      email: "renter@khtaarcar.ma",
      name: "Med Amine",
      phone: "+212 612-345678",
      role: "renter" as const,
      verified: true,
      documents: {
        cinFront: "cin_front.jpg",
        cinBack: "cin_back.jpg",
        licenseFront: "license_front.jpg",
        licenseBack: "license_back.jpg",
        status: "verified" as const
      }
    },
    {
      id: "usr_agency",
      email: "agency@khtaarcar.ma",
      name: "Khalid Mansouri",
      phone: "+212 698-765432",
      role: "agency" as const,
      agencyId: "agency_1",
      verified: true,
      documents: {
        cinFront: "cin_agency.jpg",
        cinBack: "cin_agency_back.jpg",
        licenseFront: "license_agency.jpg",
        licenseBack: "license_agency_back.jpg",
        status: "verified" as const
      }
    }
  ] as User[],
  agencies: [
    {
      id: "agency_1",
      name: "Atlas Drive Maroc",
      phone: "+212 522-458921",
      city: "Casablanca",
      verified: true,
      rating: 4.8,
      totalReviews: 32,
      logoUrl: "https://images.unsplash.com/photo-1560179707-f14e90ef3623?auto=format&fit=crop&q=80&w=200"
    },
    {
      id: "agency_2",
      name: "Bahja Rent Marrakech",
      phone: "+212 524-331290",
      city: "Marrakech",
      verified: true,
      rating: 4.9,
      totalReviews: 18,
      logoUrl: "https://images.unsplash.com/photo-1516880711640-ef7db81be3e1?auto=format&fit=crop&q=80&w=200"
    }
  ] as Agency[],
  cars: [
    {
      id: "car_1",
      make: "Range Rover",
      model: "Sport SVR Edition",
      year: 2024,
      category: "SUV" as const,
      transmission: "Automatic" as const,
      fuel: "Diesel" as const,
      seats: 5,
      city: "Marrakech",
      agencyId: "agency_2",
      agencyName: "Bahja Rent Marrakech",
      basePrice: 1250, // MAD/day
      minPrice: 950,   // Minimum acceptable negotiation price
      imageUrl: "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1000",
      images: [
        "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000"
      ],
      features: ["Panoramic Sunroof", "Laser Lights", "Fridge", "GPS Navigation Map", "3D Camera", "Morocco Offroad Pack", "22\" Rims"],
      rating: 4.9,
      reviewsCount: 15
    },
    {
      id: "car_2",
      make: "Dacia",
      model: "Sandero Stepway Extreme",
      year: 2023,
      category: "Economy" as const,
      transmission: "Manual" as const,
      fuel: "Diesel" as const,
      seats: 5,
      city: "Casablanca",
      agencyId: "agency_1",
      agencyName: "Atlas Drive Maroc",
      basePrice: 350,  // MAD/day
      minPrice: 280,
      imageUrl: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000", // Sleek modern hatch
      images: [
        "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1583121274602-3e2820c69888?auto=format&fit=crop&q=80&w=1000"
      ],
      features: ["Fuel Efficient", "Touch Screen", "Apple CarPlay", "Air Conditioning", "USB Charger", "Bluetooth"],
      rating: 4.7,
      reviewsCount: 22
    },
    {
      id: "car_3",
      make: "Mercedes-Benz",
      model: "C-Class Coupe AMG",
      year: 2023,
      category: "Luxury" as const,
      transmission: "Automatic" as const,
      fuel: "Gasoline" as const,
      seats: 4,
      city: "Casablanca",
      agencyId: "agency_1",
      agencyName: "Atlas Drive Maroc",
      basePrice: 900,  // MAD/day
      minPrice: 750,
      imageUrl: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1000",
      images: [
        "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1555215695-3004980ad54e?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000"
      ],
      features: ["AMG Sport Package", "Burmester Surround Sound", "Ambient Lighting 64 Colors", "Active Braking Assist", "Cruise Control"],
      rating: 4.8,
      reviewsCount: 8
    },
    {
      id: "car_4",
      make: "Tesla",
      model: "Model Y Dual Motor",
      year: 2023,
      category: "Electric" as const,
      transmission: "Automatic" as const,
      fuel: "Electric" as const,
      seats: 5,
      city: "Rabat",
      agencyId: "agency_1",
      agencyName: "Atlas Drive Maroc",
      basePrice: 1100, // MAD/day
      minPrice: 850,
      imageUrl: "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1000",
      images: [
        "https://images.unsplash.com/photo-1619767886558-efdc259cde1a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1536700503338-e5ba2be2c19a?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1614162692292-7ac56d7f7f1e?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?auto=format&fit=crop&q=80&w=1000"
      ],
      features: ["Autopilot Active", "Supercharger Enabled", "Premium Audio", "Heated Seats Overall", "15\" Cinema Screen"],
      rating: 4.9,
      reviewsCount: 5
    },
    {
      id: "car_5",
      make: "Volkswagen",
      model: "Golf 8 R-Line",
      year: 2023,
      category: "Sedan" as const,
      transmission: "Automatic" as const,
      fuel: "Diesel" as const,
      seats: 5,
      city: "Tangier",
      agencyId: "agency_1",
      agencyName: "Atlas Drive Maroc",
      basePrice: 550,  // MAD/day
      minPrice: 450,
      imageUrl: "https://images.unsplash.com/photo-1611245801314-e0e5d10d8a28?auto=format&fit=crop&q=80&w=1000",
      images: [
        "https://images.unsplash.com/photo-1611245801314-e0e5d10d8a28?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1542282088-fe8426682b8f?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1525609004556-c46c7d6cf0a3?auto=format&fit=crop&q=80&w=1000"
      ],
      features: ["Digital Cockpit", "IQ.Light Matrix", "Panoramic Roof", "Sport Seats", "Keyless Entry", "Adaptive Cruise Control"],
      rating: 4.6,
      reviewsCount: 19
    },
    {
      id: "car_6",
      make: "Toyota",
      model: "Prado TX-L V6",
      year: 2022,
      category: "SUV" as const,
      transmission: "Automatic" as const,
      fuel: "Diesel" as const,
      seats: 7,
      city: "Agadir",
      agencyId: "agency_2",
      agencyName: "Bahja Rent Marrakech",
      basePrice: 950,  // MAD/day
      minPrice: 790,
      imageUrl: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
      images: [
        "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&q=80&w=1000",
        "https://images.unsplash.com/photo-1606016159991-dfe4f2746ad5?auto=format&fit=crop&q=80&w=1000"
      ],
      features: ["4x4 Active Drive", "7 Comfort Seats", "Roof Rack", "Coolbox Compartment", "Premium Sound System", "Sand/Mud Traction Control"],
      rating: 4.8,
      reviewsCount: 12
    }
  ] as Car[],
  bookings: [
    {
      id: "b_1",
      carId: "car_2",
      carModel: "Dacia Sandero Stepway Extreme",
      carImage: "https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&q=80&w=1000",
      renterId: "usr_renter",
      renterName: "Med Amine",
      agencyId: "agency_1",
      agencyName: "Atlas Drive Maroc",
      startDate: "2026-06-01",
      endDate: "2026-06-05",
      pricePerDay: 320,
      totalPrice: 1280,
      status: "confirmed" as const,
      paymentMethod: "card" as const,
      paymentStatus: "paid" as const,
      negotiationId: "neg_pre_1"
    }
  ] as Booking[],
  negotiations: [] as Negotiation[],
  messages: [] as Message[],
  notifications: [
    {
      id: "notif_1",
      title: "Bienvenue sur KhtaarCar!",
      message: "Votre compte a été vérifié ainsi que vos documents (CIN & Permis). Louez en toute confiance.",
      timestamp: new Date().toISOString(),
      read: false,
      type: "auth" as const
    },
    {
      id: "notif_2",
      title: "Réservation confirmée ✅",
      message: "Atlas Drive Maroc a validé votre réservation sur la Dacia Sandero du 01 juin au 05 juin.",
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      read: false,
      type: "booking" as const
    }
  ] as Notification[],
  reviews: [
    {
      id: "rev_1",
      carId: "car_1",
      renterName: "Anas Belkhdir",
      rating: 5,
      text: "Superbe voiture, impeccable pour un voyage sur Marrakech. L'agence était hyper réactive, et le fait de pouvoir négocier directement m'a fait économiser un bon montant !",
      date: "2026-05-15",
      reply: "Merci beaucoup Anas ! À votre service pour votre prochain séjour."
    },
    {
      id: "rev_2",
      carId: "car_2",
      renterName: "Sophia Tazi",
      rating: 4.5,
      text: "Voiture très économique et propre. Parfait pour les ruelles de Casa. Processus rapide, je recommande vivement KhtaarCar !",
      date: "2026-05-20"
    }
  ] as Review[]
};

// Lazy initialization of Gemini API Client to prevent crashes when key is absent
let genAIInstance: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI | null {
  if (!genAIInstance) {
    const key = process.env.GEMINI_API_KEY;
    if (key && key !== "MY_GEMINI_API_KEY" && key.trim() !== "") {
      genAIInstance = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          }
        }
      });
    }
  }
  return genAIInstance;
}

// REST Backend API endpoints

// --- Authentication ---
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  // Match pre-seeded users
  const user = db.users.find(u => u.email === email);
  if (user) {
    res.json({ token: "stub-token-" + user.id, user });
  } else {
    // Create quick temp user
    const newUser = {
      id: "usr_" + Math.random().toString(36).substr(2, 9),
      email,
      name: email.split('@')[0],
      phone: "+212 600-000000",
      role: "renter" as const,
      verified: true,
      documents: { status: "unuploaded" as const }
    };
    db.users.push(newUser);
    res.json({ token: "stub-token-" + newUser.id, user: newUser });
  }
});

app.post("/api/auth/register", (req, res) => {
  const { email, name, phone, role } = req.body;
  const existing = db.users.find(u => u.email === email);
  if (existing) {
    return res.status(400).json({ message: "Cet e-mail est déjà utilisé." });
  }
  const newUser = {
    id: "usr_" + Math.random().toString(36).substr(2, 9),
    email,
    name,
    phone,
    role: (role === 'agency' ? 'agency' : 'renter') as any,
    verified: false,
    documents: { status: "unuploaded" as const },
    ...(role === 'agency' ? { agencyId: 'agency_new' } : {})
  };
  db.users.push(newUser);
  res.json({ token: "stub-token-" + newUser.id, user: newUser });
});

app.get("/api/users/me", (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = authHeader?.replace("Bearer stub-token-", "") || "usr_renter";
  const user = db.users.find(u => u.id === userId);
  if (user) {
    res.json(user);
  } else {
    res.status(404).json({ message: "Utilisateur non trouvé" });
  }
});

// --- Cars ---
app.get("/api/cars", (req, res) => {
  const { city, category, transmission, search, minPrice, maxPrice } = req.query;
  let filtered = [...db.cars];

  if (city && city !== "Toutes les villes") {
    filtered = filtered.filter(c => c.city.toLowerCase() === (city as string).toLowerCase());
  }
  if (category && category !== "Toutes") {
    filtered = filtered.filter(c => c.category.toLowerCase() === (category as string).toLowerCase());
  }
  if (transmission) {
    filtered = filtered.filter(c => c.transmission.toLowerCase() === (transmission as string).toLowerCase());
  }
  if (search) {
    const q = (search as string).toLowerCase();
    filtered = filtered.filter(c => 
      c.make.toLowerCase().includes(q) || 
      c.model.toLowerCase().includes(q) ||
      c.city.toLowerCase().includes(q)
    );
  }
  if (minPrice) {
    filtered = filtered.filter(c => c.basePrice >= Number(minPrice));
  }
  if (maxPrice) {
    filtered = filtered.filter(c => c.basePrice <= Number(maxPrice));
  }
  res.json(filtered);
});

app.get("/api/cars/:id", (req, res) => {
  const car = db.cars.find(c => c.id === req.params.id);
  if (car) {
    res.json(car);
  } else {
    res.status(404).json({ message: "Véhicule non trouvé" });
  }
});

app.post("/api/cars", (req, res) => {
  const newCar = {
    id: "car_" + Math.random().toString(36).substr(2, 9),
    ...req.body,
    rating: 5.0,
    reviewsCount: 0
  };
  db.cars.push(newCar);

  // Add system notifications
  db.notifications.unshift({
    id: "not_" + Math.random().toString(36).substr(2, 9),
    title: "Nouveau véhicule listé! 🚗",
    message: `L'agence ${newCar.agencyName} a ajouté ${newCar.make} ${newCar.model} (${newCar.city}).`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "booking"
  });

  res.status(201).json(newCar);
});

// --- Bookings ---
app.get("/api/bookings", (req, res) => {
  const authHeader = req.headers.authorization;
  const userId = authHeader?.replace("Bearer stub-token-", "") || "usr_renter";
  
  const user = db.users.find(u => u.id === userId);
  if (user?.role === 'agency') {
    // Show bookings for this agency's cars
    const agencyId = user.agencyId || 'agency_1';
    res.json(db.bookings.filter(b => b.agencyId === agencyId));
  } else {
    // Show renter's bookings
    res.json(db.bookings.filter(b => b.renterId === userId));
  }
});

app.post("/api/bookings", (req, res) => {
  const { carId, startDate, endDate, pricePerDay, paymentMethod } = req.body;
  const car = db.cars.find(c => c.id === carId);
  if (!car) return res.status(404).json({ message: "Car not found" });

  const authHeader = req.headers.authorization;
  const renterId = authHeader?.replace("Bearer stub-token-", "") || "usr_renter";
  const renter = db.users.find(u => u.id === renterId) || db.users[0];

  const days = Math.max(1, Math.ceil((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 3600 * 24)));
  const totalPrice = days * pricePerDay;

  const booking = {
    id: "b_" + Math.random().toString(36).substr(2, 9),
    carId,
    carModel: `${car.make} ${car.model}`,
    carImage: car.imageUrl,
    renterId,
    renterName: renter.name,
    agencyId: car.agencyId,
    agencyName: car.agencyName,
    startDate,
    endDate,
    pricePerDay,
    totalPrice,
    status: ("pending" as const),
    paymentMethod,
    paymentStatus: (paymentMethod === 'card' ? 'paid' : 'unpaid') as any
  };

  db.bookings.unshift(booking);

  // Notify Agency
  db.notifications.unshift({
    id: "not_" + Math.random().toString(36).substr(2, 9),
    title: "Nouvelle Demande de Réservation 🗓️",
    message: `${renter.name} souhaite lier votre ${car.make} ${car.model} du ${startDate} au ${endDate}.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "booking"
  });

  res.status(201).json(booking);
});

app.patch("/api/bookings/:id", (req, res) => {
  const { status } = req.body;
  const bookingIndex = db.bookings.findIndex(b => b.id === req.params.id);
  if (bookingIndex === -1) return res.status(404).json({ message: "Booking not found" });

  db.bookings[bookingIndex].status = status;
  const booking = db.bookings[bookingIndex];

  // Notify Renter
  db.notifications.unshift({
    id: "notif_" + Math.random().toString(36).substr(2, 9),
    title: `Statut Réservation: Malika / ${status === 'confirmed' ? 'Confirmé ✅' : 'Annulé ❌'}`,
    message: `Votre location pour la voiture ${booking.carModel} a été ${status === 'confirmed' ? 'approuvée par l\'agence' : 'annulée'}.`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "booking"
  });

  res.json(booking);
});

// --- Negotiations Backend Engine ---
app.post("/api/negotiations", (req, res) => {
  const { carId, offeredPrice } = req.body;
  const car = db.cars.find(c => c.id === carId);
  if (!car) return res.status(404).json({ message: "Car not found" });

  const authHeader = req.headers.authorization;
  const renterId = authHeader?.replace("Bearer stub-token-", "") || "usr_renter";
  const renter = db.users.find(u => u.id === renterId) || db.users[0];

  const negId = "neg_" + Math.random().toString(36).substr(2, 9);
  const negotiation = {
    id: negId,
    carId,
    renterId,
    renterName: renter.name,
    initialPrice: car.basePrice,
    offeredPrice,
    currentOfferBy: "renter" as const,
    status: "open" as const,
    history: [
      {
        price: offeredPrice,
        offeredBy: 'renter' as const,
        timestamp: new Date().toISOString(),
        message: `Salam! Je propose un tarif de ${offeredPrice} MAD/jour au lieu de ${car.basePrice} MAD.`
      }
    ]
  };

  db.negotiations.push(negotiation);

  // Pre-seed system welcome message in negotiation chat
  db.messages.push({
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    negotiationId: negId,
    senderId: "system",
    senderName: "KhtaarCar Bot",
    text: `Négociation lancée pour ${car.make} ${car.model}. Prix catalogue: ${car.basePrice} MAD. Votre offre: ${offeredPrice} MAD/jour.`,
    timestamp: new Date().toISOString(),
    isSystem: true
  });

  res.status(201).json(negotiation);
});

// Dynamic AI Moroccan Car Owner Negotiator
app.post("/api/negotiations/:id/counter", async (req, res) => {
  const { offeredPrice, message } = req.body;
  const negIndex = db.negotiations.findIndex(n => n.id === req.params.id);
  if (negIndex === -1) return res.status(404).json({ message: "Negotiation not found" });

  const negotiation = db.negotiations[negIndex];
  const car = db.cars.find(c => c.id === negotiation.carId);
  if (!car) return res.status(404).json({ message: "Car not found" });

  // Add renter's message/bid to the history
  negotiation.offeredPrice = offeredPrice;
  negotiation.currentOfferBy = "renter";
  negotiation.history.push({
    price: offeredPrice,
    offeredBy: 'renter' as const,
    timestamp: new Date().toISOString(),
    message: message || `Nouvelle offre de ${offeredPrice} MAD/jour.`
  });

  // Save text message to chat
  db.messages.push({
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    negotiationId: negotiation.id,
    senderId: negotiation.renterId,
    senderName: negotiation.renterName,
    text: message || `Je propose ${offeredPrice} MAD/jour.`,
    timestamp: new Date().toISOString()
  });

  const aiClient = getGeminiClient();
  let decision: 'accept' | 'counter' | 'decline' = 'counter';
  let counterPrice = car.minPrice;
  let responseText = "";

  if (offeredPrice >= car.minPrice) {
    // Elegant system rule: if renter provides a highly profitable offer, we may accept!
    if (offeredPrice >= car.basePrice * 0.9) {
      decision = 'accept';
      counterPrice = offeredPrice;
    } else {
      // Small random range for negotiation
      const acceptThreshold = car.minPrice + (car.basePrice - car.minPrice) * 0.4;
      if (offeredPrice >= acceptThreshold && Math.random() > 0.5) {
        decision = 'accept';
        counterPrice = offeredPrice;
      } else {
        decision = 'counter';
        counterPrice = Math.round(offeredPrice + (car.basePrice - offeredPrice) * 0.5);
      }
    }
  } else {
    // Offered price is below strictly acceptable minimum
    decision = offeredPrice < car.minPrice * 0.85 ? 'decline' : 'counter';
    counterPrice = Math.round(car.minPrice + (car.basePrice - car.minPrice) * 0.2);
  }

  // Generate Morocco Agency Owner Voice via Gemini 3.5 AI Model
  if (aiClient) {
    try {
      const historySummary = negotiation.history.map((h: any) => `${h.offeredBy}: ${h.price} MAD - "${h.message}"`).join("\n");
      const systemPrompt = `You are a professional, smart Moroccan car rental agency owner named "Khalid". Your goal is to maximize dealership profits while remaining extremely friendly, polite, and welcoming (hospitality of Morocco!).
The car is ${car.make} ${car.model} in ${car.city}. Catalog standard daily price is ${car.basePrice} MAD. Strictly confidential: Your absolute lowest price (bottom line) is ${car.minPrice} MAD.
Currently:
Renter offered: ${offeredPrice} MAD.
Renter written message: "${message || 'Propose custom rate'}"
Negotiation status: ${decision === 'accept' ? 'The offer is good. We accepted it.' : decision === 'decline' ? 'The price is absolutely insultingly low. Let\'s decline politely.' : 'We counter-offer with ' + counterPrice + ' MAD.'}

Generate an elegant reply to send to the renter. 
- Use a blend of warm professional Moroccan French, Arabic/Darija greeting (like Salam, Marhaban, Bikhir) and English context if suitable. 
- Must be concise, natural, and business-focused. No tech jargon.
- Format strictly as a raw JSON block with this schema:
{
  "message": "Write the Moroccan agency response here..."
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: "Salam agency owner. Please respond to Amine's offer.",
        config: {
          systemInstruction: systemPrompt,
          responseMimeType: "application/json",
          temperature: 0.8
        }
      });

      const parsed = JSON.parse(aiResponse.text || "{}");
      responseText = parsed.message || "";
    } catch (err) {
      console.error("Gemini counter-offer fails, fallback to local translator:", err);
    }
  }

  // Fallback Moroccan French Agency Dialogue
  if (!responseText) {
    if (decision === 'accept') {
      responseText = `Salam Alaykoum ${negotiation.renterName}! C'est parfait pour ${offeredPrice} MAD/jour. Marhababik à notre agence de ${car.city}, nous préparons le contrat pour votre réservation. Tarifs validés !`;
    } else if (decision === 'decline') {
      responseText = `Salam brother. Désolé, l'offre de ${offeredPrice} MAD/jour est bien au-dessous de nos frais opératoires et d'assurances tous risques pour la ${car.make}. Le prix catalogue est de ${car.basePrice} MAD, nous ne pouvons pas louer à perte. Merci pour votre compréhension.`;
    } else {
      responseText = `Salam Alaykoum! Merci pour votre proposition de ${offeredPrice} MAD. Vu la haute saison et la qualité de la ${car.make} ${car.model}, notre meilleur effort serait de ${counterPrice} MAD/jour. Qu'en dites-vous? Lbahja ou dar kbira! 😊`;
    }
  }

  // Apply State modifications
  if (decision === 'accept') {
    negotiation.status = 'accepted';
  } else if (decision === 'decline') {
    negotiation.status = 'declined';
  } else {
    negotiation.currentOfferBy = "agency";
    negotiation.history.push({
      price: counterPrice,
      offeredBy: 'agency' as const,
      timestamp: new Date().toISOString(),
      message: responseText
    });
  }

  // Save agency agent message to chat
  db.messages.push({
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    negotiationId: negotiation.id,
    senderId: car.agencyId,
    senderName: car.agencyName,
    text: responseText,
    timestamp: new Date().toISOString()
  });

  // Create notifications
  db.notifications.unshift({
    id: "not_" + Math.random().toString(36).substr(2, 9),
    title: `Négociation KhtaarCar: ${car.model}`,
    message: `L'agence a répondu pour la ${car.make}: ${decision === 'accept' ? 'Proposition validée!' : 'Contre-proposition envoyée.'}`,
    timestamp: new Date().toISOString(),
    read: false,
    type: "negotiation"
  });

  res.json(negotiation);
});

// Update negotiation status (Accept/Decline standard triggers)
app.patch("/api/negotiations/:id", (req, res) => {
  const { status } = req.body;
  const negIndex = db.negotiations.findIndex(n => n.id === req.params.id);
  if (negIndex === -1) return res.status(404).json({ message: "Negotiation not found" });

  db.negotiations[negIndex].status = status;
  const negotiation = db.negotiations[negIndex];
  const car = db.cars.find(c => c.id === negotiation.carId);

  if (status === 'accepted' && car) {
    db.messages.push({
      id: "msg_" + Math.random().toString(36).substr(2, 9),
      negotiationId: negotiation.id,
      senderId: "system",
      senderName: "KhtaarCar Bot",
      text: `Négociation conclue avec succès à ${negotiation.offeredPrice} MAD/jour! Vous pouvez désormais cliquer sur 'Finaliser Réservation' pour choisir vos options de paiement. Bon voyage!`,
      timestamp: new Date().toISOString(),
      isSystem: true
    });
  }

  res.json(negotiation);
});

// --- Chat Messages ---
app.get("/api/messages/:negotiationId", (req, res) => {
  const msgs = db.messages.filter(m => m.negotiationId === req.params.negotiationId);
  res.json(msgs);
});

app.post("/api/messages", (req, res) => {
  const { negotiationId, senderId, senderName, text } = req.body;
  const newMsg = {
    id: "msg_" + Math.random().toString(36).substr(2, 9),
    negotiationId,
    senderId,
    senderName,
    text,
    timestamp: new Date().toISOString()
  };
  db.messages.push(newMsg);
  res.status(201).json(newMsg);
});

// --- Notifications ---
app.get("/api/notifications", (req, res) => {
  res.json(db.notifications);
});

app.post("/api/notifications/read-all", (req, res) => {
  db.notifications.forEach(n => n.read = true);
  res.json({ success: true, count: db.notifications.length });
});

// --- Reviews ---
app.get("/api/reviews/:carId", (req, res) => {
  res.json(db.reviews.filter(r => r.carId === req.params.carId));
});

app.post("/api/reviews", (req, res) => {
  const { carId, renterName, rating, text } = req.body;
  const rev = {
    id: "rev_" + Math.random().toString(36).substr(2, 9),
    carId,
    renterName,
    rating: Number(rating),
    text,
    date: new Date().toISOString().split('T')[0]
  };
  db.reviews.unshift(rev);

  // Update car metric average
  const car = db.cars.find(c => c.id === carId);
  if (car) {
    const carReviews = db.reviews.filter(r => r.carId === carId);
    const sum = carReviews.reduce((acc, r) => acc + r.rating, 0);
    car.rating = Number((sum / carReviews.length).toFixed(1));
    car.reviewsCount = carReviews.length;
  }

  res.status(201).json(rev);
});

// --- Smart Artificial Intelligence Price & Negotiation Assistant ---
app.post("/api/gemini/suggest-price", async (req, res) => {
  const { city, category, year, condition, make, model } = req.body;
  const aiClient = getGeminiClient();

  if (aiClient) {
    try {
      const prompt = `L'utilisateur souhaite louer ou lister sa voiture en location au Maroc.
Détails de la voiture:
Marque: ${make || 'Dacia'}
Modèle: ${model || 'Sandero'}
Année: ${year || 2022}
Catégorie: ${category || 'Economy'}
Ville du Maroc: ${city || 'Casablanca'}
État du véhicule: ${condition || 'Excellent'}

Fournit une estimation experte du tarif optimal de location par jour en MAD (Dirhams marocains).
- Donne un loyer conseillé (ex: 350 MAD/jour).
- Donne une fourchette (Minimum acceptable pour négociation, Maximum recommandé pour haute saison).
- Ajoute 3 petites suggestions de tarification stratégiques adaptées au marché marocain de la location locale (ex: haute saison à Marrakech, rabais de long terme à Agadir...).
- Format strictly as a valid string with gorgeous markdown and custom styling. Include emojis for clarity and presentation. Keep it in French.`;

      const response = await aiClient.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: { temperature: 0.7 }
      });

      return res.json({ result: response.text });
    } catch (err) {
      console.error("Gemini Suggest Price Error:", err);
    }
  }

  // Standard Local Arabic/French Strategy Fallback
  let baseEstimate = 350;
  if (category === 'SUV') baseEstimate = 850;
  else if (category === 'Luxury') baseEstimate = 1200;
  else if (category === 'Electric') baseEstimate = 900;
  else if (category === 'Sedan') baseEstimate = 500;

  res.json({
    result: `### 🇲🇦 KhtaarCar IA - Analyse du Marché Marocain

Voici notre estimation automatique pré-saisie pour votre **${make} ${model} (${year})** à **${city}** :

* **Tarif Journalier Conseillé** : **${baseEstimate} MAD / jour**
* **Fourchette de Négociation** : **${Math.round(baseEstimate * 0.8)} MAD** (Min pour séjours longs) à **${Math.round(baseEstimate * 1.35)} MAD** (Haute saison estivale/fêtes)

#### 📈 Conseils Stratégiques de l'Atlas :
1. **Forte Saisonnalité** : Les villes côtières comme Casablanca, Tanger et Agadir connaissent une hausse de trafic de 40% de Juin à Septembre. Adaptez vos prix planchers !
2. **La Règle d'Or de la Négociation Directe** : Prévoyez 15% de marge dans votre prix d'affichage pour permettre aux locataires de négocier. Cela augmente le taux de réservation de 85% !
3. **Assurance Tous Risques** : Au Maroc, les locataires préfèrent louer l'esprit tranquille. Mentionnez l'assurance dans vos messages !`
  });
});

// Vite Middleware & SPA Static Asset pipeline configuration
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`[KhtaarCar Fullstack Backend] Server running on http://localhost:${PORT}`);
  });
}

startServer();
