import { getSupabase, newId, throwIfError } from "@/lib/supabase";

export interface AppUser {
  id: string;
  email: string;
  fullName: string;
  avatar: string;
  role: "admin" | "member";
  emailVerified?: boolean;
  password?: string;
}

interface UserRow {
  id: string;
  email: string;
  full_name: string;
  avatar: string;
  role: "admin" | "member";
  email_verified: boolean;
  password: string | null;
}

function mapUser(row: UserRow): AppUser {
  return {
    id: row.id,
    email: row.email,
    fullName: row.full_name,
    avatar: row.avatar,
    role: row.role,
    emailVerified: row.email_verified,
    password: row.password ?? undefined,
  };
}

function toRow(user: AppUser): UserRow {
  return {
    id: user.id,
    email: user.email,
    full_name: user.fullName,
    avatar: user.avatar ?? "",
    role: user.role,
    email_verified: user.emailVerified ?? false,
    password: user.password ?? null,
  };
}

export async function getUsers(): Promise<AppUser[]> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .order("created_at", { ascending: true });
  throwIfError(error, "getUsers");
  return ((data ?? []) as UserRow[]).map(mapUser);
}

export async function getUser(id: string): Promise<AppUser | undefined> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  throwIfError(error, "getUser");
  return data ? mapUser(data as UserRow) : undefined;
}

export async function findUserByEmail(
  email: string
): Promise<AppUser | undefined> {
  const { data, error } = await getSupabase()
    .from("users")
    .select("*")
    .ilike("email", email)
    .maybeSingle();
  throwIfError(error, "findUserByEmail");
  return data ? mapUser(data as UserRow) : undefined;
}

export async function addUser(
  user: Omit<AppUser, "id"> & { id?: string }
): Promise<AppUser> {
  const created: AppUser = {
    ...user,
    id: user.id ?? newId(),
    avatar: user.avatar ?? "",
    fullName: user.fullName ?? "",
  };
  const { error } = await getSupabase().from("users").insert(toRow(created));
  throwIfError(error, "addUser");
  return created;
}

export async function updateUserRecord(user: AppUser): Promise<AppUser> {
  const { error } = await getSupabase()
    .from("users")
    .update(toRow(user))
    .eq("id", user.id);
  throwIfError(error, "updateUserRecord");
  return user;
}

export async function deleteUser(id: string): Promise<void> {
  const { error } = await getSupabase().from("users").delete().eq("id", id);
  throwIfError(error, "deleteUser");
}

export async function saveVerificationToken(
  email: string,
  token: string
): Promise<void> {
  const { error } = await getSupabase()
    .from("verification_tokens")
    .upsert({ email, token });
  throwIfError(error, "saveVerificationToken");
}

export async function consumeVerificationToken(
  email: string,
  token: string
): Promise<boolean> {
  const supabase = getSupabase();
  const { data, error } = await supabase
    .from("verification_tokens")
    .select("token")
    .eq("email", email)
    .maybeSingle();
  throwIfError(error, "consumeVerificationToken");
  if (!data || data.token !== token) return false;

  const user = await findUserByEmail(email);
  if (user) {
    await updateUserRecord({ ...user, emailVerified: true });
  }
  const { error: deleteError } = await supabase
    .from("verification_tokens")
    .delete()
    .eq("email", email);
  throwIfError(deleteError, "consumeVerificationToken.delete");
  return true;
}
