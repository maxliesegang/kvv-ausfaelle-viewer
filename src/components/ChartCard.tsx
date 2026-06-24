import type { ReactNode } from "react";
import { KernCard, KernText } from "@kern-ux-annex/kern-react-kit";

interface ChartCardProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function ChartCard({ title, description, children }: ChartCardProps) {
  return (
    <KernCard title={title}>
      {description && (
        <KernText type="body" size="small" muted>
          {description}
        </KernText>
      )}
      <div className="chart-wrapper">{children}</div>
    </KernCard>
  );
}
