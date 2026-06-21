import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

export type TransactionType = "income" | "expense";

export type IncomeCategory = "Salary" | "Freelance" | "Business" | "Investments" | "Other";
export type ExpenseCategory =
  | "Food"
  | "Shopping"
  | "Transport"
  | "Entertainment"
  | "Bills"
  | "Healthcare"
  | "Education"
  | "Other";

export type Category = IncomeCategory | ExpenseCategory;

export interface Transaction {
  id: string;
  title: string;
  amount: number;
  category: Category;
  type: TransactionType;
  date: string;
  notes?: string;
  isRecurring?: boolean;
}

export interface Budget {
  category: ExpenseCategory;
  limit: number;
  spent: number;
}

export interface SavingsGoal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  icon: string;
}

export interface Notification {
  id: string;
  type: "warning" | "success" | "info";
  message: string;
  timestamp: string;
  read: boolean;
}

interface FinanceContextType {
  transactions: Transaction[];
  budgets: Budget[];
  savingsGoals: SavingsGoal[];
  notifications: Notification[];
  darkMode: boolean;
  addTransaction: (t: Omit<Transaction, "id">) => void;
  updateTransaction: (t: Transaction) => void;
  deleteTransaction: (id: string) => void;
  updateBudget: (category: ExpenseCategory, limit: number) => void;
  addSavingsGoal: (g: Omit<SavingsGoal, "id">) => void;
  updateSavingsGoal: (g: SavingsGoal) => void;
  deleteSavingsGoal: (id: string) => void;
  markNotificationRead: (id: string) => void;
  clearNotifications: () => void;
  toggleDarkMode: () => void;
  totalIncome: number;
  totalExpenses: number;
  totalSavings: number;
  currentBalance: number;
  healthScore: number;
}

const FinanceContext = createContext<FinanceContextType | null>(null);

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  "Food", "Shopping", "Transport", "Entertainment", "Bills", "Healthcare", "Education", "Other",
];

const generateId = () => Math.random().toString(36).substr(2, 9);

const sampleTransactions: Transaction[] = [
  { id: "1", title: "Monthly Salary", amount: 85000, category: "Salary", type: "income", date: "2026-06-01", notes: "June salary" },
  { id: "2", title: "Freelance Project", amount: 15000, category: "Freelance", type: "income", date: "2026-06-05" },
  { id: "3", title: "Stock Dividends", amount: 4500, category: "Investments", type: "income", date: "2026-06-10" },
  { id: "4", title: "Grocery Shopping", amount: 3200, category: "Food", type: "expense", date: "2026-06-02" },
  { id: "5", title: "Restaurant Dinner", amount: 1800, category: "Food", type: "expense", date: "2026-06-04" },
  { id: "6", title: "Electricity Bill", amount: 2400, category: "Bills", type: "expense", date: "2026-06-03" },
  { id: "7", title: "Netflix Subscription", amount: 649, category: "Entertainment", type: "expense", date: "2026-06-01", isRecurring: true },
  { id: "8", title: "Uber Rides", amount: 1200, category: "Transport", type: "expense", date: "2026-06-06" },
  { id: "9", title: "New Sneakers", amount: 5500, category: "Shopping", type: "expense", date: "2026-06-07" },
  { id: "10", title: "Gym Membership", amount: 1500, category: "Healthcare", type: "expense", date: "2026-06-01", isRecurring: true },
  { id: "11", title: "Online Course", amount: 2999, category: "Education", type: "expense", date: "2026-06-08" },
  { id: "12", title: "Salary - May", amount: 85000, category: "Salary", type: "income", date: "2026-05-01" },
  { id: "13", title: "Food May", amount: 4100, category: "Food", type: "expense", date: "2026-05-15" },
  { id: "14", title: "Bills May", amount: 2600, category: "Bills", type: "expense", date: "2026-05-03" },
  { id: "15", title: "Shopping May", amount: 3200, category: "Shopping", type: "expense", date: "2026-05-20" },
  { id: "16", title: "Freelance May", amount: 10000, category: "Freelance", type: "income", date: "2026-05-12" },
  { id: "17", title: "Salary - Apr", amount: 85000, category: "Salary", type: "income", date: "2026-04-01" },
  { id: "18", title: "Food Apr", amount: 3800, category: "Food", type: "expense", date: "2026-04-14" },
  { id: "19", title: "Bills Apr", amount: 2200, category: "Bills", type: "expense", date: "2026-04-03" },
  { id: "20", title: "Entertainment Apr", amount: 1900, category: "Entertainment", type: "expense", date: "2026-04-18" },
];

