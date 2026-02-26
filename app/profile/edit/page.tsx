import { Metadata } from "next";
import { EditProfileClient } from "./edit-profile-client";

export const metadata: Metadata = {
  title: "Edit Profile",
};

export default function EditProfilePage() {
  return <EditProfileClient />;
}
