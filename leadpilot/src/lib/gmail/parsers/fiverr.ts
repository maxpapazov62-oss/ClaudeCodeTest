import type { ParsedLead } from "./index";

export function parseFiverr(subject: string, body: string): ParsedLead | null {
  if (
    !subject.toLowerCase().includes("request") &&
    !subject.toLowerCase().includes("order") &&
    !subject.toLowerCase().includes("message")
  ) {
    return null;
  }

  const title = subject.replace(/^re:\s*/i, "").trim();

  const budgetMatch = body.match(/budget[:\s]+\$?([\d,]+)/i);
  const budget = budgetMatch ? `$${budgetMatch[1]}` : null;

  const urlMatch = body.match(/https?:\/\/www\.fiverr\.com\/[^\s\n"<>]+/i);
  const url = urlMatch ? urlMatch[0] : null;

  const lines = body.split("\n").filter((l) => l.trim().length > 20);
  const description = lines.slice(0, 3).join(" ").substring(0, 500);

  return {
    platform: "Fiverr",
    title,
    description,
    budget,
    location: null,
    url,
  };
}
