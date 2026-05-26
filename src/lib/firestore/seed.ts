/**
 * One-time seeding utility — imports all mock data into Firestore.
 * Call from a dev-only admin page or browser console.
 *
 * Usage in a component:
 *   import { seedAll } from "@/lib/firestore/seed";
 *   await seedAll();
 */
import { writeBatch, doc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import {
  MOCK_TOP_SERVICES,
  MOCK_LATEST_SERVICES,
  MOCK_REVIEWS,
} from "@/data/mock";

export async function seedServices(): Promise<number> {
  const all = [...MOCK_TOP_SERVICES, ...MOCK_LATEST_SERVICES];
  const batch = writeBatch(db);

  for (const s of all) {
    const ref = doc(db, "services", s.id);
    batch.set(ref, {
      title: s.title,
      category: s.category,
      categoryIcon: s.categoryIcon,
      description: s.description ?? "",
      price: s.price,
      priceUnit: s.priceUnit ?? "service",
      type: s.type,
      tags: s.tags ?? [],
      district: s.district,
      location: s.location,
      status: "active",
      views: (s.reviews ?? 0) * 8,
      orders: s.reviews ?? 0,
      rating: s.rating,
      badge: s.badge ?? null,
      badgeIcon: s.badgeIcon ?? null,
      // Seller info
      sellerId: `mock_${s.sellerInitial.toLowerCase()}`,
      sellerName: s.seller,
      sellerPhone: s.sellerPhone ?? "",
      sellerVerified: s.sellerVerified ?? false,
      sellerBio: s.sellerBio ?? "",
      sellerMember: s.sellerMember ?? "",
      sellerJobs: s.sellerJobs ?? 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ Seeded ${all.length} services`);
  return all.length;
}

export async function seedReviews(): Promise<number> {
  const batch = writeBatch(db);

  for (const r of MOCK_REVIEWS) {
    const ref = doc(db, "reviews", r.id);
    batch.set(ref, {
      serviceId: r.serviceId,
      sellerId: "mock_t",
      buyerId: "mock_buyer",
      author: r.author,
      initial: r.initial,
      rating: r.rating,
      text: r.text,
      createdAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log(`✅ Seeded ${MOCK_REVIEWS.length} reviews`);
  return MOCK_REVIEWS.length;
}

export async function seedDemoUsers(): Promise<void> {
  const batch = writeBatch(db);

  const users = [
    {
      id: "UDEMO01",
      name: "Saman Perera",
      email: "buyer@demo.com",
      phone: "+94771234567",
      role: "buyer",
      district: "Colombo",
      verified: true,
      joinedAt: "2024-01-15",
    },
    {
      id: "UDEMO02",
      name: "Tharindu P.",
      email: "seller@demo.com",
      phone: "+94779876543",
      role: "seller",
      district: "Colombo",
      verified: true,
      joinedAt: "2023-06-10",
      sellerCategory: "Technology",
    },
    {
      id: "UDEMO00",
      name: "Admin User",
      email: "admin@demo.com",
      phone: "+94700000000",
      role: "admin",
      district: "Colombo",
      verified: true,
      joinedAt: "2023-01-01",
    },
  ];

  for (const u of users) {
    const { id, ...data } = u;
    batch.set(doc(collection(db, "users"), id), {
      ...data,
      totalOrders: 0,
      totalEarnings: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  await batch.commit();
  console.log("✅ Seeded 3 demo users");
}

export async function seedAll(): Promise<void> {
  console.log("🚀 Starting Firestore seed...");
  await seedDemoUsers();
  await seedServices();
  await seedReviews();
  console.log("✅ Firestore seed complete!");
}
