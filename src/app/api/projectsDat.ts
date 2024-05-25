const projectsData = [
  {
    id: "gssoc-website",
    name: "GirlScript SoC 2022 Official Website",
    details:
      "A production grade web based application developed using Next.js & TailwindCSS Frameworks intended for the 8000+ contributors participating in the annually organized opensource program.|Was indispensable in showcasing the impact & commitment of the program across student communities during the sponsor pitches & conforms to their guidelines.|Was developed using Agile methodologies & CI/CD pipeline, prototyped in Figma, built with NextJS, TailwindCSS, ChakraUI & a plethora of npm libraries, hosted in Vercel, includes a dynamically updating paginated leaderboard & on-chain certificate verification.",
    github: "http://github.com/girlscript/gssoc-website-new",
    url: "https://gssoc.girlscript.tech",
    gif: "gssoc-website.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: ["NextJS", "TailwindCSS", "ChakraUI", "Figma", "Moralis", "Solidity", "Axios", "Express"]
  },
  {
    id: "eth-commerce",
    name: "EthCommerce",
    details:
    "EthCommerce is an online platform that helps creators, developers, and entrepreneurs sell their products directly to their audience. |The problem EthCommerce solves is independent creators' challenges when trying to sell their products online. |EthCommerce removes all intermediaries and gives direct access to the audience. |Developed on different chains, buyers can choose to buy courses on their favourite chain. |Our platform charges minimal fees, and that too only when the creator decides to withdraw the money. |All the data is stored on IPFS, so there is no chance that the data will be lost. |EthCommerce provides full flexibility and a real connection with the audience. |With QuickNode alerts, we send messages to the audience and creators whenever a new course is created or purchased.",
    github: "https://github.com/Open-Sorcerer/EthCommerce",
    url: "https://ethcommerce.vercel.app/",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/mBmFIWkCQIY",
    tech_stk: ["NextJS 13", "TailwindCSS", "Spline.Design", "Figma", "QuickNode", "Solidity", "MongoDB", "IPFS", "ThirdWeb", "HardHat", "Wagmi"]
  },
  {
    id: "de-stack-overflow",
    name: "DeStackOverflow",
    details:
      "Decentralized version of the most popular public forum for developers: Stack Overflow|Gives freedom to all users to post their questions, doubts & error logs.| Veteran developers in that tech stack can then post their answers.|Throughout this whole process, Privacy is maintained + Crypto donations and the Karma system helps incentivize the forum & encourage more people to resolve/answer the doubts.",
      github: "https://github.com/Open-Sorcerer/DeStackOverflow",
      url: "https://destackoverflow.on.fleek.co/",
      gif: "destackoverflow.webm",
      video: "https://www.youtube.com/embed/unKt1LBCh7I",
      tech_stk: ["IPFS","React","AntDesign","Solidity"]
  },
  {
    id: "solingo",
    name: "SoLingo",
    details:
      "Alongside the crypto boom & more big players entering, people not crypto-literate are susceptible to scams & unintentional wrong decisions at the least. Educational platforms in the crypto space are hence, a necessity.| This is a learn-to-earn project aimed at incentivising crypto-education.| This website lets you study the Solana Cookbook & attempt quizzes by module so as to gauge your new-found knowledge & showcase it with cool NFTs you earn on successful completion of each module.",
      github: "https://github.com/Open-Sorcerer/SoLingo",
      url: "#",
      gif: "video-to-be-added.webm",
      video: "https://www.youtube.com/embed/T_0E6QbSDLo",
      tech_stk: ["Anchor","TypeScript","React","TailwindCSS","Solidity","Mocha","IPFS","Solana"]
  },
  {
    id: "CrewS",
    name: "CrewS",
    details:
        "CrewS is a No Code Tool to create Data DAOs. |With CrewS you can take your crew on chain quickly to manage data along with governance. |Features include managing proposals, on-chain voting, execution of proposals, storing data as per the voting results. |FVM enables a new kind of data-centric DAO that has heretofore been impossible. |DataDAOs are DAOs whose mission revolves around the preservation, curation, augmentation, and promotion of datasets considered valuable by their stakeholders.",
    github: "https://github.com/Open-Sorcerer/CrewS",
    url: "https://bafybeiblkpu3lbde4jgopk36e2y5ggcti6olyzgpdisgcblcem24ls5cku.ipfs.gateway.valist.io/",
    gif: "video-to-be-added.webm",
    video: "https://www.youtube.com/embed/4sabLpt37-Y",
    tech_stk: ["NextJS","TailwindCSS","Solidity","FVM","IPFS"]
  },
  {
    id: "nft-haven",
    name: "NFT Haven",
    details:
      "A multi-chain DeFi Dashboard which allows minting & tracking of assets across multiple ecosystems (Ethereum, Binance Smart Chain, Polygon).|Allows users to mint their own NFTs or gift NFTs to their loved ones on the Polygon network via a very friendly user interface.|Soulbound Token NFT Minter - Any digital asset important to you (eg, Certificates, Important Documents) can be attached to wallet forever|Any media you hold - a Video, an Image, an Audio track can be converted to an NFT.|The gas fees for minting are minimal thanks to the Polygon Network. Currently the minter is on Polygon testnet, so the NFT collection of an wallet is also viewable on testnets.opensea.io.",
      github: "https://github.com/Suvraneel/Instant-Soulbound-NFT-Minter",
      url: "https://nft-haven.vercel.app/",
      gif: "nft-haven.webm",
      video: "https://www.youtube.com/embed/YeQI5xZn-_g",
      tech_stk: ["React.js","Node.js","Web3.js","Solidity","Moralis","Chainlink"]
  },
  {
    id: "jailbreak",
    name: "JailBreak",
    details:
      "A 2D RPG-style Indie Adventure Game built from scratch in stock Java & simple mathematical game logic (without using JavaFx or any Game Engine/ Library).| Complete implementation is done using OOP concepts (Sprites, Classes, Inheritance, Interfaces & Threads) only.| The game is a single player game where the player has to escape from a prison & reach the treasure chest by solving puzzles, dodging security cameras & enemies' vision.| It also has a character selection screen & a main menu pane to tweak game settings.| The game is inspired by the popular game series - The Legend of Zelda (The OG version).",
      github: "https://github.com/Suvraneel/JavaMonsterz",
      url: "#",
      gif: "video-to-be-added.webm",
      video: "https://www.youtube.com/embed/ft7uN51_jCw",
      tech_stk: ["Java 17.0.4","Object-Oriented Programming","IntelliJ IDEA 2022.2","Figma", "Sprites"]
  },
  {
    id: "bounty-gunslinger",
    name: "Bounty Gunslinger",
    details:
      "Blockchain Games are the next big thing. Play to Earn is a great incentive for the gamers to get rewarded for the time they invest in a game.|Each game can create exclusive swags/air-drops such as NFTs for players which will act as trophies forever as they are on the chain. These NFTs can have a materialistic value and this way they have utility as well.|The idea consists of a website to mint limited & exclusive access NFTs. Only the people who own one fromm the collection get access to the game and/or exclusive DLCs to the game.|Once they're bored of the game, they can then sell/trade the NFT hence passing on the game access to the new owner",
      github: "https://github.com/Suvraneel/Bounty-Gunslinger",
      url: "https://open-sorcerer-nft-game-token.vercel.app/",
      gif: "bounty-gunslinger.webm",
      video: "https://www.youtube.com/embed/s8rwjJFZRDo",
      tech_stk: ["IPFS", "ReactJS", "TailwindCSS", "Polygon", "Solidity", "Moralis", "Phaser"]
  },
  {
    id: "cowin-clone",
    name: "CoWIN Clone",
    details:
    "A fully functional clone of cowin.gov.in, built using the MERN Stack|Backend consists of an API built using Node, Express & prototyped using Postman API testing tool and the frontend consumes that API & lets the users book the vaccination slots based on availability & location of slots mass-fed by administration (ie, vaccination centers).|CoWIN API - provides API endpoints for all the components involved in a COVID-19 vaccination service|Registration of new beneficiaries, book appointments, expiry notification|Administration - CRUD vaccination centres & available slots in batches|Vaccination Centres - complete Appointments & update Doses",
    github: "https://github.com/Suvraneel/cowin-clone-ui",
    url: "https://cowin-clone-ui.vercel.app/",
    gif: "cowin.webm",
    video: "https://www.youtube.com/embed/EKGJ-pzSEns",
    tech_stk: ["React","Redux","Bootstrap","JSSoup","Postman","Express","MongoDB","NodeJS"]
  },
  {
    id: "short-term-price-trend-prediction",
    name: "Short‑term Stock Market Price Trend Prediction",
    details:
      "Scraping stock price data of various equities from NSE website, preprocessing, normalizing, feature engineering, & finally training an LSTM model on the time-series data using a 4-layered RNN.|Evaluating the accuracy of the model using metrics (like RMSE & MAE) and comparing its hyper-parameters (optimizers & activation functions)",
      github: "#",
      url: "#",
      gif: "lstm-stock-pred.webm",
      video: "https://www.youtube.com/embed/EKGJ-pzSEns",
      tech_stk: ["Python","Numpy","Tensorflow","Keras", "BeautifulSoup"]
  },
  {
    id: "meteorologyly",
    name: "Meterologyly",
    details:
      "Minimalist Weather Forecasting Web Application Dashboard that fetches & visualizes data using a collection of APIs.|Fetches detailed current weather data or 7 day forecast using OpenWeatherMap API, GoogleMapEmbed API, and visualizations using Chart.js|Manifests all weather data by Geolocation, Top Searched Cities or City Search",
      github: "https://github.com/Suvraneel/Meteorologyly",
      url: "https://suvraneel.github.io/Meteorologyly/",
      gif: "meteorologyly.webm",
      video: "https://www.youtube.com/embed/EKGJ-pzSEns",
      tech_stk: ["HTML5","CSS3","Javascript","BootStrap","Chart.js","APIs"]
  },
  {
    name: "Diablo Music App",
    details:
      "Minimalistic Music Player with a dark UI especially-curated for the nocturnal.| Utilises Firebase-authenticated login.| Doubles as local & online music player",
      github: "https://github.com/Suvraneel/Diablo-Music",
      url: "https://suvraneel.github.io/pages/diablo-music.html",
      gif: "video-to-be-added.webm",
      video: "https://www.youtube-nocookie.com/embed/u8BbvsCbQyM?rel=0&amp;controls=0&amp;showinfo=0",
      tech_stk: ["Flutter","Firebase","Dart","Dart-UI","Dart-Libraries"]
  },
];

export default projectsData;