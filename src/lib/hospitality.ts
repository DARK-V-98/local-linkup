export const EMERGENCY_TYPES = [
    { id: "roof", label: "Roof repairs", description: "Urgent roof leaks and waterproofing" },
    { id: "electric", label: "Electrical faults", description: "Find a registered electrical service provider" },
    { id: "plumbing", label: "Plumbing", description: "Burst pipes, leaks and blocked drains" },
    { id: "flood", label: "Water removal", description: "Property clean-up and water removal services" },
    { id: "medicine", label: "Medicine delivery", description: "Delivery enquiries subject to provider requirements" },
    { id: "lockout", label: "Locks and keys", description: "Lockouts and key replacement" },
] as const;
export type ReviewStatus = "pending" | "approved" | "changes_requested" | "rejected" | "suspended";
export interface HotelProperty {
    id: string;
    ownerId: string;
    name: string;
    district: string;
    address: string;
    description: string;
    phone: string;
    website: string;
    checkIn: string;
    checkOut: string;
    facilities: string[];
    policy: string;
    status: ReviewStatus;
    notes?: string;
}
export interface HotelItem {
    id: string;
    name: string;
    description: string;
    priceMinor: number;
    active: boolean;
    capacity: number;
    units: number;
    minNights: number;
    maxNights: number;
    basis: "stay" | "night" | "person" | "person_night";
    roomId: string;
    nights: number;
    includedAddonIds: string[];
}
export interface EmergencyApplication {
    id: string;
    ownerId: string;
    displayName: string;
    district: string;
    types: string[];
    serviceIds: string[];
    phone: string;
    hours: string;
    description: string;
    status: ReviewStatus;
    notes?: string;
}
export interface StayRequest {
    id: string;
    ownerId: string;
    buyerId: string;
    propertyId: string;
    propertyName: string;
    buyerName: string;
    arrival: string;
    departure: string;
    adults: number;
    children: number;
    rooms: number;
    roomId: string;
    packageId: string;
    addonIds: string[];
    notes: string;
    estimateMinor: number;
    status: "requested" | "quoted" | "accepted" | "declined" | "closed";
    quoteMinor?: number;
    quoteTerms?: string;
    quoteExpires?: string;
    quoteVersion?: number;
}
export interface StaySelection {
    arrival: string;
    departure: string;
    adults: number;
    children: number;
    rooms: number;
    roomId: string;
    packageId: string;
    addonIds: string[];
    notes: string;
}
