import { useQuery } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type { MonitorContract } from "./types";

export const useMonitorContracts = (params: { changed?: boolean; q?: string }) => {
  const search = new URLSearchParams();
  if (params.changed !== undefined) search.set("changed", String(params.changed));
  if (params.q) search.set("q", params.q);
  const qs = search.toString();
  return useQuery({
    queryKey: ["monitor-contracts", params],
    queryFn: () =>
      api.get<MonitorContract[]>(`/api/monitor/contracts${qs ? `?${qs}` : ""}`),
  });
};
