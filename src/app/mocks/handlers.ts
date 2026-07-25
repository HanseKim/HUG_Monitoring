import { http, HttpResponse, delay } from "msw";
import type {
  TenantScoreReq,
  TenantScoreRes,
  UnderwriteReq,
  UnderwriteRes,
} from "@/entities/assessment";
import type { MonitorContract, ModelDashboard, Snapshot } from "@/entities/contract";
import type { RecoveryReq, RecoveryRes } from "@/entities/recovery-case";
import { GRADE_SCALE, gradeByIdx, gradeFromPd } from "@/shared/config/grades";
import { PATH_LABEL } from "@/entities/recovery-case";

const mockDelay = () => delay(800 + Math.random() * 700);

// ── 위험도 곡선 근사 (프로토타입 실측치: 아파트 70%→3.16%, 오피스텔 95%→80.1%) ──
const CURVE_POINTS: [number, number][] = [
  [50, 0.8],
  [60, 1.6],
  [70, 3.16],
  [80, 5.2],
  [85, 7.0],
  [90, 18.0],
  [95, 47.1],
  [100, 62.0],
  [110, 78.0],
];

function riskAtRatio(ratio: number, houseType: string): number {
  const factor = houseType === "오피스텔" ? 1.7 : 1;
  const pts = CURVE_POINTS;
  let base: number;
  if (ratio <= pts[0][0]) base = pts[0][1];
  else if (ratio >= pts[pts.length - 1][0]) base = pts[pts.length - 1][1];
  else {
    base = pts[pts.length - 1][1];
    for (let i = 0; i < pts.length - 1; i++) {
      const [x1, y1] = pts[i];
      const [x2, y2] = pts[i + 1];
      if (ratio >= x1 && ratio <= x2) {
        base = y1 + ((y2 - y1) * (ratio - x1)) / (x2 - x1);
        break;
      }
    }
  }
  return Math.min(99, Math.round(base * factor * 10) / 10);
}

// 유형별 가정 시세 배율 (보증금 → 주택가액 역산)
const RATIO_BY_TYPE: Record<string, number> = {
  아파트: 0.7,
  다세대주택: 0.9,
  연립주택: 0.85,
  오피스텔: 0.95,
  기타: 0.88,
};

const gradeOf = (riskPct: number): TenantScoreRes["grade"] =>
  riskPct < 5 ? "안심" : riskPct < 20 ? "주의" : "위험";

