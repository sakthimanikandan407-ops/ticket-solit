dimport { createClient } from "@supabase/supabase-js";

const CONFIG_KEY = "ticketsplit_supabase_config";

export function getStoredSupabaseConfig() {
  try {
    const raw = localStorage.getItem(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn("Error reading Supabase config", e);
  }

  // Fallback to Vite environment variables if defined
  return {
    url: import.meta.env.VITE_SUPABASE_URL || "",
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || ""
  };
}

export function saveStoredSupabaseConfig(url, anonKey) {
  try {
    localStorage.setItem(CONFIG_KEY, JSON.stringify({ url: url.trim(), anonKey: anonKey.trim() }));
    supabaseClient = null; // force reinit
    initSupabase();
  } catch (e) {
    console.error("Error saving Supabase config", e);
  }
}

let supabaseClient = null;

export function initSupabase() {
  const config = getStoredSupabaseConfig();
  if (config.url && config.anonKey) {
    try {
      supabaseClient = createClient(config.url, config.anonKey);
      return supabaseClient;
    } catch (err) {
      console.error("Failed to initialize Supabase client:", err);
      supabaseClient = null;
    }
  }
  return null;
}

export function getSupabase() {
  if (!supabaseClient) {
    initSupabase();
  }
  return supabaseClient;
}

export function isSupabaseConfigured() {
  const config = getStoredSupabaseConfig();
  return Boolean(config.url && config.anonKey);
}

export async function testConnection() {
  const client = getSupabase();
  if (!client) {
    return { success: false, message: "Supabase URL and Anon Key not configured" };
  }
  try {
    const { error } = await client.from("groups").select("id").limit(1);
    if (error && error.code !== "PGRST116" && error.code !== "42P01") {
      // 42P01 means table does not exist yet, which still means auth/connection succeeded!
      if (error.code === "42P01") {
        return {
          success: true,
          tableWarning: true,
          message: "Connected to Supabase! (Tables not created yet, please run SQL schema)"
        };
      }
      return { success: false, message: error.message };
    }
    return { success: true, message: "Successfully connected to Supabase backend!" };
  } catch (err) {
    return { success: false, message: err.message || "Network error connecting to Supabase" };
  }
}

// SQL Schema for Supabase Editor
export const SUPABASE_SQL_SCHEMA = `-- TicketSplit Database Schema for Supabase
-- Run this in Supabase Dashboard -> SQL Editor

-- 1. Profiles / Members Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  initials TEXT,
  avatar_url TEXT,
  upi_id TEXT NOT NULL,
  default_share_percent NUMERIC DEFAULT 25.0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Groups Table
CREATE TABLE IF NOT EXISTS public.groups (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  location TEXT,
  member_count INT DEFAULT 4,
  net_balance NUMERIC DEFAULT 0.0,
  total_spend_month NUMERIC DEFAULT 0.0,
  next_rent_due_days INT DEFAULT 4,
  monthly_rent NUMERIC DEFAULT 32000.0,
  rent_due_date_text TEXT DEFAULT '1st Nov',
  landlord_upi TEXT DEFAULT 'suresh.sharma@okaxis',
  is_auto_split_rent_active BOOLEAN DEFAULT TRUE,
  reminders_on BOOLEAN DEFAULT TRUE,
  image_url TEXT,
  flat_group_upi_id TEXT DEFAULT 'greenglen402@axisbank',
  rent_payment_automation BOOLEAN DEFAULT TRUE,
  smart_debt_minimization BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Expenses Table
CREATE TABLE IF NOT EXISTS public.expenses (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  total_amount NUMERIC NOT NULL,
  paid_by_name TEXT NOT NULL,
  paid_by_member_id TEXT,
  split_summary TEXT,
  date_text TEXT,
  category TEXT DEFAULT 'Utilities',
  category_emoji TEXT DEFAULT '⚡',
  you_get_back_amount NUMERIC DEFAULT 0.0,
  you_owe_amount NUMERIC DEFAULT 0.0,
  settled_text TEXT,
  receipt_name TEXT,
  receipt_url TEXT,
  receipt_size_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Settlements Table
CREATE TABLE IF NOT EXISTS public.settlements (
  id TEXT PRIMARY KEY,
  group_id TEXT REFERENCES public.groups(id) ON DELETE CASCADE,
  from_member_id TEXT,
  to_member_id TEXT,
  amount NUMERIC NOT NULL,
  utr_reference TEXT,
  status TEXT DEFAULT 'COMPLETED',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS) & allow read/write for anon
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.settlements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public Read Profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Public Insert Profiles" ON public.profiles FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Profiles" ON public.profiles FOR UPDATE USING (true);

CREATE POLICY "Public Read Groups" ON public.groups FOR SELECT USING (true);
CREATE POLICY "Public Insert Groups" ON public.groups FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Groups" ON public.groups FOR UPDATE USING (true);

CREATE POLICY "Public Read Expenses" ON public.expenses FOR SELECT USING (true);
CREATE POLICY "Public Insert Expenses" ON public.expenses FOR INSERT WITH CHECK (true);
CREATE POLICY "Public Update Expenses" ON public.expenses FOR UPDATE USING (true);
`;

// Sync helpers with Supabase
export async function syncExpensesToSupabase(expenses) {
  const client = getSupabase();
  if (!client) return;
  try {
    const formatted = expenses.map(e => ({
      id: e.id,
      group_id: e.groupId,
      title: e.title,
      total_amount: e.totalAmount,
      paid_by_name: e.paidByName,
      paid_by_member_id: e.paidByMemberId,
      split_summary: e.splitSummary,
      date_text: e.dateText,
      category: e.category,
      category_emoji: e.categoryEmoji,
      you_get_back_amount: e.youGetBackAmount || 0,
      you_owe_amount: e.youOweAmount || 0,
      settled_text: e.settledText,
      receipt_name: e.receiptName,
      receipt_url: e.receiptUrl
    }));
    await client.from("expenses").upsert(formatted);
  } catch (e) {
    console.warn("Supabase expenses sync error:", e);
  }
}
