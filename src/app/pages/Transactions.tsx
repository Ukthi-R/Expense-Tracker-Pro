import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Search, Plus, Pencil, Trash2, Filter, ChevronDown, RefreshCw } from "lucide-react";
import { useFinance, Transaction } from "../context/FinanceContext";
import { TransactionModal } from "../components/TransactionModal";

const fmt = (n: number) => "₹" + n.toLocaleString("en-IN", { maximumFractionDigits: 0 });
const ALL_CATEGORIES = ["All", "Salary", "Freelance", "Business", "Investments", "Food", "Shopping", "Transport", "Entertainment", "Bills", "Healthcare", "Education", "Other"];

function getCategoryEmoji(cat: string) {
  const map: Record<string, string> = {
    Salary: "💼", Freelance: "🎯", Business: "🏢", Investments: "📊",
    Food: "🍔", Shopping: "🛍️", Transport: "🚗", Entertainment: "🎬",
    Bills: "📄", Healthcare: "🏥", Education: "📚", Other: "📌",
  };
  return map[cat] || "💳";
}

export function Transactions() {
  const { transactions, addTransaction, updateTransaction, deleteTransaction } = useFinance();
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
  const [filterCategory, setFilterCategory] = useState("All");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return transactions
      .filter((t) => {
        const q = search.toLowerCase();
        const matchSearch = !q || t.title.toLowerCase().includes(q) || t.category.toLowerCase().includes(q) || String(t.amount).includes(q);
        const matchType = filterType === "all" || t.type === filterType;
        const matchCat = filterCategory === "All" || t.category === filterCategory;
        return matchSearch && matchType && matchCat;
      })
      .sort((a, b) => {
        if (sortBy === "date") return b.date.localeCompare(a.date);
        return b.amount - a.amount;
      });
  }, [transactions, search, filterType, filterCategory, sortBy]);

  const handleEdit = (t: Transaction) => {
    setEditing(t);
    setModalOpen(true);
  };

  const handleSave = (data: Omit<Transaction, "id">) => {
    if (editing) {
      updateTransaction({ ...data, id: editing.id });
      setEditing(null);
    } else {
      addTransaction(data);
    }
  };

  const handleDelete = (id: string) => {
    deleteTransaction(id);
    setConfirmDelete(null);
  };

  const totalIncome = filtered.filter((t) => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = filtered.filter((t) => t.type === "expense").reduce((s, t) => s + t.amount, 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-foreground">Transactions</h1>
          <p className="text-muted-foreground text-sm">{filtered.length} records found</p>
        </div>
        <button
          onClick={() => { setEditing(null); setModalOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:opacity-90 transition-opacity shadow-sm"
        >
          <Plus size={16} />
          <span className="hidden sm:inline">Add Transaction</span>
        </button>
      </div>

      {/* Summary strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-emerald-400 text-sm mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalIncome)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="text-red-400 text-sm mt-0.5" style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalExpense)}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-3 text-center">
          <p className="text-xs text-muted-foreground">Net</p>
          <p className={`text-sm mt-0.5 ${totalIncome - totalExpense >= 0 ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: "var(--font-mono)" }}>{fmt(totalIncome - totalExpense)}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-4 space-y-3">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-input-background border border-border text-card-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
              placeholder="Search transactions..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button
            onClick={() => setShowFilters((f) => !f)}
            className={`px-3 py-2 rounded-xl border border-border flex items-center gap-1.5 text-sm transition-colors ${showFilters ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-card-foreground"}`}
          >
            <Filter size={15} />
            <span className="hidden sm:inline">Filters</span>
          </button>
        </div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <div className="flex flex-wrap gap-2 pt-1">
                <div className="flex gap-1 p-1 bg-muted rounded-xl">
                  {(["all", "income", "expense"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setFilterType(t)}
                      className={`px-3 py-1 rounded-lg text-sm capitalize transition-colors ${filterType === t ? "bg-card text-card-foreground shadow-sm" : "text-muted-foreground hover:text-card-foreground"}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <select
                  className="px-3 py-1.5 rounded-xl bg-muted border border-border text-card-foreground text-sm focus:outline-none"
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                >
                  {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <div className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-muted border border-border">
                  <span className="text-xs text-muted-foreground">Sort:</span>
                  <button onClick={() => setSortBy("date")} className={`text-xs px-2 py-0.5 rounded-lg ${sortBy === "date" ? "bg-card text-card-foreground" : "text-muted-foreground"}`}>Date</button>
                  <button onClick={() => setSortBy("amount")} className={`text-xs px-2 py-0.5 rounded-lg ${sortBy === "amount" ? "bg-card text-card-foreground" : "text-muted-foreground"}`}>Amount</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Transactions list */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-4xl mb-3">🔍</div>
            <p className="text-card-foreground">No transactions found</p>
            <p className="text-muted-foreground text-sm mt-1">Try adjusting your search or filters</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((t, i) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/30 transition-colors group"
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0 bg-muted">
                  {getCategoryEmoji(t.category)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-card-foreground text-sm truncate">{t.title}</p>
                    {t.isRecurring && (
                      <span className="flex-shrink-0 flex items-center gap-1 text-xs text-muted-foreground">
                        <RefreshCw size={10} /> Recurring
                      </span>
                    )}
                  </div>
                  <p className="text-muted-foreground text-xs">{t.category} • {new Date(t.date).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</p>
                  {t.notes && <p className="text-muted-foreground text-xs truncate">{t.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-sm ${t.type === "income" ? "text-emerald-400" : "text-red-400"}`} style={{ fontFamily: "var(--font-mono)" }}>
                    {t.type === "income" ? "+" : "-"}{fmt(t.amount)}
                  </span>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(t)}
                      className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-card-foreground transition-colors"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => setConfirmDelete(t.id)}
                      className="p-1.5 rounded-lg hover:bg-red-500/10 text-muted-foreground hover:text-red-400 transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      <TransactionModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        onSave={handleSave}
        initial={editing}
      />

      {/* Delete confirm */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60"
              onClick={() => setConfirmDelete(null)}
            />
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              className="relative bg-card border border-border rounded-2xl p-6 max-w-sm w-full z-10 shadow-2xl"
            >
              <div className="text-3xl text-center mb-3">🗑️</div>
              <h3 className="text-center text-card-foreground mb-2">Delete Transaction?</h3>
              <p className="text-center text-muted-foreground text-sm mb-5">This action cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl border border-border text-card-foreground hover:bg-muted transition-colors">Cancel</button>
                <button onClick={() => handleDelete(confirmDelete)} className="flex-1 py-2.5 rounded-xl bg-red-500 text-white hover:bg-red-600 transition-colors">Delete</button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
