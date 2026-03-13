export const dynamic = "force-dynamic";

import { Zap } from "lucide-react";
import { GoogleSignInButton } from "./google-sign-in-button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
              <Zap className="h-6 w-6" />
            </div>
          </div>
          <h1 className="text-2xl font-bold">LeadPilot</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Respond to leads faster than your competition
          </p>
        </div>

        <div className="rounded-lg border bg-card p-8 shadow-sm space-y-4">
          <h2 className="text-center text-lg font-semibold">Sign in to continue</h2>
          <GoogleSignInButton />
          <p className="text-center text-xs text-muted-foreground">
            We&apos;ll request Gmail read access to monitor your inbox for new leads.
          </p>
        </div>
      </div>
    </div>
  );
}
