export type MarketingProgram = {
  slug: string;
  title: string;
  category: string;
  level: string;
  duration: string;
  price: string;
  mode: string;
  description: string;
  highlights: string[];
  outcomes: string[];
  image: string;
};

export const techPrograms: MarketingProgram[] = [
  {
    slug: "web-development",
    title: "Web Development",
    category: "Software",
    level: "Beginner to Intermediate",
    duration: "16 Weeks",
    price: "From 180,000 XAF",
    mode: "Hybrid",
    description: "Build modern websites and client-facing apps with strong HTML, CSS, JavaScript, React, and deployment fundamentals.",
    highlights: ["React interfaces", "API integration", "Responsive design"],
    outcomes: ["Portfolio-ready projects", "Frontend job readiness", "Deployment workflows"],
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "software-engineering",
    title: "Software Engineering",
    category: "Engineering",
    level: "Intermediate",
    duration: "24 Weeks",
    price: "From 260,000 XAF",
    mode: "On-site + Remote Labs",
    description: "Learn application architecture, version control, testing, backend logic, and collaborative engineering practice.",
    highlights: ["System design basics", "Backend services", "Team workflows"],
    outcomes: ["Production-style builds", "Git and testing discipline", "Career-track portfolio"],
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "cloud-devops",
    title: "Cloud & DevOps",
    category: "Infrastructure",
    level: "Intermediate",
    duration: "14 Weeks",
    price: "From 220,000 XAF",
    mode: "Weekend Hybrid",
    description: "Understand cloud services, CI/CD, Linux operations, container workflows, and practical deployment habits.",
    highlights: ["CI/CD pipelines", "Cloud fundamentals", "Docker workflows"],
    outcomes: ["Deployment confidence", "DevOps starter toolkit", "Operational literacy"],
    image: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "graphic-design",
    title: "Graphic Design",
    category: "Creative Tech",
    level: "Beginner",
    duration: "10 Weeks",
    price: "From 140,000 XAF",
    mode: "Evening Classes",
    description: "Create brand assets, digital campaigns, social media visuals, and polished layouts with professional design tools.",
    highlights: ["Brand identity", "Layout systems", "Campaign assets"],
    outcomes: ["Client-ready mockups", "Design portfolio", "Creative production speed"],
    image: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "computer-basics",
    title: "Computer Basics",
    category: "Foundations",
    level: "Beginner",
    duration: "6 Weeks",
    price: "From 85,000 XAF",
    mode: "On-site",
    description: "Get comfortable with typing, internet research, file management, email, and everyday computer confidence.",
    highlights: ["Digital literacy", "Practical office usage", "Internet safety"],
    outcomes: ["Stronger confidence", "Workplace readiness", "Independent tool use"],
    image: "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "ai-tools",
    title: "AI Tools for Work",
    category: "AI Productivity",
    level: "Beginner to Intermediate",
    duration: "5 Weeks",
    price: "From 95,000 XAF",
    mode: "Remote Live",
    description: "Use AI safely for writing, research, analysis, prompt design, workflow automation, and business productivity.",
    highlights: ["Prompt workflows", "Research acceleration", "Practical automation"],
    outcomes: ["Daily productivity gains", "AI literacy", "Responsible usage habits"],
    image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "digital-marketing",
    title: "Digital Marketing",
    category: "Growth",
    level: "Beginner",
    duration: "8 Weeks",
    price: "From 130,000 XAF",
    mode: "Hybrid",
    description: "Learn content planning, paid and organic growth fundamentals, campaign analytics, and online brand positioning.",
    highlights: ["Content strategy", "Social campaigns", "Performance tracking"],
    outcomes: ["Campaign planning", "Audience growth skills", "Marketing reporting"],
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "cybersecurity-basics",
    title: "Cybersecurity Basics",
    category: "Security",
    level: "Beginner to Intermediate",
    duration: "9 Weeks",
    price: "From 150,000 XAF",
    mode: "Weekend Cohort",
    description: "Cover device protection, network basics, identity hygiene, threat awareness, and practical security routines.",
    highlights: ["Security hygiene", "Threat awareness", "Defensive fundamentals"],
    outcomes: ["Safer digital practice", "Security vocabulary", "Starter security mindset"],
    image: "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
  },
  {
    slug: "data-office-productivity",
    title: "Data & Office Productivity",
    category: "Business Tech",
    level: "Beginner",
    duration: "7 Weeks",
    price: "From 100,000 XAF",
    mode: "Hybrid",
    description: "Work faster with spreadsheets, dashboards, presentations, documentation, and digital reporting essentials.",
    highlights: ["Spreadsheet skills", "Reporting workflows", "Presentation design"],
    outcomes: ["Office confidence", "Cleaner reporting", "Data handling basics"],
    image: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  },
];

export const learningSteps = [
  {
    title: "Choose a track",
    description: "Pick the training path that matches your career goal, schedule, and current skill level.",
  },
  {
    title: "Learn with structure",
    description: "Progress through guided sessions, hands-on labs, projects, and feedback checkpoints.",
  },
  {
    title: "Ship real work",
    description: "Complete portfolio pieces, practical assessments, and job-facing deliverables you can show.",
  },
  {
    title: "Move into opportunity",
    description: "Get support with applications, freelance readiness, internships, and next-step planning.",
  },
];

export const platformStats = [
  { label: "Training tracks", value: "9+" },
  { label: "Hands-on projects", value: "30+" },
  { label: "Live expert sessions", value: "120+" },
  { label: "Career support touchpoints", value: "1:1" },
];

export const faqs = [
  {
    question: "Do I need a technical background before joining?",
    answer: "No. Several tracks start from beginner level, and each program clearly indicates the expected starting point.",
  },
  {
    question: "Are classes fully online?",
    answer: "Some tracks are hybrid, some are remote live, and some are on-site. Each program card shows its delivery mode.",
  },
  {
    question: "Will I build projects during training?",
    answer: "Yes. The platform is built around applied work, not just passive lessons, so every learner finishes with practical outputs.",
  },
  {
    question: "Can working professionals join?",
    answer: "Yes. Many cohorts run evenings or weekends and are designed for learners balancing work or school schedules.",
  },
];

export const partnerLogos = ["Tech Teams", "Cloud Labs", "Creative Hubs", "Startup Circles", "Digital Offices"];
