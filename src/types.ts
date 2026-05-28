export type Role = 'renter' | 'agency' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone: string;
  role: Role;
  agencyId?: string;
  verified: boolean;
  documents: {
    cinFront?: string;
    cinBack?: string;
    licenseFront?: string;
    licenseBack?: string;
    status: 'unuploaded' | 'pending' | 'verified' | 'rejected';
  };
}

export interface Agency {
  id: string;
  name: string;
  phone: string;
  city: string;
  verified: boolean;
  rating: number;
  totalReviews: number;
  logoUrl?: string;
}

export interface Car {
  id: string;
  make: string;
  model: string;
  year: number;
  category: 'SUV' | 'Luxury' | 'Sedan' | 'Economy' | 'Electric';
  transmission: 'Automatic' | 'Manual';
  fuel: 'Diesel' | 'Gasoline' | 'Electric' | 'Hybrid';
  seats: number;
  city: string;
  agencyId: string;
  agencyName: string;
  basePrice: number; // base price in MAD/day
  minPrice: number;  // lowest acceptable price/day for direct negotiation
  imageUrl: string;
  images?: string[];
  features: string[];
  rating: number;
  reviewsCount: number;
}

export interface Booking {
  id: string;
  carId: string;
  carModel: string;
  carImage: string;
  renterId: string;
  renterName: string;
  agencyId: string;
  agencyName: string;
  startDate: string;
  endDate: string;
  pricePerDay: number;
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'active' | 'completed' | 'cancelled';
  paymentMethod: 'cash' | 'card' | 'bank_transfer';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  negotiationId?: string;
}

export interface Negotiation {
  id: string;
  carId: string;
  renterId: string;
  renterName: string;
  initialPrice: number; // standard daily rate
  offeredPrice: number; // renter counter price
  currentOfferBy: 'renter' | 'agency';
  status: 'open' | 'accepted' | 'declined' | 'converted';
  history: {
    price: number;
    offeredBy: 'renter' | 'agency';
    timestamp: string;
    message?: string;
  }[];
}

export interface Message {
  id: string;
  negotiationId: string;
  senderId: string;
  senderName: string;
  text: string;
  timestamp: string;
  isSystem?: boolean;
}

export interface Review {
  id: string;
  carId: string;
  renterName: string;
  rating: number;
  text: string;
  date: string;
  reply?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  type: 'booking' | 'negotiation' | 'auth' | 'document';
}
