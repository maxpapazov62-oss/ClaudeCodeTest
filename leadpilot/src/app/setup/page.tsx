import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Navbar } from "@/components/navbar";
import { ConfigurationForm } from "@/components/configuration-form";

export default async function SetupPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: existing } = await supabase
    .from("configurations")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-xl px-4 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold">
            {existing ? "Edit Configuration" : "Get Started"}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {existing
              ? "Update your lead monitoring settings."
              : "Set up your profile so LeadPilot knows what leads to find and how to respond."}
          </p>
        </div>
        <ConfigurationForm existing={existing} userId={user.id} />
      </main>
    </div>
  );
}
