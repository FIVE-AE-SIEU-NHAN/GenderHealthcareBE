

export type CycleLogStatus = "NORMAL" | "NEED_ATTENTION" | "NOT_POSITIVE" | null;

export function convertStatusToEnum(
  status: string | undefined
): CycleLogStatus {
  if (!status) return null;
  const normalized = status.trim().toLowerCase();
  if (normalized === "normal") return "NORMAL";
  if (normalized === "need attention") return "NEED_ATTENTION";
  if (normalized === "not positive") return "NOT_POSITIVE";
  // Có thể map thêm tiếng Việt ở đây nếu muốn
  if (normalized === "bình thường") return "NORMAL";
  if (normalized === "cần chú ý") return "NEED_ATTENTION";
  if (normalized === "không tích cực") return "NOT_POSITIVE";
  return null;
}


export function getCycleDay(startDate: string, cycleLength = 28): number {
  const start = new Date(startDate);
  const today = new Date();
  const diffDays = Math.floor((today.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
  return (diffDays % cycleLength) + 1;
}

export function getCyclePhase(day: number): string {
  if (day <= 5) return "menstrual";
  if (day <= 12) return "follicular";
  if (day <= 15) return "ovulation";
  return "luteal";
}

export interface StatusInput {
  mood?: number;
  libido?: number;
  stress?: number;
  sleep_hours?: number;
  energy?: number;
}

export function predictStatus(phase: string, data: StatusInput) {
  const notes: string[] = [];
  let status = "Normal";
  if (data.stress !== undefined && data.sleep_hours !== undefined && data.stress >= 4 && data.sleep_hours < 6) {
    notes.push("High stress and lack of sleep may negatively affect your cycle.");
  }
  if (phase === "ovulation" && data.libido !== undefined && data.libido <= 2) {
    notes.push("Low libido during ovulation may signal a hormone imbalance.");
  }
  if (phase === "luteal" && data.mood !== undefined && data.mood <= 2) {
    notes.push("Poor mood in PMS phase may indicate premenstrual syndrome.");
  }
  if (phase === "follicular" && data.energy !== undefined && data.energy <= 2) {
    notes.push("Low energy during follicular phase, watch your health.");
  }
  if (notes.length >= 2) status = "Not positive";
  else if (notes.length === 1) status = "Need attention";
  return { status, notes };
}
