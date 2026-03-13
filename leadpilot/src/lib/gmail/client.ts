import { google } from "googleapis";

export function createGmailClient(accessToken: string, refreshToken: string) {
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: accessToken,
    refresh_token: refreshToken,
  });

  return google.gmail({ version: "v1", auth: oauth2Client });
}

export async function getNewMessages(
  gmail: ReturnType<typeof google.gmail>,
  sinceDate: Date | null
) {
  const query = sinceDate
    ? `after:${Math.floor(sinceDate.getTime() / 1000)}`
    : "newer_than:1d";

  const response = await gmail.users.messages.list({
    userId: "me",
    q: query,
    maxResults: 50,
  });

  return response.data.messages || [];
}

export async function getMessage(
  gmail: ReturnType<typeof google.gmail>,
  messageId: string
) {
  const response = await gmail.users.messages.get({
    userId: "me",
    id: messageId,
    format: "full",
  });

  return response.data;
}

export function extractEmailBody(
  message: ReturnType<typeof getMessage> extends Promise<infer T> ? T : never
): { subject: string; body: string; from: string } {
  const headers = message.payload?.headers || [];
  const subject =
    headers.find((h) => h.name === "Subject")?.value || "";
  const from =
    headers.find((h) => h.name === "From")?.value || "";

  let body = "";
  const parts = message.payload?.parts || [];

  function extractText(
    parts: Array<{ mimeType?: string; body?: { data?: string }; parts?: unknown[] }>
  ): string {
    for (const part of parts) {
      if (part.mimeType === "text/plain" && part.body?.data) {
        return Buffer.from(part.body.data, "base64").toString("utf-8");
      }
      if (part.parts) {
        const text = extractText(
          part.parts as Array<{
            mimeType?: string;
            body?: { data?: string };
            parts?: unknown[];
          }>
        );
        if (text) return text;
      }
    }
    return "";
  }

  if (parts.length > 0) {
    body = extractText(
      parts as Array<{
        mimeType?: string;
        body?: { data?: string };
        parts?: unknown[];
      }>
    );
  } else if (message.payload?.body?.data) {
    body = Buffer.from(message.payload.body.data, "base64").toString("utf-8");
  }

  return { subject, body, from };
}