// ── POST /api/tenant/score ──
const tenantScore = http.post("/api/tenant/score", async ({ request }) => {
  const req = (await request.json()) as TenantScoreReq;
  await mockDelay();

  // 에러 상태 데모: 주소에 "오류" 포함 시 실패 응답
  if (req.address.includes("오류")) {
    return HttpResponse.json(
      { message: "주소를 확인할 수 없습니다. 도로명 또는 지번 주소로 다시 입력해주세요." },
      { status: 422 },
    );
  }

  const assumedRatio = RATIO_BY_TYPE[req.houseType] ?? 0.88;
  const housePrice = Math.round(req.deposit / assumedRatio / 1_000_000) * 1_000_000;
  const jeonseRatio = Math.round((req.deposit / housePrice) * 1000) / 10;

  const lienFired =
    req.seniorLien === "근저당설정" ||
    req.seniorLien === "압류·가압류" ||
    req.seniorLien === "선순위존재";
  let riskPct = riskAtRatio(jeonseRatio, req.houseType);
  if (lienFired) riskPct = Math.min(99, Math.round(riskPct * 1.35 * 10) / 10);
  const grade = gradeOf(riskPct);

  const highRatio = jeonseRatio >= 90;
  const noInsurance = req.insurance === "미가입";
  const riskyType = req.houseType === "오피스텔" || req.houseType === "다세대주택";

  const res: TenantScoreRes = {
    grade,
    riskPct,
    jeonseRatio,
    housePrice,
    checklist: [
      {
        id: "HR0",
        fired: highRatio,
        title: "전세가율 90% 초과 (깡통전세 구간)",
        evidence: highRatio
          ? `전세가율 ${jeonseRatio}% — 유사조건 상담 340건 중 85.6%가 소송·경매 단계로 진행되었습니다.`
          : `전세가율 ${jeonseRatio}%로 깡통전세 기준(90%) 미만입니다.`,
      },
      {
        id: "HR1",
        fired: lienFired,
        title: "선순위 권리 존재",
        evidence: lienFired
          ? `${req.seniorLien} 확인 — 경매 시 배당 순위가 밀려 보증금 손실 위험이 큽니다. 유사 사례 212건 중 71.2%에서 보증금 일부 미회수.`
          : "등기부상 선순위 권리가 확인되지 않았습니다.",
      },
      {
        id: "HR2",
        fired: noInsurance,
        title: "보증보험 미가입",
        evidence: noInsurance
          ? "보증보험 미가입 상태 — 사고 발생 시 보증금 전액을 직접 회수해야 합니다. 미가입 피해 상담의 평균 회수율은 43%입니다."
          : "보증보험 가입(또는 확인 예정) 상태입니다.",
      },
      {
        id: "HR3",
        fired: riskyType && grade !== "안심",
        title: "사고 다발 주택유형",
        evidence:
          riskyType && grade !== "안심"
            ? `${req.houseType}은 최근 3년 보증사고의 62.4%를 차지한 유형입니다. 시세 확인이 어려워 가격 부풀리기에 취약합니다.`
            : "해당 주택유형의 구조적 위험 신호는 크지 않습니다.",
      },
    ],
    similarCases: [
      {
        region: "서울 강서구",
        summary:
          "보증금 2.8억 다세대 — 계약 6개월 후 임대인 파산, 경매 진행. 전세가율 96% 계약으로 배당 후 1.1억 미회수.",
        disputeType: "경매·배당",
      },
      {
        region: "인천 미추홀구",
        summary:
          "보증금 1.9억 오피스텔 — 근저당 선순위 1.4억 존재. 보증보험 가입 거절 후 임차인이 계약 해제 소송 제기.",
        disputeType: "계약해제 소송",
      },
      ...(grade === "위험"
        ? [
            {
              region: "경기 부천시",
              summary:
                "동일 임대인 명의 12건 동시 사고 — 전세사기 특별법 적용, 피해자 우선매수권 행사 사례.",
              disputeType: "전세사기",
            },
          ]
        : []),
    ],
    insuranceReco:
      grade === "안심"
        ? {
            type: "recommend",
            product: req.hasLoan
              ? "전세보증금반환보증 + 안심전세대출보증"
              : "전세보증금반환보증",
            message: req.hasLoan
              ? "현재 조건은 가입 요건을 충족할 가능성이 높습니다. 전세대출 이용 예정이므로 반환보증과 대출보증을 함께 신청하면 금리 우대를 받을 수 있습니다."
              : "현재 조건은 가입 요건을 충족할 가능성이 높습니다. 계약 직후 전세보증금반환보증 가입을 권장합니다.",
          }
        : grade === "주의"
          ? {
              type: "conditional",
              product: "전세보증금반환보증 (감액인수 가능성)",
              message:
                "전세가율이 높아 보증금 일부만 인수(감액인수)될 가능성이 있습니다. 계약 전 보증금을 낮추거나 임대인에게 선순위 말소를 요구하는 협상을 권장합니다.",
            }
          : {
              type: "warning",
              product: null,
              message:
                "현재 조건은 보증보험 가입이 거절될 가능성이 높습니다. 계약 진행 전 반드시 재검토하시고, 이미 계약했다면 전세피해지원센터(1533-8119) 상담을 받아보세요.",
            },
    curve: CURVE_POINTS.filter(([r]) => r >= 60 && r <= 100).map(([ratio]) => ({
      ratio,
      riskPct: riskAtRatio(ratio, req.houseType),
    })),
  };
  return HttpResponse.json(res);
});

