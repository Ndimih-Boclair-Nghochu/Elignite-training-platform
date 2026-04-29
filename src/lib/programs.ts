import type { Program as DbProgram } from "@prisma/client";
import { techPrograms, type MarketingProgram } from "@/lib/site-content";

const defaultProgramImage =
  "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80";

const categoryImageMap: Record<string, string> = {
  software:
    "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80",
  engineering:
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
  infrastructure:
    "https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80",
  "creative tech":
    "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80",
  foundations:
    "https://images.unsplash.com/photo-1515378791036-0648a3ef77b2?auto=format&fit=crop&w=1200&q=80",
  growth:
    "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=1200&q=80",
  security:
    "https://images.unsplash.com/photo-1510511459019-5dda7724fd87?auto=format&fit=crop&w=1200&q=80",
  "business tech":
    "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80",
  "ai productivity":
    "https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80",
};

const defaultRequirements = [
  "Interest in the field and commitment to practice",
  "Basic computer access for assignments and project work",
  "Willingness to learn through guided tasks and feedback",
];

export function slugifyProgramValue(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}

function normalizeItems(value: string | null | undefined, fallback: string[]): string[] {
  const parsed =
    value
      ?.split(/[\n,]/)
      .map((item) => item.trim())
      .filter(Boolean) || [];

  return parsed.length > 0 ? parsed : fallback;
}

function inferImage(slug: string, category: string, fallbackIndex = 0): string {
  const marketingMatch = techPrograms.find((item) => item.slug === slug);
  if (marketingMatch?.image) {
    return marketingMatch.image;
  }

  return (
    categoryImageMap[category.toLowerCase()] ||
    techPrograms[fallbackIndex % techPrograms.length]?.image ||
    defaultProgramImage
  );
}

function inferHighlights(description: string, fallback: string[] = []): string[] {
  if (fallback.length > 0) {
    return fallback;
  }

  const sentences = description
    .split(".")
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (sentences.length > 0) {
    return sentences;
  }

  return [
    "Guided instructor support",
    "Hands-on technical practice",
    "Real-world project delivery",
  ];
}

export function truncateWords(text: string, limit = 22): string {
  const words = text.trim().split(/\s+/);
  if (words.length <= limit) {
    return text;
  }

  return `${words.slice(0, limit).join(" ")}...`;
}

export function programSelectOptions(programs: Array<{ slug: string; title: string }>) {
  return programs.map((program) => ({
    slug: program.slug,
    title: program.title,
  }));
}

export function toMarketingProgram(
  program: Pick<
    DbProgram,
    "slug" | "title" | "category" | "duration" | "description" | "tuition" | "requirements" | "outcomes" | "imageUrl"
  >,
  fallbackIndex = 0
): MarketingProgram & { requirements: string[] } {
  const fallback =
    techPrograms.find((item) => item.slug === program.slug) ||
    techPrograms[fallbackIndex % techPrograms.length];

  const fallbackOutcomes = fallback?.outcomes || [
    "Practical assignments with visible outputs",
    "Project work aligned with current tools",
    "Career-facing technical confidence",
  ];

  return {
    slug: program.slug,
    title: program.title,
    category: program.category,
    duration: program.duration,
    description: program.description,
    level: fallback?.level || "All levels",
    mode: fallback?.mode || "Instructor-led",
    price: `${program.tuition.toLocaleString()} XAF`,
    highlights: inferHighlights(program.description, fallback?.highlights),
    outcomes: normalizeItems(program.outcomes, fallbackOutcomes),
    requirements: normalizeItems(program.requirements, defaultRequirements),
    image: program.imageUrl || inferImage(program.slug, program.category, fallbackIndex),
  };
}

export function programDetailSlug(program: { slug?: string | null; title: string }) {
  const safeSlug = slugifyProgramValue(program.slug || "");
  if (safeSlug) {
    return safeSlug;
  }

  return slugifyProgramValue(program.title);
}
