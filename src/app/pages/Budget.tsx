import React, { useState } from "react";
import { motion } from "motion/react";
import { AlertTriangle, CheckCircle, Edit3 } from "lucide-react";
import { useFinance, ExpenseCategory } from "../context/FinanceContext";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const CATEGORY_EMOJIS: Record<string, string> = {
  Food: "🍔", Shopping: "🛍️", Transport: "🚗", Entertainment: "🎬",
  Bills: "📄", Healthcare: "🏥", Education: "📚", Other: "📌",
};

export function Budget() {
  const { budgets, updateBudget } = useFinance();
  const [editing, setEditing] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");

  const startEdit = (category: string, currentLimit: number) => {
    setEditing(category);
    setEditValue(String(currentLimit));
  };

  const saveEdit = (category: ExpenseCategory) => {
    const val = Number(editValue);
    if (val > 0) updateBudget(category, val);
    setEditing(null);
  };

  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const overCount = budgets.filter((b) => b.spent > b.limit).length;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-foreground">Budget Planner</h1>
        <p className="text-muted-foreground text-sm">Set and track monthly spending limits</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Budget</p>
          <p className="text-card-foreground" style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalBudget)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Spent</p>
          <p className={totalSpent > totalBudget ? "text-red-400" : "text-emerald-400"} style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalSpent)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Over Budget</p>
          <p className={overCount > 0 ? "text-red-400" : "text-emerald-400"} style={{ fontFamily: "var(--font-mono)" }}>{overCount} {overCount === 1 ? "category" : "categories"}</p>
        </div>
      </div>

      {overCount > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20">
          <AlertTriangle size={18} className="text-red-400 flex-shrink-0" />
          <p className="text-red-400 text-sm">You have exceeded the budget in {overCount} {overCount === 1 ? "category" : "categories"} this month. Review and adjust your spending.</p>
        </motion.div>
      )}

      <div className="space-y-3">
        {budgets.map((b, i) => {
          const pct = b.limit > 0 ? Math.min(100, Math.round((b.spent / b.limit) * 100)) : 0;
          const isOver = b.spent > b.limit;
          const isNear = !isOver && pct >= 80;
          const barColor = isOver ? "#ef4444" : isNear ? "#f59e0b" : "#10b981";

          return (
            <motion.div
              key={b.category}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-card border border-border rounded-2xl p-5"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{CATEGORY_EMOJIS[b.category]}</span>
                  <div>
                    <p className="text-card-foreground">{b.category}</p>
                    <p className="text-muted-foreground text-xs">
                      {fmt(b.spent)} / {" "}
                      {editing === b.category ? (
                        <span className="inline-flex items-center gap-1">
                          <input
                            autoFocus
                            type="number"
                            value={editValue}
                            onChange={(e) => setEditValue(e.target.value)}
                            onBlur={() => saveEdit(b.category as ExpenseCategory)}
                            onKeyDown={(e) => e.key === "Enter" && saveEdit(b.category as ExpenseCategory)}
                            className="w-24 px-1.5 py-0.5 rounded-lg bg-input-background border border-border text-card-foreground text-xs focus:outline-none focus:ring-1 focus:ring-primary/50"
                          />
                        </span>
                      ) : (
                        <>{fmt(b.limit)}</>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    isOver ? "bg-red-500/10 text-red-400" :
                    isNear ? "bg-amber-500/10 text-amber-400" :
                    "bg-emerald-500/10 text-emerald-400"
                  }`}>
                    {isOver ? "Over Budget" : isNear ? "Near Limit" : `${pct}% used`}
                  </span>
                  {isOver ? <AlertTriangle size={15} className="text-red-400" /> : <CheckCircle size={15} className="text-emerald-400" />}
                  <button
                    onClick={() => startEdit(b.category, b.limit)}
                    className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-card-foreground transition-colors"
                  >
                    <Edit3 size={13} />
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: i * 0.05 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: barColor }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{fmt(b.limit - b.spent > 0 ? b.limit - b.spent : 0)} remaining</span>
                  <span>{pct}%</span>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