// ── POST /api/underwrite/score ──
const underwriteScore = http.post("/api/underwrite/score", async ({ request }) => {
  const req = (await request.json()) as UnderwriteReq;
  await mockDelay();

  const jeonseRatio = Math.round((req.deposit / req.housePrice) * 1000) / 10;
  const pdPct = riskAtRatio(jeonseRatio, req.houseType);
  // 경매 낙찰가율 80% 가정 회수 → LGD
  const recovery = Math.max(0, req.housePrice * 0.8 - req.seniorAmount);
  const lgdPct =
    Math.round(Math.max(0, 1 - Math.min(1, recovery / req.deposit)) * 1000) / 10;
  const ead = req.deposit;
  const el = Math.round((pdPct / 100) * (lgdPct / 100) * ead);
  const expectedPremium = Math.round(req.deposit * 0.0024);
  const verdict: UnderwriteRes["verdict"] =
    el <= expectedPremium && jeonseRatio <= 90 ? "승인" : "거절";

  const reasons: string[] = [];
  reasons.push(
    `전세가율 ${jeonseRatio}% — ${jeonseRatio <= 90 ? "인수 기준(90%) 이내" : "인수 기준(90%) 초과"}`,
  );
  reasons.push(`부도확률(PD) ${pdPct}% × 손실률(LGD) ${lgdPct}% 기준 예상손실 ${el.toLocaleString("ko-KR")}원`);
  reasons.push(
    el <= expectedPremium
      ? `예상손실이 예상보험료(${expectedPremium.toLocaleString("ko-KR")}원) 이하로 인수 타당`
      : `예상손실이 예상보험료(${expectedPremium.toLocaleString("ko-KR")}원)를 초과하여 인수 부적합`,
  );
  if (req.seniorAmount > 0)
    reasons.push(
      `선순위금액 ${req.seniorAmount.toLocaleString("ko-KR")}원 — 경매 회수액에서 우선 차감 반영`,
    );

  // ── 13등급 산정 (grade_scale.py 로직 재현) ──
  // HR0: 전세가율>100% 무조건 D / HR1(선순위권리): 1등급 강등 / 승급 없음
  const modelGrade = gradeFromPd(pdPct);
  let gradeIdx = modelGrade.idx;
  let gradeReason: string;
  if (jeonseRatio > 100) {
    gradeIdx = 18;
    gradeReason = `전세가율 ${jeonseRatio}% → D (HR0 깡통주택 강제)`;
  } else if (req.seniorAmount > 0) {
    gradeIdx = Math.min(18, modelGrade.idx + 1);
    gradeReason = `PD ${pdPct}% → ${modelGrade.name} → ${gradeByIdx(gradeIdx).name} (HR1 선순위권리)`;
  } else {
    gradeReason = `PD ${pdPct}% → ${modelGrade.name} (하드룰 미발동)`;
  }
  const finalGrade = gradeByIdx(gradeIdx);

  const res: UnderwriteRes = {
    verdict,
    pdPct,
    lgdPct,
    ead,
    el,
    expectedPremium,
    reasons,
    jeonseRatio,
    grade13: finalGrade.name,
    gradeIdx: finalGrade.idx,
    gradeBand: finalGrade.band,
    gradeReason,
  };
  return HttpResponse.json(res);
});

