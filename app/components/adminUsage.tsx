import { getAdminUsageStats } from "@/app/lib/controllerAdmin"
import AdminUsageDashboard from "./adminUsageDashboard"

export default async function AdminUsage() {
  const data = await getAdminUsageStats()
  return <AdminUsageDashboard data={data} />
}
