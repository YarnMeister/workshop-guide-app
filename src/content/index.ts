// Centralized static content index for pages and steps
// IDs are immutable and never reused. See README for rules.

export const PAGES = [
  { id: "P01", slug: "welcome", title: "Welcome", steps: ["P01S01"] },
  { id: "P02", slug: "setup", title: "Environment Setup", steps: ["P02S01"] },
  { id: "P03", slug: "connect-accounts", title: "Connect Accounts", steps: ["P03S01"] },
  { id: "P04", slug: "first-task", title: "First Task", steps: ["P04S01"] },
] as const;

export type PageId = typeof PAGES[number]["id"];
export type StepId = `${PageId}S${string}`;

type Step = {
  pageId: PageId;
  title: string;
  body: string;
  images?: string[]; // paths relative to /public
  ctaLabel?: string;
  ctaHref?: string;
};

export const STEPS: Record<StepId, Step> = {
  P01S01: {
    pageId: "P01",
    title: "Enter participant number",
    body: "Enter your participant number to begin your onboarding journey.",
    ctaLabel: "Continue",
    ctaHref: "/setup",
    images: ["/assets/p01/s01/img-p01-s01-01.png"],
  },
  P02S01: {
    pageId: "P02",
    title: "Install required tools",
    body: "Install your editor, CLI tools, and any workshop dependencies.",
    ctaLabel: "Open downloads",
    ctaHref: "/connect-accounts",
    images: ["/assets/p02/s01/img-p02-s01-01.png"],
  },
  P03S01: {
    pageId: "P03",
    title: "Connect your accounts",
    body: "Link collaboration tools and repositories used in the workshop.",
    ctaLabel: "Open Slack",
    ctaHref: "/first-task",
    images: ["/assets/p03/s01/img-p03-s01-01.png"],
  },
  P04S01: {
    pageId: "P04",
    title: "Start your first task",
    body: "Use your setup to complete the introductory task.",
    ctaLabel: "Go to dashboard",
    ctaHref: "/dashboard",
    images: ["/assets/p04/s01/img-p04-s01-01.png"],
  },
};

export function getPageIndexBySlug(slug: string): number {
  return PAGES.findIndex(p => p.slug === slug);
}

export function getStepIndexWithinPage(stepId: StepId): number {
  const step = STEPS[stepId];
  const page = PAGES.find(p => p.id === step.pageId);
  if (!page) return -1;
  return page.steps.findIndex(s => s === stepId);
}


