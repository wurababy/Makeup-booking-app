import { redirect } from "next/navigation";
import AdminDashboard from "@/components/AdminDashboard";
import { adminUser } from "@/lib/server/admin";

export const dynamic = "force-dynamic";
export const metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminPage() {
  const u = await adminUser();
  if (!u) redirect("/admin/login");
  return <AdminDashboard email={u.email} />;
}
