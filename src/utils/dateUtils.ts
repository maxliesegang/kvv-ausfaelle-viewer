export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

export interface DatePreset {
  from: string;
  to: string;
}

export interface DatePresets {
  last7: DatePreset;
  last30: DatePreset;
  thisMonth: DatePreset;
  lastMonth: DatePreset;
  thisYear: DatePreset;
  all: DatePreset;
}

export function getDatePresets(): DatePresets {
  const today = new Date();
  const last7Days = new Date(today);
  last7Days.setDate(today.getDate() - 7);
  const last30Days = new Date(today);
  last30Days.setDate(today.getDate() - 30);
  const thisMonthStart = new Date(today.getFullYear(), today.getMonth(), 1);
  const lastMonthStart = new Date(today.getFullYear(), today.getMonth() - 1, 1);
  const lastMonthEnd = new Date(today.getFullYear(), today.getMonth(), 0);
  const thisYearStart = new Date(today.getFullYear(), 0, 1);

  return {
    last7: { from: formatDate(last7Days), to: formatDate(today) },
    last30: { from: formatDate(last30Days), to: formatDate(today) },
    thisMonth: { from: formatDate(thisMonthStart), to: formatDate(today) },
    lastMonth: { from: formatDate(lastMonthStart), to: formatDate(lastMonthEnd) },
    thisYear: { from: formatDate(thisYearStart), to: formatDate(today) },
    all: { from: "", to: "" },
  };
}

export function getTimeOfDayCategory(time?: string): string {
  if (!time) return "unknown";
  const hour = parseInt(time.split(":")[0], 10);
  if (hour >= 5 && hour < 9) return "morning"; // 05:00-08:59
  if (hour >= 9 && hour < 12) return "late-morning"; // 09:00-11:59
  if (hour >= 12 && hour < 17) return "afternoon"; // 12:00-16:59
  if (hour >= 17 && hour < 20) return "evening"; // 17:00-19:59
  if (hour >= 20 || hour < 5) return "night"; // 20:00-04:59
  return "unknown";
}
