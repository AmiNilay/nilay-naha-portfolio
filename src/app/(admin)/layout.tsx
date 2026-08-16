import type { Metadata } from "next";
import AdminLayoutClient from "@/components/admin/AdminLayoutClient";

export const metadata: Metadata = {
  title: "Admin Dashboard | Nilay Naha",
  description: "Portfolio Content Management System",
  robots: {
    index: false,
    follow: false,
  },
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
