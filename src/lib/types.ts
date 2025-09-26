export interface Booking {
  _id: string;
  userId: string;
  packageId: string;
  startDate: Date;
  endDate: Date;
  isSelfPickup: boolean;
  location: string;
  deliveryTime: {
    startHour: number;
    endHour: number;
  };
  selectedPlan: {
    duration: number;
    price: number;
  };
  priceBreakDown: {
    basePrice: number;
    deliveryCharge: number;
    grandTotal: number;
  };
  document: Document[];
  address: Address;
  partnerId?: string;
  status: 'PENDING' | 'PARTNER_ASSIGNED' | 'DOCUMENTS_UNDER_REVIEW' | 'CONFIRMED' | 'CANCELLED';
  lockedBy?: string;
  lockedAt?: Date;
}

export interface Document {
  docType: 'SELFIE' | 'SIGNATURE';
  docLink: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  reviewedBy?: string;
  reviewedAt?: Date;
}

export interface Address {
  buildingAreaName: string;
  houseNumber: string;
  streetAddress: string;
  zip: string;
  latitude: number;
  longitude: number;
}

export interface Partner {
  _id: string;
  name: string;
  city: string;
  status: 'online' | 'offline' | 'busy';
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  lastGpsUpdate?: Date;
  currentBookings?: string[];
}