export interface Cooperation {
  id: string;
  name: string;
  description: string;
  domains: string[];
  path?: string; // Added to match the path from the ID token
  syncStatus: "synced" | "new" | "updated" | "deleted";
}
