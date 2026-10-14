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
    role: "Advanced App Engineering Sr. Analyst",
    company: "Accenture",
    duration: "2023 - Present",
    image: "ACN.svg",
    summary: "Build backend services and integrations for a business-intelligence portal serving a global media client.",
    highlights: [
      "Designed and deployed Java Spring Boot microservices for the portal.",
      "Improved data validation and error handling, reducing support tickets by 60%.",
      "Improved Elasticsearch query speed by 30%.",
      "Worked with product and data teams to turn ambiguous requirements into pragmatic technical solutions.",
    ],
  },
];

export const communityLeadershipData: ExperienceEntry[] = [
  {
    role: "Organiser · Core Team",
    company: "Web3Conf India 2023",
    duration: "Jun 2023 - Aug 2023",
    image: "Web3ConfIndia23.png",
    summary: "Produced a Web3 developer conference in India.",
    highlights: [
      "Coordinated speakers, sponsors, and media partners from first outreach to event day.",
      "Secured sponsorships from blockchain startups, Web3 gaming platforms, and enterprises.",
      "Helped convene 2,500+ attendees, 100+ speakers, and 150+ companies and sponsors.",
      "Anchored a conference stage and led on-site operations with event staff and the venue team.",
      "Managed the event app and feedback loop for registration, networking, and post-event learning.",
    ],
  },
  {
    role: "Program Manager",
    company: "HyperEdge Winter of Blockchain 2023",
    duration: "Jan 2023 - Apr 2023",
    image: "HyperEdgeWoB23.png",
    summary: "Ran a blockchain learning programme for an 800+ member community.",
    highlights: [
      "Hosted 10+ sessions and workshops, including livestreams with industry practitioners.",
      "Led community partnerships, sponsorships, social media, and email campaigns.",
      "Wrote technical content and designed graphics for social media, email, and YouTube.",
      "Managed Discord moderation and cohort operations end to end.",
    ],
  },
  {
    role: "Technical Program Manager",
    company: "GirlScript Summer of Code 2022",
    duration: "Jan 2022 - Aug 2022",
    image: "GSSoC22.png",
    summary: "Led delivery of the official platform and contributor programme for a national open-source initiative.",
    highlights: [
      "Recruited and managed a 30-person team and ran the end-to-end contributor workflow.",
      "Built and maintained the official Next.js website for 6,000+ contributors, supporting applications and registration.",
      "Mentored 6,000+ contributors and hosted 15+ hours of workshops and community events.",
      "Secured 10+ organisational partnerships and more than $10k in sponsorships.",
      "Served as the primary point of contact for stakeholders throughout the programme.",
    ],
  },
  {
    role: "Full-stack Web Development Intern",
    company: "GEOGO TechSolutions",
    duration: "Nov 2021 - Feb 2022",
    image: "GEOGO.png",
    summary: "Built responsive web applications and APIs under industry mentorship.",
    highlights: [
      "Developed full-stack projects, including a CoWIN vaccination-booking clone, using the MERN stack.",
      "Built and consumed APIs and maintained their documentation.",
      "Took part in code reviews and user testing with industry mentors.",
    ],
  },
  {
    role: "Supervisor & Mentor · C/C++",
    company: "GirlScript Winter of Contributing 2021",
    duration: "Sep 2021 - Dec 2021",
    image: "GWOC21.png",
    summary: "Maintained an open-source programme repository and mentored new contributors.",
    highlights: [
      "Reviewed contributions to an open-source repository with roughly 900 stars and 1.6k forks.",
      "Mentored 6,000+ participants in Git, GitHub, and open-source workflows.",
      "Built GitHub Actions automation and reviewed Hacktoberfest contributions.",
    ],
  },
  {
    role: "Open-source Contributor",
    company: "GirlScript Summer of Code 2021",
    duration: "Mar 2021 - Jun 2021",
    image: "GSSoC21.png",
    summary: "Contributed algorithm code to NeoAlgo and AlgoTree.",
    highlights: [
      "Made 14 merged pull requests across NeoAlgo and AlgoTree.",
      "Recognised among the top 100 active contributors from 7,000+ participants.",
    ],
  },
];

export const educationData: EducationEntry = {
  degree: "B.Tech in Computer Science & Engineering",
  institution: "University of Calcutta",
  campus: "University College of Science, Technology & Agriculture (UCSTA)",
  duration: "2019 - 2023",
  score: "9.24 CGPA",
  image: "UCSTA.png",
};
