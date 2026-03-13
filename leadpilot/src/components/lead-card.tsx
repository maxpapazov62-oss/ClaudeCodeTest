"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import {
  ChevronDown,
  ChevronUp,
  Check,
  X,
  Copy,
  ExternalLink,
  MapPin,
  DollarSign,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import type { LeadWithResponse } from "@/types";

const PLATFORM_COLORS: Record<string, string> = {
  Upwork: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  Fiverr:
    "bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200",
  Thumbtack: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  Freelancer:
    "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200",
  default: "bg-secondary text-secondary-foreground",
};

const STATUS_VARIANTS: Record<
  string,
  "default" | "secondary" | "success" | "warning" | "destructive" | "outline"
> = {
  new: "warning",
  responded: "success",
  skipped: "secondary",
  expired: "outline",
};

interface LeadCardProps {
  lead: LeadWithResponse;
  onApprove: (responseId: string, message: string) => Promise<void>;
  onReject: (responseId: string) => Promise<void>;
}

export function LeadCard({ lead, onApprove, onReject }: LeadCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editedMessage, setEditedMessage] = useState(
    lead.responses[0]?.draft_message || ""
  );
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);

  const response = lead.responses[0];
  const platformColor =
    PLATFORM_COLORS[lead.source_platform] || PLATFORM_COLORS.default;

  async function handleApprove() {
    if (!response) return;
    setLoading("approve");
    await onApprove(response.id, editedMessage);
    setLoading(null);
  }

  async function handleReject() {
    if (!response) return;
    setLoading("reject");
    await onReject(response.id);
    setLoading(null);
  }

  function handleCopy() {
    navigator.clipboard.writeText(editedMessage);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="rounded-lg border bg-card text-card-foreground transition-shadow hover:shadow-md">
      <button
        className="w-full p-4 text-left"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <span
                className={`rounded-full px-2 py-0.5 text-xs font-medium ${platformColor}`}
              >
                {lead.source_platform}
              </span>
              <Badge variant={STATUS_VARIANTS[lead.status] || "default"}>
                {lead.status}
              </Badge>
              {lead.lead_budget && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <DollarSign className="h-3 w-3" />
                  {lead.lead_budget}
                </span>
              )}
              {lead.lead_location && (
                <span className="flex items-center gap-1 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3" />
                  {lead.lead_location}
                </span>
              )}
            </div>
            <h3 className="font-medium truncate">{lead.lead_title}</h3>
            <p className="text-xs text-muted-foreground mt-0.5">
              {formatDistanceToNow(new Date(lead.created_at), {
                addSuffix: true,
              })}
            </p>
          </div>
          {expanded ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0 mt-1" />
          )}
        </div>
      </button>

      {expanded && (
        <div className="border-t px-4 pb-4 space-y-4">
          <div>
            <p className="text-sm font-medium text-muted-foreground mb-1">
              Description
            </p>
            <p className="text-sm">{lead.lead_description}</p>
            {lead.lead_url && (
              <a
                href={lead.lead_url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                View original post
                <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>

          {response && lead.status === "new" && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                AI-Drafted Response
              </p>
              <Textarea
                value={editedMessage}
                onChange={(e) => setEditedMessage(e.target.value)}
                className="text-sm min-h-[100px]"
              />
              <div className="flex gap-2 mt-2">
                <Button
                  size="sm"
                  onClick={handleApprove}
                  disabled={loading !== null}
                >
                  <Check className="h-4 w-4" />
                  {loading === "approve" ? "Approving..." : "Approve"}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopy}
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={handleReject}
                  disabled={loading !== null}
                >
                  <X className="h-4 w-4" />
                  {loading === "reject" ? "Rejecting..." : "Reject"}
                </Button>
              </div>
            </div>
          )}

          {response && lead.status !== "new" && (
            <div>
              <p className="text-sm font-medium text-muted-foreground mb-1">
                Response ({response.status})
              </p>
              <p className="text-sm bg-muted rounded p-3">
                {response.final_message || response.draft_message}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