// ── GET /api/monitor/contracts ── 고정 시드 9건
// 발제사 실데이터 지역이 세종시이므로 세종 건을 최우선 강등 건으로 배치
const SEED_CONTRACTS: MonitorContract[] = [
  {
    contractId: "C-2026-0007",
    deposit: 290_000_000,
    strategyBefore: "정기 모니터링",
    strategyAfter: "든든전세 매입 검토",
    address: "세종 세종시 한솔동 ◎◎파크빌 401호",
    houseType: "다세대주택",
    before: { grade: "안심", riskPct: 2.4, jeonseRatio: 74, snapshotAt: "2026-06-05" },
    after: { grade: "위험", riskPct: 41.8, jeonseRatio: 97, snapshotAt: "2026-07-22" },
    trigger: "T3_등기변동",
    reason: "등기변동 — 근저당 8천만원 설정 + 인근 실거래가 11.3% 하락 반영",
    recommendations: ["임대인 재산조회", "든든전세 매입 검토", "임차인 우선 고지"],
  },
  {
    contractId: "C-2026-0042",
    deposit: 280_000_000,
    strategyBefore: "정기 모니터링",
    strategyAfter: "든든전세 매입 검토",
    address: "서울 강서구 화곡동 ○○빌라 302호",
    houseType: "다세대주택",
    before: { grade: "안심", riskPct: 8.2, jeonseRatio: 78, snapshotAt: "2026-06-01" },
    after: { grade: "위험", riskPct: 46.2, jeonseRatio: 95, snapshotAt: "2026-07-12" },
    trigger: "T3_등기변동",
    reason: "등기변동 — 근저당 1.2억 설정 감지",
    recommendations: ["임대인 확인", "보증보험 가입여부 확인"],
  },
  {
    contractId: "C-2026-0117",
    deposit: 190_000_000,
    strategyBefore: "관찰 강화",
    strategyAfter: "경매 배당 준비",
    address: "인천 미추홀구 주안동 △△오피스텔 1204호",
    houseType: "오피스텔",
    before: { grade: "주의", riskPct: 12.4, jeonseRatio: 84, snapshotAt: "2026-05-15" },
    after: { grade: "위험", riskPct: 38.9, jeonseRatio: 93, snapshotAt: "2026-07-03" },
    trigger: "T1_정기",
    reason: "정기 재평가 — 단지 시세 9.7% 하락으로 전세가율 상승",
    recommendations: ["시세 재확인", "감액 갱신 협상 안내"],
  },
  {
    contractId: "C-2026-0233",
    deposit: 220_000_000,
    strategyBefore: "정기 모니터링",
    strategyAfter: "협의매입 검토",
    address: "경기 부천시 원미구 □□연립 201호",
    houseType: "연립주택",
    before: { grade: "안심", riskPct: 4.1, jeonseRatio: 72, snapshotAt: "2026-06-20" },
    after: { grade: "주의", riskPct: 14.8, jeonseRatio: 81, snapshotAt: "2026-07-18" },
    trigger: "T4_지역리스크",
    reason: "지역리스크 — 부천 원미구 보증사고율 분기 2.1배 증가",
    recommendations: ["동일 임대인 보유물건 조회", "지역 사고 동향 모니터링 강화"],
  },
  {
    contractId: "C-2026-0301",
    deposit: 240_000_000,
    strategyBefore: "관찰 강화",
    strategyAfter: "관찰 강화",
    address: "서울 관악구 신림동 ◇◇빌라 402호",
    houseType: "다세대주택",
    before: { grade: "주의", riskPct: 11.2, jeonseRatio: 83, snapshotAt: "2026-07-01" },
    after: { grade: "주의", riskPct: 13.5, jeonseRatio: 83, snapshotAt: "2026-07-20" },
    trigger: "T2_금리",
    reason: "기준금리 0.25%p 인상 — 등급 변동 없음, 경보만 발령",
    recommendations: ["갱신 시점 이자 부담 재계산"],
  },
  {
    contractId: "C-2026-0305",
    deposit: 210_000_000,
    strategyBefore: "정기 모니터링",
    strategyAfter: "정기 모니터링",
    address: "경기 수원시 팔달구 ▽▽오피스텔 808호",
    houseType: "오피스텔",
    before: { grade: "안심", riskPct: 6.8, jeonseRatio: 76, snapshotAt: "2026-07-05" },
    after: { grade: "안심", riskPct: 7.1, jeonseRatio: 76, snapshotAt: "2026-07-20" },
    trigger: "T2_금리",
    reason: "기준금리 0.25%p 인상 — 등급 변동 없음, 경보만 발령",
    recommendations: ["차주 상환능력 지표 점검"],
  },
  {
    contractId: "C-2026-0150",
    deposit: 620_000_000,
    strategyBefore: "정기 모니터링",
    strategyAfter: null,
    address: "서울 송파구 잠실동 ☆☆아파트 103동 1501호",
    houseType: "아파트",
    before: { grade: "안심", riskPct: 2.1, jeonseRatio: 62, snapshotAt: "2026-06-10" },
    after: null,
    trigger: null,
    reason: null,
    recommendations: [],
  },
  {
    contractId: "C-2026-0188",
    deposit: 250_000_000,
    strategyBefore: "정기 모니터링",
    strategyAfter: null,
    address: "대전 유성구 봉명동 ◎◎아파트 205동 902호",
    houseType: "아파트",
    before: { grade: "안심", riskPct: 3.4, jeonseRatio: 68, snapshotAt: "2026-06-14" },
    after: null,
    trigger: null,
    reason: null,
    recommendations: [],
  },
  {
    contractId: "C-2026-0210",
    deposit: 210_000_000,
    strategyBefore: "관찰 강화",
    strategyAfter: null,
    address: "부산 해운대구 좌동 ◆◆연립 101호",
    houseType: "연립주택",
    before: { grade: "주의", riskPct: 9.8, jeonseRatio: 80, snapshotAt: "2026-06-25" },
    after: null,
    trigger: null,
    reason: null,
    recommendations: [],
  },
];

