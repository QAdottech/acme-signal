import type { Organization, Collection } from "@/types/organization";

const defaultOrganizations: Organization[] = [
  {
    id: "1",
    name: "Spotify",
    industry: "Music",
    location: "Stockholm",
    employees: 9000,
    logo: "/logos/spotify_400x400.jpg",
    website_url: "https://spotify.com",
    description:
      "Spotify is a leading global audio streaming platform that offers a vast library of music, podcasts, and other audio content. Founded in 2006 in Sweden by Daniel Ek and Martin Lorentzon, Spotify allows users to stream millions of tracks on-demand, create personalized playlists, and discover new content through curated recommendations and algorithms.",
    dealStage: "Customer",
    annualRevenue: "$14.4B",
    owner: "Sarah Johnson",
    lastContacted: "2026-02-20",
    collections: [],
  },
  {
    id: "2",
    name: "Wolt",
    industry: "Food",
    location: "Helsinki",
    employees: 5000,
    logo: "/logos/wolt_400x400.jpg",
    website_url: "https://wolt.com",
    description:
      "Wolt is a Finnish technology company specializing in food delivery and logistics services. Founded in 2014 by Miki Kuusi and a team of co-founders, Wolt connects users with local restaurants, grocery stores, and other retailers through its user-friendly app and platform.",
    dealStage: "Customer",
    annualRevenue: "$1.2B",
    owner: "Michael Chen",
    lastContacted: "2026-02-15",
    collections: [],
  },
  {
    id: "3",
    name: "QA.tech",
    industry: "Software testing",
    location: "Stockholm",
    employees: 15,
    logo: "/logos/qatech_400x400.jpg",
    website_url: "https://qa.tech",
    description:
      "QA.tech is an AI-driven platform that automates end-to-end (E2E) testing for web applications, particularly benefiting B2B SaaS companies. Its AI agent, Jarvis, scans web apps to learn their structure, generates tests based on user interactions, and continuously adapts to changes.",
    dealStage: "Lead",
    owner: "Emma Wilson",
    lastContacted: "2026-02-22",
    collections: [],
  },
  {
    id: "4",
    name: "Vercel",
    industry: "Web Development",
    location: "San Francisco",
    employees: 400,
    logo: "/logos/vercel.svg",
    website_url: "https://vercel.com",
    description:
      "Vercel is a cloud platform for static sites and Serverless Functions that fits perfectly with your workflow. It enables developers to host Jamstack websites and web services that deploy instantly, scale automatically, and requires no supervision.",
    dealStage: "Qualified",
    annualRevenue: "$100M",
    owner: "David Martinez",
    lastContacted: "2026-02-18",
    collections: [],
  },
  {
    id: "5",
    name: "Netlify",
    industry: "Web Development",
    location: "San Francisco",
    employees: 300,
    logo: "/logos/netlify_400x400.png",
    website_url: "https://www.netlify.com",
    description:
      "Netlify is a web development platform that multiplies productivity. By unifying the elements of the modern decoupled web, from local development to advanced edge logic, Netlify enables a 10x faster path to much more performant, secure, and scalable websites and apps.",
    dealStage: "Lead",
    owner: "Sarah Johnson",
    lastContacted: "2026-02-10",
    collections: [],
  },
  {
    id: "6",
    name: "Peakon",
    industry: "HR Technology",
    location: "Copenhagen",
    employees: 250,
    logo: "/logos/peakon_400x400.jpg",
    website_url: "https://peakon.com",
    description:
      "Peakon, now part of Workday, is an employee success platform that converts feedback into insights you can put to work. By making it simple to collect, analyze and act on employee feedback, Peakon improves employee engagement, develops quality leaders, and reduces employee turnover.",
    dealStage: "Customer",
    annualRevenue: "$50M",
    owner: "Michael Chen",
    lastContacted: "2026-01-28",
    collections: [],
  },
  {
    id: "7",
    name: "Small Giant Games",
    industry: "Gaming",
    location: "Helsinki",
    employees: 100,
    logo: "/logos/small_giant_games_400x400.png",
    website_url: "https://smallgiantgames.com",
    description:
      "Small Giant Games is a mobile game developer based in Helsinki, Finland. Founded in 2013, the company is known for creating Empires & Puzzles, a popular match-3 RPG game.",
    dealStage: "Customer",
    annualRevenue: "$200M",
    owner: "Emma Wilson",
    lastContacted: "2026-02-05",
    collections: [],
  },
  {
    id: "8",
    name: "Klarna",
    industry: "Fintech",
    location: "Stockholm",
    employees: 7000,
    logo: "/logos/klarna_400x400.jpg",
    website_url: "https://klarna.com",
    description:
      "Klarna is a leading global retail bank, payments, and shopping service. Founded in 2005 in Stockholm, Sweden, Klarna simplifies the shopping experience for consumers and merchants by offering various payment solutions and financial services.",
    dealStage: "Customer",
    annualRevenue: "$2.5B",
    owner: "David Martinez",
    lastContacted: "2026-02-24",
    collections: [],
  },
  {
    id: "9",
    name: "Oneflow",
    industry: "Contract Management",
    location: "Stockholm",
    employees: 200,
    logo: "/logos/oneflow_400x400.jpg",
    website_url: "https://oneflow.com",
    description:
      "Oneflow is a contract automation platform that helps businesses create, sign, and manage contracts digitally. The platform streamlines the entire contract process from drafting to signing and storing.",
    dealStage: "Qualified",
    annualRevenue: "$15M",
    owner: "Sarah Johnson",
    lastContacted: "2026-02-19",
    collections: [],
  },
  {
    id: "10",
    name: "lovable.dev",
    industry: "Developer Tools",
    location: "Stockholm",
    employees: 45,
    logo: "/logos/lovable_600x600.png",
    website_url: "https://lovable.dev",
    description:
      "lovable.dev is your superhuman full stack engineer, helping developers turn ideas into fully functional applications in seconds using AI. The platform streamlines the development process by automating routine tasks and providing intelligent coding assistance.",
    dealStage: "Lead",
    owner: "Emma Wilson",
    lastContacted: "2026-02-21",
    collections: [],
  },
  {
    id: "11",
    name: "Steep",
    industry: "Analytics",
    location: "Stockholm",
    employees: 20,
    logo: "/logos/steep_400x400.jpg",
    website_url: "https://steep.app",
    description:
      "Steep is a modern analytics platform powered by metrics that changes how companies use data together. It provides powerful insights and visualization tools to help businesses make data-driven decisions more effectively.",
    dealStage: "Lead",
    owner: "Michael Chen",
    lastContacted: "2026-02-12",
    collections: [],
  },
  {
    id: "12",
    name: "Anthropic",
    industry: "Artificial Intelligence",
    location: "San Francisco",
    employees: 500,
    logo: "/logos/anthropic_400x400.jpg",
    website_url: "https://anthropic.com",
    description:
      "Anthropic is an artificial intelligence research company focused on developing safe and ethical AI systems. Known for creating Claude, their AI assistant, they work on advancing AI technology while prioritizing safety and beneficial outcomes for humanity.",
    dealStage: "Proposal",
    annualRevenue: "$850M",
    owner: "David Martinez",
    lastContacted: "2026-02-23",
    collections: [],
  },
  {
    id: "13",
    name: "Depict.ai",
    industry: "E-commerce AI",
    location: "Stockholm",
    employees: 50,
    logo: "/logos/depict_200x200.png",
    website_url: "https://depict.ai",
    description:
      "depict.ai provides AI-powered product recommendations for e-commerce websites. Their technology helps online retailers increase sales by showing relevant products to shoppers through advanced machine learning algorithms.",
    dealStage: "Lead",
    owner: "Sarah Johnson",
    lastContacted: "2026-01-30",
    collections: [],
  },
  {
    id: "14",
    name: "Sana Labs",
    industry: "EdTech",
    location: "Stockholm",
    employees: 150,
    logo: "/logos/sana_400x400.jpg",
    website_url: "https://sanalabs.com",
    description:
      "Sana Labs is a global leader in AI-powered learning platforms. They develop personalized learning experiences that adapt to each individual's needs, helping organizations and individuals learn more effectively.",
    dealStage: "Customer",
    annualRevenue: "$30M",
    owner: "Emma Wilson",
    lastContacted: "2026-02-14",
    collections: [],
  },
  {
    id: "15",
    name: "Figma",
    industry: "Design Tools",
    location: "San Francisco",
    employees: 800,
    logo: "/logos/figma_400x400.jpg",
    website_url: "https://figma.com",
    description:
      "Figma is a collaborative interface design tool that operates in the browser. It allows teams to work together in real-time on design projects, making the design process more efficient and collaborative.",
    dealStage: "Customer",
    annualRevenue: "$600M",
    owner: "Michael Chen",
    lastContacted: "2026-02-25",
    collections: [],
  },
  {
    id: "16",
    name: "Hugging Face",
    industry: "Artificial Intelligence",
    location: "New York",
    employees: 450,
    logo: "/logos/huggingface_400x400.jpg",
    website_url: "https://huggingface.co",
    description:
      "Hugging Face is the leading platform for machine learning, providing tools and resources for building, training, and deploying ML models. They're known for their transformers library and commitment to open-source AI development.",
    dealStage: "Qualified",
    owner: "David Martinez",
    lastContacted: "2026-02-17",
    collections: [],
  },
  {
    id: "17",
    name: "Jasper",
    industry: "Artificial Intelligence",
    location: "Austin",
    employees: 400,
    logo: "/logos/jasper_400x400.jpg",
    website_url: "https://jasper.ai",
    description:
      "Jasper is an AI content platform that helps individuals and teams create high-quality content faster. Using advanced language models, Jasper assists with writing blog posts, social media content, marketing copy, and more.",
    dealStage: "Closed Lost",
    owner: "Sarah Johnson",
    lastContacted: "2026-01-15",
    collections: [],
  },
  {
    id: "18",
    name: "Overstory",
    industry: "Artificial Intelligence",
    location: "Amsterdam, Netherlands",
    employees: 50,
    logo: "/logos/overstory_400x400.png",
    website_url: "https://overstory.ai",
    description:
      "Overstory uses AI to monitor vegetation and prevent power outages by analyzing satellite imagery, helping utility companies save millions.",
    dealStage: "Lead",
    owner: "Emma Wilson",
    lastContacted: "2026-02-08",
    collections: [],
  },
  {
    id: "19",
    name: "Cradle",
    industry: "Biotechnology",
    location: "Amsterdam, Netherlands",
    employees: 30,
    logo: "/logos/cradlebio_200x200.jpeg",
    website_url: "https://cradle.bio",
    description:
      "Cradle provides an AI platform that aids in protein design for bioplastics, enabling sustainable material development.",
    dealStage: "Lead",
    owner: "Michael Chen",
    lastContacted: "2026-02-03",
    collections: [],
  },
  {
    id: "20",
    name: "Atlar",
    industry: "Financial Technology",
    location: "Stockholm, Sweden",
    employees: 25,
    logo: "/logos/atlar.svg",
    website_url: "https://atlar.com",
    description:
      "Atlar offers a platform for automating bank-to-bank payments, streamlining financial operations for businesses.",
    dealStage: "New",
    owner: "David Martinez",
    lastContacted: "2026-02-01",
    collections: [],
  },
  {
    id: "21",
    name: "Legora",
    industry: "Legal Technology",
    location: "Stockholm, Sweden",
    employees: 15,
    logo: "/logos/legora_200x200.jpg",
    website_url: "https://legora.com/",
    description:
      "Legora leverages AI to assist lawyers by automating document analysis and legal research, enhancing efficiency in legal practices.",
    dealStage: "Qualified",
    owner: "Sarah Johnson",
    lastContacted: "2026-02-20",
    collections: [],
  },
  {
    id: "22",
    name: "Anyfin",
    industry: "Fintech",
    location: "Stockholm, Sweden",
    employees: 80,
    logo: "/logos/anyfin_400x400.jpg",
    website_url: "https://anyfin.com",
    description:
      "Anyfin helps consumers refinance their existing loans and credit card debt at better rates, making financial services more transparent and accessible.",
    dealStage: "Customer",
    annualRevenue: "$25M",
    owner: "Michael Chen",
    lastContacted: "2026-02-11",
    collections: [],
  },
  {
    id: "23",
    name: "Cursor",
    industry: "Developer Tools",
    location: "San Francisco",
    employees: 15,
    logo: "/logos/anysphere_400x400.jpg",
    website_url: "https://cursor.sh",
    description:
      "Cursor is an AI-powered code editor built for pair-programming with AI. It helps developers write code faster and more efficiently through intelligent suggestions and automation.",
    dealStage: "Negotiation",
    owner: "Emma Wilson",
    lastContacted: "2026-02-24",
    collections: [],
  },
  {
    id: "24",
    name: "Perplexity",
    industry: "Artificial Intelligence",
    location: "San Francisco",
    employees: 40,
    logo: "/logos/perplexity_400x400.jpg",
    website_url: "https://perplexity.ai",
    description:
      "Perplexity is an AI-powered search engine that provides accurate, real-time answers with citations. It combines the power of large language models with up-to-date information from the web.",
    dealStage: "Proposal",
    owner: "David Martinez",
    lastContacted: "2026-02-22",
    collections: [],
  },
  {
    id: "25",
    name: "Listen Labs",
    industry: "Customer Research",
    location: "San Francisco",
    employees: 40,
    logo: "/logos/listen_labs.png",
    website_url: "https://listen.ai",
    description:
      "Listen Labs is an AI-powered customer research platform that automates voice-based customer interviews, enabling businesses to gain actionable insights rapidly. Founded in 2023, the platform handles the entire research process from interview design to analyzing responses.",
    dealStage: "Lead",
    owner: "Sarah Johnson",
    lastContacted: "2026-02-16",
    collections: [],
  },
];

