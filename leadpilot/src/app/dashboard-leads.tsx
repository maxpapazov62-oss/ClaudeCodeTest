"use client";

import { useState } from "react";
import { LeadCard } from "@/components/lead-card";
import type { LeadWithResponse } from "@/types";
import { createClient } from "@/lib/supabase/client";

interface DashboardLeadsProps {
  initialLeads: LeadWithResponse[];
}

export function DashboardLeads({ initialLeads }: DashboardLeadsProps) {
  const [leads, setLeads] = useState(initialLeads);
  const supabase = createClient();

  async function handleApprove(responseId: string, message: string) {
    await supabase
      .from("responses")
      .update({
        status: "approved",
        final_message: message,
        approved_at: new Date().toISOString(),
      })
      .eq("id", responseId);

    // Update lead status
    const lead = leads.find((l) =>
      l.responses.some((r) => r.id === responseId)
    );
    if (lead) {
      await supabase
        .from("leads")
        .update({ status: "responded" })
        .eq("id", lead.id);
    }

    setLeads((prev) =>
      prev.map((l) => {
        if (!l.responses.some((r) => r.id === responseId)) return l;
        return {
          ...l,
          status: "responded" as const,
          responses: l.responses.map((r) =>
            r.id === responseId
              ? { ...r, status: "approved" as const, final_message: message }
              : r
          ),
        };
      })
    );
  }

  async function handleReject(responseId: string) {
    await supabase
      .from("responses")
      .update({ status: "rejected" })
      .eq("id", responseId);

    const lead = leads.find((l) =>
      l.responses.some((r) => r.id === responseId)
    );
    if (lead) {
      await supabase
        .from("leads")
        .update({ status: "skipped" })
        .eq("id", lead.id);
    }

    setLeads((prev) =>
      prev.map((l) => {
        if (!l.responses.some((r) => r.id === responseId)) return l;
        return {
          ...l,
          status: "skipped" as const,
          responses: l.responses.map((r) =>
            r.id === responseId ? { ...r, status: "rejected" as const } : r
          ),
        };
      })
    );
  }

  return (
    <div className="space-y-3">
      {leads.map((lead) => (
        <LeadCard
          key={lead.id}
          lead={lead}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      ))}
    </div>
  );
}
