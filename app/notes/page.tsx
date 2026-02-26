import { Metadata } from "next";
import { NotesClient } from "./notes-client";

export const metadata: Metadata = {
  title: "Notes",
};

export default function NotesPage() {
  return <NotesClient />;
}
