import { Outlet } from "react-router-dom";
import { Sidebar } from "@/widgets/sidebar";

export function AppLayout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="min-w-0 flex-1 bg-canvas">
        <div className="mx-auto max-w-[1200px] px-8 py-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
