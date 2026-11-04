import { redirect } from "next/navigation";

/** Profile editing moved into Settings. */
export default function EditProfilePage() {
  redirect("/settings");
}
