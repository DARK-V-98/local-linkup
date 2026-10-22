export interface StoredBooking {
    id: string;
    serviceId: string;
    serviceTitle: string;
    category: string;
    categoryIcon: string;
    vendorName: string;
    vendorPhone: string;
    vendorInitial: string;
    vendorVerified: boolean;
    customerName: string;
    customerPhone: string;
    date: string;
    time: string;
    notes: string;
    extraData: Record<string, string>;
    price: number;
    district: string;
    status: 'pending' | 'confirmed' | 'in_progress' | 'completed' | 'cancelled';
    createdAt: string;
    isEmergency?: boolean;
    statusHistory?: StatusEvent[];
}
export interface StatusEvent {
    status: StoredBooking['status'];
    at: string;
}
export interface StoredService {
    imageUrl?: string;
    id: string;
    title: string;
    category: string;
    categoryIcon: string;
    description: string;
    price: number;
    priceUnit: string;
    type: string;
    tags: string[];
    district: string;
    status: 'active' | 'paused' | 'draft';
    views: number;
    orders: number;
    rating: number;
    createdAt: string;
}
export function generateId(prefix: string): string { return `${prefix}-${crypto.randomUUID()}`; }
