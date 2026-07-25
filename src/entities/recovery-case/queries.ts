import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type { RecoveryReq, RecoveryRes } from "./types";

export const analyzeRecovery = (req: RecoveryReq) =>
  api.post<RecoveryRes>("/api/recovery/analyze", req);

export const useRecoveryAnalyze = () =>
  useMutation({ mutationFn: analyzeRecovery });
