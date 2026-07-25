import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { TenantPage } from "@/pages/tenant";
import { UnderwritePage } from "@/pages/underwrite";
import { MonitorPage } from "@/pages/monitor";
import { RecoveryPage } from "@/pages/recovery";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: 1, refetchOnWindowFocus: false },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route element={<AppLayout />}>
            <Route path="/" element={<Navigate to="/tenant" replace />} />
            <Route path="/tenant" element={<TenantPage />} />
            <Route path="/underwrite" element={<UnderwritePage />} />
            <Route path="/monitor" element={<MonitorPage />} />
            <Route path="/recovery" element={<RecoveryPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
