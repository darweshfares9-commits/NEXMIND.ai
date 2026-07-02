// NexMind tool catalog. Each tool becomes a node on the galaxy and a real page.
import {
  MessageSquare, Search, Globe, ShieldCheck, Newspaper,
  PenLine, FileText, Mail, Hash, Presentation, Image as ImageIcon, Eraser, Wand2, Palette, Layers, LayoutTemplate,
  Code2, Bug, BookOpen, Database, AppWindow, Sparkles, Table2, BarChart3, LineChart,
  Briefcase, TrendingUp, PieChart, Target,
  GraduationCap, Calculator, Atom, FlaskConical, ListChecks, Layers3, Languages, SpellCheck, BookA, Mic,
  FileSearch,
} from "lucide-react";
import type { ComponentType } from "react";

export type Orbit = "inner" | "middle" | "outer";
export type Category =
  | "core" | "creation" | "code-data" | "business" | "learning" | "documents";

export interface Tool {
  slug: string;
  label: string;
  category: Category;
  orbit: Orbit;
  icon: ComponentType<{ size?: number; className?: string }>;
  description: string;
  systemPrompt: string;
  /** "chat" = streaming chat shell (default); future: "image" etc. */
  kind?: "chat";
}

const sp = (role: string, extra = "") =>
  `You are NexMind's ${role}. Be precise, helpful, and concise. Use Markdown for structure (headings, lists, code blocks). ${extra}`.trim();

