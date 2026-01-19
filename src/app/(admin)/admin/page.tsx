import { redirect } from "next/navigation";

export default function AdminRoot() {
  // Automatically send users to the dashboard
  redirect("/admin/dashboard");
}