import { useMutation } from "@tanstack/react-query";
import { api } from "@/shared/api/client";
import type {
  TenantScoreReq,
  TenantScoreRes,
  UnderwriteReq,
  UnderwriteRes,
} from "./types";

export const scoreTenant = (req: TenantScoreReq) =>
  api.post<TenantScoreRes>("/api/tenant/score", req);

export const scoreUnderwrite = (req: UnderwriteReq) =>
  api.post<UnderwriteRes>("/api/underwrite/score", req);

export const useTenantScore = () =>
  useMutation({ mutationFn: scoreTenant });

export const useUnderwriteScore = () =>
  useMutation({ mutationFn: scoreUnderwrite });
