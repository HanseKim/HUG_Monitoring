import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./AppLayout";
import { OverviewPage } from "@/pages/overview";
import { AssessPage } from "@/pages/assess";
import { MonitorPage } from "@/pages/monitor";
import { PolicyPage } from "@/pages/policy";
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
            <Route path="/" element={<OverviewPage />} />
            <Route path="/assess" element={<AssessPage />} />
            <Route path="/monitor" element={<MonitorPage />} />
            <Route path="/policy" element={<PolicyPage />} />
            <Route path="/recovery" element={<RecoveryPage />} />
            {/* 구 경로 호환 */}
            <Route path="/underwrite" element={<Navigate to="/assess" replace />} />
            <Route path="/tenant" element={<Navigate to="/assess" replace />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
