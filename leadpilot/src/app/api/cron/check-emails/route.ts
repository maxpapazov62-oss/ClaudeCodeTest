import { NextRequest, NextResponse } from "next/server";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createGmailClient, getNewMessages, getMessage, extractEmailBody } from "@/lib/gmail/client";
import { parseLeadEmail } from "@/lib/gmail/parsers";
import { generateLeadResponse } from "@/lib/claude/client";
import { sendLeadNotification } from "@/lib/resend/client";

// Service-role client — bypasses RLS for server-side cron use
function getServiceClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}

export async function GET(request: NextRequest) {
  // Verify cron secret to prevent unauthorized calls
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const supabase = getServiceClient();

  // Get all active configurations with their gmail connections
  const { data: configs } = await supabase
    .from("configurations")
    .select("*, profiles(id)")
    .eq("is_active", true);

  if (!configs || configs.length === 0) {
    return NextResponse.json({ processed: 0 });
  }

  let totalNewLeads = 0;

  for (const config of configs) {
    const userId = config.user_id;

    const { data: gmailConn } = await supabase
      .from("gmail_connections")
      .select("*")
      .eq("user_id", userId)
      .single();

    if (!gmailConn) continue;

    try {
      const gmail = createGmailClient(
        gmailConn.access_token,
        gmailConn.refresh_token
      );

      const sinceDate = gmailConn.last_synced_at
        ? new Date(gmailConn.last_synced_at)
        : null;

      const messages = await getNewMessages(gmail, sinceDate);

      for (const msg of messages) {
        if (!msg.id) continue;

        const fullMsg = await getMessage(gmail, msg.id);
        const { subject, body, from } = extractEmailBody(fullMsg);

        const parsed = parseLeadEmail(from, subject, body);
        if (!parsed) continue;

        // Deduplicate by subject + user
        const { data: existing } = await supabase
          .from("leads")
          .select("id")
          .eq("user_id", userId)
          .eq("source_email_subject", subject)
          .single();

        if (existing) continue;

        const { data: lead } = await supabase
          .from("leads")
          .insert({
            user_id: userId,
            source_platform: parsed.platform,
            source_email_subject: subject,
            source_email_body: body,
            lead_title: parsed.title,
            lead_description: parsed.description,
            lead_budget: parsed.budget,
            lead_location: parsed.location,
            lead_url: parsed.url,
            status: "new",
          })
          .select()
          .single();

        if (!lead) continue;

        totalNewLeads++;

        // Generate AI response
        const draft = await generateLeadResponse({
          leadTitle: lead.lead_title,
          leadDescription: lead.lead_description,
          leadBudget: lead.lead_budget,
          leadLocation: lead.lead_location,
          platform: lead.source_platform,
          niche: config.niche,
          priceMin: config.price_min,
          priceMax: config.price_max,
          locationCity: config.location_city,
          locationState: config.location_state,
          landingPageUrl: config.landing_page_url,
        });

        const status = config.auto_approve ? "approved" : "pending";

        await supabase.from("responses").insert({
          lead_id: lead.id,
          user_id: userId,
          draft_message: draft,
          status,
          approved_at: config.auto_approve ? new Date().toISOString() : null,
        });

        if (config.auto_approve) {
          await supabase
            .from("leads")
            .update({ status: "responded" })
            .eq("id", lead.id);
        } else {
          const origin =
            process.env.NEXT_PUBLIC_APP_URL || "https://leadpilot.app";

          // Get user email
          const { data: userData } =
            await supabase.auth.admin.getUserById(userId);
          const email = userData?.user?.email;

          if (email) {
            await sendLeadNotification({
              toEmail: email,
              leadTitle: lead.lead_title,
              platform: lead.source_platform,
              draftMessage: draft,
              dashboardUrl: origin,
            }).catch(() => {});
          }
        }
      }

      // Update last_synced_at
      await supabase
        .from("gmail_connections")
        .update({ last_synced_at: new Date().toISOString() })
        .eq("user_id", userId);
    } catch (err) {
      console.error(`Error processing user ${userId}:`, err);
    }
  }

  return NextResponse.json({ processed: totalNewLeads });
}
