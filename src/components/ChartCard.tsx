import type { ReactNode } from "react";

interface ChartCardProps {
  title: string;
  description: string;
  children: ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <div className="chart-section">
      <h2>{title}</h2>
      <p className="chart-note">{description}</p>
      <div className="chart-wrapper">{children}</div>
    </div>
  );
}
