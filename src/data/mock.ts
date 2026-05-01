export interface MockCategory { id: string; name: string; icon: string; description: string; count: number; }
export interface MockService {
  id: string; title: string; category: string; categoryIcon: string;
  seller: string; sellerInitial: string; location: string; price: number;
  rating: number; reviews: number; type: string; postedAt: Date;
  badge?: string; badgeIcon?: string;
}

export const MOCK_CATEGORIES: MockCategory[] = [
  { id: '1', name: 'Technology', icon: 'fas fa-laptop-code', description: 'Web, mobile & IT pros', count: 420 },
  { id: '2', name: 'Home Services', icon: 'fas fa-tools', description: 'Cleaning, plumbing & more', count: 310 },
  { id: '3', name: 'Education', icon: 'fas fa-book-reader', description: 'Tutors & courses', count: 280 },
  { id: '4', name: 'Creative', icon: 'fas fa-paint-brush', description: 'Design, art & media', count: 190 },
  { id: '5', name: 'Repairs', icon: 'fas fa-wrench', description: 'Quick fixes for anything', count: 240 },
  { id: '6', name: 'Delivery', icon: 'fas fa-shipping-fast', description: 'Same-day pickups', count: 160 },
  { id: '7', name: 'Agriculture', icon: 'fas fa-seedling', description: 'Farm & garden experts', count: 90 },
  { id: '8', name: 'Vehicle Service', icon: 'fas fa-car', description: 'Mechanics & detailing', count: 175 },
  { id: '9', name: 'Tuition', icon: 'fas fa-graduation-cap', description: 'Local & online classes', count: 220 },
  { id: '10', name: 'Ayurveda Service', icon: 'fas fa-leaf', description: 'Wellness & therapy', count: 110 },
];

export const MOCK_TOP_SERVICES: MockService[] = [
  { id: 't1', title: 'Premium WordPress Website Development', category: 'Technology', categoryIcon: 'fas fa-crown',
    seller: 'Tharindu P.', sellerInitial: 'T', location: 'Colombo', price: 25000, rating: 5.0, reviews: 142,
    type: 'Fixed Price', postedAt: new Date(Date.now() - 2*86400000), badge: 'Top Rated', badgeIcon: 'fas fa-crown' },
  { id: 't2', title: 'Luxury Home Deep Cleaning', category: 'Home Services', categoryIcon: 'fas fa-gem',
    seller: 'Nirmala S.', sellerInitial: 'N', location: 'Kandy', price: 8500, rating: 4.9, reviews: 98,
    type: 'Local Service', postedAt: new Date(Date.now() - 4*86400000), badge: 'Premium', badgeIcon: 'fas fa-gem' },
  { id: 't3', title: 'A/L Combined Maths Mastery', category: 'Tuition', categoryIcon: 'fas fa-fire',
    seller: 'Kasun J.', sellerInitial: 'K', location: 'Galle', price: 4500, rating: 4.9, reviews: 211,
    type: 'Online Service', postedAt: new Date(Date.now() - 7*86400000), badge: 'Hot', badgeIcon: 'fas fa-fire' },
  { id: 't4', title: 'Pro Wedding Photography Package', category: 'Creative', categoryIcon: 'fas fa-trophy',
    seller: 'Dinithi A.', sellerInitial: 'D', location: 'Negombo', price: 75000, rating: 4.8, reviews: 64,
    type: 'Booking Service', postedAt: new Date(Date.now() - 10*86400000), badge: 'Award Winner', badgeIcon: 'fas fa-trophy' },
];

export const MOCK_LATEST_SERVICES: MockService[] = [
  { id: 'l1', title: 'Mobile App UI/UX Design', category: 'Creative', categoryIcon: 'fas fa-mobile-screen', seller: 'Amaya R.', sellerInitial: 'A', location: 'Colombo', price: 18000, rating: 4.8, reviews: 32, type: 'Fixed Price', postedAt: new Date(Date.now() - 3600000) },
  { id: 'l2', title: 'AC Repair & Servicing', category: 'Repairs', categoryIcon: 'fas fa-snowflake', seller: 'Ravi M.', sellerInitial: 'R', location: 'Dehiwala', price: 3500, rating: 4.7, reviews: 88, type: 'Local Service', postedAt: new Date(Date.now() - 7200000) },
  { id: 'l3', title: 'English Spoken Classes', category: 'Education', categoryIcon: 'fas fa-language', seller: 'Shanika P.', sellerInitial: 'S', location: 'Online', price: 2500, rating: 4.9, reviews: 156, type: 'Online Service', postedAt: new Date(Date.now() - 10800000) },
  { id: 'l4', title: 'Same-Day Bike Delivery', category: 'Delivery', categoryIcon: 'fas fa-motorcycle', seller: 'Asela K.', sellerInitial: 'A', location: 'Colombo', price: 600, rating: 4.6, reviews: 421, type: 'Hourly Service', postedAt: new Date(Date.now() - 14400000) },
  { id: 'l5', title: 'Plumbing & Pipe Fitting', category: 'Home Services', categoryIcon: 'fas fa-faucet', seller: 'Sunil B.', sellerInitial: 'S', location: 'Maharagama', price: 4000, rating: 4.5, reviews: 67, type: 'Local Service', postedAt: new Date(Date.now() - 21600000) },
  { id: 'l6', title: 'Logo & Brand Identity', category: 'Creative', categoryIcon: 'fas fa-palette', seller: 'Hashini W.', sellerInitial: 'H', location: 'Online', price: 12000, rating: 5.0, reviews: 41, type: 'Fixed Price', postedAt: new Date(Date.now() - 28800000) },
  { id: 'l7', title: 'Car Full Detailing', category: 'Vehicle Service', categoryIcon: 'fas fa-car-side', seller: 'Pradeep N.', sellerInitial: 'P', location: 'Nugegoda', price: 9500, rating: 4.8, reviews: 73, type: 'Booking Service', postedAt: new Date(Date.now() - 32400000) },
  { id: 'l8', title: 'Ayurveda Body Therapy', category: 'Ayurveda Service', categoryIcon: 'fas fa-spa', seller: 'Malini D.', sellerInitial: 'M', location: 'Kandy', price: 6500, rating: 4.9, reviews: 124, type: 'Booking Service', postedAt: new Date(Date.now() - 36000000) },
  { id: 'l9', title: 'React & Next.js Development', category: 'Technology', categoryIcon: 'fas fa-code', seller: 'Yasiru F.', sellerInitial: 'Y', location: 'Online', price: 35000, rating: 4.9, reviews: 56, type: 'Hourly Service', postedAt: new Date(Date.now() - 43200000) },
  { id: 'l10', title: 'Vegetable Farm Setup', category: 'Agriculture', categoryIcon: 'fas fa-tractor', seller: 'Bandula J.', sellerInitial: 'B', location: 'Anuradhapura', price: 22000, rating: 4.7, reviews: 18, type: 'Local Service', postedAt: new Date(Date.now() - 50400000) },
  { id: 'l11', title: 'Grade 10 Science Tuition', category: 'Tuition', categoryIcon: 'fas fa-flask', seller: 'Chamil U.', sellerInitial: 'C', location: 'Matara', price: 3000, rating: 4.8, reviews: 92, type: 'Local Service', postedAt: new Date(Date.now() - 57600000) },
  { id: 'l12', title: 'Garden Landscaping', category: 'Home Services', categoryIcon: 'fas fa-tree', seller: 'Kumara S.', sellerInitial: 'K', location: 'Battaramulla', price: 15000, rating: 4.6, reviews: 28, type: 'Booking Service', postedAt: new Date(Date.now() - 64800000) },
];
