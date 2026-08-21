import Sidebar from "@/app/dashboard/sidebar/sidebar";

export default function DashboardLayout({ children }) {
  return (
    <div className="min-h-screen bg-gray-100">

      <Sidebar />

      <main className="ml-64 min-h-screen">
        {children}
      </main>

    </div>
  );
}