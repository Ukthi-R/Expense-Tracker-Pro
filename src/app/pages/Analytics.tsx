import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, LineChart, Line, Legend,
} from "recharts";
import { useFinance } from "../context/FinanceContext";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const CATEGORY_COLORS: Record<string, string> = {
  Food: "#10b981",
  Shopping: "#2563eb",
  Transport: "#f59e0b",
  Entertainment: "#8b5cf6",
  Bills: "#ef4444",
  Healthcare: "#06b6d4",
  Education: "#f97316",
  Other: "#64748b",
};

const EXPENSE_CATS = ["Food", "Shopping", "Transport", "Entertainment", "Bills", "Healthcare", "Education", "Other"];

const TOOLTIP_STYLE = {
  contentStyle: {
    backgroundColor: "var(--card)",
    border: "1px solid var(--border)",
    borderRadius: "12px",
    color: "var(--card-foreground)",
    fontSize: "13px",
  },
};

export function Analytics() {
  const { transactions } = useFinance();
  const [activeChart, setActiveChart] = useState<"monthly" | "category" | "heatmap">("monthly");

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const monthKeys = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
    return monthKeys.map((key, i) => {
      const inc = transactions.filter((t) => t.type === "income" && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const exp = transactions.filter((t) => t.type === "expense" && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { month: months[i], income: inc, expense: exp, savings: Math.max(0, inc - exp) };
    });
  }, [transactions]);

  const categoryData = useMemo(() => {
    return EXPENSE_CATS.map((cat) => {
      const total = transactions
        .filter((t) => t.type === "expense" && t.category === cat)
        .reduce((s, t) => s + t.amount, 0);
      return { name: cat, value: total, color: CATEGORY_COLORS[cat] };
    }).filter((d) => d.value > 0);
  }, [transactions]);

  const heatmapData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    transactions.filter((t) => t.type === "expense").forEach((t) => {
      const d = t.date.split("T")[0];
      dayMap[d] = (dayMap[d] || 0) + t.amount;
    });
    const days = [];
    const start = new Date("2026-06-01");
    for (let i = 0; i < 30; i++) {
      const d = new Date(start);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split("T")[0];
      days.push({ date: key, amount: dayMap[key] || 0, day: d.getDate() });
    }
    return days;
  }, [transactions]);

  const maxHeat = Math.max(...heatmapData.map((d) => d.amount), 1);

  const spendingTrend = useMemo(() => {
    return monthlyData.map((d) => ({
      ...d,
      rate: d.income > 0 ? Math.round(((d.income - d.expense) / d.income) * 100) : 0,
    }));
  }, [monthlyData]);

  const totalExpense = categoryData.reduce((s, d) => s + d.value, 0);

  const tabs = [
    { id: "monthly", label: "Monthly Trend" },
    { id: "category", label: "Category Split" },
    { id: "heatmap", label: "Spending Heatmap" },
  ] as const;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-foreground">Analytics</h1>
        <p className="text-muted-foreground text-sm">Deep dive into your financial patterns</p>
      </div>

      {/* Tab selector */}
      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveChart(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${activeChart === tab.id ? "bg-primary text-primary-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeChart === "monthly" && (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-card-foreground mb-4">Monthly Spending Trend</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="month" tick={{ fill: "#8898b0", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "#8898b0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                <Legend />
                <Line type="monotone" dataKey="income" stroke="#10b981" strokeWidth={2.5} dot={{ fill: "#10b981", r: 4 }} />
                <Line type="monotone" dataKey="expense" stroke="#ef4444" strokeWidth={2.5} dot={{ fill: "#ef4444", r: 4 }} />
              </LineChart>
            </ResponsiveContainer>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-card-foreground mb-4">Income vs Expense (Bar)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={monthlyData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#8898b0", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8898b0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                  <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-card-foreground mb-4">Savings Rate (%)</h3>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={spendingTrend}>
                  <defs>
                    <linearGradient id="rateGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                  <XAxis dataKey="month" tick={{ fill: "#8898b0", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#8898b0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `${v}%`} />
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => `${v}%`} />
                  <Area type="monotone" dataKey="rate" stroke="#2563eb" strokeWidth={2} fill="url(#rateGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </motion.div>
          </div>
        </div>
      )}

      {activeChart === "category" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-card-foreground mb-4">Spending by Category</h3>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={categoryData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card border border-border rounded-2xl p-5">
              <h3 className="text-card-foreground mb-4">Category Breakdown</h3>
              <div className="space-y-3">
                {categoryData.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.color }} />
                        <span className="text-card-foreground">{cat.name}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-muted-foreground text-xs">{Math.round((cat.value / totalExpense) * 100)}%</span>
                        <span className="text-card-foreground" style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}>{fmt(cat.value)}</span>
                      </div>
                    </div>
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${(cat.value / totalExpense) * 100}%` }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="h-full rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-border rounded-2xl p-5">
            <h3 className="text-card-foreground mb-4">Category Comparison (Bar)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={categoryData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#8898b0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#8898b0", fontSize: 12 }} axisLine={false} tickLine={false} width={80} />
                <Tooltip {...TOOLTIP_STYLE} formatter={(v: number) => fmt(v)} />
                <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                  {categoryData.map((entry, index) => (
                    <Cell key={index} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>
      )}

      {activeChart === "heatmap" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
          <h3 className="text-card-foreground mb-2">June 2026 Spending Heatmap</h3>
          <p className="text-muted-foreground text-sm mb-6">Daily spending activity — darker = higher spend</p>
          <div className="grid grid-cols-7 gap-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
              <div key={d} className="text-center text-xs text-muted-foreground pb-1">{d}</div>
            ))}
            {Array.from({ length: 0 }).map((_, i) => <div key={`pad-${i}`} />)}
            {heatmapData.map((d) => {
              const intensity = d.amount / maxHeat;
              const opacity = d.amount > 0 ? Math.max(0.15, intensity) : 0.05;
              return (
                <div
                  key={d.date}
                  className="aspect-square rounded-lg flex items-center justify-center text-xs relative group cursor-default"
                  style={{ backgroundColor: `rgba(16, 185, 129, ${opacity})` }}
                >
                  <span className="text-card-foreground text-xs">{d.day}</span>
                  {d.amount > 0 && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 rounded-lg bg-card border border-border text-xs text-card-foreground whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 shadow-lg">
                      {fmt(d.amount)}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-4">
            <span className="text-xs text-muted-foreground">Less</span>
            {[0.05, 0.2, 0.4, 0.6, 0.8, 1].map((o) => (
              <div key={o} className="w-4 h-4 rounded" style={{ backgroundColor: `rgba(16, 185, 129, ${o})` }} />
            ))}
            <span className="text-xs text-muted-foreground">More</span>
          </div>
        </motion.div>
      )}
    </div>
  );
}
