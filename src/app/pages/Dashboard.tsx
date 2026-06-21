import React, { useMemo } from "react";
import { motion } from "motion/react";
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank,
  ArrowUpRight, ArrowDownRight, Sparkles, Zap,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar,
} from "recharts";
import { useFinance } from "../context/FinanceContext";

const fmt = (n: number) =>
  "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

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

const cardVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { delay: i * 0.08, type: "spring", damping: 25, stiffness: 250 },
  }),
};

export function Dashboard() {
  const { transactions, totalIncome, totalExpenses, totalSavings, currentBalance, healthScore } = useFinance();

  const monthlyData = useMemo(() => {
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun"];
    const monthKeys = ["2026-01", "2026-02", "2026-03", "2026-04", "2026-05", "2026-06"];
    return monthKeys.map((key, i) => {
      const inc = transactions.filter((t) => t.type === "income" && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      const exp = transactions.filter((t) => t.type === "expense" && t.date.startsWith(key)).reduce((s, t) => s + t.amount, 0);
      return { month: months[i], income: inc, expense: exp, savings: inc - exp };
    });
  }, [transactions]);

  const recentTransactions = useMemo(
    () => [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 6),
    [transactions]
  );

  const currentMonth = transactions.filter((t) => t.date.startsWith("2026-06"));
  const monthIncome = currentMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = currentMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;

  const insights = useMemo(() => {
    const tips = [];
    if (savingsRate >= 20) tips.push({ icon: "🎯", text: `You are saving ${savingsRate}% of your income this month. Excellent!` });
    else if (savingsRate > 0) tips.push({ icon: "💡", text: `You are saving ${savingsRate}% this month. Try to reach 20% for financial stability.` });
    const foodExp = currentMonth.filter((t) => t.category === "Food" && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    if (foodExp > 4000) tips.push({ icon: "🍽️", text: `You spent ${fmt(foodExp)} on food this month. Reducing by 10% could save ${fmt(Math.round(foodExp * 0.1 * 12))} annually.` });
    if (tips.length < 2) tips.push({ icon: "📈", text: "Consider investing your surplus income to grow your wealth over time." });
    return tips.slice(0, 3);
  }, [currentMonth, savingsRate]);

  const summaryCards = [
    {
      label: "Total Income",
      value: fmt(monthIncome),
      total: fmt(totalIncome),
      icon: TrendingUp,
      color: "emerald",
      bg: "from-emerald-500/20 to-emerald-500/5",
      iconBg: "bg-emerald-500/20 text-emerald-400",
      trend: "+12%",
      positive: true,
    },
    {
      label: "Total Expenses",
      value: fmt(monthExpense),
      total: fmt(totalExpenses),
      icon: TrendingDown,
      color: "red",
      bg: "from-red-500/20 to-red-500/5",
      iconBg: "bg-red-500/20 text-red-400",
      trend: "-5%",
      positive: false,
    },
    {
      label: "Net Savings",
      value: fmt(monthIncome - monthExpense),
      total: fmt(totalSavings),
      icon: PiggyBank,
      color: "blue",
      bg: "from-blue-500/20 to-blue-500/5",
      iconBg: "bg-blue-500/20 text-blue-400",
      trend: `${savingsRate}%`,
      positive: savingsRate >= 0,
    },
    {
      label: "Current Balance",
      value: fmt(currentBalance),
      total: "All time",
      icon: Wallet,
      color: "violet",
      bg: "from-violet-500/20 to-violet-500/5",
      iconBg: "bg-violet-500/20 text-violet-400",
      trend: currentBalance >= 0 ? "Healthy" : "Deficit",
      positive: currentBalance >= 0,
    },
  ];

  const healthColor =
    healthScore >= 75 ? "text-emerald-400" :
    healthScore >= 50 ? "text-amber-400" : "text-red-400";

  const healthLabel =
    healthScore >= 75 ? "Excellent" :
    healthScore >= 50 ? "Good" :
    healthScore >= 25 ? "Fair" : "Poor";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Financial Overview</h1>
          <p className="text-muted-foreground text-sm mt-0.5">June 2026 • Your financial snapshot</p>
        </div>
        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-card border border-border">
          <div className={`text-2xl ${healthColor}`} style={{ fontFamily: "var(--font-mono)" }}>{healthScore}</div>
          <div>
            <p className="text-xs text-muted-foreground">Health Score</p>
            <p className={`text-xs ${healthColor}`}>{healthLabel}</p>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {summaryCards.map((card, i) => (
          <motion.div
            key={card.label}
            custom={i}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
            className={`bg-card border border-border rounded-2xl p-5 relative overflow-hidden cursor-default`}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${card.bg} opacity-60`} />
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={`p-2 rounded-xl ${card.iconBg}`}>
                  <card.icon size={18} />
                </div>
                <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${card.positive ? "bg-emerald-500/10 text-emerald-400" : "bg-red-500/10 text-red-400"}`}>
                  {card.positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                  {card.trend}
                </span>
              </div>
              <p className="text-muted-foreground text-xs mb-1">{card.label}</p>
              <p className="text-card-foreground text-xl" style={{ fontFamily: "var(--font-mono)" }}>{card.value}</p>
              <p className="text-muted-foreground text-xs mt-1">All time: {card.total}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Monthly trend chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="lg:col-span-2 bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-card-foreground">Income vs Expenses</h3>
            <span className="text-xs text-muted-foreground px-2 py-1 rounded-lg bg-muted">2026</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="month" tick={{ fill: "#8898b0", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#8898b0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
              <Tooltip
                contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--card-foreground)" }}
                formatter={(v: number) => fmt(v)}
              />
              <Bar dataKey="income" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="expense" fill="#ef4444" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Smart insights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-card border border-border rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded-lg bg-violet-500/20 text-violet-400">
              <Sparkles size={16} />
            </div>
            <h3 className="text-card-foreground">Smart Insights</h3>
          </div>
          <div className="space-y-3">
            {insights.map((ins, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-xl bg-muted/50">
                <span className="text-xl flex-shrink-0">{ins.icon}</span>
                <p className="text-sm text-muted-foreground leading-relaxed">{ins.text}</p>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Savings trend */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400">
            <Zap size={16} />
          </div>
          <h3 className="text-card-foreground">Savings Growth</h3>
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={monthlyData}>
            <defs>
              <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
            <XAxis dataKey="month" tick={{ fill: "#8898b0", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#8898b0", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip contentStyle={{ backgroundColor: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", color: "var(--card-foreground)" }} formatter={(v: number) => fmt(v)} />
            <Area type="monotone" dataKey="savings" stroke="#10b981" strokeWidth={2} fill="url(#savingsGrad)" />
          </AreaChart>
        </ResponsiveContainer>
      </motion.div>

      {/* Recent transactions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-card border border-border rounded-2xl p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-card-foreground">Recent Transactions</h3>
          <span className="text-xs text-muted-foreground">{transactions.length} total</span>
        </div>
        <div className="space-y-2">
          {recentTransactions.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-base flex-shrink-0"
                  style={{ backgroundColor: (CATEGORY_COLORS[t.category] || "#64748b") + "22" }}
                >
                  {t.type === "income" ? "💰" : getCategoryEmoji(t.category)}
                </div>
                <div>
                  <p className="text-card-foreground text-sm">{t.title}</p>
                  <p className="text-muted-foreground text-xs">{t.category} • {formatDate(t.date)}</p>
                </div>
              </div>
              <span className={`text-sm ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: "var(--font-mono)" }}>
                {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

function getCategoryEmoji(cat: string) {
  const map: Record<string, string> = {
    Food: "🍔", Shopping: "🛍️", Transport: "🚗", Entertainment: "🎬",
    Bills: "📄", Healthcare: "🏥", Education: "📚", Other: "📌",
  };
  return map[cat] || "💳";
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
