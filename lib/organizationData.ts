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
      "Spotify is a leading global audio streaming platform that offers a vast library of music, podcasts, and other audio content. Founded in 2006 in Sweden by Daniel Ek and Martin Lorentzon, Spotify allows users to stream millions of tracks on-demand, create personalized playlists, and discover new content through curated recommendations and algorithms. It operates on a freemium model, offering free ad-supported access and premium subscription plans with added features like offline listening and ad-free streaming. Spotify has revolutionized the music industry by providing artists with a platform to reach a global audience while reshaping how people consume and interact with audio entertainment.",
    assessmentStatus: "Portfolio company",
    exitStatus: "IPO",
    exitDate: "2018-04-03",
    collections: [],
    founders: [
      {
        name: "Daniel Ek",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/danielek",
      },
      {
        name: "Martin Lorentzon",
        role: "Co-founder",
        linkedin: "https://www.linkedin.com/in/martinlorentzon",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2011-01",
        amount: "$100M",
        roundType: "Series C",
        investors: ["Kleiner Perkins", "Accel Partners", "DST Global"],
      },
      {
        id: "2",
        date: "2015-06",
        amount: "$526M",
        roundType: "Series E",
        investors: ["TPG", "Dragoneer", "Goldman Sachs"],
      },
      {
        id: "3",
        date: "2016-03",
        amount: "$1B",
        roundType: "Series F",
        investors: ["TPG", "Dragoneer Investment Group"],
      },
    ],
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
      "Wolt is a Finnish technology company specializing in food delivery and logistics services. Founded in 2014 by Miki Kuusi and a team of co-founders, Wolt connects users with local restaurants, grocery stores, and other retailers through its user-friendly app and platform. Operating in multiple countries worldwide, Wolt offers fast, reliable delivery and pickup options, making it a popular choice for urban consumers. The company is known for its emphasis on exceptional customer service, efficient logistics, and sleek design. In May 2022, Wolt was acquired by DoorDash in an all-stock transaction valued at $8.1 billion, allowing DoorDash to expand into European and Asian markets while Wolt continues to operate as a sub-brand.",
    assessmentStatus: "Portfolio company",
    exitStatus: "Acquired",
    exitDate: "2022-05",
    acquiredBy: "DoorDash",
    collections: [],
    founders: [
      {
        name: "Miki Kuusi",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/mikikuusi",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2016-04",
        amount: "$12.5M",
        roundType: "Series A",
        investors: ["EQT Ventures"],
      },
      {
        id: "2",
        date: "2018-01",
        amount: "$30M",
        roundType: "Series B",
        investors: ["EQT Ventures", "83North", "Highland Europe"],
      },
      {
        id: "3",
        date: "2019-06",
        amount: "$130M",
        roundType: "Series C",
        investors: ["ICONIQ Capital"],
      },
      {
        id: "4",
        date: "2020-05",
        amount: "$100M",
        roundType: "Series D",
        investors: ["ICONIQ Capital", "83North", "Highland Europe"],
      },
      {
        id: "5",
        date: "2021-01",
        amount: "$530M",
        roundType: "Series E",
        investors: [
          "ICONIQ Growth",
          "Tiger Global",
          "DST Global",
          "KKR",
          "Prosus",
          "EQT Growth",
          "Coatue",
          "83North",
          "Goldman Sachs",
        ],
      },
      {
        id: "6",
        date: "2022-05",
        amount: "$8.1B",
        roundType: "Acquisition",
        investors: ["DoorDash"],
      },
    ],
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
      "QA.tech is an AI-driven platform that automates end-to-end (E2E) testing for web applications, particularly benefiting B2B SaaS companies. Its AI agent, Jarvis, scans web apps to learn their structure, generates tests based on user interactions, and continuously adapts to changes, identifying 95% of bugs in a fraction of the time required by traditional methods. This approach allows development teams to focus more on innovation and user experience, reducing manual QA testing costs and accelerating deployment. Founded in 2024, QA.tech aims to revolutionize quality assurance by providing an autonomous QA tester that ensures reliable and bug-free applications developed by both humans and artificial intelligence.",
    assessmentStatus: "Screening",
    collections: [],
    founders: [
      {
        name: "Daniel Mauno Pettersson",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/danielmaunopettersson",
      },
      {
        name: "Patrick Lef",
        role: "CPO & Co-founder",
        linkedin: "https://www.linkedin.com/in/patricklef",
      },
      {
        name: "Vilhelm von Ehrenheim",
        role: "CAIO & Co-founder",
        linkedin: "https://www.linkedin.com/in/vilhelm-von-ehrenheim",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2023-09",
        amount: "$1M",
        roundType: "Pre-seed",
        investors: ["byFounders"],
      },
      {
        id: "2",
        date: "2024-05",
        amount: "€3M",
        roundType: "Seed",
        investors: [
          "PROfounders Capital",
          "byFounders",
          "Curiosity VC",
          "Mads Johnsen",
          "Jon Åslund",
        ],
      },
    ],
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
      "Vercel is a cloud platform for static sites and Serverless Functions that fits perfectly with your workflow. It enables developers to host Jamstack websites and web services that deploy instantly, scale automatically, and requires no supervision, all with no configuration.",
    assessmentStatus: "Hitlist",
    collections: [],
    founders: [
      {
        name: "Guillermo Rauch",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/rauchg",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2020-04",
        amount: "$21M",
        roundType: "Series A",
        investors: ["Accel", "CRV", "GV"],
      },
      {
        id: "2",
        date: "2020-12",
        amount: "$40M",
        roundType: "Series B",
        investors: ["Accel", "Bedrock Capital"],
      },
      {
        id: "3",
        date: "2021-11",
        amount: "$150M",
        roundType: "Series D",
        investors: ["GGV Capital", "Accel"],
      },
    ],
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
    assessmentStatus: "Screening",
    collections: [],
    founders: [
      {
        name: "Mathias Biilmann",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/mathiasbiilmann",
      },
      {
        name: "Christian Bach",
        role: "Co-founder",
        linkedin: "https://www.linkedin.com/in/christianbach",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2016-08",
        amount: "$2.1M",
        roundType: "Seed",
        investors: ["at.inc/"],
      },
      {
        id: "2",
        date: "2018-03",
        amount: "$12M",
        roundType: "Series A",
        investors: ["Andreessen Horowitz"],
      },
      {
        id: "3",
        date: "2018-10",
        amount: "$30M",
        roundType: "Series B",
        investors: ["Kleiner Perkins"],
      },
      {
        id: "4",
        date: "2020-03",
        amount: "$53M",
        roundType: "Series C",
        investors: [
          "EQT Ventures",
          "Andreessen Horowitz",
          "Kleiner Perkins",
          "Preston-Werner Ventures",
        ],
      },
      {
        id: "5",
        date: "2021-11",
        amount: "$105M",
        roundType: "Series D",
        investors: [
          "Bessemer Venture Partners",
          "Andreessen Horowitz",
          "BOND",
          "EQT Ventures",
          "Kleiner Perkins",
          "Mango Capital",
          "Menlo Ventures",
        ],
      },
    ],
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
    assessmentStatus: "Portfolio company",
    exitStatus: "Acquired",
    exitDate: "2021-03",
    acquiredBy: "Workday",
    collections: [],
    fundingRounds: [
      {
        id: "1",
        date: "2015",
        amount: "€4M",
        roundType: "Seed",
        investors: ["Seed investors"],
      },
      {
        id: "2",
        date: "2016",
        amount: "€6M",
        roundType: "Series A",
        investors: ["Series A investors"],
      },
      {
        id: "3",
        date: "2019",
        amount: "$57M",
        roundType: "Series B",
        investors: ["Atomico", "IDInvest Partners"],
      },
      {
        id: "4",
        date: "2021-03",
        amount: "$700M",
        roundType: "Acquisition",
        investors: ["Workday"],
      },
    ],
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
      "Small Giant Games is a mobile game developer based in Helsinki, Finland. Founded in 2013, the company is known for creating Empires & Puzzles, a popular match-3 RPG game. In 2018, Small Giant Games was acquired by Zynga, allowing them to expand their reach and continue developing innovative mobile games.",
    assessmentStatus: "Portfolio company",
    exitStatus: "Acquired",
    exitDate: "2018-12",
    acquiredBy: "Zynga",
    collections: [],
    fundingRounds: [
      {
        id: "1",
        date: "2013-10",
        amount: "Undisclosed",
        roundType: "Seed",
        investors: ["Seed investors"],
      },
      {
        id: "2",
        date: "2014-10",
        amount: "Undisclosed",
        roundType: "Seed",
        investors: ["Creandum", "PROfounders Capital"],
      },
      {
        id: "3",
        date: "2017-03",
        amount: "$5.7M",
        roundType: "Series A",
        investors: ["EQT Ventures"],
      },
      {
        id: "4",
        date: "2018-02",
        amount: "$41M",
        roundType: "Series B",
        investors: ["EQT Ventures", "Creandum", "Spintop Ventures"],
      },
      {
        id: "5",
        date: "2018-12",
        amount: "$700M",
        roundType: "Acquisition",
        investors: ["Zynga"],
      },
    ],
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
      "Klarna is a leading global retail bank, payments, and shopping service. Founded in 2005 in Stockholm, Sweden, Klarna simplifies the shopping experience for consumers and merchants by offering various payment solutions and financial services. The company has revolutionized online shopping with its 'buy now, pay later' model and serves millions of consumers and merchants worldwide.",
    assessmentStatus: "Portfolio company",
    exitStatus: "IPO",
    exitDate: "2021-07",
    collections: [],
    founders: [
      {
        name: "Sebastian Siemiatkowski",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/sebastiansiemiatkowski",
      },
      {
        name: "Niklas Adalberth",
        role: "Co-founder",
        linkedin: "https://www.linkedin.com/in/niklasadalberth",
      },
      {
        name: "Victor Jacobsson",
        role: "Co-founder",
        linkedin: "https://www.linkedin.com/in/victorjacobsson",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2020-09",
        amount: "$650M",
        roundType: "Series G",
        investors: [
          "Silver Lake",
          "BlackRock",
          "HMI Capital",
          "Ant Group",
          "GIC",
          "Dragoneer Investment Group",
        ],
      },
      {
        id: "2",
        date: "2021-03",
        amount: "$1B",
        roundType: "Series H",
        investors: [
          "Silver Lake",
          "BlackRock",
          "Sequoia Capital",
          "Visa",
          "TCV",
        ],
      },
      {
        id: "3",
        date: "2021-06",
        amount: "$639M",
        roundType: "Series H",
        investors: [
          "SoftBank Vision Fund 2",
          "Silver Lake",
          "Sequoia Capital",
          "Dragoneer Investment Group",
        ],
      },
      {
        id: "4",
        date: "2022-07",
        amount: "$800M",
        roundType: "Series H",
        investors: [
          "Sequoia Capital",
          "Silver Lake",
          "Mubadala",
          "CPP Investments",
        ],
      },
      {
        id: "5",
        date: "2025-09",
        amount: "$1.37B",
        roundType: "IPO",
        investors: ["Public Markets"],
      },
    ],
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
      "Oneflow is a contract automation platform that helps businesses create, sign, and manage contracts digitally. The platform streamlines the entire contract process from drafting to signing and storing, making contract management more efficient and user-friendly.",
    assessmentStatus: "Hitlist",
    exitStatus: "IPO",
    exitDate: "2022-04",
    collections: [],
    fundingRounds: [
      {
        id: "1",
        date: "2015",
        amount: "Undisclosed",
        roundType: "Seed",
        investors: ["Lars Appelstål"],
      },
      {
        id: "2",
        date: "2016",
        amount: "Undisclosed",
        roundType: "Seed",
        investors: ["Bengt Nilsson", "Johan Borendal"],
      },
      {
        id: "3",
        date: "2020-01",
        amount: "SEK 20M",
        roundType: "Angel",
        investors: ["Mattias Ståhlgren"],
      },
      {
        id: "4",
        date: "2022-04",
        amount: "Undisclosed",
        roundType: "IPO",
        investors: ["Nasdaq First North"],
      },
      {
        id: "5",
        date: "2024-08",
        amount: "SEK 75M",
        roundType: "Post-IPO",
        investors: ["Spintop Ventures", "Lars Appelstål"],
      },
    ],
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
      "lovable.dev is your superhuman full stack engineer, helping developers turn ideas into fully functional applications in seconds using AI. The platform streamlines the development process by automating routine tasks and providing intelligent coding assistance. The company pioneered 'vibe coding' and became a unicorn just eight months after launch.",
    assessmentStatus: "Screening",
    collections: [],
    founders: [
      {
        name: "Anton Osika",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/antonosika",
      },
      {
        name: "Fabian Hedin",
        role: "CTO & Co-founder",
        linkedin: "https://www.linkedin.com/in/fabian-hedin-2377b0144",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2024-10",
        amount: "€6.8M",
        roundType: "Pre-seed",
        investors: ["byFounders", "Hummingbird Ventures"],
      },
      {
        id: "2",
        date: "2025-02",
        amount: "€14.3M",
        roundType: "Seed",
        investors: ["Creandum", "Charlie Songhurst", "Thomas Wolf"],
      },
      {
        id: "3",
        date: "2025-07",
        amount: "$200M",
        roundType: "Series A",
        investors: [
          "Accel",
          "20VC",
          "ByFounders",
          "Creandum",
          "Hummingbird Ventures",
          "Visionaries Club",
        ],
      },
    ],
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
    assessmentStatus: "Screening",
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
    assessmentStatus: "Preparing for NDC",
    collections: [],
    fundingRounds: [
      {
        id: "1",
        date: "2022-05",
        amount: "$580M",
        roundType: "Series C",
        investors: ["Sam Bankman-Fried", "Caroline Ellison", "Spark Capital"],
      },
      {
        id: "2",
        date: "2023-05",
        amount: "$450M",
        roundType: "Series D",
        investors: [
          "Spark Capital",
          "Salesforce Ventures",
          "Google",
          "Sound Ventures",
        ],
      },
      {
        id: "3",
        date: "2024-03",
        amount: "$4B",
        roundType: "Series E",
        investors: ["Amazon"],
      },
    ],
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
    assessmentStatus: "Screening",
    collections: [],
    fundingRounds: [
      {
        id: "1",
        date: "2020-05",
        amount: "$150K",
        roundType: "Pre-Seed",
        investors: ["Angel Investors"],
      },
      {
        id: "2",
        date: "2020-08",
        amount: "$2.7M",
        roundType: "Seed",
        investors: [
          "Initialized Capital",
          "Y Combinator",
          "Northzone",
          "EQT Ventures",
        ],
      },
      {
        id: "3",
        date: "2022-02",
        amount: "$17M",
        roundType: "Series A",
        investors: [
          "Tiger Global Management",
          "Initialized Capital",
          "EQT Ventures",
        ],
      },
    ],
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
    assessmentStatus: "Portfolio company",
    collections: [],
    exitStatus: "Acquired",
    exitDate: "2025-09",
    acquiredBy: "Workday",
    fundingRounds: [
      {
        id: "1",
        date: "2021-01",
        amount: "$18M",
        roundType: "Series A",
        investors: ["EQT Ventures"],
      },
      {
        id: "2",
        date: "2022-12",
        amount: "$34M",
        roundType: "Series B",
        investors: ["Menlo Ventures", "EQT Ventures"],
      },
      {
        id: "3",
        date: "2023-05",
        amount: "$28M",
        roundType: "Series B Extension",
        investors: ["NEA", "Workday Ventures"],
      },
      {
        id: "4",
        date: "2025-09",
        amount: "$1.1B",
        roundType: "Acquisition",
        investors: ["Workday"],
      },
    ],
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
      "Figma is a collaborative interface design tool that operates in the browser. It allows teams to work together in real-time on design projects, making the design process more efficient and collaborative. The platform has revolutionized how designers and teams create, test, and ship designs.",
    assessmentStatus: "Portfolio company",
    exitStatus: "IPO",
    exitDate: "2021-09",
    collections: [],
    founders: [
      {
        name: "Dylan Field",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/dylanfield",
      },
      {
        name: "Evan Wallace",
        role: "Co-founder",
        linkedin: "https://www.linkedin.com/in/evanwallace",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2013-06",
        amount: "$3.89M",
        roundType: "Seed",
        investors: ["Adam Nash", "Index Ventures", "Localglobe"],
      },
      {
        id: "2",
        date: "2015-12",
        amount: "$14M",
        roundType: "Series A",
        investors: ["Greylock Partners", "Index Ventures", "Iconiq Capital"],
      },
      {
        id: "3",
        date: "2018-02",
        amount: "$25M",
        roundType: "Series B",
        investors: [
          "Greylock Partners",
          "Index Ventures",
          "Kleiner Perkins",
          "Fuel Capital",
        ],
      },
      {
        id: "4",
        date: "2019-02",
        amount: "$40M",
        roundType: "Series C",
        investors: [
          "Sequoia Capital",
          "Greylock Partners",
          "Index Ventures",
          "Kleiner Perkins",
          "Founders Fund",
        ],
      },
      {
        id: "5",
        date: "2020-04",
        amount: "$50M",
        roundType: "Series D",
        investors: [
          "Andreessen Horowitz",
          "Index Ventures",
          "Sequoia Capital",
          "Kleiner Perkins",
        ],
      },
      {
        id: "6",
        date: "2021-06",
        amount: "$200M",
        roundType: "Series E",
        investors: ["Durable Capital Partners", "Morgan Stanley"],
      },
      {
        id: "7",
        date: "2025-07",
        amount: "$1.22B",
        roundType: "IPO",
        investors: ["Public Markets"],
      },
    ],
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
    assessmentStatus: "Hitlist",
    collections: [],
    fundingRounds: [
      {
        id: "1",
        date: "2021-03",
        amount: "$40M",
        roundType: "Series B",
        investors: ["Lux Capital", "Addition", "A.Capital", "Betaworks"],
      },
      {
        id: "2",
        date: "2022-05",
        amount: "$100M",
        roundType: "Series C",
        investors: ["Coatue", "Sequoia Capital", "Tiger Global"],
      },
      {
        id: "3",
        date: "2023-08",
        amount: "$235M",
        roundType: "Series D",
        investors: ["Salesforce Ventures", "Google", "Amazon", "Nvidia"],
      },
    ],
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
    assessmentStatus: "Not interesting",
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
    assessmentStatus: "Screening",
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
    assessmentStatus: "Screening",
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
    assessmentStatus: "Screening",
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
    assessmentStatus: "Hitlist",
    collections: [],
    founders: [
      {
        name: "Max Junestrand",
        role: "CEO & Co-founder",
        linkedin: "https://www.linkedin.com/in/maxjunestrand",
      },
      {
        name: "Sigge Labor",
        role: "CTO & Co-founder",
        linkedin: "https://www.linkedin.com/in/siggelabor",
      },
      {
        name: "August Erséus",
        role: "CPO & Co-founder",
        linkedin: "https://www.linkedin.com/in/augusterseus",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2024-05",
        amount: "$10.5M",
        roundType: "Seed",
        investors: ["Benchmark", "Y Combinator"],
      },
      {
        id: "2",
        date: "2024-07",
        amount: "$25M",
        roundType: "Series A",
        investors: ["Redpoint Ventures", "Y Combinator"],
      },
      {
        id: "3",
        date: "2025-05",
        amount: "$80M",
        roundType: "Series B",
        investors: [
          "ICONIQ Capital",
          "General Catalyst",
          "Redpoint Ventures",
          "Benchmark",
          "Y Combinator",
        ],
      },
    ],
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
    assessmentStatus: "Portfolio company",
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
    assessmentStatus: "Hitlist",
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
    assessmentStatus: "Screening",
    collections: [],
    fundingRounds: [
      {
        id: "1",
        date: "2023-03",
        amount: "$25M",
        roundType: "Series A",
        investors: ["NEA", "Elad Gil"],
      },
      {
        id: "2",
        date: "2024-01",
        amount: "$73.6M",
        roundType: "Series B",
        investors: ["IVP", "NEA", "Jeff Bezos", "Nvidia"],
      },
      {
        id: "3",
        date: "2024-06",
        amount: "$62.7M",
        roundType: "Series C",
        investors: ["Daniel Gross", "Nat Friedman", "IVP"],
      },
    ],
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
      "Listen Labs is an AI-powered customer research platform that automates voice-based customer interviews, enabling businesses to gain actionable insights rapidly. Founded in 2023, the platform handles the entire research process—from interview design and participant recruitment to conducting interviews and analyzing responses. Using large language models, Listen Labs generates comprehensive reports, highlight reels, and presentations within hours instead of weeks. The platform provides access to millions of pre-qualified interviewees across various demographics and geographies, serving major clients including Microsoft, Canva, and Chubbies. The company was founded by Florian Juengermann (former Tesla Autopilot team member and German competitive programming champion) and Alfred Wahlforss (brother of SoundCloud's founder), who previously launched the AI avatar app BeFake.",
    assessmentStatus: "Screening",
    collections: [],
    founders: [
      {
        name: "Florian Juengermann",
        role: "Co-founder",
        linkedin: "https://www.linkedin.com/in/florianjuengermann",
      },
      {
        name: "Alfred Wahlforss",
        role: "Co-founder",
        linkedin: "https://www.linkedin.com/in/alfredwahlforss",
      },
    ],
    fundingRounds: [
      {
        id: "1",
        date: "2025-04",
        amount: "$27M",
        roundType: "Seed + Series A",
        investors: ["Sequoia Capital", "Conviction", "Pear VC"],
      },
    ],
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
