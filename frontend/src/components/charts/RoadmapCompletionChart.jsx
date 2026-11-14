import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 shadow-soft max-w-[220px]">
      <p className="text-sm font-semibold text-ink mb-0.5 truncate">{label}</p>
      <p className="coord-label text-muted">{payload[0].value}% complete</p>
    </div>
  );
};

/**
 * data: [{ label: string, progress: number }]
 */
const RoadmapCompletionChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={240}>
    <BarChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 6" stroke="var(--c-border)" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fill: "var(--c-muted)", fontSize: 11 }}
        axisLine={{ stroke: "var(--c-border)" }}
        tickLine={false}
        interval={0}
        angle={-15}
        textAnchor="end"
        height={50}
      />
      <YAxis
        domain={[0, 100]}
        tick={{ fill: "var(--c-muted)", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={36}
      />
      <Tooltip content={<CustomTooltip />} cursor={{ fill: "var(--c-surface-2)" }} />
      <Bar dataKey="progress" radius={[6, 6, 0, 0]} maxBarSize={44}>
        {data.map((entry, i) => (
          <Cell key={i} fill={entry.progress >= 70 ? "var(--c-success)" : "var(--c-primary)"} />
        ))}
      </Bar>
    </BarChart>
  </ResponsiveContainer>
);

export default RoadmapCompletionChart;
