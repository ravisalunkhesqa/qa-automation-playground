import { supabase } from "./supabaseClient";

export type PlaygroundItem = {
  id: number;
  name: string;
  description: string;
  created_at?: string;
};

export async function listPlaygroundItems() {
  if (!supabase) {
    return [];
  }

  const { data, error } = await supabase.from("playground_items").select("*").order("id", { ascending: true });
  if (error) {
    throw error;
  }
  return data as PlaygroundItem[];
}

export async function createPlaygroundItem(payload: { name: string; description: string }) {
  if (!supabase) {
    throw new Error("Backend client is not configured");
  }

  const { data, error } = await supabase.from("playground_items").insert(payload).select().single();
  if (error) {
    throw error;
  }
  return data as PlaygroundItem;
}

export async function updatePlaygroundItem(id: number, payload: { name: string; description: string }) {
  if (!supabase) {
    throw new Error("Backend client is not configured");
  }

  const { data, error } = await supabase.from("playground_items").update(payload).eq("id", id).select().single();
  if (error) {
    throw error;
  }
  return data as PlaygroundItem;
}

export async function deletePlaygroundItem(id: number) {
  if (!supabase) {
    throw new Error("Backend client is not configured");
  }

  const { error } = await supabase.from("playground_items").delete().eq("id", id);
  if (error) {
    throw error;
  }
}
