"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { createClient } from "@/lib/supabase/client";
import type { Configuration } from "@/types";

const NICHE_SUGGESTIONS = [
  "Tiling",
  "Painting",
  "Roofing",
  "Plumbing",
  "Electrical",
  "Landscaping",
  "Carpentry",
  "Web Development",
  "Graphic Design",
  "Video Editing",
  "Copywriting",
  "Photography",
  "Cleaning",
  "Moving",
];

const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY",
];

interface ConfigFormProps {
  existing?: Configuration | null;
  userId: string;
}

export function ConfigurationForm({ existing, userId }: ConfigFormProps) {
  const router = useRouter();
  const supabase = createClient();

  const [form, setForm] = useState({
    niche: existing?.niche || "",
    price_min: existing?.price_min?.toString() || "25",
    price_max: existing?.price_max?.toString() || "150",
    location_state: existing?.location_state || "",
    location_city: existing?.location_city || "",
    location_zip: existing?.location_zip || "",
    landing_page_url: existing?.landing_page_url || "",
    auto_approve: existing?.auto_approve || false,
    is_active: existing?.is_active ?? true,
  });

  const [nicheOpen, setNicheOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  function setField<K extends keyof typeof form>(key: K, value: typeof form[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  const filteredSuggestions = NICHE_SUGGESTIONS.filter((s) =>
    s.toLowerCase().includes(form.niche.toLowerCase())
  );

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);

    const payload = {
      user_id: userId,
      niche: form.niche,
      price_min: parseInt(form.price_min),
      price_max: parseInt(form.price_max),
      location_state: form.location_state,
      location_city: form.location_city,
      location_zip: form.location_zip,
      landing_page_url: form.landing_page_url,
      auto_approve: form.auto_approve,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };

    const { error: dbError } = existing
      ? await supabase
          .from("configurations")
          .update(payload)
          .eq("id", existing.id)
      : await supabase.from("configurations").insert(payload);

    setSaving(false);

    if (dbError) {
      setError(dbError.message);
      return;
    }

    router.push("/");
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Niche */}
      <div className="relative space-y-1">
        <Label htmlFor="niche">Your Niche / Service</Label>
        <Input
          id="niche"
          placeholder="e.g. Roofing, Web Development, Painting..."
          value={form.niche}
          onChange={(e) => {
            setField("niche", e.target.value);
            setNicheOpen(true);
          }}
          onFocus={() => setNicheOpen(true)}
          onBlur={() => setTimeout(() => setNicheOpen(false), 150)}
          required
        />
        {nicheOpen && form.niche && filteredSuggestions.length > 0 && (
          <ul className="absolute z-10 mt-1 w-full rounded-md border bg-popover shadow-lg">
            {filteredSuggestions.map((s) => (
              <li
                key={s}
                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent"
                onMouseDown={() => {
                  setField("niche", s);
                  setNicheOpen(false);
                }}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Price Range */}
      <div className="space-y-1">
        <Label>Price Range (USD/hr or per project)</Label>
        <div className="flex items-center gap-3">
          <Input
            type="number"
            placeholder="Min"
            value={form.price_min}
            onChange={(e) => setField("price_min", e.target.value)}
            min={0}
            className="w-24"
            required
          />
          <span className="text-muted-foreground">—</span>
          <Input
            type="number"
            placeholder="Max"
            value={form.price_max}
            onChange={(e) => setField("price_max", e.target.value)}
            min={0}
            className="w-24"
            required
          />
        </div>
      </div>

      {/* Location */}
      <div className="space-y-1">
        <Label>Location</Label>
        <div className="grid grid-cols-3 gap-3">
          <select
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={form.location_state}
            onChange={(e) => setField("location_state", e.target.value)}
            required
          >
            <option value="">State</option>
            {US_STATES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
          <Input
            placeholder="City"
            value={form.location_city}
            onChange={(e) => setField("location_city", e.target.value)}
            required
          />
          <Input
            placeholder="Zip"
            value={form.location_zip}
            onChange={(e) => setField("location_zip", e.target.value)}
            maxLength={10}
          />
        </div>
      </div>

      {/* Landing Page */}
      <div className="space-y-1">
        <Label htmlFor="url">Your Landing Page / Website</Label>
        <Input
          id="url"
          type="url"
          placeholder="https://yoursite.com"
          value={form.landing_page_url}
          onChange={(e) => setField("landing_page_url", e.target.value)}
          required
        />
      </div>

      {/* Auto-approve */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium text-sm">Auto-send responses</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automatically send AI responses without your approval
          </p>
        </div>
        <Switch
          checked={form.auto_approve}
          onCheckedChange={(v) => setField("auto_approve", v)}
        />
      </div>

      {/* Active toggle */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div>
          <p className="font-medium text-sm">Monitoring Active</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Pause or resume email monitoring
          </p>
        </div>
        <Switch
          checked={form.is_active}
          onCheckedChange={(v) => setField("is_active", v)}
        />
      </div>

      {error && (
        <p className="text-sm text-destructive">{error}</p>
      )}

      <Button type="submit" className="w-full" disabled={saving}>
        {saving ? "Saving..." : existing ? "Save Changes" : "Save & Start Monitoring"}
      </Button>
    </form>
  );
}
