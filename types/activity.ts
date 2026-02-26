export interface Activity {
  id: string;
  type: "organization_added" | "person_added" | "collection_created" | "stage_changed" | "note_added" | "meeting_scheduled" | "deal_updated" | "email_sent";
  title: string;
  description: string;
  timestamp: string;
  userId?: string;
  userName?: string;
  relatedEntityId?: string;
  relatedEntityType?: "organization" | "person" | "collection";
  read?: boolean;
}
