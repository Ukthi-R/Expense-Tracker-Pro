import React, { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Brain, Lightbulb, TrendingUp, AlertCircle, Target, Sparkles, ChevronRight } from "lucide-react";
import { useFinance } from "../context/FinanceContext";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

function CircularProgress({ value, size = 120, strokeWidth = 10 }: { value: number; size?: number; strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 75 ? "#10b981" : value >= 50 ? "#f59e0b" : value >= 25 ? "#f97316" : "#ef4444";
  const label = value >= 75 ? "Excellent" : value >= 50 ? "Good" : value >= 25 ? "Fair" : "Poor";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="rotate-[-90deg]">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth={strokeWidth} />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      <div className="absolute text-center">
        <div className="text-card-foreground" style={{ fontSize: "22px", fontFamily: "var(--font-mono)", fontWeight: 600 }}>{value}</div>
        <div className="text-muted-foreground text-xs">{label}</div>
      </div>
    </div>
  );
}

export function AIAdvisor() {
  const { transactions, budgets, savingsGoals, healthScore, totalIncome, totalExpenses } = useFinance();
  const [activeTab, setActiveTab] = useState<"overview" | "tips" | "predict">("overview");

  const currentMonth = transactions.filter((t) => t.date.startsWith("2026-06"));
  const monthIncome = currentMonth.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const monthExpense = currentMonth.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  const savingsRate = monthIncome > 0 ? Math.round(((monthIncome - monthExpense) / monthIncome) * 100) : 0;
  const expenseRatio = monthIncome > 0 ? Math.round((monthExpense / monthIncome) * 100) : 0;
  const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length;
  const completedGoals = savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length;

  const scoreBreakdown = [
    { label: "Savings Rate", score: Math.min(100, savingsRate * 2), weight: "40%", desc: `${savingsRate}% of income saved` },
    { label: "Expense Control", score: Math.max(0, 100 - expenseRatio), weight: "30%", desc: `Spending ${expenseRatio}% of income` },
    { label: "Budget Compliance", score: Math.max(0, 100 - (overBudgetCount / Math.max(1, budgets.length)) * 100), weight: "30%", desc: `${overBudgetCount} categories over limit` },
  ];

  const insights = useMemo(() => {
    const tips = [];

    const foodExp = currentMonth.filter((t) => t.category === "Food" && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const transportExp = currentMonth.filter((t) => t.category === "Transport" && t.type === "expense").reduce((s, t) => s + t.amount, 0);
    const entertainmentExp = currentMonth.filter((t) => t.category === "Entertainment" && t.type === "expense").reduce((s, t) => s + t.amount, 0);

    if (foodExp > 5000) {
      tips.push({
        type: "warning" as const,
        icon: "🍔",
        title: "High Food Spending",
        text: `You spent ${fmt(foodExp)} on food this month. Cooking at home instead of ordering out could save ${fmt(Math.round(foodExp * 0.3))} per month, or ${fmt(Math.round(foodExp * 0.3 * 12))} annually.`,
        saving: Math.round(foodExp * 0.3),
      });
    }

    if (savingsRate < 20) {
      tips.push({
        type: "info" as const,
        icon: "📊",
        title: "Boost Your Savings Rate",
        text: `Your current savings rate is ${savingsRate}%. Financial experts recommend saving at least 20% of income. Increasing by just 5% would add ${fmt(Math.round(monthIncome * 0.05))} to your savings every month.`,
        saving: Math.round(monthIncome * 0.05),
      });
    }

    if (entertainmentExp > 2000) {
      tips.push({
        type: "info" as const,
        icon: "🎬",
        title: "Entertainment Budget",
        text: `Entertainment costs ${fmt(entertainmentExp)} this month. Consider reviewing subscription services — cutting one could save ${fmt(650)} monthly (${fmt(7800)} annually).`,
        saving: 650,
      });
    }

    tips.push({
      type: "success" as const,
      icon: "📈",
      title: "Investment Opportunity",
      text: `With a surplus of ${fmt(Math.max(0, monthIncome - monthExpense))}, consider putting 50% into an index fund. Over 10 years at 12% returns, that could grow to ${fmt(Math.round(Math.max(0, monthIncome - monthExpense) * 0.5 * 12 * 1.12 ** 10))}!`,
      saving: 0,
    });

    if (overBudgetCount > 0) {
      tips.push({
        type: "warning" as const,
        icon: "⚠️",
        title: "Budget Overruns Detected",
        text: `You've exceeded your budget in ${overBudgetCount} ${overBudgetCount === 1 ? "category" : "categories"}. Review and tighten spending in those areas to stay on track.`,
        saving: 0,
      });
    }

    return tips;
  }, [currentMonth, savingsRate, monthIncome, monthExpense, overBudgetCount]);

  const predictions = useMemo(() => {
    const categories = ["Food", "Shopping", "Transport", "Bills", "Entertainment"];
    return categories.map((cat) => {
      const prevMonth = transactions.filter((t) => t.type === "expense" && t.category === cat && t.date.startsWith("2026-05")).reduce((s, t) => s + t.amount, 0);
      const currMonth = currentMonth.filter((t) => t.type === "expense" && t.category === cat).reduce((s, t) => s + t.amount, 0);
      const growth = prevMonth > 0 ? Math.round(((currMonth - prevMonth) / prevMonth) * 100) : 0;
      const predicted = currMonth > 0 ? Math.round(currMonth * 1.05) : prevMonth;
      return { category: cat, current: currMonth, predicted, growth };
    });
  }, [transactions, currentMonth]);

  const tabs = [
    { id: "overview", label: "Health Score" },
    { id: "tips", label: "AI Tips" },
    { id: "predict", label: "Predictions" },
  ] as const;

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-violet-500/20 text-violet-400">
          <Brain size={20} />
        </div>
        <div>
          <h1 className="text-foreground">AI Financial Advisor</h1>
          <p className="text-muted-foreground text-sm">Personalized insights powered by your data</p>
        </div>
      </div>

      <div className="flex gap-1 p-1 bg-card border border-border rounded-xl w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm transition-all ${activeTab === tab.id ? "bg-violet-500 text-white shadow-sm" : "text-muted-foreground hover:text-card-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "overview" && (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-6">
            <h3 className="text-card-foreground mb-6">Financial Health Score</h3>
            <div className="flex flex-col sm:flex-row items-center gap-8">
              <div className="flex-shrink-0">
                <CircularProgress value={healthScore} size={140} strokeWidth={12} />
              </div>
              <div className="flex-1 space-y-4 w-full">
                {scoreBreakdown.map((item, i) => {
                  const color = item.score >= 75 ? "#10b981" : item.score >= 50 ? "#f59e0b" : "#ef4444";
                  return (
                    <div key={i} className="space-y-1.5">
                      <div className="flex justify-between text-sm">
                        <span className="text-card-foreground">{item.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-muted-foreground text-xs">{item.desc}</span>
                          <span style={{ color, fontFamily: "var(--font-mono)" }} className="text-xs">{Math.round(item.score)}</span>
                        </div>
                      </div>
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${item.score}%` }}
                          transition={{ duration: 1, ease: "easeOut", delay: i * 0.2 }}
                          className="h-full rounded-full"
                          style={{ backgroundColor: color }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">Weight: {item.weight}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: "Savings Rate", value: `${savingsRate}%`, color: savingsRate >= 20 ? "text-emerald-400" : "text-amber-400" },
              { label: "Expense Ratio", value: `${expenseRatio}%`, color: expenseRatio <= 70 ? "text-emerald-400" : "text-red-400" },
              { label: "Budget Compliance", value: `${budgets.length - overBudgetCount}/${budgets.length}`, color: overBudgetCount === 0 ? "text-emerald-400" : "text-amber-400" },
              { label: "Goals Achieved", value: `${completedGoals}/${savingsGoals.length}`, color: "text-violet-400" },
            ].map((m) => (
              <div key={m.label} className="bg-card border border-border rounded-xl p-4 text-center">
                <p className={`text-xl ${m.color}`} style={{ fontFamily: "var(--font-mono)" }}>{m.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{m.label}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === "tips" && (
        <div className="space-y-3">
          {insights.map((ins, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className={`bg-card border rounded-2xl p-5 ${
                ins.type === "warning" ? "border-amber-500/20" :
                ins.type === "success" ? "border-emerald-500/20" :
                "border-border"
              }`}
            >
              <div className="flex items-start gap-4">
                <span className="text-3xl flex-shrink-0">{ins.icon}</span>
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-card-foreground text-sm">{ins.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      ins.type === "warning" ? "bg-amber-500/10 text-amber-400" :
                      ins.type === "success" ? "bg-emerald-500/10 text-emerald-400" :
                      "bg-blue-500/10 text-blue-400"
                    }`}>
                      {ins.type === "warning" ? "Action Needed" : ins.type === "success" ? "Opportunity" : "Insight"}
                    </span>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">{ins.text}</p>
                  {ins.saving > 0 && (
                    <div className="mt-3 flex items-center gap-2 text-sm text-emerald-400">
                      <TrendingUp size={14} />
                      Potential savings: {fmt(ins.saving)}/month
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === "predict" && (
        <div className="space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border border-border rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sparkles size={16} className="text-violet-400" />
              <h3 className="text-card-foreground">Expense Predictions for July</h3>
            </div>
            <p className="text-muted-foreground text-sm mb-5">Based on your spending patterns, here's what to expect next month:</p>
            <div className="space-y-3">
              {predictions.map((p, i) => (
                <motion.div
                  key={p.category}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.08 }}
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <ChevronRight size={14} className="text-muted-foreground" />
                    <div>
                      <p className="text-card-foreground text-sm">{p.category}</p>
                      <p className="text-muted-foreground text-xs">Current: {fmt(p.current)}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-card-foreground text-sm" style={{ fontFamily: "var(--font-mono)" }}>{fmt(p.predicted)}</p>
                    <p className={`text-xs ${p.growth > 5 ? "text-red-400" : p.growth < 0 ? "text-emerald-400" : "text-muted-foreground"}`}>
                      {p.growth > 0 ? "+" : ""}{p.growth}% vs last month
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-card border border-emerald-500/20 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <Target size={16} className="text-emerald-400" />
              <h3 className="text-card-foreground">Budget Recommendation</h3>
            </div>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>Based on your 3-month average spending pattern:</p>
              <ul className="space-y-1 mt-2 pl-4">
                <li>• Allocate <span className="text-emerald-400">30%</span> of income to essential needs</li>
                <li>• Limit discretionary spending to <span className="text-amber-400">20%</span></li>
                <li>• Save at least <span className="text-blue-400">20%</span> each month</li>
                <li>• Keep <span className="text-violet-400">30%</span> for bills and investments</li>
              </ul>
              <div className="mt-3 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                <p className="text-emerald-400">Your ideal monthly budget: {fmt(Math.round(monthIncome * 0.8))}</p>
                <p className="text-muted-foreground text-xs mt-1">Leave {fmt(Math.round(monthIncome * 0.2))} for savings and emergencies</p>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
