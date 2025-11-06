export interface Assessment {
  id: string;
  name: string;
  date: string;
  time: string;
  categories: string[];
  status: string;
  syncStatus: "pending" | "synced" | "error";
  lastModified?: string;
}