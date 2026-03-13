interface StatsBarProps {
  total: number;
  pending: number;
  sent: number;
}

export function StatsBar({ total, pending, sent }: StatsBarProps) {
  return (
    <div className="grid grid-cols-3 gap-4">
      {[
        { label: "Total Leads", value: total, color: "text-foreground" },
        {
          label: "Pending Review",
          value: pending,
          color: "text-yellow-600 dark:text-yellow-400",
        },
        {
          label: "Responses Sent",
          value: sent,
          color: "text-green-600 dark:text-green-400",
        },
      ].map(({ label, value, color }) => (
        <div
          key={label}
          className="rounded-lg border bg-card p-4 text-card-foreground"
        >
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
        </div>
      ))}
    </div>
  );
}
