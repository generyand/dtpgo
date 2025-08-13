export const ORG = {
  name: "Department of Technical Programs",
  college: "UM Digos College",
  logoSrc: "/logo/dtp.png",
};

export const NAV_LINKS = [
  { href: "#home", label: "Home" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#faq", label: "FAQ" },
] as const;

export const NAV_CTA_TEXT = "Request a Demo";

export const HERO = {
  headline: "Modernizing Assembly Attendance, Effortlessly.",
  subheadline:
    "Launch events, scan arrivals, and see attendance update in real‑time — all in one modern dashboard.",
  ctaText: "Join Now ->",
  ctaHref: "/join",
  imageSrc: "/features/Hero.png",
};

export interface FeatureItem {
  title: string;
  description: string;
  iconSrc: string;
  iconAlt?: string;
  bullets?: string[];
}

export const FEATURES: FeatureItem[] = [
  {
    title: "Instant QR Code Check-in",
    description:
      "Students and attendees scan a unique QR code upon entry. No more lines, no more manual ticking, no more delays.",
    iconSrc: "/features/qrcode.png",
    iconAlt: "QR code icon",
    bullets: ["One-tap check-in", "Unique event QR"],
  },
  {
    title: "Real-Time Attendance Dashboard",
    description:
      "Monitor who has arrived and who is absent from a single screen. Accessible on any device—PC, tablet, or phone.",
    iconSrc: "/features/realtime.png",
    iconAlt: "Realtime dashboard icon",
    bullets: ["Live presence updates", "Works on any device"],
  },
  {
    title: "Automated Report Generation",
    description:
      "Instantly export detailed attendance records for assemblies and seminars. Perfect for compliance and record-keeping.",
    iconSrc: "/features/analytics.png",
    iconAlt: "Analytics/report icon",
    bullets: ["CSV/PDF exports", "Audit-friendly"],
  },
];

export const HOW_IT_WORKS = [
  {
    title: "Create Event",
    body: "Add your assembly details to generate a unique, secure QR code.",
  },
  {
    title: "Scan to Attend",
    body: "Display the QR code; attendees scan with their smartphone to be marked present.",
  },
  {
    title: "Track & Report",
    body: "View live data and download the complete report when the event ends.",
  },
];

export const FINAL_CTA = {
  headline: "Ready to Modernize Your Assembly Attendance?",
  subheadline:
    "Boost efficiency, ensure 100% accuracy, and provide a seamless experience for staff and students.",
  ctaText: "Request a Live Demo",
  points: [
    "Get started in under 5 minutes",
    "Works on phone, tablet, and laptop",
    "Secure & verified platform",
  ],
};

export const FAQ = [
  {
    q: "Is the system difficult to set up?",
    a: "Not at all. The system is designed to be intuitive. You can create your first event and be ready to accept check-ins in under 5 minutes.",
  },
  {
    q: "What do students need to check in?",
    a: "All they need is a smartphone with a camera. No special app installation is required on their end, making the process frictionless.",
  },
  {
    q: "Can this be used for events other than assemblies?",
    a: "Absolutely. It’s perfect for seminars, workshops, training sessions, and any event where you need to track attendance accurately.",
  },
  {
    q: "How secure is the attendance data?",
    a: "The data is securely stored and accessible only to authorized administrators. Unique QR codes prevent fraudulent check-ins.",
  },
];

export const FOOTER = {
  contactEmail: "dtp.dc@umindanao.edu.ph",
  contactPhone: "Department Phone Number",
  legal: ["Privacy Policy", "Terms of Service"],
  address: [
    "Department of Technical Programs",
    "UM Digos College",
    "Digos City, Philippines",
  ],
  socials: [
    { label: "Website", href: "https://umdc.umindanao.edu.ph/login", type: "website" },
    { label: "Facebook", href: "https://www.facebook.com/DepartmentOfTechnicalPrograms", type: "facebook" },
  ],
};


