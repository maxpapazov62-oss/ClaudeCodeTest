import { Resend } from "resend";

export async function sendLeadNotification({
  toEmail,
  leadTitle,
  platform,
  draftMessage,
  dashboardUrl,
}: {
  toEmail: string;
  leadTitle: string;
  platform: string;
  draftMessage: string;
  dashboardUrl: string;
}) {
  const resend = new Resend(process.env.RESEND_API_KEY);
  await resend.emails.send({
    from: "LeadPilot <notifications@leadpilot.app>",
    to: toEmail,
    subject: `New lead from ${platform}: ${leadTitle}`,
    html: `
      <div style="font-family: Inter, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #6366f1; margin-bottom: 4px;">New Lead Found</h2>
        <p style="color: #6b7280; margin-top: 0;">${platform} · Just now</p>

        <div style="background: #f9fafb; border-radius: 8px; padding: 16px; margin: 20px 0;">
          <h3 style="margin: 0 0 8px; color: #111827;">${leadTitle}</h3>
        </div>

        <div style="background: #eff6ff; border-left: 4px solid #6366f1; padding: 16px; border-radius: 0 8px 8px 0; margin: 20px 0;">
          <p style="margin: 0 0 8px; font-weight: 600; color: #4338ca;">AI-Drafted Response:</p>
          <p style="margin: 0; color: #1e40af; line-height: 1.6;">${draftMessage}</p>
        </div>

        <a href="${dashboardUrl}" style="display: inline-block; background: #6366f1; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">
          Review & Approve →
        </a>

        <p style="color: #9ca3af; font-size: 12px; margin-top: 32px;">
          You're receiving this because you have a LeadPilot account.
          Manage notifications in your settings.
        </p>
      </div>
    `,
  });
}
