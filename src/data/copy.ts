// Site copy. Only the brand positioning from the brief is stated; nothing about founders,
// history, fabrics, origin, prices, offers or sustainability is claimed.
// Replace with approved copy when supplied.

export interface HeroSlide {
  id: string;
  /** Three photographs of the same look (desktop triptych); the first is used on mobile. */
  files: [string, string, string];
  eyebrow: string;
  title: string;
  body: string;
  cta: { label: string; to: string };
  secondary?: { label: string; to: string };
}

export const heroSlides: HeroSlide[] = [
  {
    id: "tailoring",
    files: ["DSC09946.jpg", "DSC09960.jpg", "DSC09994.jpg"],
    eyebrow: "Contemporary Western womenswear",
    title: "Tailoring with a statement",
    body: "Sculpted sleeves, sharp lapels and wide-leg trousers — refined suiting for everyday to occasion.",
    cta: { label: "Shop the collection", to: "/shop" },
    secondary: { label: "View the lookbook", to: "/lookbook" },
  },
  {
    id: "sleeves",
    files: ["DSC09865(1).jpg", "DSC09888.jpg", "DSC09899.jpg"],
    eyebrow: "Statement sleeves",
    title: "Make an entrance",
    body: "Bell, puff and cape-like sleeves that give every look its silhouette.",
    cta: { label: "Shop statement sleeves", to: "/collections/statement-sleeves" },
  },
  {
    id: "occasion",
    files: ["DSC00707.jpg", "DSC00519.jpg", "DSC00672.jpg"],
    eyebrow: "Occasion dressing",
    title: "For the moments that matter",
    body: "Floor-length layers and fluid longline styles in emerald, cream and ivory.",
    cta: { label: "Shop occasion", to: "/collections/occasion" },
  },
];

/** Homepage product rails, in order. `collection` filters the rail; `to` is the "view all" link. */
export const homeRails = [
  { id: "tailoring", title: "The tailoring edit", tagline: "sharp lines, soft power", collection: "tailoring", to: "/collections/tailoring" },
  { id: "statement-sleeves", title: "Statement sleeves", tagline: "the details everyone notices", collection: "statement-sleeves", to: "/collections/statement-sleeves" },
  { id: "occasion", title: "Occasion dressing", tagline: "for the moments that matter", collection: "occasion", to: "/collections/occasion" },
] as const;

export const copy = {
  intro: {
    eyebrow: "The atelier",
    title: "A contemporary Western wardrobe",
    body: "LAYAAN Atelier designs women's clothing in contemporary Western silhouettes: refined tailoring, coordinated outfits and statement sleeves, made for dressing from everyday to occasion.",
    pillars: [
      { title: "Refined tailoring", body: "Blazers and trouser suits with sharp lapels, sculpted shoulders and wide-leg trousers." },
      { title: "Coordinated sets", body: "Jackets with skirts or trousers, and tunics with trousers, designed to be worn together." },
      { title: "Statement sleeves", body: "Puff, bell and cape-like sleeves that give each look its silhouette." },
    ],
  },
} as const;
