export interface MockCategory { id: string; name: string; icon: string; description: string; count: number; }
export interface MockService {
  id: string; title: string; category: string; categoryIcon: string;
  seller: string; sellerInitial: string; location: string; district: string; price: number;
  rating: number; reviews: number; type: string; postedAt: Date;
  badge?: string; badgeIcon?: string;
  description?: string; tags?: string[]; priceUnit?: string;
  sellerVerified?: boolean; sellerMember?: string; sellerJobs?: number;
  sellerBio?: string; sellerPhone?: string;
  /** Present on services loaded from Firestore; absent on static mock data */
  sellerId?: string;
}

export const SL_DISTRICTS = [
  "All Districts",
  "Colombo", "Gampaha", "Kalutara",
  "Kandy", "Matale", "Nuwara Eliya",
  "Galle", "Matara", "Hambantota",
  "Jaffna", "Kilinochchi", "Mannar", "Mullaitivu", "Vavuniya",
  "Batticaloa", "Ampara", "Trincomalee",
  "Kurunegala", "Puttalam",
  "Anuradhapura", "Polonnaruwa",
  "Badulla", "Monaragala",
  "Ratnapura", "Kegalle",
  "Online",
];

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
    seller: 'Tharindu P.', sellerInitial: 'T', location: 'Colombo', district: 'Colombo', price: 25000, rating: 5.0, reviews: 142,
    type: 'Fixed Price', postedAt: new Date(Date.now() - 2*86400000), badge: 'Top Rated', badgeIcon: 'fas fa-crown',
    description: 'I will build you a fully responsive, blazing-fast WordPress website from scratch. Includes custom theme, contact forms, SEO setup, and 3 months of free support. Perfect for small businesses, restaurants, and portfolios across Sri Lanka.',
    tags: ['WordPress', 'SEO', 'Responsive', 'Business Website'],
    priceUnit: 'project', sellerVerified: true, sellerMember: 'Jan 2023', sellerJobs: 142, sellerBio: 'Full-stack developer with 7+ years experience. Based in Colombo.', sellerPhone: '+94771234567' },
  { id: 't2', title: 'Luxury Home Deep Cleaning', category: 'Home Services', categoryIcon: 'fas fa-gem',
    seller: 'Nirmala S.', sellerInitial: 'N', location: 'Kandy', district: 'Kandy', price: 8500, rating: 4.9, reviews: 98,
    type: 'Local Service', postedAt: new Date(Date.now() - 4*86400000), badge: 'Premium', badgeIcon: 'fas fa-gem',
    description: 'Professional deep cleaning service for homes and apartments. We use eco-friendly products safe for children and pets. Includes all rooms, kitchen, bathrooms, windows, and balconies. Available across Kandy district.',
    tags: ['Deep Clean', 'Eco-Friendly', 'Home', 'Kitchen', 'Bathrooms'],
    priceUnit: '3-bedroom home', sellerVerified: true, sellerMember: 'Mar 2022', sellerJobs: 98, sellerBio: 'Professional cleaning team serving Kandy for 5+ years.', sellerPhone: '+94779876543' },
  { id: 't3', title: 'A/L Combined Maths Mastery', category: 'Tuition', categoryIcon: 'fas fa-fire',
    seller: 'Kasun J.', sellerInitial: 'K', location: 'Galle', district: 'Galle', price: 4500, rating: 4.9, reviews: 211,
    type: 'Online Service', postedAt: new Date(Date.now() - 7*86400000), badge: 'Hot', badgeIcon: 'fas fa-fire',
    description: 'Expert A/L Combined Mathematics tuition with proven results. I have helped 200+ students achieve A grades. Monthly batch classes + individual doubt sessions. Available online or in-person in Galle.',
    tags: ['A/L Maths', 'Combined Maths', 'Online', 'Exam Prep'],
    priceUnit: 'month', sellerVerified: true, sellerMember: 'Jun 2021', sellerJobs: 211, sellerBio: 'B.Sc. Mathematics graduate. 8 years teaching experience.', sellerPhone: '+94766543210' },
  { id: 't4', title: 'Pro Wedding Photography Package', category: 'Creative', categoryIcon: 'fas fa-trophy',
    seller: 'Dinithi A.', sellerInitial: 'D', location: 'Negombo', district: 'Gampaha', price: 75000, rating: 4.8, reviews: 64,
    type: 'Booking Service', postedAt: new Date(Date.now() - 10*86400000), badge: 'Award Winner', badgeIcon: 'fas fa-trophy',
    description: 'Award-winning wedding photography by Dinithi. Full-day coverage, 500+ edited photos, cinematic video highlight reel, same-day preview gallery. We travel island-wide. Book 3+ months in advance.',
    tags: ['Wedding', 'Photography', 'Videography', 'Island-wide'],
    priceUnit: 'full day', sellerVerified: true, sellerMember: 'Feb 2020', sellerJobs: 64, sellerBio: 'Awarded best wedding photographer at Lanka Media Awards 2024.', sellerPhone: '+94712345678' },
];

