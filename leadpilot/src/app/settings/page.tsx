import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { ConfigurationForm } from "@/components/configuration-form";

export default async function SettingsPage() {
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

  const { data: gmail } = await supabase
    .from("gmail_connections")
    .select("gmail_address, last_synced_at")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-10 space-y-10">
        <div>
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account and monitoring configuration.
          </p>
        </div>

        {gmail && (
          <div className="rounded-lg border bg-card p-4">
            <p className="text-sm font-medium">Connected Gmail</p>
            <p className="text-sm text-muted-foreground mt-1">
              {gmail.gmail_address}
            </p>
            {gmail.last_synced_at && (
              <p className="text-xs text-muted-foreground mt-1">
                Last synced:{" "}
                {new Date(gmail.last_synced_at).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div>
          <h2 className="text-lg font-semibold mb-4">Lead Configuration</h2>
          {config ? (
            <ConfigurationForm existing={config} userId={user.id} />
          ) : (
            <p className="text-sm text-muted-foreground">
              No configuration yet.{" "}
              <a href="/setup" className="text-primary underline">
                Set one up
              </a>
              .
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
