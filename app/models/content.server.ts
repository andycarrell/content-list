import { supabase } from "./supabase.server";
import type { User } from "./user.server";

export type Content = {
  id: string;
  url: string;
  created_at: string;
  profile_id: string;
};

export async function getContentList({ userId }: { userId: User["id"] }) {
  const { data } = await supabase
    .from("content")
    .select("id, url, created_at")
    .eq("profile_id", userId);

  return data;
}

export async function createContent({
  url,
  userId,
}: {
  url: Content["url"];
  userId: User["id"];
}) {
  const { data, error } = await supabase
    .from("content")
    .insert([{ url, profile_id: userId }])
    .select()
    .single();

  if (error) {
    return null;
  }

  return data;
}
