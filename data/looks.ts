/* Phase 1 uses this list. In Phase 6 looks, prices and photos move into the database and are edited from the admin dashboard. */
export type Look = { slug: string; name: string; category: string; description: string; price: number; minutes: number };

export const CATEGORIES = ["Soft Glam", "Full Glam", "Bridal", "Birthday", "Natural", "Traditional", "Editorial"] as const;

export const LOOKS: Look[] = [
  { slug: "soft-glam", name: "Soft Glam", category: "Soft Glam", description: "Polished, luminous makeup for parties and photoshoots.", price: 45000, minutes: 60 },
  { slug: "rosy-soft-glam", name: "Rosy Soft Glam", category: "Soft Glam", description: "Dewy skin, rosy cheeks and a glossy lip.", price: 48000, minutes: 60 },
  { slug: "full-glam", name: "Full Glam", category: "Full Glam", description: "Bold, sculpted and camera-ready for your biggest nights.", price: 55000, minutes: 90 },
  { slug: "smoky-full-glam", name: "Smoky Full Glam", category: "Full Glam", description: "Dramatic smoky eyes with flawless, long-wear skin.", price: 60000, minutes: 90 },
  { slug: "bridal-glam", name: "Bridal Glam", category: "Bridal", description: "A long-wear, romantic finish. Trial included.", price: 120000, minutes: 150 },
  { slug: "bridesmaid-glam", name: "Bridesmaid Glam", category: "Bridal", description: "Soft, coordinated glam for the bridal party.", price: 50000, minutes: 75 },
  { slug: "birthday-glam", name: "Birthday Glam", category: "Birthday", description: "Radiant and celebratory, made to be photographed.", price: 50000, minutes: 75 },
  { slug: "natural-glam", name: "Natural Glam", category: "Natural", description: "Fresh, skin-first makeup that looks effortlessly like you.", price: 30000, minutes: 45 },
  { slug: "traditional-glam", name: "Traditional Glam", category: "Traditional", description: "Rich, elegant makeup for weddings and cultural celebrations.", price: 70000, minutes: 120 },
  { slug: "editorial-look", name: "Editorial Look", category: "Editorial", description: "Creative, artistic makeup for shoots and fashion.", price: 80000, minutes: 120 },
];

export const naira = (n: number) => "₦" + n.toLocaleString("en-NG");
export const duration = (m: number) => (m < 60 ? `${m} min` : `${Math.floor(m / 60)} hr${m % 60 ? ` ${m % 60} min` : ""}`);
