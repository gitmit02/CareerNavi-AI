import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-2 shadow-soft">
      <p className="coord-label text-muted mb-0.5">{label}</p>
      <p className="text-sm font-semibold text-ink">{payload[0].value}% complete</p>
    </div>
  );
};

/**
 * data: [{ label: string, progress: number }]
 */
const ProgressLineChart = ({ data = [] }) => (
  <ResponsiveContainer width="100%" height={240}>
    <LineChart data={data} margin={{ top: 8, right: 8, left: -20, bottom: 0 }}>
      <CartesianGrid strokeDasharray="3 6" stroke="var(--c-border)" vertical={false} />
      <XAxis
        dataKey="label"
        tick={{ fill: "var(--c-muted)", fontSize: 11 }}
        axisLine={{ stroke: "var(--c-border)" }}
        tickLine={false}
      />
      <YAxis
        domain={[0, 100]}
        tick={{ fill: "var(--c-muted)", fontSize: 11 }}
        axisLine={false}
        tickLine={false}
        width={36}
      />
      <Tooltip content={<CustomTooltip />} />
      <Line
        type="monotone"
        dataKey="progress"
        stroke="var(--c-primary)"
        strokeWidth={2.5}
        dot={{ r: 4, fill: "var(--c-primary)" }}
        activeDot={{ r: 6 }}
      />
    </LineChart>
  </ResponsiveContainer>
);

export default ProgressLineChart;
