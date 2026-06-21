import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { Transaction, TransactionType, Category } from "../context/FinanceContext";

const INCOME_CATEGORIES = ["Salary", "Freelance", "Business", "Investments", "Other"];
const EXPENSE_CATEGORIES = ["Food", "Shopping", "Transport", "Entertainment", "Bills", "Healthcare", "Education", "Other"];

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (t: Omit<Transaction, "id">) => void;
  initial?: Transaction | null;
}

const empty = (): Omit<Transaction, "id"> => ({
  title: "",
  amount: 0,
  category: "Salary",
  type: "income",
  date: new Date().toISOString().split("T")[0],
  notes: "",
  isRecurring: false,
});

export function TransactionModal({ open, onClose, onSave, initial }: Props) {
  const [form, setForm] = useState<Omit<Transaction, "id">>(empty());

  useEffect(() => {
    if (initial) {
      const { id: _id, ...rest } = initial;
      setForm(rest);
    } else {
      setForm(empty());
    }
  }, [initial, open]);

  const categories = form.type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  const handleTypeChange = (type: TransactionType) => {
    setForm((f) => ({
      ...f,
      type,
      category: type === "income" ? "Salary" : "Food",
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || form.amount <= 0) return;
    onSave(form);
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 z-10"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-card-foreground">{initial ? "Edit Transaction" : "Add Transaction"}</h2>
              <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-card-foreground">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-2 p-1 bg-muted rounded-xl">
                {(["income", "expense"] as TransactionType[]).map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => handleTypeChange(t)}
                    className={`flex-1 py-2 rounded-lg transition-all capitalize ${
                      form.type === t
                        ? t === "income"
                          ? "bg-emerald-500 text-white shadow-sm"
                          : "bg-red-500 text-white shadow-sm"
                        : "text-muted-foreground hover:text-card-foreground"
                    }`}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Title</label>
                <input
                  className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="Transaction title"
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  required
                />
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Amount (₹)</label>
                <input
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                  placeholder="0"
                  value={form.amount || ""}
                  onChange={(e) => setForm((f) => ({ ...f, amount: Number(e.target.value) }))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Category</label>
                  <select
                    className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={form.category}
                    onChange={(e) => setForm((f) => ({ ...f, category: e.target.value as Category }))}
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-muted-foreground mb-1">Date</label>
                  <input
                    type="date"
                    className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                    value={form.date}
                    onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-muted-foreground mb-1">Notes (optional)</label>
                <textarea
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
                  placeholder="Add a note..."
                  value={form.notes || ""}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="recurring"
                  className="rounded"
                  checked={form.isRecurring || false}
                  onChange={(e) => setForm((f) => ({ ...f, isRecurring: e.target.checked }))}
                />
                <label htmlFor="recurring" className="text-sm text-muted-foreground">Recurring transaction</label>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-2.5 rounded-xl border border-border text-card-foreground hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
                >
                  {initial ? "Update" : "Add Transaction"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
