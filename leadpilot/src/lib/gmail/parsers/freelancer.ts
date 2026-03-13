import type { ParsedLead } from "./index";

export function parseFreelancer(
  subject: string,
  body: string
): ParsedLead | null {
  if (
    !subject.toLowerCase().includes("project") &&
    !subject.toLowerCase().includes("contest") &&
    !subject.toLowerCase().includes("job")
  ) {
    return null;
  }

  const title = subject.replace(/^re:\s*/i, "").trim();

  const budgetMatch = body.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/i);
  const budget = budgetMatch ? budgetMatch[0] : null;

  const urlMatch = body.match(
    /https?:\/\/www\.freelancer\.com\/[^\s\n"<>]+/i
  );
  const url = urlMatch ? urlMatch[0] : null;

  const lines = body.split("\n").filter((l) => l.trim().length > 20);
  const description = lines.slice(0, 3).join(" ").substring(0, 500);

  return {
    platform: "Freelancer",
    title,
    description,
    budget,
    location: null,
    url,
  };
}
