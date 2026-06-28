export type Project = {
  title: string;
  summary: string;
  impact: string;
  stack: string[];
  href: string;
  repo?: string;
};

export type SkillCluster = {
  title: string;
  depth: string;
  capabilities: string[];
};

export type ExperienceItem = {
  year: string;
  title: string;
  company: string;
  summary: string;
  highlights: string[];
};

export const projects: Project[] = [
  {
    title: "GirlScript SoC 2022 Official Website",
    summary:
      "A production-grade web application for 8000+ contributors in the annual open-source program, built with Next.js and TailwindCSS.",
    impact:
      "Included a dynamic leaderboard and on-chain certificate verification to support sponsor visibility and contributor trust.",
    stack: ["Next.js", "TailwindCSS", "Chakra UI", "CI/CD", "Figma"],
    href: "https://gssoc.girlscript.tech",
    repo: "https://github.com/girlscript/gssoc-website-new",
  },
  {
    title: "EthCommerce",
    summary:
      "A creator-first commerce platform that removes intermediaries and lets builders sell directly to their audience across chains.",
    impact:
      "Stored course data on IPFS and used QuickNode alerts for real-time audience and creator notifications.",
    stack: ["Web3", "IPFS", "QuickNode", "Next.js", "Smart Contracts"],
    href: "https://ethcommerce.vercel.app/",
    repo: "https://github.com/Open-Sorcerer/EthCommerce",
  },
  {
    title: "DeStackOverflow",
    summary:
      "A decentralized Stack Overflow-style public forum where users ask technical questions and receive community answers.",
    impact:
      "Preserved user privacy while adding crypto donations and karma mechanics to incentivize quality contributions.",
    stack: ["Next.js 13", "Web3", "Decentralized Storage", "Community Systems"],
    href: "https://destackoverflow.on.fleek.co/",
    repo: "https://github.com/Open-Sorcerer/DeStackOverflow",
  },
  {
    title: "SoLingo",
    summary:
      "A learn-to-earn Solana education platform where users study modules, attempt quizzes, and earn NFTs for completion.",
    impact:
      "Made crypto literacy engaging through incentives, badges, and module-driven progression.",
    stack: ["Solana", "Web3", "NFTs", "Learning Experience"],
    href: "https://www.youtube.com/embed/T_0E6QbSDLo",
    repo: "https://github.com/Open-Sorcerer/SoLingo",
  },
  {
    title: "CrewS",
    summary:
      "A no-code tool to create Data DAOs with proposal management, on-chain voting, and execution workflows.",
    impact:
      "Enabled data-centric governance with transparent proposal pipelines and dataset-focused DAO operations.",
    stack: ["FVM", "Data DAO", "On-chain Voting", "Governance"],
    href: "https://bafybeiblkpu3lbde4jgopk36e2y5ggcti6olyzgpdisgcblcem24ls5cku.ipfs.gateway.valist.io/",
    repo: "https://github.com/Open-Sorcerer/CrewS",
  },
  {
    title: "NFT Haven",
    summary:
      "A multi-chain DeFi dashboard for minting and tracking assets across Ethereum, BSC, and Polygon ecosystems.",
    impact:
      "Added soulbound NFT minting and low-cost Polygon flows for identity-bound digital assets.",
    stack: ["Polygon", "Ethereum", "BSC", "NFT", "DeFi"],
    href: "https://nft-haven.vercel.app/",
    repo: "https://github.com/Suvraneel/Instant-Soulbound-NFT-Minter",
  },
  {
    title: "JavaMonsterz",
    summary:
      "A 2D RPG-style indie adventure game built in stock Java using OOP and custom game logic without game engines.",
    impact:
      "Implemented puzzle mechanics, enemy vision systems, and complete single-player progression loops.",
    stack: ["Java 17", "OOP", "Game Logic", "IntelliJ IDEA"],
    href: "https://www.youtube.com/embed/ft7uN51_jCw",
    repo: "https://github.com/Suvraneel/JavaMonsterz",
  },
  {
    title: "Bounty Gunslinger",
    summary:
      "A play-to-earn game access concept where NFT ownership unlocks exclusive gameplay and downloadable content.",
    impact:
      "Designed transferability mechanics so game ownership could be traded by transferring access NFTs.",
    stack: ["Blockchain Gaming", "NFT", "Web3", "Token Access"],
    href: "https://open-sorcerer-nft-game-token.vercel.app/",
    repo: "https://github.com/Suvraneel/Bounty-Gunslinger",
  },
  {
    title: "CoWIN Clone",
    summary:
      "A functional cowin.gov.in clone on the MERN stack with slot discovery, booking flows, and admin center controls.",
    impact:
      "Covered beneficiary registration, appointment booking, notifications, and vaccination center CRUD workflows.",
    stack: ["MERN", "Node.js", "Express", "Postman", "REST APIs"],
    href: "https://cowin-clone-ui.vercel.app/",
    repo: "https://github.com/Suvraneel/cowin-clone-ui",
  },
  {
    title: "Short-term Stock Market Price Trend Prediction",
    summary:
      "A time-series forecasting project using a 4-layer RNN with LSTM on NSE equity datasets.",
    impact:
      "Benchmarked model quality with RMSE and MAE while tuning optimizers and activation functions.",
    stack: ["Python", "RNN", "LSTM", "Time Series", "ML"],
    href: "https://github.com/Suvraneel",
  },
  {
    title: "Meteorologyly",
    summary:
      "A minimalist weather dashboard that visualizes current and 7-day forecasts with chart-driven interfaces.",
    impact:
      "Combined weather APIs, map embeds, and location-driven discovery for practical forecast exploration.",
    stack: ["OpenWeatherMap", "Chart.js", "Google Maps", "JavaScript"],
    href: "https://suvraneel.github.io/Meteorologyly/",
    repo: "https://github.com/Suvraneel/Meteorologyly",
  },
  {
    title: "Diablo Music App",
    summary:
      "A minimalist dark-themed music player that supports both online and local listening experiences.",
    impact:
      "Added Firebase-authenticated login to personalize playback and user sessions.",
    stack: ["JavaScript", "Firebase", "UI Engineering"],
    href: "https://suvraneel.github.io/pages/diablo-music.html",
    repo: "https://github.com/Suvraneel/Diablo-Music",
  },
];

