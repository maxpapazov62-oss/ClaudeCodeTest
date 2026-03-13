import type { ParsedLead } from "./index";

export function parseThumbtack(
  subject: string,
  body: string
): ParsedLead | null {
  if (
    !subject.toLowerCase().includes("lead") &&
    !subject.toLowerCase().includes("request") &&
    !subject.toLowerCase().includes("match")
  ) {
    return null;
  }

  const title = subject.replace(/^re:\s*/i, "").trim();

  const budgetMatch = body.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?/i);
  const budget = budgetMatch ? budgetMatch[0] : null;

  const locationMatch = body.match(/location[:\s]+([^\n]+)/i);
  const location = locationMatch ? locationMatch[1].trim() : null;

  const urlMatch = body.match(/https?:\/\/www\.thumbtack\.com\/[^\s\n"<>]+/i);
  const url = urlMatch ? urlMatch[0] : null;

  const lines = body.split("\n").filter((l) => l.trim().length > 20);
  const description = lines.slice(0, 3).join(" ").substring(0, 500);

  return {
    platform: "Thumbtack",
    title,
    description,
    budget,
    location,
    url,
  };
}
