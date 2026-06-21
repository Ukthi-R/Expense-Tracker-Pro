import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard, ArrowLeftRight, BarChart3, Wallet, Target,
  Brain, Bell, Sun, Moon, X, Menu, CheckCheck, TrendingUp,
} from "lucide-react";
import { FinanceProvider, useFinance } from "./context/FinanceContext";
import { Dashboard } from "./pages/Dashboard";
import { Transactions } from "./pages/Transactions";
import { Analytics } from "./pages/Analytics";
import { Budget } from "./pages/Budget";
import { Goals } from "./pages/Goals";
import { AIAdvisor } from "./pages/AIAdvisor";

type Page = "dashboard" | "transactions" | "analytics" | "budget" | "goals" | "ai";

const NAV_ITEMS = [
  { id: "dashboard" as Page, label: "Dashboard", icon: LayoutDashboard },
  { id: "transactions" as Page, label: "Transactions", icon: ArrowLeftRight },
  { id: "analytics" as Page, label: "Analytics", icon: BarChart3 },
  { id: "budget" as Page, label: "Budget", icon: Wallet },
  { id: "goals" as Page, label: "Goals", icon: Target },
  { id: "ai" as Page, label: "AI Advisor", icon: Brain },
];

function NotificationPanel({ onClose }: { onClose: () => void }) {
  const { notifications, markNotificationRead, clearNotifications } = useFinance();
  const unread = notifications.filter((n) => !n.read);

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="absolute top-14 right-0 w-80 bg-card border border-border rounded-2xl shadow-2xl z-50 overflow-hidden"
    >
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-muted-foreground" />
          <span className="text-card-foreground text-sm">Notifications</span>
          {unread.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-primary/20 text-primary">{unread.length}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {notifications.length > 0 && (
            <button onClick={clearNotifications} className="text-xs text-muted-foreground hover:text-card-foreground flex items-center gap-1 transition-colors">
              <CheckCheck size={12} /> Clear
            </button>
          )}
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="max-h-80 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <Bell size={28} className="text-muted-foreground mb-2 opacity-40" />
            <p className="text-muted-foreground text-sm">All caught up!</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {notifications.map((n) => (
              <div
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`p-4 hover:bg-muted/50 cursor-pointer transition-colors ${!n.read ? "bg-primary/5" : ""}`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">
                    {n.type === "warning" ? "⚠️" : n.type === "success" ? "✅" : "ℹ️"}
                  </span>
                  <div>
                    <p className="text-card-foreground text-xs leading-relaxed">{n.message}</p>
                    <p className="text-muted-foreground text-xs mt-1">
                      {new Date(n.timestamp).toLocaleDateString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                  {!n.read && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </motion.div>
  );
}

function AppInner() {
  const [page, setPage] = useState<Page>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const { darkMode, toggleDarkMode, notifications } = useFinance();

  const unreadCount = notifications.filter((n) => !n.read).length;
  const currentNav = NAV_ITEMS.find((n) => n.id === page)!;

  const PageComponent = {
    dashboard: Dashboard,
    transactions: Transactions,
    analytics: Analytics,
    budget: Budget,
    goals: Goals,
    ai: AIAdvisor,
  }[page];

  const handleNavClick = (p: Page) => {
    setPage(p);
    setSidebarOpen(false);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex flex-col w-64 xl:w-72 min-h-screen bg-sidebar border-r border-sidebar-border flex-shrink-0">
        <div className="p-6 border-b border-sidebar-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
              <TrendingUp size={18} className="text-primary-foreground" />
            </div>
            <div>
              <p className="text-sidebar-foreground font-semibold text-sm">Expense Tracker</p>
              <p className="text-muted-foreground text-xs">Pro Edition</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  active
                    ? "bg-sidebar-primary text-white shadow-sm"
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                }`}
              >
                <item.icon size={18} className={active ? "opacity-100" : "opacity-70"} />
                {item.label}
                {item.id === "ai" && (
                  <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">AI</span>
                )}
              </motion.button>
            );
          })}
        </nav>

        <div className="p-4 border-t border-sidebar-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-sidebar-accent">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm flex-shrink-0">
              R
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sidebar-foreground text-sm truncate">Rahul Sharma</p>
              <p className="text-muted-foreground text-xs">Premium Plan</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-72 bg-sidebar border-r border-sidebar-border z-50 lg:hidden flex flex-col"
            >
              <div className="p-5 border-b border-sidebar-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center">
                    <TrendingUp size={18} className="text-primary-foreground" />
                  </div>
                  <div>
                    <p className="text-sidebar-foreground font-semibold text-sm">Expense Tracker</p>
                    <p className="text-muted-foreground text-xs">Pro Edition</p>
                  </div>
                </div>
                <button onClick={() => setSidebarOpen(false)} className="p-2 rounded-xl hover:bg-sidebar-accent text-muted-foreground">
                  <X size={18} />
                </button>
              </div>
              <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                {NAV_ITEMS.map((item) => {
                  const active = page === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => handleNavClick(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                        active ? "bg-sidebar-primary text-white" : "text-sidebar-foreground hover:bg-sidebar-accent"
                      }`}
                    >
                      <item.icon size={18} className={active ? "opacity-100" : "opacity-70"} />
                      {item.label}
                      {item.id === "ai" && (
                        <span className="ml-auto text-xs px-1.5 py-0.5 rounded-full bg-violet-500/20 text-violet-400">AI</span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top header */}
        <header className="sticky top-0 z-30 flex items-center justify-between px-4 lg:px-6 py-3 bg-background/80 backdrop-blur-md border-b border-border">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2">
              <currentNav.icon size={16} className="text-primary" />
              <span className="text-foreground text-sm hidden sm:block">{currentNav.label}</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            <div className="relative">
              <button
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center leading-none">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {notifOpen && <NotificationPanel onClose={() => setNotifOpen(false)} />}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-6 overflow-auto pb-24 lg:pb-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={page}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PageComponent />
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-30 bg-card/95 backdrop-blur-md border-t border-border">
        <div className="flex">
          {NAV_ITEMS.map((item) => {
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex-1 flex flex-col items-center py-2 gap-0.5 transition-colors ${
                  active ? "text-primary" : "text-muted-foreground"
                }`}
              >
                <item.icon size={20} />
                <span className="text-xs">
                  {item.label === "AI Advisor" ? "AI" : item.label === "Transactions" ? "Txns" : item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export default function App() {
  return (
    <FinanceProvider>
      <AppInner />
    </FinanceProvider>
  );
}
