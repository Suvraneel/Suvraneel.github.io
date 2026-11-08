/** Where a thumbnail's looping footage sits on its poster, in % of the poster: [left, top, width, height]. */
type Rect = [number, number, number, number];

/**
 * A designed thumbnail's moving part. The poster (`thumbnail`) shows the footage on its first
 * frame; the tile plays the loop (`src` + .webm / .mp4) over that spot, with `top` (whatever the
 * poster paints above the footage, cut to `topRect`) laid back over it.
 */
/*
 * `logo` is the mark shown beside the project's name on the tile: its own
 * (from its repo or live site) where it has one; otherwise a simple mark drawn
 * for this page in its poster's colour (NFT Haven, CrewS, SoLingo, JailBreak,
 * Bounty Gunslinger, CoWIN Clone, Diablo, LSTM).
 *
 * `hero` marks the flagship tiles (Monoma, SettleX, Sheetah) that break the poster
 * template: full-bleed footage from their teasers or the app under copy set in each brand's
 * own type and palette (see app/projects/ProjectHero.tsx); `thumbnail` is then
 * the footage's first frame.
 *
 * `titleLines` breaks a long name the same way on its tile and in its dialog's
 * title, so the name that flies between them never re-wraps.
 *
 * `posterText` is what a designed thumbnail (thumbs/) says in its pixels: the tile
 * also carries it as text, for screen readers, search and find-in-page.
 */

export type ThumbLoop = {
  src: string;
  top: string;
  /** The poster's aspect ratio. */
  aspect: string;
  rect: Rect;
  topRect: Rect;
  /** The footage window's corner radius; cqw is 1% of the poster's width. */
  radius: string;
  mask?: string;
};

const loop = (
  id: string,
  aspect: string,
  rect: Rect,
  topRect: Rect,
  shape: Pick<ThumbLoop, "radius" | "mask"> = { radius: "1.55cqw" }
): ThumbLoop => ({
  src: `/images/project-assets/thumbs/${id}.loop`,
  top: `/images/project-assets/thumbs/${id}.top.webp`,
  aspect,
  rect,
  topRect,
  ...shape,
});