const defaultCollections: Collection[] = [
  {
    id: "1",
    name: "Artificial Intelligence Companies",
    description: "A collection of companies working on AI technologies",
    organizationIds: ["3", "12", "13", "16", "17", "18", "24", "25"],
    tags: [],
  },
  {
    id: "2",
    name: "Stockholm Startups",
    description: "Promising startups based in Stockholm",
    organizationIds: ["3", "9", "10", "11", "20", "21", "22"],
    tags: [],
  },
  {
    id: "3",
    name: "Developer Tools",
    description: "Companies offering developer tools and AI assistance",
    organizationIds: ["3", "10", "15", "23"],
    tags: [],
  },
];

export function getOrganizations(): Organization[] {
  const storedOrganizations = localStorage.getItem("organizations");
  if (storedOrganizations) {
    return JSON.parse(storedOrganizations);
  }
  const organizationsWithCollections = defaultOrganizations.map((org) => ({
    ...org,
    collections: defaultCollections
      .filter((collection) => collection.organizationIds.includes(org.id))
      .map((collection) => collection.id),
  }));
  localStorage.setItem(
    "organizations",
    JSON.stringify(organizationsWithCollections)
  );
  return organizationsWithCollections;
}

export function getCollections(): Collection[] {
  const storedCollections = localStorage.getItem("collections");
  if (storedCollections) {
    return JSON.parse(storedCollections);
  }
  localStorage.setItem("collections", JSON.stringify(defaultCollections));
  return defaultCollections;
}

export function saveOrganizations(organizations: Organization[]): void {
  localStorage.setItem("organizations", JSON.stringify(organizations));
}

export function saveCollections(collections: Collection[]): void {
  localStorage.setItem("collections", JSON.stringify(collections));
}

export function deduplicateCollectionOrganizationIds(): void {
  const collections = getCollections();
  const updatedCollections = collections.map((collection) => ({
    ...collection,
    organizationIds: [...new Set(collection.organizationIds)],
  }));
  saveCollections(updatedCollections);
}