// 스냅샷에 등급 필드 부여 (PD → 등급). 모델 산출물 외 지표는 만들지 않는다.
const enrichSnapshot = (s: Snapshot): Snapshot => {
  const g = gradeFromPd(s.riskPct);
  return { ...s, grade13: g.name, gradeIdx: g.idx };
};
const ENRICHED_CONTRACTS: MonitorContract[] = SEED_CONTRACTS.map((c) => ({
  ...c,
  before: enrichSnapshot(c.before),
  after: c.after ? enrichSnapshot(c.after) : null,
}));

// ── GET /api/monitor/portfolio ──
// 전부 모델 산출물: 등급별 분포·실측 사고율·예측 PD·성능 지표. (2024 시험셋 25,519건)
const monitorPortfolio = http.get("/api/monitor/portfolio", async () => {
  await mockDelay();
  const grades = GRADE_SCALE.map((g) => ({
    idx: g.idx,
    name: g.name,
    count: g.testCount,
    actualRate: g.actualRate,
    predictedPd: g.predictedPd,
  }));
  const res: ModelDashboard = {
    asOf: "2026-07-25",
    dataset: {
      total: 50054,
      incidents: 3777,
      incidentRate: 7.55,
      testFrom: "2024-01",
      testTo: "2024-12",
      testCount: 25519,
    },
    performance: { auc: 0.8595, ap: 0.475, brier: 0.05265, gradeMonotonicity: 0.9938 },
    watch: {
      thresholdGrade: "BB+",
      contractShare: 34.6,
      captureRate: 83.8,
      watchRate: 18.41,
      nonWatchRate: 1.89,
      lift: 9.7,
    },
    grades,
  };
  return HttpResponse.json(res);
});

const monitorContracts = http.get("/api/monitor/contracts", async ({ request }) => {
  await mockDelay();
  const url = new URL(request.url);
  const changed = url.searchParams.get("changed");
  const q = url.searchParams.get("q")?.trim() ?? "";

  let list = ENRICHED_CONTRACTS;
  if (q) {
    list = list.filter(
      (c) => c.address.includes(q) || c.contractId.toLowerCase().includes(q.toLowerCase()),
    );
  } else if (changed === "true") {
    list = list.filter((c) => c.after !== null);
  } else if (changed === "false") {
    list = list.filter((c) => c.after === null);
  }
  return HttpResponse.json(list);
});

