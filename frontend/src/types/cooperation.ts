export interface Cooperation {
  id: string;
  name: string;
  description: string;
  domains: string[];
  syncStatus: "synced" | "new" | "updated" | "deleted";
}
