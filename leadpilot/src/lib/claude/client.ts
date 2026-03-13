import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function generateLeadResponse({
  leadTitle,
  leadDescription,
  leadBudget,
  leadLocation,
  platform,
  niche,
  priceMin,
  priceMax,
  locationCity,
  locationState,
  landingPageUrl,
}: {
  leadTitle: string;
  leadDescription: string;
  leadBudget: string | null;
  leadLocation: string | null;
  platform: string;
  niche: string;
  priceMin: number;
  priceMax: number;
  locationCity: string;
  locationState: string;
  landingPageUrl: string;
}): Promise<string> {
  const systemPrompt = `You are a freelancer's assistant drafting a brief, natural response to a potential client lead.

Rules:
- Keep it 2-4 sentences max
- Sound human and conversational, not salesy or robotic
- Mention the specific service they need
- Naturally include the freelancer's landing page URL at the end
- Match the tone: casual for community platforms, professional for Upwork/Fiverr
- Never use generic filler phrases like "I hope this finds you well" or "I'd be happy to assist"
- Don't repeat the lead description back to them`;

  const userPrompt = `Draft a response for this lead:

Platform: ${platform}
Job/Request: ${leadTitle}
Details: ${leadDescription}
${leadBudget ? `Budget: ${leadBudget}` : ""}
${leadLocation ? `Location: ${leadLocation}` : ""}

About the freelancer:
- Service: ${niche}
- Price range: $${priceMin}–$${priceMax}
- Location: ${locationCity}, ${locationState}
- Website: ${landingPageUrl}

Write only the response message, nothing else.`;

  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 256,
    messages: [{ role: "user", content: userPrompt }],
    system: systemPrompt,
  });

  const content = message.content[0];
  if (content.type !== "text") throw new Error("Unexpected response type");
  return content.text;
}
