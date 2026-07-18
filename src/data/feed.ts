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
