/** A published service listing, as rendered by the cards across the site. */
export interface ServiceListing {
  id: string; title: string; category: string; categoryIcon: string;
  seller: string; sellerInitial: string; location: string; district: string; price: number;
  rating: number; reviews: number; type: string; postedAt: Date;
  badge?: string; badgeIcon?: string;
  description?: string; tags?: string[]; priceUnit?: string;
  sellerVerified?: boolean; sellerMember?: string; sellerJobs?: number;
  sellerBio?: string; sellerPhone?: string;
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

