"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ExerciseHistoryChartProps {
  data: { date: string; maxWeight: number; volume: number }[];
}

export function ExerciseHistoryChart({ data }: ExerciseHistoryChartProps) {
  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <p className="mb-4 text-sm font-medium text-muted-foreground">
        Peso máximo por sesión
      </p>
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
              tickLine={false}
              axisLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                fontSize: "13px",
              }}
            />
            <Line
              type="monotone"
              dataKey="maxWeight"
              stroke="var(--primary)"
              strokeWidth={2}
              dot={{ fill: "var(--primary)", r: 3 }}
              name="Peso máx (kg)"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