const projectsData = [
  {
    id: "monoma",
    name: "Monoma",
    logo: "/images/project-assets/logos/monoma.svg",
    details:
      "Built a multi-tenant, Atlassian-centric agentic AI platform that turns Jira, Confluence, GitHub, and Slack activity into a persistent organisational graph and shared execution context.|Correlated tickets, documentation, pull requests, reviews, ownership, and engineering discussions across tools.|Developed 18+ permission-aware MCP tools and approval-gated workflows with tenant-scoped access, identity propagation, and audit trails for topic monitors, team and personal digests, morning briefs, blocker detection, cross-tool investigations, and actionable Slack delivery.",
    github: "#",
    url: "https://usemonoma.com",
    thumbnail: "/images/project-assets/hero/monoma.poster.webp",
    hero: "monoma",
    posterText: "Organizational memory. Company brain that evolves with every action. Scoped to your permissions. Approval-gated before every write.",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/1yD7N6u9MG8",
    tech_stk: ["FastAPI", "Celery", "PostgreSQL", "pgvector", "Redis", "MCP"],
  },
  {
    id: "settlex",
    name: "SettleX",
    logo: "/images/project-assets/logos/settlex.svg",
    details:
      "Architected a chain-agnostic cross-chain settlement protocol that aggregates transactions and settles net deltas instead of bridging each transfer individually.|Built and deployed a containerised Bun/Elysia backend on AWS with scheduled workers, persistent WebSocket listeners, and PostgreSQL to monitor spoke-chain contracts and execute settlements with on-chain acknowledgements.|Validated multiple chain testnets through a Next.js explorer; net settlement reduces transaction fees by up to 90% while improving capital efficiency.",
    github: "#",
    url: "https://settlex.fi",
    thumbnail: "/images/project-assets/hero/settlex.poster.webp",
    hero: "settlex",
    posterText: "Multi-chain testnets. The Clearing Layer for Crypto. Settles only the net delta, cutting bridging costs by up to 90%.",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/2CyxdCe9RD8",
    tech_stk: ["Bun", "Elysia", "AWS", "PostgreSQL", "WebSockets", "Next.js"],
  },
  {
    id: "sheetah",
    name: "Sheetah",
    logo: "/images/project-assets/logos/sheetah.svg",
    details:
      "Built Sheetah, a browser spreadsheet that opens CSV, Excel, JSON and Parquet files and queries them with SQL through DuckDB-WASM, with no backend, so the data stays in the browser.|Designed a canvas grid that fetches 200-row windows by rowid range instead of OFFSET, keeps recently fetched chunks in a bounded cache, and maps the scrollbar proportionally past 8M px because browsers cap element height, so a 10-million-row result reaches its last row. Ran DuckDB-WASM in a Web Worker with user queries and UI reads on separate connections, a run lock and send()-based cancellation, so scrolling does not abort a running query.|Sealed the engine before first use (file access limited to a virtual /sheetah/ folder, external access disabled, configuration locked) and added a Content-Security-Policy with connect-src 'self' as a second layer. A Playwright test runs 13 attack queries (URL and S3 reads, ATTACH, COPY TO a URL, remote extensions, path traversal, attempts to switch the locked settings back on) and asserts that each one fails and no request leaves the page.|Turned point-and-click sorts, filters and pivots into readable SQL composed around the last query and shown in the editor; pivots compile to FILTER aggregates with GROUPING SETS totals, and charts aggregate every row in DuckDB rather than a sample. Wrote clean-up steps for messy exports (₹ amounts, Indian 1,00,000 grouping, Cr/Dr), Tally XML import, and bank-to-books payment matching that produces a reconciliation statement.|Set up CI with oxlint, npm audit, Node unit tests that run the generated SQL on the same DuckDB-WASM build, Playwright end-to-end tests and a frame-timing test against the production build under the real CSP, and axe-core WCAG 2.1 A/AA checks. The build checks self-hosted DuckDB extensions against pinned SHA-256 hashes, and CI fails if the initial JavaScript goes over a 180 KB gzip budget.",
    github: "https://github.com/Suvraneel/Sheetah",
    url: "https://sheetah.vercel.app",
    thumbnail: "/images/project-assets/hero/sheetah.poster.webp",
    hero: "sheetah",
    posterText: "Sheets × SQL. 10M-row grid · 60 fps scroll · Zero uploads",
    gif: "sheetah.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: ["DuckDB-WASM", "TypeScript", "React", "Canvas API", "Web Workers", "Apache Arrow", "CodeMirror", "Playwright"],
  },
  {
    id: "radlet",
    name: "Radlet",
    logo: "/images/project-assets/logos/radlet.svg",
    details:
      "Built Radlet, a free macOS menu-bar app that opens a wheel of conversions and tools under the pointer when a modifier key is held during a file drag, saving results beside the originals.|Split it into a SwiftUI and AppKit shell and a Rust engine that talk in JSON lines over stdin and stdout; the engine detects each file's format and returns wheel slots carrying their own actions, so new conversions appear on the wheel without app changes. Exposed the same engine as a CLI and as a Model Context Protocol server for AI agents, which leaves out the password tools.|By default, ran each conversion in its own worker process and process group under a time limit, so a crash or hang fails only that conversion, kills any FFmpeg it started and deletes its partial output. Wrote results to hidden temporary files and hard-linked them into place under a free name, so no existing file is ever overwritten.|Wrote a bundled Swift helper that runs Apple's Vision and Speech frameworks on device for text recognition, subject masks, face detection and timed transcripts, which the engine turns into background removal, face redaction and subtitles. Added a Smart compression mode that binary-searches for the lowest JPEG or WebP quality that still passes SSIM checks against the original on brightness and colour.|Covered it with 200+ Rust and 90+ Swift tests, among them a contract test that decodes a protocol session recorded from the freshly built engine, and ran them in GitHub Actions with rustfmt, clippy and cargo-deny licence checks. Set up a tag-triggered release workflow that builds, verifies and publishes a universal Apple silicon and Intel DMG.",
    github: "https://github.com/Suvraneel/Radlet",
    url: "https://radlet.vercel.app",
    thumbnail: "/images/project-assets/thumbs/radlet.webp",
    posterText: "Weapon wheel for files. 500+ conversions · Rust + SwiftUI · MCP server",
    thumbLoop: loop("radlet", "1 / 1", [28, 27, 70, 70], [28, 27, 70, 70], {
      radius: "0",
      mask: "radial-gradient(closest-side, #000 87.7%, transparent 88.5%)",
    }),
    gif: "radlet.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: ["Rust", "Swift", "SwiftUI", "AppKit", "MCP", "Vision framework", "PDFium", "FFmpeg"],
  },
  {
    id: "stake-overflow",
    name: "StakeOverflow",
    logo: "/images/project-assets/logos/stake-overflow.svg",
    details:
      "Decentralized version of the most popular public forum for developers: Stack Overflow|Gives freedom to all users to post their questions, doubts & error logs.| Veteran developers in that tech stack can then post their answers.|Throughout this whole process, Privacy is maintained + Crypto donations and the Karma system helps incentivize the forum & encourage more people to resolve/answer the doubts.",
    github: "https://github.com/Open-Sorcerer/StakeOverflow",
    url: "https://stake-overflow.vercel.app/",
    thumbnail: "/images/project-assets/stakeoverflow-thumbnail.webp",
    gif: "destackoverflow.webm",
    video: "https://www.youtube.com/embed/unKt1LBCh7I",
    tech_stk: ["IPFS", "React", "AntDesign", "Solidity"],
  },
  {
    id: "gssoc-website",
    name: "GSSoC 2022 Official Website",
    titleLines: ["GSSoC 2022", "Official Website"],
    logo: "/images/project-assets/logos/gssoc-website.webp",
    details:
      "The official website for GirlScript Summer of Code 2022, a national open-source programme; 6,000+ contributors applied and registered through it.|Featured a live, paginated contributor leaderboard and on-chain certificate verification.|Prototyped in Figma, then built with Next.js, Tailwind CSS and Chakra UI, and shipped to Vercel through a CI/CD pipeline.|Used in sponsor pitches to show the programme's reach across student communities.|Originally hosted at [gssoc.girlscript.org](https://gssoc.girlscript.org) for GSSoC 2022; the live link is a preserved snapshot of that release.",
    github: "https://github.com/Suvraneel/gssoc-website-new",
    url: "https://gssoc-2022.vercel.app/",
    thumbnail: "/images/project-assets/thumbs/gssoc-website.webp",
    posterText: "6,000+ contributors. 14+ countries · 4,836 merged PRs · On-chain certificate verifier",
    thumbLoop: loop("gssoc-website", "16 / 9", [42.501, 11.557, 51.997, 46.22], [42.5, 11.481, 52.031, 46.296]),
    gif: "gssoc-website.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: [
      "NextJS",
      "TailwindCSS",
      "ChakraUI",
      "Figma",
      "Moralis",
      "Solidity",
      "Axios",
      "Express",
    ],
  },
  {
    id: "nft-haven",
    name: "NFT Haven",
    logo: "/images/project-assets/logos/nft-haven.svg",
    details:
      "A multi-chain DeFi Dashboard which allows minting & tracking of assets across multiple ecosystems (Ethereum, Binance Smart Chain, Polygon).|Allows users to mint their own NFTs or gift NFTs to their loved ones on the Polygon network via a very friendly user interface.|Soulbound Token NFT Minter - Any digital asset important to you (e.g., Certificates, Important Documents) can be attached to wallet forever|Any media you hold - a Video, an Image, an Audio track can be converted to an NFT.|The gas fees for minting are minimal thanks to the Polygon Network. Currently the minter is on Polygon testnet, so the NFT collection of a wallet is also viewable on testnets.opensea.io.",
    github: "https://github.com/Suvraneel/Instant-Soulbound-NFT-Minter",
    url: "https://nft-haven.vercel.app/",
    thumbnail: "/images/project-assets/thumbs/nft-haven.webp",
    posterText: "Soulbound NFT minter. Solidity ERC-721 · IPFS metadata · 3-chain DeFi dashboard",
    thumbLoop: loop("nft-haven", "16 / 9", [42.501, 14.225, 50.997, 56.662], [42.5, 14.167, 51.042, 56.759]),
    gif: "nft-haven.webm",
    video: "https://www.youtube.com/embed/YeQI5xZn-_g",
    tech_stk: [
      "React.js",
      "Node.js",
      "Web3.js",
      "Solidity",
      "Moralis",
      "Chainlink",
    ],
  },
  {
    id: "eth-commerce",
    name: "EthCommerce",
    logo: "/images/project-assets/logos/eth-commerce.webp",
    details:
      "EthCommerce is an online platform that helps creators, developers, and entrepreneurs sell their products directly to their audience. |The problem EthCommerce solves is independent creators' challenges when trying to sell their products online. |EthCommerce removes all intermediaries and gives direct access to the audience. |Developed on different chains, buyers can choose to buy courses on their favourite chain. |Our platform charges minimal fees, and that too only when the creator decides to withdraw the money. |All the data is stored on IPFS, so there is no chance that the data will be lost. |EthCommerce provides full flexibility and a real connection with the audience. |With QuickNode alerts, we send messages to the audience and creators whenever a new course is created or purchased.",
    github: "https://github.com/Open-Sorcerer/EthCommerce",
    url: "https://ethcommerce.vercel.app/",
    thumbnail: "/images/project-assets/thumbs/eth-commerce.webp",
    posterText: "Sell direct. Fees only on withdrawal",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/mBmFIWkCQIY",
    tech_stk: [
      "NextJS 13",
      "TailwindCSS",
      "Spline.Design",
      "Figma",
      "QuickNode",
      "Solidity",
      "MongoDB",
      "IPFS",
      "ThirdWeb",
      "HardHat",
      "Wagmi",
    ],
  },
  {
    id: "CrewS",
    name: "CrewS",
    logo: "/images/project-assets/logos/CrewS.svg",
    details:
      "CrewS is a No Code Tool to create Data DAOs. |With CrewS you can take your crew on chain quickly to manage data along with governance. |Features include managing proposals, on-chain voting, execution of proposals, storing data as per the voting results. |FVM enables a new kind of data-centric DAO that has heretofore been impossible. |DataDAOs are DAOs whose mission revolves around the preservation, curation, augmentation, and promotion of datasets considered valuable by their stakeholders.",
    github: "https://github.com/Open-Sorcerer/CrewS",
    url: "#",
    thumbnail: "/images/project-assets/thumbs/CrewS.webp",
    posterText: "No-code Data DAOs",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/4sabLpt37-Y",
    tech_stk: ["NextJS", "TailwindCSS", "Solidity", "FVM", "IPFS"],
  },
  {
    id: "solingo",
    name: "SoLingo",
    logo: "/images/project-assets/logos/solingo.svg",
    details:
      "Alongside the crypto boom & more big players entering, people not crypto-literate are susceptible to scams & unintentional wrong decisions at the least. Educational platforms in the crypto space are hence, a necessity.| This is a learn-to-earn project aimed at incentivising crypto-education.| This website lets you study the Solana Cookbook & attempt quizzes by module so as to gauge your new-found knowledge & showcase it with cool NFTs you earn on successful completion of each module.",
    github: "https://github.com/Open-Sorcerer/SoLingo",
    url: "#",
    thumbnail: "/images/project-assets/thumbs/solingo.webp",
    posterText: "Learn to earn.",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/T_0E6QbSDLo",
    tech_stk: [
      "Anchor",
      "TypeScript",
      "React",
      "TailwindCSS",
      "Solidity",
      "Mocha",
      "IPFS",
      "Solana",
    ],
  },

  {
    id: "jailbreak",
    name: "JailBreak",
    logo: "/images/project-assets/logos/jailbreak.svg",
    details:
      "A 2D RPG-style Indie Adventure Game built from scratch in stock Java & simple mathematical game logic (without using JavaFx or any Game Engine/ Library).| Complete implementation is done using OOP concepts (Sprites, Classes, Inheritance, Interfaces & Threads) only.| The game is a single player game where the player has to escape from a prison & reach the treasure chest by solving puzzles, dodging security cameras & enemies' vision.| It also has a character selection screen & a main menu pane to tweak game settings.| The game is inspired by the popular game series - The Legend of Zelda (The OG version).",
    github: "https://github.com/Suvraneel/JavaMonsterz",
    url: "#",
    thumbnail: "/images/project-assets/thumbs/jailbreak.webp",
    posterText: "Stock Java. No game engine.",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/ft7uN51_jCw",
    tech_stk: [
      "Java 17.0.4",
      "Object-Oriented Programming",
      "IntelliJ IDEA 2022.2",
      "Figma",
      "Sprites",
    ],
  },
  {
    id: "bounty-gunslinger",
    name: "Bounty Gunslinger",
    logo: "/images/project-assets/logos/bounty-gunslinger.svg",
    details:
      "Blockchain Games are the next big thing. Play to Earn is a great incentive for the gamers to get rewarded for the time they invest in a game.|Each game can create exclusive swags/air-drops such as NFTs for players which will act as trophies forever as they are on the chain. These NFTs can have a materialistic value and this way they have utility as well.|The idea consists of a website to mint limited & exclusive access NFTs. Only the people who own one from the collection get access to the game and/or exclusive DLCs to the game.|Once they're bored of the game, they can then sell/trade the NFT hence passing on the game access to the new owner",
    github: "https://github.com/Suvraneel/Bounty-Gunslinger",
    url: "https://open-sorcerer-nft-game-token.vercel.app/",
    thumbnail: "/images/project-assets/thumbs/bounty-gunslinger.webp",
    posterText: "Mint to play. Polygon · IPFS · Phaser 3 game",
    thumbLoop: loop("bounty-gunslinger", "16 / 9", [58.5, 10.666, 35, 62.222], [58.438, 10.556, 35.078, 62.361], { radius: "50%" }),
    gif: "bounty-gunslinger.webm",
    video: "https://www.youtube.com/embed/s8rwjJFZRDo",
    tech_stk: [
      "IPFS",
      "ReactJS",
      "TailwindCSS",
      "Polygon",
      "Solidity",
      "Moralis",
      "Phaser",
    ],
  },
  {
    id: "cowin-clone",
    name: "CoWIN Clone",
    logo: "/images/project-assets/logos/cowin-clone.svg",
    details:
      "A fully functional clone of [cowin.gov.in](https://www.cowin.gov.in/), built using the MERN Stack|Backend consists of an API built using Node, Express & prototyped using Postman API testing tool and the frontend consumes that API & lets the users book the vaccination slots based on availability & location of slots mass-fed by administration (i.e., vaccination centres).|CoWIN API - provides API endpoints for all the components involved in a COVID-19 vaccination service|Registration of new beneficiaries, book appointments, expiry notification|Administration - CRUD vaccination centres & available slots in batches|Vaccination Centres - complete Appointments & update Doses",
    github: "https://github.com/Suvraneel/cowin-clone-ui",
    url: "https://cowin-clone-ui.vercel.app/",
    thumbnail: "/images/project-assets/thumbs/cowin-clone.webp",
    posterText: "Book vaccination slots.",
    gif: "cowin.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: [
      "React",
      "Redux",
      "Bootstrap",
      "JSSoup",
      "Postman",
      "Express",
      "MongoDB",
      "NodeJS",
    ],
  },
  {
    id: "short-term-price-trend-prediction",
    name: "Short‑term Stock Market Price Trend Prediction",
    titleLines: ["Short‑term Stock", "Market Price", "Trend Prediction"],
    logo: "/images/project-assets/logos/short-term-price-trend-prediction.svg",
    details:
      "Scraping stock price data of various equities from NSE website, preprocessing, normalizing, feature engineering, & finally training an LSTM model on the time-series data using a 4-layered RNN.|Evaluating the accuracy of the model using metrics (like RMSE & MAE) and comparing its hyper-parameters (optimizers & activation functions)",
    github: "#",
    url: "#",
    thumbnail: "/images/project-assets/thumbs/short-term-price-trend-prediction.webp",
    posterText: "LSTM × NSE. 1,233 trading days · 16 configs benchmarked · 5 NSE equities tested",
    thumbLoop: loop("short-term-price-trend-prediction", "16 / 9", [42.501, 11.557, 50.997, 56.662], [42.5, 11.481, 51.042, 56.759]),
    gif: "lstm-stock-pred.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: ["Python", "Numpy", "Tensorflow", "Keras", "BeautifulSoup"],
  },
  {
    id: "meteorologyly",
    name: "Meteorologyly",
    logo: "/images/project-assets/logos/meteorologyly.webp",
    details:
      "Minimalist Weather Forecasting Web Application Dashboard that fetches & visualizes data using a collection of APIs.|Fetches detailed current weather data or 7 day forecast using OpenWeatherMap API, GoogleMapEmbed API, and visualizations using Chart.js|Manifests all weather data by Geolocation, Top Searched Cities or City Search",
    github: "https://github.com/Suvraneel/Meteorologyly",
    url: "https://suvraneel.github.io/Meteorologyly/",
    thumbnail: "/images/project-assets/meteorologyly-thumbnail.webp",
    gif: "meteorologyly.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: ["HTML5", "CSS3", "Javascript", "BootStrap", "Chart.js", "APIs"],
  },
  {
    id: "diablo-music",
    name: "Diablo Music App",
    logo: "/images/project-assets/logos/diablo-music-app.svg",
    details:
      "Minimalistic Music Player with a dark UI especially-curated for the nocturnal.| Utilises Firebase-authenticated login.| Doubles as local & online music player",
    github: "https://github.com/Suvraneel/Diablo-Music",
    url: "#",
    thumbnail: "/images/project-assets/thumbs/diablo-music-app.webp",
    posterText: "For the nocturnal.",
    gif: "video-to-be-added.webm",
    video:
      "https://www.youtube-nocookie.com/embed/u8BbvsCbQyM?rel=0&amp;controls=0&amp;showinfo=0",
    tech_stk: ["Flutter", "Firebase", "Dart", "Dart-UI", "Dart-Libraries"],
  },
];

export default projectsData;