export const MOCK_LATEST_SERVICES: MockService[] = [
  { id: 'l1', title: 'Mobile App UI/UX Design', category: 'Creative', categoryIcon: 'fas fa-mobile-screen', seller: 'Amaya R.', sellerInitial: 'A', location: 'Colombo', district: 'Colombo', price: 18000, rating: 4.8, reviews: 32, type: 'Fixed Price', postedAt: new Date(Date.now() - 3600000),
    description: 'Modern, user-friendly mobile app UI/UX design for iOS and Android. Includes wireframes, prototypes, and final design files. Figma and Adobe XD deliverables.',
    tags: ['Figma', 'UI/UX', 'Mobile App', 'Prototype'], priceUnit: 'project', sellerVerified: true, sellerMember: 'Apr 2023', sellerJobs: 32, sellerBio: 'UI/UX designer specializing in mobile apps.', sellerPhone: '+94771111111' },
  { id: 'l2', title: 'AC Repair & Servicing', category: 'Repairs', categoryIcon: 'fas fa-snowflake', seller: 'Ravi M.', sellerInitial: 'R', location: 'Dehiwala', district: 'Colombo', price: 3500, rating: 4.7, reviews: 88, type: 'Local Service', postedAt: new Date(Date.now() - 7200000),
    description: 'Professional AC servicing and repair for all brands. Gas refilling, coil cleaning, electrical faults, and full overhaul. Available 7 days a week across Colombo district.',
    tags: ['AC Repair', 'Gas Refill', 'All Brands', 'Same-Day'], priceUnit: 'unit', sellerVerified: false, sellerMember: 'Aug 2022', sellerJobs: 88, sellerBio: 'Certified AC technician, 10 years experience.', sellerPhone: '+94762222222' },
  { id: 'l3', title: 'English Spoken Classes', category: 'Education', categoryIcon: 'fas fa-language', seller: 'Shanika P.', sellerInitial: 'S', location: 'Online', district: 'Online', price: 2500, rating: 4.9, reviews: 156, type: 'Online Service', postedAt: new Date(Date.now() - 10800000),
    description: 'Improve your spoken English with proven techniques. Small group and 1-on-1 sessions. Perfect for job interviews, work presentations, and daily communication.',
    tags: ['Spoken English', 'Online', 'Interview Prep', '1-on-1'], priceUnit: 'month', sellerVerified: true, sellerMember: 'Nov 2021', sellerJobs: 156, sellerBio: 'CELTA certified English teacher.', sellerPhone: '+94753333333' },
  { id: 'l4', title: 'Same-Day Bike Delivery', category: 'Delivery', categoryIcon: 'fas fa-motorcycle', seller: 'Asela K.', sellerInitial: 'A', location: 'Colombo', district: 'Colombo', price: 600, rating: 4.6, reviews: 421, type: 'Hourly Service', postedAt: new Date(Date.now() - 14400000),
    description: 'Fast and reliable same-day bike delivery within Colombo and suburbs. Parcels, documents, food, and medicine. Real-time tracking available via WhatsApp.',
    tags: ['Same-Day', 'Parcel', 'Colombo', 'Fast Delivery'], priceUnit: 'delivery', sellerVerified: true, sellerMember: 'Jul 2021', sellerJobs: 421, sellerBio: 'Reliable delivery rider, 3+ years on the road.', sellerPhone: '+94774444444' },
  { id: 'l5', title: 'Plumbing & Pipe Fitting', category: 'Home Services', categoryIcon: 'fas fa-faucet', seller: 'Sunil B.', sellerInitial: 'S', location: 'Maharagama', district: 'Colombo', price: 4000, rating: 4.5, reviews: 67, type: 'Local Service', postedAt: new Date(Date.now() - 21600000),
    description: 'Expert plumbing services — leaks, blockages, pipe replacements, water heater installation. Emergency callouts available. Serving Colombo and Kalutara districts.',
    tags: ['Plumbing', 'Leaks', 'Emergency', 'Water Heater'], priceUnit: 'job', sellerVerified: false, sellerMember: 'Feb 2023', sellerJobs: 67, sellerBio: 'Licensed plumber with 12 years experience.', sellerPhone: '+94755555555' },
  { id: 'l6', title: 'Logo & Brand Identity', category: 'Creative', categoryIcon: 'fas fa-palette', seller: 'Hashini W.', sellerInitial: 'H', location: 'Online', district: 'Online', price: 12000, rating: 5.0, reviews: 41, type: 'Fixed Price', postedAt: new Date(Date.now() - 28800000),
    description: 'Complete brand identity design: logo, color palette, typography, business card, and brand guidelines. All file formats provided (SVG, PNG, PDF). Unlimited revisions.',
    tags: ['Logo', 'Branding', 'Identity', 'Unlimited Revisions'], priceUnit: 'package', sellerVerified: true, sellerMember: 'Sep 2022', sellerJobs: 41, sellerBio: 'Graphic designer with international experience.', sellerPhone: '+94776666666' },
  { id: 'l7', title: 'Car Full Detailing', category: 'Vehicle Service', categoryIcon: 'fas fa-car-side', seller: 'Pradeep N.', sellerInitial: 'P', location: 'Nugegoda', district: 'Colombo', price: 9500, rating: 4.8, reviews: 73, type: 'Booking Service', postedAt: new Date(Date.now() - 32400000),
    description: 'Full car detailing package including exterior wash, interior vacuum, dashboard polish, seat shampoo, and engine bay cleaning. We come to your location.',
    tags: ['Car Detailing', 'Mobile Service', 'Interior', 'Engine Bay'], priceUnit: 'car', sellerVerified: true, sellerMember: 'Jan 2022', sellerJobs: 73, sellerBio: 'Detailing specialist, serving Colombo for 4 years.', sellerPhone: '+94777777777' },
  { id: 'l8', title: 'Ayurveda Body Therapy', category: 'Ayurveda Service', categoryIcon: 'fas fa-spa', seller: 'Malini D.', sellerInitial: 'M', location: 'Kandy', district: 'Kandy', price: 6500, rating: 4.9, reviews: 124, type: 'Booking Service', postedAt: new Date(Date.now() - 36000000),
    description: 'Authentic Ayurveda body therapy and wellness treatments by a certified Ayurveda practitioner. Herbal oil massages, stress relief, and chronic pain management.',
    tags: ['Ayurveda', 'Massage', 'Wellness', 'Herbal Oil'], priceUnit: 'session', sellerVerified: true, sellerMember: 'May 2020', sellerJobs: 124, sellerBio: 'BAMS qualified Ayurveda doctor, 8 years practice.', sellerPhone: '+94768888888' },
  { id: 'l9', title: 'React & Next.js Development', category: 'Technology', categoryIcon: 'fas fa-code', seller: 'Yasiru F.', sellerInitial: 'Y', location: 'Online', district: 'Online', price: 35000, rating: 4.9, reviews: 56, type: 'Hourly Service', postedAt: new Date(Date.now() - 43200000),
    description: 'Expert React and Next.js development for web apps, dashboards, and e-commerce sites. TypeScript, REST API/GraphQL integration, performance optimization.',
    tags: ['React', 'Next.js', 'TypeScript', 'Full Stack'], priceUnit: 'project', sellerVerified: true, sellerMember: 'Oct 2021', sellerJobs: 56, sellerBio: 'Senior developer, 6 years React experience.', sellerPhone: '+94759999999' },
  { id: 'l10', title: 'Vegetable Farm Setup', category: 'Agriculture', categoryIcon: 'fas fa-tractor', seller: 'Bandula J.', sellerInitial: 'B', location: 'Anuradhapura', district: 'Anuradhapura', price: 22000, rating: 4.7, reviews: 18, type: 'Local Service', postedAt: new Date(Date.now() - 50400000),
    description: 'Complete vegetable farm setup including soil preparation, raised beds, irrigation system installation, and seed planting. Consultancy for organic farming.',
    tags: ['Organic', 'Farm Setup', 'Irrigation', 'Vegetables'], priceUnit: 'perch', sellerVerified: false, sellerMember: 'Dec 2022', sellerJobs: 18, sellerBio: 'Agriculture graduate, organic farming specialist.', sellerPhone: '+94760101010' },
  { id: 'l11', title: 'Grade 10 Science Tuition', category: 'Tuition', categoryIcon: 'fas fa-flask', seller: 'Chamil U.', sellerInitial: 'C', location: 'Matara', district: 'Matara', price: 3000, rating: 4.8, reviews: 92, type: 'Local Service', postedAt: new Date(Date.now() - 57600000),
    description: 'O/L Science tuition for Grade 9 and 10. Physics, Chemistry, Biology. Small groups max 5 students. Past paper practice and exam techniques included.',
    tags: ['O/L Science', 'Grade 10', 'Past Papers', 'Exam Prep'], priceUnit: 'month', sellerVerified: true, sellerMember: 'Mar 2021', sellerJobs: 92, sellerBio: 'B.Sc. graduate, 5+ years teaching O/L Science.', sellerPhone: '+94771212121' },
  { id: 'l12', title: 'Garden Landscaping', category: 'Home Services', categoryIcon: 'fas fa-tree', seller: 'Kumara S.', sellerInitial: 'K', location: 'Battaramulla', district: 'Colombo', price: 15000, rating: 4.6, reviews: 28, type: 'Booking Service', postedAt: new Date(Date.now() - 64800000),
    description: 'Professional garden design and landscaping. New garden creation, redesign, water features, paving, and plant selection. We handle everything from design to completion.',
    tags: ['Garden Design', 'Landscaping', 'Water Feature', 'Paving'], priceUnit: 'project', sellerVerified: false, sellerMember: 'Jun 2023', sellerJobs: 28, sellerBio: 'Landscape architect with 15 years experience.', sellerPhone: '+94763131313' },
];

