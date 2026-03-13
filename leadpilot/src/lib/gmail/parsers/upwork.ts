import type { ParsedLead } from "./index";

export function parseUpwork(subject: string, body: string): ParsedLead | null {
  // Upwork sends notifications with subjects like "New job matching your profile: ..."
  if (
    !subject.toLowerCase().includes("job") &&
    !subject.toLowerCase().includes("invitation") &&
    !subject.toLowerCase().includes("proposal")
  ) {
    return null;
  }

  const title = subject
    .replace(/^re:\s*/i, "")
    .replace(/new job matching.*?:\s*/i, "")
    .replace(/job invitation:\s*/i, "")
    .trim();

  // Extract budget from body
  const budgetMatch = body.match(/\$[\d,]+(?:\s*[-–]\s*\$[\d,]+)?(?:\/hr)?/i);
  const budget = budgetMatch ? budgetMatch[0] : null;

  // Extract job URL
  const urlMatch = body.match(
    /https?:\/\/www\.upwork\.com\/jobs\/[^\s\n"<>]+/i
  );
  const url = urlMatch ? urlMatch[0] : null;

  // Extract description — take first substantial paragraph after title
  const lines = body.split("\n").filter((l) => l.trim().length > 20);
  const description = lines.slice(0, 3).join(" ").substring(0, 500);

  return {
    platform: "Upwork",
    title,
    description,
    budget,
    location: null,
    url,
  };
}