const sampleBudgets: Budget[] = [
  { category: "Food", limit: 7000, spent: 5000 },
  { category: "Shopping", limit: 8000, spent: 5500 },
  { category: "Transport", limit: 3000, spent: 1200 },
  { category: "Entertainment", limit: 3000, spent: 2549 },
  { category: "Bills", limit: 5000, spent: 2400 },
  { category: "Healthcare", limit: 3000, spent: 1500 },
  { category: "Education", limit: 5000, spent: 2999 },
  { category: "Other", limit: 3000, spent: 0 },
];

const sampleGoals: SavingsGoal[] = [
  { id: "g1", title: "Buy Laptop", targetAmount: 80000, currentAmount: 52000, deadline: "2026-09-30", icon: "💻" },
  { id: "g2", title: "Vacation Fund", targetAmount: 150000, currentAmount: 35000, deadline: "2026-12-31", icon: "✈️" },
  { id: "g3", title: "Emergency Fund", targetAmount: 300000, currentAmount: 180000, deadline: "2027-03-31", icon: "🛡️" },
  { id: "g4", title: "New Phone", targetAmount: 55000, currentAmount: 55000, deadline: "2026-06-30", icon: "📱" },
];

const computeHealthScore = (
  income: number,
  expenses: number,
  budgets: Budget[]
): number => {
  if (income === 0) return 0;
  const savingsRate = Math.max(0, (income - expenses) / income);
  const expenseRatio = Math.min(1, expenses / income);
  const overBudgetCount = budgets.filter((b) => b.spent > b.limit).length;
  const budgetCompliance = Math.max(0, 1 - overBudgetCount / budgets.length);
  const score =
    savingsRate * 40 + (1 - expenseRatio) * 30 + budgetCompliance * 30;
  return Math.round(Math.min(100, Math.max(0, score * 100)));
};

