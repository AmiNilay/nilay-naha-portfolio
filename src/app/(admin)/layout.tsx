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
  return (
    <>
      {/* Runs before paint so a dark public theme never flashes in the admin panel. */}
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.classList.remove("dark");document.documentElement.style.colorScheme="light";`,
        }}
      />
      <AdminLayoutClient>{children}</AdminLayoutClient>
    </>
  );
}