// ── POST /api/recovery/analyze ──
const recoveryAnalyze = http.post("/api/recovery/analyze", async ({ request }) => {
  const req = (await request.json()) as RecoveryReq;
  await mockDelay();

  const metro = /서울|인천|경기/.test(req.address);
  const multiUnit = req.houseType === "다세대주택" || req.houseType === "연립주택";

  const evictionCost =
    req.evictionStatus === "점유중" ? 12_000_000 : req.evictionStatus === "미상" ? 6_000_000 : 2_000_000;
  const repairCost =
    req.defectStatus === "보수필요" ? 15_000_000 : req.defectStatus === "경미" ? 5_000_000 : 1_000_000;

  // 자산화(든든전세 매입 후 매각) 기대값: 감정가의 재매각율 - 부대비용
  const resaleRate = (multiUnit && metro ? 0.82 : 0.68) - req.failedBidCount * 0.02;
  const eAssetization = Math.round(
    Math.max(0, req.appraisalPrice * resaleRate - evictionCost - repairCost - req.seniorAmount),
  );
  // 배당대기 기대값: 최저매각가 기준 배당
  const dividendRate = req.houseType === "오피스텔" ? 0.92 : 0.78;
  const eDividend = Math.round(
    Math.max(0, Math.min(req.subrogationAmount, req.minBidPrice * dividendRate - req.seniorAmount)),
  );
  const economicGain = eAssetization - eDividend;

  const gate = {
    offsetPossible: req.subrogationAmount >= req.minBidPrice * 0.5,
    opposableClear: req.opposableTenant !== "유",
    paymentAllowed: req.minBidPrice - req.subrogationAmount <= req.subrogationAmount * 0.3,
  };
  const gatePass = gate.offsetPossible && gate.opposableClear && gate.paymentAllowed;

  let path: RecoveryRes["path"];
  if (gatePass && economicGain > 0) path = "셀프낙찰";
  else if (!gate.opposableClear) path = "배당대기";
  else if (economicGain <= 0) path = req.failedBidCount >= 3 ? "협의매입" : "배당대기";
  else path = req.failedBidCount >= 4 ? "캠코공매" : "배당대기";
  if (eAssetization === 0 && eDividend === 0) path = "재산추적";

  const score = Math.max(
    5,
    Math.min(
      98,
      Math.round(
        50 +
          (economicGain / Math.max(1, req.subrogationAmount)) * 60 +
          (gatePass ? 15 : -20) -
          req.failedBidCount * 3,
      ),
    ),
  );

  const res: RecoveryRes = {
    path,
    score,
    eAssetization,
    eDividend,
    economicGain,
    gate,
    scenarios: [
      { name: "낙관", g: 0.1, eAssetization: Math.round(eAssetization * 1.12) },
      { name: "기준", g: 0, eAssetization },
      { name: "비관", g: -0.1, eAssetization: Math.round(eAssetization * 0.85) },
    ],
    reasons: [
      `유찰 ${req.failedBidCount}회 반영 재매각율 ${(resaleRate * 100).toFixed(0)}% 기준, 자산화 기대값은 ${eAssetization.toLocaleString("ko-KR")}원으로 산정되었습니다.`,
      `배당대기 시 최저매각가(${req.minBidPrice.toLocaleString("ko-KR")}원)의 ${(dividendRate * 100).toFixed(0)}% 배당 가정으로 기대 배당액은 ${eDividend.toLocaleString("ko-KR")}원입니다.`,
      gate.opposableClear
        ? "대항력 있는 임차인이 없어 인수 부담 없이 소유권 확보가 가능합니다."
        : "대항력 있는 임차인이 존재하여 낙찰 시 보증금 인수 부담이 발생합니다.",
      gate.offsetPossible
        ? "대위변제채권으로 매수대금 상계가 가능하여 현금 투입이 최소화됩니다."
        : "상계 요건을 충족하지 못해 매수대금 대부분을 현금으로 납부해야 합니다.",
      `경제이득(자산화-배당) ${economicGain.toLocaleString("ko-KR")}원과 게이트 통과 여부를 종합하여 「${PATH_LABEL[path]}」 경로를 권고합니다.`,
    ],
  };
  return HttpResponse.json(res);
});

export const handlers = [
  tenantScore,
  underwriteScore,
  monitorContracts,
  monitorPortfolio,
  recoveryAnalyze,
];
