import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Plus, Trash2, X, Target } from "lucide-react";
import { useFinance, SavingsGoal } from "../context/FinanceContext";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });

const ICONS = ["💻", "✈️", "🛡️", "📱", "🏠", "🚗", "📚", "💎", "🎓", "🏋️", "🌏", "🎸"];

export function Goals() {
  const { savingsGoals, addSavingsGoal, updateSavingsGoal, deleteSavingsGoal } = useFinance();
  const [modalOpen, setModalOpen] = useState(false);
  const [addFundsGoal, setAddFundsGoal] = useState<SavingsGoal | null>(null);
  const [fundsAmount, setFundsAmount] = useState("");
  const [form, setForm] = useState({ title: "", targetAmount: "", currentAmount: "", deadline: "", icon: "🎯" });
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    addSavingsGoal({
      title: form.title,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      deadline: form.deadline,
      icon: form.icon,
    });
    setForm({ title: "", targetAmount: "", currentAmount: "", deadline: "", icon: "🎯" });
    setModalOpen(false);
  };

  const handleAddFunds = () => {
    if (!addFundsGoal || !fundsAmount) return;
    const newAmount = Math.min(
      addFundsGoal.currentAmount + Number(fundsAmount),
      addFundsGoal.targetAmount
    );
    updateSavingsGoal({ ...addFundsGoal, currentAmount: newAmount });
    setAddFundsGoal(null);
    setFundsAmount("");
  };

  const totalTarget = savingsGoals.reduce((s, g) => s + g.targetAmount, 0);
  const totalSaved = savingsGoals.reduce((s, g) => s + g.currentAmount, 0);
  const completedGoals = savingsGoals.filter((g) => g.currentAmount >= g.targetAmount).length;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Savings Goals</h1>
          <p className="text-muted-foreground text-sm">{completedGoals} of {savingsGoals.length} goals achieved</p>
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">New Goal</span>
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Target</p>
          <p className="text-card-foreground text-sm" style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalTarget)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Total Saved</p>
          <p className="text-emerald-400 text-sm" style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalSaved)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-1">Completed</p>
          <p className="text-violet-400 text-sm" style={{ fontFamily: "var(--font-mono)" }}>{completedGoals} goals</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {savingsGoals.map((g, i) => {
          const pct = g.targetAmount > 0 ? Math.round((g.currentAmount / g.targetAmount) * 100) : 0;
          const completed = g.currentAmount >= g.targetAmount;
          const daysLeft = Math.max(0, Math.ceil((new Date(g.deadline).getTime() - Date.now()) / 86400000));

          return (
            <motion.div
              key={g.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
              whileHover={{ scale: 1.01 }}
              className={`bg-card border rounded-2xl p-5 relative ${completed ? "border-emerald-500/30" : "border-border"}`}
            >
              {completed && (
                <div className="absolute top-4 right-4 text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-400">
                  ✓ Achieved!
                </div>
              )}
              <div className="flex items-start gap-3 mb-4">
                <span className="text-3xl">{g.icon}</span>
                <div className="flex-1 min-w-0">
                  <h3 className="text-card-foreground">{g.title}</h3>
                  <p className="text-muted-foreground text-xs">
                    {daysLeft > 0 ? `${daysLeft} days remaining` : "Deadline passed"} • {new Date(g.deadline).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-emerald-400" style={{ fontFamily: "var(--font-mono)" }}>{fmt(g.currentAmount)}</span>
                  <span className="text-muted-foreground" style={{ fontFamily: "var(--font-mono)" }}>{fmt(g.targetAmount)}</span>
                </div>
                <div className="h-3 bg-muted rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 1, ease: "easeOut", delay: i * 0.08 + 0.2 }}
                    className="h-full rounded-full"
                    style={{ background: completed ? "linear-gradient(90deg, #10b981, #059669)" : "linear-gradient(90deg, #2563eb, #10b981)" }}
                  />
                </div>
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{pct}% completed</span>
                  <span>{fmt(g.targetAmount - g.currentAmount)} to go</span>
                </div>
              </div>

              <div className="flex gap-2">
                {!completed && (
                  <button
                    onClick={() => { setAddFundsGoal(g); setFundsAmount(""); }}
                    className="flex-1 py-2 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors text-sm"
                  >
                    + Add Funds
                  </button>
                )}
                <button
                  onClick={() => setConfirmDelete(g.id)}
                  className="px-3 py-2 rounded-xl hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </motion.div>
          );
        })}

        {savingsGoals.length === 0 && (
          <div className="md:col-span-2 flex flex-col items-center justify-center py-16 bg-card border border-border rounded-2xl">
            <Target size={40} className="text-muted-foreground mb-3" />
            <p className="text-card-foreground">No savings goals yet</p>
            <p className="text-muted-foreground text-sm mt-1">Create your first goal to start tracking</p>
          </div>
        )}
      </div>

      {/* Create goal modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="relative bg-card border border-border rounded-2xl p-6 max-w-md w-full z-10 shadow-2xl">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-card-foreground">New Savings Goal</h2>
                <button onClick={() => setModalOpen(false)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"><X size={18} /></button>
              </div>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Goal Title</label>
                  <input required className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Buy a Laptop" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Target (₹)</label>
                    <input required type="number" min="1" className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="80000" value={form.targetAmount} onChange={(e) => setForm((f) => ({ ...f, targetAmount: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-sm text-muted-foreground mb-1">Saved so far (₹)</label>
                    <input type="number" min="0" className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" placeholder="0" value={form.currentAmount} onChange={(e) => setForm((f) => ({ ...f, currentAmount: e.target.value }))} />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Deadline</label>
                  <input required type="date" className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50" value={form.deadline} onChange={(e) => setForm((f) => ({ ...f, deadline: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-2">Pick an Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map((icon) => (
                      <button key={icon} type="button" onClick={() => setForm((f) => ({ ...f, icon }))} className={`text-2xl p-2 rounded-xl transition-colors ${form.icon === icon ? "bg-primary/20 ring-2 ring-primary" : "hover:bg-muted"}`}>{icon}</button>
                    ))}
                  </div>
                </div>
                <div className="flex gap-3 pt-1">
                  <button type="button" onClick={() => setModalOpen(false)} className="flex-1 py-2.5 rounded-xl border border-border text-card-foreground hover:bg-muted transition-colors">Cancel</button>
                  <button type="submit" className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity">Create Goal</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add funds modal */}
      <AnimatePresence>
        {addFundsGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setAddFundsGoal(null)} />
            <motion.div initial={{ scale: 0.92, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.92, opacity: 0 }} className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full z-10 shadow-2xl">
              <div className="text-center mb-4">
                <span className="text-4xl">{addFundsGoal.icon}</span>
                <h3 className="text-card-foreground mt-2">{addFundsGoal.title}</h3>
                <p className="text-muted-foreground text-sm">{fmt(addFundsGoal.currentAmount)} / {fmt(addFundsGoal.targetAmount)}</p>
              </div>
              <div className="mb-5">
                <label className="block text-sm text-muted-foreground mb-1">Amount to Add (₹)</label>
                <input
                  autoFocus
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Enter amount"
                  value={fundsAmount}
                  onChange={(e) => setFundsAmount(e.target.value)}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setAddFundsGoal(null)} className="flex-1 py-2.5 rounded-xl border border-border text-card-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={handleAddFunds} disabled={!fundsAmount} className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-40 transition-opacity">Add Funds</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/60" onClick={() => setConfirmDelete(null)} />
            <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} exit={{ scale: 0.9 }} className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full z-10 shadow-2xl">
              <div className="text-3xl text-center mb-3">🗑️</div>
              <h3 className="text-center text-card-foreground mb-2">Delete Goal?</h3>
              <p className="text-center text-muted-foreground text-sm mb-5">This will permanently delete the goal.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-border text-card-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => { deleteSavingsGoal(confirmDelete); setConfirmDelete(null); }} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