export const MOCK_REVIEWS = [
  { id: 'r1', serviceId: 't1', author: 'Priya M.', initial: 'P', rating: 5, date: new Date(Date.now() - 5*86400000), text: 'Tharindu built our restaurant website in record time. The design is stunning and works perfectly on mobile. Highly recommend!' },
  { id: 'r2', serviceId: 't1', author: 'Lakshan R.', initial: 'L', rating: 5, date: new Date(Date.now() - 12*86400000), text: 'Excellent work, great communication, delivered well before deadline. Will use again for our next project.' },
  { id: 'r3', serviceId: 't1', author: 'Sajini W.', initial: 'S', rating: 5, date: new Date(Date.now() - 20*86400000), text: 'Professional service from start to finish. The SEO setup has already improved our Google ranking.' },
  { id: 'r4', serviceId: 't2', author: 'Geetha P.', initial: 'G', rating: 5, date: new Date(Date.now() - 3*86400000), text: 'Absolutely spotless after Nirmala\'s team came through. Worth every rupee. Booked monthly!' },
  { id: 'r5', serviceId: 't2', author: 'Rohan S.', initial: 'R', rating: 4, date: new Date(Date.now() - 8*86400000), text: 'Very thorough cleaning. They paid attention to areas I didn\'t even know needed cleaning. Great team.' },
  { id: 'r6', serviceId: 't3', author: 'Anura T.', initial: 'A', rating: 5, date: new Date(Date.now() - 15*86400000), text: 'My son went from a C to an A in Combined Maths. Kasun\'s explanations are crystal clear.' },
  { id: 'r7', serviceId: 't4', author: 'Chamali N.', initial: 'C', rating: 5, date: new Date(Date.now() - 30*86400000), text: 'Our wedding photos are absolutely magical. Dinithi captured every emotion perfectly. Thank you!' },
];
