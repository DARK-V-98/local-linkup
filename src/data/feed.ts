export interface FeedComment {
  id: string;
  author: string;
  initial: string;
  text: string;
  postedAt: Date;
}

export interface FeedPost {
  id: string;
  author: string;
  initial: string;
  role: "Individual Seller" | "Business" | "Pro Seller";
  verified: boolean;
  location: string;
  category: string;
  categoryIcon: string;
  postedAt: Date;
  title: string;
  description: string;
  price?: number;
  priceType?: "Fixed" | "Hourly" | "Negotiable";
  image?: string;
  tags: string[];
  likes: number;
  shares: number;
  contactPhone?: string;
  contactWhatsapp?: string;
  comments: FeedComment[];
}

export const MOCK_FEED_POSTS: FeedPost[] = [
  {
    id: "p1",
    author: "Tharindu Perera",
    initial: "T",
    role: "Pro Seller",
    verified: true,
    location: "Colombo 05",
    category: "Technology",
    categoryIcon: "fa-laptop-code",
    postedAt: new Date(Date.now() - 25 * 60 * 1000),
    title: "Custom WordPress Websites — Launch in 7 Days 🚀",
    description:
      "Hey Needlyy fam! 👋 I build blazing-fast WordPress sites for small businesses across Sri Lanka. SEO-ready, mobile-first, and fully managed. DM me for a free consultation!",
    price: 25000,
    priceType: "Fixed",
    tags: ["#webdesign", "#wordpress", "#colombo"],
    likes: 248,
    shares: 32,
    contactPhone: "+94771234567",
    contactWhatsapp: "+94771234567",
    comments: [
      { id: "c1", author: "Ruwan F.", initial: "R", text: "Sent you a DM 🙌", postedAt: new Date(Date.now() - 10 * 60 * 1000) },
      { id: "c2", author: "Nimali D.", initial: "N", text: "Do you also do e-commerce stores?", postedAt: new Date(Date.now() - 5 * 60 * 1000) },
    ],
  },
  {
    id: "p2",
    author: "Nirmala Cleaning Co.",
    initial: "N",
    role: "Business",
    verified: true,
    location: "Kandy",
    category: "Home Services",
    categoryIcon: "fa-broom",
    postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    title: "Deep home cleaning — bookings open this weekend ✨",
    description:
      "We have 4 slots open this Saturday & Sunday for deep cleaning in Kandy area. Eco-friendly products, trained staff, fully insured. Book early — slots fill fast!",
    price: 8500,
    priceType: "Fixed",
    tags: ["#cleaning", "#kandy", "#weekend"],
    likes: 132,
    shares: 18,
    contactWhatsapp: "+94772345678",
    comments: [
      { id: "c3", author: "Ishara K.", initial: "I", text: "Booked! Can't wait 😍", postedAt: new Date(Date.now() - 60 * 60 * 1000) },
    ],
  },
  {
    id: "p3",
    author: "Kasun Jayawardena",
    initial: "K",
    role: "Individual Seller",
    verified: false,
    location: "Galle",
    category: "Tuition",
    categoryIcon: "fa-graduation-cap",
    postedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
    title: "A/L Combined Maths — Online classes starting May 15",
    description:
      "🎓 New batch for 2027 A/L students. Live Zoom classes + recorded sessions + monthly papers. Limited to 25 students for personal attention.",
    price: 4500,
    priceType: "Fixed",
    tags: ["#tuition", "#alevels", "#maths"],
    likes: 412,
    shares: 87,
    contactPhone: "+94773456789",
    comments: [
      { id: "c4", author: "Pasindu M.", initial: "P", text: "Sir, are physics classes also available?", postedAt: new Date(Date.now() - 3 * 60 * 60 * 1000) },
      { id: "c5", author: "Hashini W.", initial: "H", text: "Highly recommend! 🔥", postedAt: new Date(Date.now() - 2 * 60 * 60 * 1000) },
    ],
  },
  {
    id: "p4",
    author: "Asela Quick Delivery",
    initial: "A",
    role: "Individual Seller",
    verified: true,
    location: "Colombo (island-wide)",
    category: "Delivery",
    categoryIcon: "fa-motorcycle",
    postedAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
    title: "Same-day bike delivery within Colombo 🛵",
    description:
      "Need something picked up & dropped today? I cover all of Colombo within 2 hours. Documents, food, parcels — Rs. 600 flat within 10km.",
    price: 600,
    priceType: "Fixed",
    tags: ["#delivery", "#colombo", "#sameday"],
    likes: 89,
    shares: 24,
    contactWhatsapp: "+94774567890",
    comments: [],
  },
];
