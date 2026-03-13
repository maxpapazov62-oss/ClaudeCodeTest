export type LeadStatus = "new" | "responded" | "skipped" | "expired";
export type ResponseStatus = "pending" | "approved" | "rejected" | "sent";

export interface Profile {
  id: string;
  full_name: string | null;
  created_at: string;
}

export interface Configuration {
  id: string;
  user_id: string;
  niche: string;
  price_min: number;
  price_max: number;
  location_state: string;
  location_city: string;
  location_zip: string;
  landing_page_url: string;
  auto_approve: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GmailConnection {
  id: string;
  user_id: string;
  gmail_address: string;
  access_token: string;
  refresh_token: string;
  token_expiry: string;
  last_synced_at: string | null;
}

export interface Lead {
  id: string;
  user_id: string;
  source_platform: string;
  source_email_subject: string;
  source_email_body: string;
  lead_title: string;
  lead_description: string;
  lead_budget: string | null;
  lead_location: string | null;
  lead_url: string | null;
  status: LeadStatus;
  created_at: string;
}

export interface LeadResponse {
  id: string;
  lead_id: string;
  user_id: string;
  draft_message: string;
  final_message: string | null;
  status: ResponseStatus;
  approved_at: string | null;
  created_at: string;
}

export interface LeadWithResponse extends Lead {
  responses: LeadResponse[];
}
