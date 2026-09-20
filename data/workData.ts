export type ExperienceEntry = {
  role: string;
  company: string;
  duration: string;
  summary: string;
  highlights: string[];
  image?: string;
};

export type EducationEntry = {
  degree: string;
  institution: string;
  campus: string;
  duration: string;
  score: string;
  image: string;
};

export const workData: ExperienceEntry[] = [
  {
    role: "Advanced Application Engineering Senior Analyst",
    company: "Accenture",
    duration: "2023 — Present",
    image: "ACN.svg",
    summary: "Building backend systems for enterprise-scale products.",
    highlights: [
      "Design and deliver production services with an emphasis on reliable integrations and maintainable system boundaries.",
      "Work across APIs, data flows, and deployment workflows with cross-functional teams.",
      "Turn product requirements into pragmatic, supportable engineering decisions.",
    ],
  },
];

export const communityLeadershipData: ExperienceEntry[] = [
  {
    role: "Lead Organiser · Core Team",
    company: "Web3Conf India 2023",
    duration: "Jun 2023 — Aug 2023",
    image: "Web3ConfIndia23.png",
    summary: "Produced a large community conference for India’s Web3 ecosystem.",
    highlights: [
      "Built the speaker, sponsor, media-partner, and event operations workflow from planning through on-site delivery.",
      "Helped convene 2,500+ attendees, 100+ speakers, and 150+ companies and sponsors.",
      "Maintained the event app and the feedback loop that supported registration, networking, and post-event learning.",
    ],
  },
  {
    role: "Program Manager",
    company: "HyperEdge Winter of Blockchain 2023",
    duration: "Jan 2023 — Apr 2023",
    image: "HyperEdgeWoB23.png",
    summary: "Ran a blockchain learning programme for an 800+ member community.",
    highlights: [
      "Hosted 10+ sessions and workshops with community partners and industry practitioners.",
      "Led partnerships, sponsorships, social content, email, and livestream programming.",
      "Managed Discord moderation, programming, and community operations end to end.",
    ],
  },
  {
    role: "Technical Program Manager",
    company: "GirlScript Summer of Code 2022",
    duration: "Jan 2022 — Aug 2022",
    image: "GSSoC22.png",
    summary: "Led programme delivery and the official platform for a national open-source initiative.",
    highlights: [
      "Managed a cross-functional team of 30 and the end-to-end contributor programme workflow.",
      "Mentored 6,000+ contributors during the three-month programme.",
      "Secured 10+ organisational partnerships and more than $10k in sponsorships.",
    ],
  },
  {
    role: "Full-stack Web Development Intern",
    company: "GEOGO TechSolutions",
    duration: "Nov 2021 — Feb 2022",
    image: "GEOGO.png",
    summary: "Built responsive web experiences and APIs with an industry mentorship team.",
    highlights: [
      "Developed responsive interfaces with HTML, CSS, JavaScript, and the MERN stack.",
      "Participated in code reviews, user testing, API documentation, and peer review.",
    ],
  },
  {
    role: "Supervisor & Mentor · C/C++",
    company: "GirlScript Winter of Contributing 2021",
    duration: "Sep 2021 — Dec 2021",
    image: "GWOC21.png",
    summary: "Maintained an open-source programme repository and mentored new contributors.",
    highlights: [
      "Reviewed contributions for a repository with roughly 900 stars and 1.6k forks.",
      "Helped 6,000+ contributors learn Git, GitHub, and open-source workflows.",
      "Built GitHub Actions automation and reviewed Hacktoberfest-accepted contributions.",
    ],
  },
  {
    role: "Open-source Contributor",
    company: "GirlScript Summer of Code 2021",
    duration: "Mar 2021 — Jun 2021",
    image: "GSSoC21.png",
    summary: "Contributed to algorithm repositories while building an open-source practice.",
    highlights: [
      "Made 14 merged pull requests across NeoAlgo and AlgoTree.",
      "Recognised among the top 100 active contributors from 7,000+ participants.",
    ],
  },
];

export const educationData: EducationEntry = {
  degree: "B.Tech in Computer Science & Engineering",
  institution: "University of Calcutta",
  campus: "University College of Science, Technology & Agriculture",
  duration: "2019 — 2023",
  score: "9.24 CGPA",
  image: "UCSTA.png",
};
