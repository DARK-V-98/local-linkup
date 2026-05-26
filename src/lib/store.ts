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
}

export interface StoredService {
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

const BOOKINGS_KEY = 'needly_bookings';
const SERVICES_KEY = 'needly_my_services';

export function getBookings(): StoredBooking[] {
  try {
    return JSON.parse(localStorage.getItem(BOOKINGS_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function addBooking(b: StoredBooking): void {
  const existing = getBookings();
  existing.unshift(b);
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(existing));
}

export function updateBookingStatus(id: string, status: StoredBooking['status']): void {
  const bookings = getBookings();
  const idx = bookings.findIndex((b) => b.id === id);
  if (idx !== -1) {
    bookings[idx].status = status;
    localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
  }
}

export function getBookingById(id: string): StoredBooking | null {
  return getBookings().find((b) => b.id === id) ?? null;
}

export function getMyServices(): StoredService[] {
  try {
    return JSON.parse(localStorage.getItem(SERVICES_KEY) ?? '[]');
  } catch {
    return [];
  }
}

export function addService(s: StoredService): void {
  const existing = getMyServices();
  existing.unshift(s);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(existing));
}

export function updateService(id: string, updates: Partial<StoredService>): void {
  const services = getMyServices();
  const idx = services.findIndex((s) => s.id === id);
  if (idx !== -1) {
    services[idx] = { ...services[idx], ...updates };
    localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
  }
}

export function deleteService(id: string): void {
  const services = getMyServices().filter((s) => s.id !== id);
  localStorage.setItem(SERVICES_KEY, JSON.stringify(services));
}

export function generateId(prefix = 'N'): string {
  return prefix + Math.random().toString(36).substring(2, 10).toUpperCase();
}
