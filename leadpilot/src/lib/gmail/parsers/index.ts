import { parseUpwork } from "./upwork";
import { parseFiverr } from "./fiverr";
import { parseThumbtack } from "./thumbtack";
import { parseFreelancer } from "./freelancer";

export interface ParsedLead {
  platform: string;
  title: string;
  description: string;
  budget: string | null;
  location: string | null;
  url: string | null;
}

const PLATFORM_PATTERNS: Array<{
  domain: string;
  platform: string;
  parser: (subject: string, body: string) => ParsedLead | null;
}> = [
  { domain: "@upwork.com", platform: "Upwork", parser: parseUpwork },
  { domain: "@fiverr.com", platform: "Fiverr", parser: parseFiverr },
  { domain: "@thumbtack.com", platform: "Thumbtack", parser: parseThumbtack },
  {
    domain: "@freelancer.com",
    platform: "Freelancer",
    parser: parseFreelancer,
  },
];

export function parseLeadEmail(
  from: string,
  subject: string,
  body: string
): ParsedLead | null {
  for (const { domain, parser } of PLATFORM_PATTERNS) {
    if (from.toLowerCase().includes(domain)) {
      return parser(subject, body);
    }
  }
  return null;
}
