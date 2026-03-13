import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { StatsBar } from "@/components/stats-bar";
import { DashboardLeads } from "./dashboard-leads";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: config } = await supabase
    .from("configurations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!config) redirect("/setup");

  const { data: leads } = await supabase
    .from("leads")
    .select("*, responses(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const allLeads = leads || [];
  const total = allLeads.length;
  const pending = allLeads.filter((l) => l.status === "new").length;
  const sent = allLeads.filter((l) => l.status === "responded").length;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-4xl px-4 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Monitoring{" "}
              <span className="font-medium text-foreground">{config.niche}</span>{" "}
              leads in {config.location_city}, {config.location_state}
            </p>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4" />
              Settings
            </Link>
          </Button>
        </div>

        <StatsBar total={total} pending={pending} sent={sent} />

        <div>
          <h2 className="text-lg font-semibold mb-3">Recent Leads</h2>
          {allLeads.length === 0 ? (
            <div className="rounded-lg border bg-card p-12 text-center">
              <p className="text-muted-foreground font-medium">No leads yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                LeadPilot is monitoring your Gmail inbox. New leads will appear
                here within minutes.
              </p>
            </div>
          ) : (
            <DashboardLeads initialLeads={allLeads} />
          )}
        </div>
      </main>
    </div>
  );
}
