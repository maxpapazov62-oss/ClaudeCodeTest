import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { generateLeadResponse } from "@/lib/claude/client";
import { sendLeadNotification } from "@/lib/resend/client";

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { leadId } = await request.json();

  const { data: lead } = await supabase
    .from("leads")
    .select("*")
    .eq("id", leadId)
    .eq("user_id", user.id)
    .single();

  if (!lead) {
    return NextResponse.json({ error: "Lead not found" }, { status: 404 });
  }

  const { data: config } = await supabase
    .from("configurations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!config) {
    return NextResponse.json({ error: "No configuration found" }, { status: 400 });
  }

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

  const { data: response } = await supabase
    .from("responses")
    .insert({
      lead_id: lead.id,
      user_id: user.id,
      draft_message: draft,
      status,
      approved_at: config.auto_approve ? new Date().toISOString() : null,
    })
    .select()
    .single();

  if (config.auto_approve) {
    await supabase
      .from("leads")
      .update({ status: "responded" })
      .eq("id", lead.id);
  } else {
    // Send notification email
    const origin =
      process.env.NEXT_PUBLIC_APP_URL || "https://leadpilot.app";
    await sendLeadNotification({
      toEmail: user.email!,
      leadTitle: lead.lead_title,
      platform: lead.source_platform,
      draftMessage: draft,
      dashboardUrl: origin,
    }).catch(() => {}); // Don't fail if email fails
  }

  return NextResponse.json({ response });
}