export function FinanceProvider({ children }: { children: React.ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      const saved = localStorage.getItem("fin_transactions");
      return saved ? JSON.parse(saved) : sampleTransactions;
    } catch {
      return sampleTransactions;
    }
  });

  const [budgets, setBudgets] = useState<Budget[]>(() => {
    try {
      const saved = localStorage.getItem("fin_budgets");
      return saved ? JSON.parse(saved) : sampleBudgets;
    } catch {
      return sampleBudgets;
    }
  });

  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>(() => {
    try {
      const saved = localStorage.getItem("fin_goals");
      return saved ? JSON.parse(saved) : sampleGoals;
    } catch {
      return sampleGoals;
    }
  });

  const [notifications, setNotifications] = useState<Notification[]>(() => {
    try {
      const saved = localStorage.getItem("fin_notifications");
      return saved ? JSON.parse(saved) : [
        { id: "n1", type: "info", message: "Welcome to Expense Tracker Pro! Your financial journey starts here.", timestamp: new Date().toISOString(), read: false },
        { id: "n2", type: "success", message: "You saved 28% of your income this month. Great job! 🎉", timestamp: new Date().toISOString(), read: false },
      ];
    } catch {
      return [];
    }
  });

  const [darkMode, setDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem("fin_darkMode");
      return saved ? JSON.parse(saved) : true;
    } catch {
      return true;
    }
  });

  useEffect(() => {
    localStorage.setItem("fin_transactions", JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem("fin_budgets", JSON.stringify(budgets));
  }, [budgets]);

  useEffect(() => {
    localStorage.setItem("fin_goals", JSON.stringify(savingsGoals));
  }, [savingsGoals]);

  useEffect(() => {
    localStorage.setItem("fin_notifications", JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem("fin_darkMode", JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add("dark");
  }, []);

  const currentMonthIncome = transactions
    .filter((t) => t.type === "income" && t.date.startsWith("2026-06"))
    .reduce((sum, t) => sum + t.amount, 0);

  const currentMonthExpenses = transactions
    .filter((t) => t.type === "expense" && t.date.startsWith("2026-06"))
    .reduce((sum, t) => sum + t.amount, 0);

  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalSavings = totalIncome - totalExpenses;
  const currentBalance = totalSavings;

  const updatedBudgets = budgets.map((b) => ({
    ...b,
    spent: transactions
      .filter((t) => t.type === "expense" && t.category === b.category && t.date.startsWith("2026-06"))
      .reduce((sum, t) => sum + t.amount, 0),
  }));

  const healthScore = computeHealthScore(currentMonthIncome, currentMonthExpenses, updatedBudgets);

  const addTransaction = useCallback((t: Omit<Transaction, "id">) => {
    const newT = { ...t, id: generateId() };
    setTransactions((prev) => [newT, ...prev]);
    if (t.type === "expense") {
      const budgetForCat = updatedBudgets.find((b) => b.category === t.category);
      if (budgetForCat && budgetForCat.spent + t.amount > budgetForCat.limit) {
        setNotifications((prev) => [
          {
            id: generateId(),
            type: "warning",
            message: `Budget exceeded for ${t.category}! You've spent ₹${(budgetForCat.spent + t.amount).toLocaleString("en-IN")} of ₹${budgetForCat.limit.toLocaleString("en-IN")} limit.`,
            timestamp: new Date().toISOString(),
            read: false,
          },
          ...prev,
        ]);
      }
    }
  }, [updatedBudgets]);

  const updateTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => prev.map((x) => (x.id === t.id ? t : x)));
  }, []);

  const deleteTransaction = useCallback((id: string) => {
    setTransactions((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const updateBudget = useCallback((category: ExpenseCategory, limit: number) => {
    setBudgets((prev) =>
      prev.map((b) => (b.category === category ? { ...b, limit } : b))
    );
  }, []);

  const addSavingsGoal = useCallback((g: Omit<SavingsGoal, "id">) => {
    setSavingsGoals((prev) => [{ ...g, id: generateId() }, ...prev]);
  }, []);

  const updateSavingsGoal = useCallback((g: SavingsGoal) => {
    setSavingsGoals((prev) => prev.map((x) => (x.id === g.id ? g : x)));
  }, []);

  const deleteSavingsGoal = useCallback((id: string) => {
    setSavingsGoals((prev) => prev.filter((g) => g.id !== id));
  }, []);

  const markNotificationRead = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const clearNotifications = useCallback(() => setNotifications([]), []);
  const toggleDarkMode = useCallback(() => setDarkMode((d) => !d), []);

  return (
    <FinanceContext.Provider
      value={{
        transactions,
        budgets: updatedBudgets,
        savingsGoals,
        notifications,
        darkMode,
        addTransaction,
        updateTransaction,
        deleteTransaction,
        updateBudget,
        addSavingsGoal,
        updateSavingsGoal,
        deleteSavingsGoal,
        markNotificationRead,
        clearNotifications,
        toggleDarkMode,
        totalIncome,
        totalExpenses,
        totalSavings,
        currentBalance,
        healthScore,
      }}
    >
      {children}
    </FinanceContext.Provider>
  );
}

export function useFinance() {
  const ctx = useContext(FinanceContext);
  if (!ctx) throw new Error("useFinance must be used within FinanceProvider");
  return ctx;
}
