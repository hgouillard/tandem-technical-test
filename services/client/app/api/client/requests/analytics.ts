import { GroupedData } from "@/scripts/dataingest/types";

export async function fetchAnalytics(): Promise<GroupedData> {
  const response = await fetch("/api/analytics");
  if (!response.ok) {
    throw new Error("Failed to fetch analytics data");
  }
  return response.json();
}