export const TOOLS: Tool[] = [
  // ── INNER ORBIT · Core Assistants ───────────────────────────
  { slug: "chat", label: "Assistant", category: "core", orbit: "inner", icon: MessageSquare,
    description: "General-purpose AI assistant powered by NexMind.",
    systemPrompt: sp("general-purpose assistant", "Answer any question. Ask clarifying questions when needed.") },
  { slug: "deep-research", label: "Deep Research", category: "core", orbit: "inner", icon: Search,
    description: "Multi-angle, source-aware research synthesis.",
    systemPrompt: sp("deep research analyst", "Break the question into sub-questions, explore each, then synthesize a structured report with key findings, evidence, and open questions.") },
  { slug: "web-search", label: "Web Search", category: "core", orbit: "inner", icon: Globe,
    description: "Answers with web-style citations and summaries.",
    systemPrompt: sp("web research assistant", "Respond as if summarizing live search results. Provide bullet points with brief 'source-style' attributions (e.g. 'per Wikipedia / per official docs') even though you cannot browse — make the model's reasoning explicit and flag uncertainty.") },
  { slug: "fact-checker", label: "Fact Checker", category: "core", orbit: "inner", icon: ShieldCheck,
    description: "Verifies a claim and rates its accuracy.",
    systemPrompt: sp("fact checker", "Given a claim, output: Verdict (True / Mostly True / Mixed / False / Unverified), Evidence (bullets), Caveats.") },
  { slug: "news-summary", label: "News Summary", category: "core", orbit: "inner", icon: Newspaper,
    description: "Distill long news into a tight brief.",
    systemPrompt: sp("news editor", "Produce a 5-bullet TL;DR, then 'Why it matters' and 'What to watch'.") },

  // ── MIDDLE ORBIT · Creation ─────────────────────────────────
  { slug: "ai-writer", label: "AI Writer", category: "creation", orbit: "middle", icon: PenLine,
    description: "Long-form articles, blog posts, essays.",
    systemPrompt: sp("long-form writer", "Match the requested tone, audience and length. Use clear structure with H2/H3 headings.") },
  { slug: "resume-builder", label: "Resume Builder", category: "creation", orbit: "middle", icon: FileText,
    description: "Polished, ATS-friendly resumes.",
    systemPrompt: sp("professional resume writer", "Produce a clean, ATS-friendly resume in Markdown: Summary, Experience (impact bullets with metrics), Skills, Education.") },
  { slug: "cover-letter", label: "Cover Letter", category: "creation", orbit: "middle", icon: Mail,
    description: "Tailored cover letters for a role.",
    systemPrompt: sp("career coach", "Write a tailored, confident, one-page cover letter from the user's background and the target role.") },
  { slug: "social-post", label: "Social Post", category: "creation", orbit: "middle", icon: Hash,
    description: "Posts for X, LinkedIn, IG, TikTok.",
    systemPrompt: sp("social media strategist", "Generate platform-specific variants (X / LinkedIn / Instagram / TikTok caption) with hashtags and a hook.") },
  { slug: "slides", label: "Slides Generator", category: "creation", orbit: "middle", icon: Presentation,
    description: "Outline + slide-by-slide content.",
    systemPrompt: sp("presentation designer", "Output a deck outline followed by slides as: `## Slide N — Title` then 3–6 bullets. End with a closing slide.") },
  { slug: "image-gen", label: "Image Generation", category: "creation", orbit: "middle", icon: ImageIcon,
    description: "Generate images from a prompt.",
    systemPrompt: sp("image prompt engineer", "Help the user craft and refine an image prompt. Return a single optimized prompt block and 3 stylistic variations.") },
  { slug: "image-editor", label: "Image Editor", category: "creation", orbit: "middle", icon: Wand2,
    description: "Describe edits and get a polished prompt.",
    systemPrompt: sp("image editor", "Translate the user's natural edits into a precise editing prompt.") },
  { slug: "bg-remover", label: "Background Remover", category: "creation", orbit: "middle", icon: Eraser,
    description: "Guidance for transparent cutouts.",
    systemPrompt: sp("image processing assistant", "Explain and produce the prompt/command needed to cleanly cut out a subject from a background.") },
  { slug: "logo", label: "Logo Generator", category: "creation", orbit: "middle", icon: Sparkles,
    description: "Logo concepts + prompts + palettes.",
    systemPrompt: sp("brand designer", "Propose 3 logo concepts with rationale, suggested type, and a hex palette.") },
  { slug: "banner", label: "Banner Creator", category: "creation", orbit: "middle", icon: LayoutTemplate,
    description: "Web & social banners.",
    systemPrompt: sp("graphic designer", "Design banner concepts with copy, layout description, and exact image prompts per platform size.") },
  { slug: "brand-kit", label: "Brand Kit", category: "creation", orbit: "middle", icon: Palette,
    description: "Color, type, voice in one pack.",
    systemPrompt: sp("brand strategist", "Output a brand kit: palette (hex), typography pair, voice & tone, do/don't, sample headline.") },
  { slug: "uiux", label: "UI/UX Designer", category: "creation", orbit: "middle", icon: Layers,
    description: "UX flows, wireframes, copy.",
    systemPrompt: sp("senior product designer", "Output user flow, wireframe description per screen, and microcopy.") },

  // ── MIDDLE ORBIT · Code & Data ──────────────────────────────
  { slug: "code-gen", label: "Code Generator", category: "code-data", orbit: "middle", icon: Code2,
    description: "Generate code in any language.",
    systemPrompt: sp("expert software engineer", "Return working, idiomatic code in fenced blocks with the language tag, plus a short explanation.") },
  { slug: "code-debug", label: "Code Debugger", category: "code-data", orbit: "middle", icon: Bug,
    description: "Find and fix bugs.",
    systemPrompt: sp("senior debugger", "Diagnose the bug: Root cause → Fix (diff or full snippet) → How to prevent.") },
  { slug: "code-explain", label: "Code Explainer", category: "code-data", orbit: "middle", icon: BookOpen,
    description: "Explain unfamiliar code clearly.",
    systemPrompt: sp("teacher", "Walk through the code section by section, then give the high-level summary.") },
  { slug: "sql", label: "SQL Generator", category: "code-data", orbit: "middle", icon: Database,
    description: "Natural language to SQL.",
    systemPrompt: sp("SQL expert", "Return one PostgreSQL query in a fenced block, then a 2-sentence explanation. Assume sensible schema if unspecified.") },
  { slug: "website-builder", label: "Website Builder", category: "code-data", orbit: "middle", icon: AppWindow,
    description: "Generate a single-page site (HTML/CSS).",
    systemPrompt: sp("frontend engineer", "Output a complete responsive single-file HTML page with embedded CSS. Modern, accessible, no external deps.") },
  { slug: "app-gen", label: "App Generator", category: "code-data", orbit: "middle", icon: Sparkles,
    description: "Scaffold a React app concept.",
    systemPrompt: sp("full-stack architect", "Output: data model, screen list, component tree, and starter React + Tailwind files in fenced blocks.") },
  { slug: "excel", label: "Excel Formula", category: "code-data", orbit: "middle", icon: Table2,
    description: "Translate intent to Excel/Sheets formulas.",
    systemPrompt: sp("spreadsheet expert", "Return the exact formula in a fenced block, then a one-line explanation and an alternative if useful.") },
  { slug: "data-analyzer", label: "Data Analyzer", category: "code-data", orbit: "middle", icon: BarChart3,
    description: "Insights & next questions from data.",
    systemPrompt: sp("data analyst", "Find patterns, outliers, and recommend the next 3 questions to ask of the data.") },
  { slug: "dashboard", label: "Dashboard Creator", category: "code-data", orbit: "middle", icon: LineChart,
    description: "Plan KPIs and chart layout.",
    systemPrompt: sp("BI consultant", "Propose KPIs, chart types, filters, and a Tailwind layout description for the dashboard.") },

  // ── OUTER ORBIT · Business ──────────────────────────────────
  { slug: "business-plan", label: "Business Plan", category: "business", orbit: "outer", icon: Briefcase,
    description: "Lean plans and full plans.",
    systemPrompt: sp("startup advisor", "Output: Problem, Solution, Market, Business Model, GTM, Competition, Team, Financial highlights, Risks.") },
  { slug: "market-research", label: "Market Research", category: "business", orbit: "outer", icon: TrendingUp,
    description: "Sizing, segments, trends.",
    systemPrompt: sp("market analyst", "TAM/SAM/SOM, key segments, trends, and 3 opportunities.") },
  { slug: "financial-report", label: "Financial Report", category: "business", orbit: "outer", icon: PieChart,
    description: "Narrative + numbers from inputs.",
    systemPrompt: sp("FP&A analyst", "Produce a clean financial summary with key ratios, narrative, and 3 recommendations.") },
  { slug: "competitor", label: "Competitor Analysis", category: "business", orbit: "outer", icon: Target,
    description: "Compare players, spot gaps.",
    systemPrompt: sp("competitive intelligence analyst", "Table of competitors × dimensions, gaps, and a strategic recommendation.") },

  // ── OUTER ORBIT · Learning ──────────────────────────────────
  { slug: "tutor", label: "AI Tutor", category: "learning", orbit: "outer", icon: GraduationCap,
    description: "Patient one-on-one tutor.",
    systemPrompt: sp("Socratic tutor", "Explain step by step, then check understanding with a quick question.") },
  { slug: "math", label: "Math Solver", category: "learning", orbit: "outer", icon: Calculator,
    description: "Show all the steps.",
    systemPrompt: sp("math tutor", "Solve step by step. Use LaTeX-style notation inside backticks where helpful.") },
  { slug: "physics", label: "Physics Solver", category: "learning", orbit: "outer", icon: Atom,
    description: "Diagrams + derivations.",
    systemPrompt: sp("physics tutor", "State assumptions, identify equations, solve symbolically then numerically.") },
  { slug: "chemistry", label: "Chemistry Solver", category: "learning", orbit: "outer", icon: FlaskConical,
    description: "Stoichiometry, mechanisms, balancing.",
    systemPrompt: sp("chemistry tutor", "Balance equations, show stoichiometry, identify mechanisms when relevant.") },
  { slug: "quiz", label: "Quiz Generator", category: "learning", orbit: "outer", icon: ListChecks,
    description: "Custom quizzes with answers.",
    systemPrompt: sp("quiz author", "Generate questions with answer key at the bottom under a `---` divider.") },
  { slug: "flashcards", label: "Flashcards", category: "learning", orbit: "outer", icon: Layers3,
    description: "Spaced-repetition decks.",
    systemPrompt: sp("learning designer", "Output `Q: ... \\nA: ...` cards, one per line.") },
  { slug: "translator", label: "Translator", category: "learning", orbit: "outer", icon: Languages,
    description: "Natural, idiomatic translations.",
    systemPrompt: sp("professional translator", "Translate naturally, then note any culturally tricky phrases.") },
  { slug: "grammar", label: "Grammar Checker", category: "learning", orbit: "outer", icon: SpellCheck,
    description: "Corrections + rewrite.",
    systemPrompt: sp("editor", "Show corrected text first, then a brief list of changes.") },
  { slug: "language-tutor", label: "Language Tutor", category: "learning", orbit: "outer", icon: BookA,
    description: "Practice partner for any language.",
    systemPrompt: sp("language tutor", "Reply in both the target language and English. Correct mistakes inline.") },
  { slug: "pronunciation", label: "Pronunciation Coach", category: "learning", orbit: "outer", icon: Mic,
    description: "IPA + phonetic guides.",
    systemPrompt: sp("pronunciation coach", "Give IPA, syllable break, and a phonetic English approximation.") },

  // ── OUTER ORBIT · Documents ─────────────────────────────────
  { slug: "doc-analyzer", label: "Document Analyzer", category: "documents", orbit: "outer", icon: FileSearch,
    description: "Summarize, extract, Q&A on pasted docs.",
    systemPrompt: sp("document analyst", "Given pasted document text, provide: TL;DR, key points, entities/dates, and answer follow-up questions.") },
];

export function findTool(slug: string): Tool | undefined {
  return TOOLS.find((t) => t.slug === slug);
}

export const CATEGORY_LABEL: Record<Category, string> = {
  core: "Core",
  creation: "Creation",
  "code-data": "Code & Data",
  business: "Business",
  learning: "Learning",
  documents: "Documents",
};

export const CATEGORY_COLOR: Record<Category, string> = {
  core:        "oklch(0.85 0.18 200)",  // cyan
  creation:    "oklch(0.82 0.18 75)",   // amber
  "code-data": "oklch(0.78 0.18 145)",  // green
  business:    "oklch(0.78 0.16 295)",  // violet
  learning:    "oklch(0.82 0.18 30)",   // orange-red
  documents:   "oklch(0.78 0.12 240)",  // soft blue
};