export const skillClusters: SkillCluster[] = [
  {
    title: "Front-end Development",
    depth: "Crafting modern interfaces with performance-first interaction design",
    capabilities: ["JavaScript", "TypeScript", "React", "Next.js", "TailwindCSS"],
  },
  {
    title: "Back-end Engineering",
    depth: "Building robust services, APIs, and data-backed application layers",
    capabilities: ["Node.js", "Express", "MongoDB", "MySQL", "PHP", "REST APIs"],
  },
  {
    title: "Web3 and Decentralized Stack",
    depth: "Shipping blockchain-enabled products with practical developer tooling",
    capabilities: ["IPFS", "Filecoin", "Ethers.js", "Pinata", "Wallet SDKs"],
  },
  {
    title: "Community and Leadership",
    depth: "Scaling technical communities, events, and contributor ecosystems",
    capabilities: [
      "Mentored 10,000+ open-source contributors",
      "Hackathon collaboration across India",
      "Program strategy and sponsorship execution",
    ],
  },
];

export const experience: ExperienceItem[] = [
  {
    year: "2023",
    title: "Lead Organiser - Core Team",
    company: "Web3Conf India",
    summary:
      "Coordinated end-to-end execution for a large-scale Web3 conference with 2500+ attendees.",
    highlights: [
      "Invited keynote speakers, panelists, and workshop facilitators to curate a high-quality agenda.",
      "Secured sponsorships and strategic partnerships with blockchain startups, gaming platforms, and enterprises.",
      "Managed event technology, on-site logistics, and stage operations for a seamless conference experience.",
    ],
  },
  {
    year: "2023",
    title: "Program Manager",
    company: "HyperEdge Winter of Blockchain",
    summary:
      "Hosted sessions and workshops on blockchain development with industry experts and partner communities.",
    highlights: [
      "Scaled a Discord community to 800+ members through targeted campaigns and collaborations.",
      "Led social, email, and livestream content operations for sustained engagement.",
      "Handled sponsorship and program partnerships to expand reach and delivery impact.",
    ],
  },
  {
    year: "2022",
    title: "Technical Program Manager",
    company: "GirlScript Summer of Code",
    summary:
      "Led a cross-functional team of 30 members and drove delivery for a 3-month open-source program.",
    highlights: [
      "Mentored 6000+ contributors while overseeing platform operations and communication.",
      "Directed end-to-end development of the official website to drive registrations and engagement.",
      "Secured 10+ partnerships and over $10k in sponsorships.",
    ],
  },
  {
    year: "2022",
    title: "Full Stack Web Development Intern",
    company: "GEOGO TechSolutions",
    summary:
      "Built responsive websites and API-driven features under industry mentorship.",
    highlights: [
      "Shipped user-friendly interfaces with HTML, CSS, JavaScript, and MERN stack patterns.",
      "Participated in code reviews and team meetings to improve delivery quality and velocity.",
      "Developed and consumed APIs with maintainable documentation and testing workflows.",
    ],
  },
  {
    year: "2021",
    title: "Supervisor and Mentor (C/C++ Domain)",
    company: "GirlScript Winter of Contributing",
    summary:
      "Maintained a high-traffic repository and mentored thousands of contributors in open-source workflows.",
    highlights: [
      "Helped scale a repository to ~900 stars and ~1.6k forks while maintaining quality standards.",
      "Mentored 6000+ contributors in Git, GitHub, and contribution best practices.",
      "Implemented CI/CD automation via GitHub Actions for smoother maintainer operations.",
    ],
  },
  {
    year: "2021",
    title: "Open Source Contributor",
    company: "GirlScript Summer of Code",
    summary:
      "Contributed actively to flagship open-source projects and ranked among top contributors.",
    highlights: [
      "Merged 14 pull requests across NeoAlgo and AlgoTree repositories.",
      "Recognized among the Top 100 active contributors out of 7000+ participants.",
    ],
  },
];

