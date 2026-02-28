"use client";

import { useState, useEffect, useMemo } from "react";
import {
  DollarSign,
  Plus,
  TrendingUp,
  TrendingDown,
  ArrowUpRight,
  ArrowDownRight,
  Trash2,
  X,
  PieChart as PieChartIcon,
  BarChart3,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  BudgetItem,
  BudgetCategory,
  BUDGET_CATEGORY_LABELS,
  INCOME_CATEGORIES,
  EXPENSE_CATEGORIES,
} from "@/lib/types";
import { cn, generateId, formatCurrency, formatDate } from "@/lib/utils";

const CHART_COLORS = [
  "#722039",
  "#ab1f48",
  "#cc2d5a",
  "#df4d74",
  "#f59e0b",
  "#d97706",
  "#b45309",
  "#059669",
  "#0284c7",
];

type FilterType = "all" | "income" | "expense";

interface FormState {
  type: "income" | "expense";
  category: BudgetCategory;
  description: string;
  amount: string;
  budgeted: string;
  date: string;
  notes: string;
}

const emptyForm: FormState = {
  type: "income",
  category: "ticket_sales",
  description: "",
  amount: "",
  budgeted: "",
  date: new Date().toISOString().split("T")[0],
  notes: "",
};

export default function BudgetPage() {
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [filter, setFilter] = useState<FilterType>("all");
  const [loading, setLoading] = useState(true);

  // Load from API on mount
  useEffect(() => {
    async function loadItems() {
      try {
        const res = await fetch("/api/budget");
        if (!res.ok) throw new Error("Failed to fetch budget items");
        const data = await res.json();
        setItems(data);
      } catch (err) {
        console.error("Error loading budget items:", err);
      } finally {
        setLoading(false);
      }
    }
    loadItems();
  }, []);

  // ---------- Computed values ----------
  const totalIncome = useMemo(
    () => items.filter((i) => i.type === "income").reduce((s, i) => s + i.amount, 0),
    [items]
  );
  const totalExpenses = useMemo(
    () => items.filter((i) => i.type === "expense").reduce((s, i) => s + i.amount, 0),
    [items]
  );
  const totalBudgetedExpenses = useMemo(
    () => items.filter((i) => i.type === "expense").reduce((s, i) => s + i.budgeted, 0),
    [items]
  );
  const netProfitLoss = totalIncome - totalExpenses;
  const budgetUtilization =
    totalBudgetedExpenses > 0
      ? Math.round((totalExpenses / totalBudgetedExpenses) * 100)
      : 0;

  // ---------- Chart data ----------
  const barChartData = useMemo(() => {
    const allCats = [...INCOME_CATEGORIES, ...EXPENSE_CATEGORIES];
    return allCats
      .map((cat) => {
        const catItems = items.filter((i) => i.category === cat);
        const income = catItems
          .filter((i) => i.type === "income")
          .reduce((s, i) => s + i.amount, 0);
        const expense = catItems
          .filter((i) => i.type === "expense")
          .reduce((s, i) => s + i.amount, 0);
        if (income === 0 && expense === 0) return null;
        return {
          name: BUDGET_CATEGORY_LABELS[cat],
          Income: income,
          Expenses: expense,
        };
      })
      .filter(Boolean);
  }, [items]);

  const pieChartData = useMemo(() => {
    return EXPENSE_CATEGORIES.map((cat) => {
      const total = items
        .filter((i) => i.type === "expense" && i.category === cat)
        .reduce((s, i) => s + i.amount, 0);
      return { name: BUDGET_CATEGORY_LABELS[cat], value: total };
    }).filter((d) => d.value > 0);
  }, [items]);

  // ---------- Filtered items ----------
  const filteredItems = useMemo(
    () => (filter === "all" ? items : items.filter((i) => i.type === filter)),
    [items, filter]
  );

  const incomeItems = useMemo(
    () => items.filter((i) => i.type === "income"),
    [items]
  );
  const expenseItems = useMemo(
    () => items.filter((i) => i.type === "expense"),
    [items]
  );

  // Group items by category
  const groupByCategory = (list: BudgetItem[]) => {
    const grouped: Record<string, BudgetItem[]> = {};
    for (const item of list) {
      if (!grouped[item.category]) grouped[item.category] = [];
      grouped[item.category].push(item);
    }
    return Object.entries(grouped).sort(([a], [b]) =>
      BUDGET_CATEGORY_LABELS[a as BudgetCategory].localeCompare(
        BUDGET_CATEGORY_LABELS[b as BudgetCategory]
      )
    );
  };

  // ---------- CRUD ----------
  function openNewModal() {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  }

  function openEditModal(item: BudgetItem) {
    setEditingId(item.id);
    setForm({
      type: item.type,
      category: item.category,
      description: item.description,
      amount: item.amount.toString(),
      budgeted: item.budgeted.toString(),
      date: item.date,
      notes: item.notes,
    });
    setShowModal(true);
  }

  async function handleSave() {
    const amount = parseFloat(form.amount) || 0;
    const budgeted = parseFloat(form.budgeted) || 0;
    if (!form.description.trim() || amount <= 0) return;

    if (editingId) {
      const changes = {
        type: form.type,
        category: form.category,
        description: form.description.trim(),
        amount,
        budgeted,
        date: form.date,
        notes: form.notes.trim(),
      };
      try {
        const res = await fetch(`/api/budget/${editingId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(changes),
        });
        if (!res.ok) throw new Error("Failed to update budget item");
        const updatedItem: BudgetItem = await res.json();
        setItems((prev) =>
          prev.map((item) => (item.id === editingId ? updatedItem : item))
        );
      } catch (err) {
        console.error("Error updating budget item:", err);
        return;
      }
    } else {
      const newItem = {
        id: generateId(),
        type: form.type,
        category: form.category,
        description: form.description.trim(),
        amount,
        budgeted,
        date: form.date,
        notes: form.notes.trim(),
        createdAt: new Date().toISOString(),
      };
      try {
        const res = await fetch("/api/budget", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newItem),
        });
        if (!res.ok) throw new Error("Failed to create budget item");
        const createdItem: BudgetItem = await res.json();
        setItems((prev) => [...prev, createdItem]);
      } catch (err) {
        console.error("Error creating budget item:", err);
        return;
      }
    }

    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  async function handleDelete(id: string) {
    try {
      const res = await fetch(`/api/budget/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete budget item");
      setItems((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error("Error deleting budget item:", err);
    }
  }

  // Keep category in sync when type changes
  function handleTypeChange(type: "income" | "expense") {
    const cats = type === "income" ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;
    setForm((prev) => ({
      ...prev,
      type,
      category: cats.includes(prev.category) ? prev.category : cats[0],
    }));
  }

  // ---------- Render ----------
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-wine-200 border-t-wine-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <DollarSign className="w-5 h-5 text-gold-400" />
            <span className="text-xs uppercase tracking-[0.2em] text-wine-500 font-semibold">
              Financial Overview
            </span>
          </div>
          <h1 className="text-3xl font-bold text-wine-950">Budget Tracker</h1>
          <p className="text-sm text-gray-500 mt-1">
            Track income, expenses, and financial health for Fullerton Uncorked.
          </p>
        </div>
        <button
          onClick={openNewModal}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-wine-700 to-wine-800 text-white font-semibold text-sm shadow-lg shadow-wine-500/20 hover:shadow-wine-500/40 hover:from-wine-600 hover:to-wine-700 transition-all"
        >
          <Plus className="w-4 h-4" />
          Add Entry
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Income */}
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-emerald-500 to-emerald-700 text-white shadow-lg shadow-emerald-500/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-emerald-100">
                Total Income
              </span>
              <ArrowUpRight className="w-4 h-4 text-emerald-200" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalIncome)}</p>
            <p className="text-xs text-emerald-200 mt-1">
              {incomeItems.length} income {incomeItems.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        {/* Total Expenses */}
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-red-500 to-red-700 text-white shadow-lg shadow-red-500/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-red-100">
                Total Expenses
              </span>
              <ArrowDownRight className="w-4 h-4 text-red-200" />
            </div>
            <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
            <p className="text-xs text-red-200 mt-1">
              {expenseItems.length} expense {expenseItems.length === 1 ? "entry" : "entries"}
            </p>
          </div>
        </div>

        {/* Net Profit / Loss */}
        <div
          className={cn(
            "relative overflow-hidden rounded-xl p-5 text-white shadow-lg",
            netProfitLoss >= 0
              ? "bg-gradient-to-br from-emerald-600 to-teal-700 shadow-emerald-500/20"
              : "bg-gradient-to-br from-red-600 to-rose-700 shadow-red-500/20"
          )}
        >
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider opacity-80">
                Net {netProfitLoss >= 0 ? "Profit" : "Loss"}
              </span>
              {netProfitLoss >= 0 ? (
                <TrendingUp className="w-4 h-4 opacity-70" />
              ) : (
                <TrendingDown className="w-4 h-4 opacity-70" />
              )}
            </div>
            <p className="text-2xl font-bold">{formatCurrency(Math.abs(netProfitLoss))}</p>
            <p className="text-xs opacity-70 mt-1">
              {netProfitLoss >= 0 ? "Healthy margin" : "Over budget"}
            </p>
          </div>
        </div>

        {/* Budget Utilization */}
        <div className="relative overflow-hidden rounded-xl p-5 bg-gradient-to-br from-wine-700 to-wine-900 text-white shadow-lg shadow-wine-500/20">
          <div className="absolute -right-4 -top-4 w-24 h-24 rounded-full bg-white/10" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-wine-200">
                Budget Utilization
              </span>
              <DollarSign className="w-4 h-4 text-wine-300" />
            </div>
            <p className="text-2xl font-bold">{budgetUtilization}%</p>
            <div className="mt-2 h-1.5 bg-wine-950/40 rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-500",
                  budgetUtilization > 100 ? "bg-red-400" : "bg-gold-400"
                )}
                style={{ width: `${Math.min(budgetUtilization, 100)}%` }}
              />
            </div>
            <p className="text-xs text-wine-300 mt-1">
              {formatCurrency(totalExpenses)} of {formatCurrency(totalBudgetedExpenses)} budgeted
            </p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      {items.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Bar Chart */}
          <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="w-4 h-4 text-wine-600" />
              <h2 className="text-sm font-semibold text-wine-900">
                Income vs Expenses by Category
              </h2>
            </div>
            {barChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart
                  data={barChartData}
                  margin={{ top: 5, right: 20, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ec" />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: "#722039" }}
                    tickLine={false}
                    axisLine={{ stroke: "#f3e8ec" }}
                    angle={-30}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis
                    tick={{ fontSize: 11, fill: "#722039" }}
                    tickLine={false}
                    axisLine={{ stroke: "#f3e8ec" }}
                    tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`}
                  />
                  <Tooltip
                    formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                    contentStyle={{
                      backgroundColor: "#4a0d20",
                      border: "none",
                      borderRadius: "8px",
                      color: "#fff",
                      fontSize: 12,
                    }}
                    itemStyle={{ color: "#fbbf24" }}
                    labelStyle={{ color: "#fdf2f4", fontWeight: 600 }}
                  />
                  <Bar
                    dataKey="Income"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                  <Bar
                    dataKey="Expenses"
                    fill="#ab1f48"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={40}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">
                Add budget entries to see chart data.
              </div>
            )}
          </div>

          {/* Pie Chart */}
          <div className="rounded-xl bg-white border border-gray-100 p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="w-4 h-4 text-wine-600" />
              <h2 className="text-sm font-semibold text-wine-900">
                Expense Breakdown
              </h2>
            </div>
            {pieChartData.length > 0 ? (
              <div className="flex flex-col items-center">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={pieChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {pieChartData.map((_, idx) => (
                        <Cell
                          key={`cell-${idx}`}
                          fill={CHART_COLORS[idx % CHART_COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value: number | undefined) => formatCurrency(value ?? 0)}
                      contentStyle={{
                        backgroundColor: "#4a0d20",
                        border: "none",
                        borderRadius: "8px",
                        color: "#fff",
                        fontSize: 12,
                      }}
                      itemStyle={{ color: "#fbbf24" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                {/* Legend */}
                <div className="flex flex-wrap justify-center gap-x-4 gap-y-1.5 mt-2">
                  {pieChartData.map((entry, idx) => (
                    <div key={entry.name} className="flex items-center gap-1.5 text-xs">
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: CHART_COLORS[idx % CHART_COLORS.length],
                        }}
                      />
                      <span className="text-gray-600">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-center h-[300px] text-sm text-gray-400">
                Add expense entries to see breakdown.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter className="w-4 h-4 text-wine-500" />
        <span className="text-sm font-medium text-wine-800">View:</span>
        {(["all", "income", "expense"] as FilterType[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "px-3 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize",
              filter === f
                ? "bg-wine-700 text-white shadow-sm"
                : "bg-white text-wine-700 border border-wine-200 hover:bg-wine-50"
            )}
          >
            {f === "all" ? "All Entries" : f === "income" ? "Income" : "Expenses"}
          </button>
        ))}
      </div>

      {/* Income Table */}
      {(filter === "all" || filter === "income") && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-emerald-50 to-white">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <h2 className="text-sm font-semibold text-emerald-900">
                Income
              </h2>
              <span className="ml-auto text-xs font-medium text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                {formatCurrency(totalIncome)}
              </span>
            </div>
          </div>
          {incomeItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No income entries yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Add ticket sales, sponsorships, or donations.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                    <th className="text-left px-6 py-3 font-semibold">Description</th>
                    <th className="text-left px-4 py-3 font-semibold">Category</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-right px-4 py-3 font-semibold">Budgeted</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Notes</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupByCategory(incomeItems).map(([cat, catItems]) => (
                    <CategoryGroup
                      key={cat}
                      category={cat as BudgetCategory}
                      items={catItems}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      variant="income"
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Expense Table */}
      {(filter === "all" || filter === "expense") && (
        <div className="rounded-xl bg-white border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-red-50 to-white">
            <div className="flex items-center gap-2">
              <TrendingDown className="w-4 h-4 text-red-600" />
              <h2 className="text-sm font-semibold text-red-900">
                Expenses
              </h2>
              <span className="ml-auto text-xs font-medium text-red-600 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-200">
                {formatCurrency(totalExpenses)}
              </span>
            </div>
          </div>
          {expenseItems.length === 0 ? (
            <div className="px-6 py-12 text-center">
              <DollarSign className="w-10 h-10 text-gray-200 mx-auto mb-3" />
              <p className="text-sm text-gray-400 font-medium">No expense entries yet</p>
              <p className="text-xs text-gray-300 mt-1">
                Track venue, catering, entertainment, and other costs.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-xs text-gray-500 uppercase tracking-wider border-b border-gray-50">
                    <th className="text-left px-6 py-3 font-semibold">Description</th>
                    <th className="text-left px-4 py-3 font-semibold">Category</th>
                    <th className="text-right px-4 py-3 font-semibold">Amount</th>
                    <th className="text-right px-4 py-3 font-semibold">Budgeted</th>
                    <th className="text-left px-4 py-3 font-semibold">Date</th>
                    <th className="text-left px-4 py-3 font-semibold">Notes</th>
                    <th className="px-4 py-3 w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {groupByCategory(expenseItems).map(([cat, catItems]) => (
                    <CategoryGroup
                      key={cat}
                      category={cat as BudgetCategory}
                      items={catItems}
                      onEdit={openEditModal}
                      onDelete={handleDelete}
                      variant="expense"
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Empty state when no items at all */}
      {items.length === 0 && (
        <div className="rounded-xl bg-white border border-gray-100 p-12 text-center shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-wine-100 to-wine-50 flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-wine-400" />
          </div>
          <h3 className="text-lg font-semibold text-wine-900 mb-1">
            No Budget Entries Yet
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-6">
            Start tracking your event finances by adding income and expense entries.
            Monitor ticket sales, sponsorships, vendor costs, and more.
          </p>
          <button
            onClick={openNewModal}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-wine-700 to-wine-800 text-white font-semibold text-sm shadow-lg shadow-wine-500/20 hover:shadow-wine-500/40 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add First Entry
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center modal-overlay"
          onClick={() => setShowModal(false)}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto animate-fade-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-wine-900">
                {editingId ? "Edit Entry" : "Add Budget Entry"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {/* Modal body */}
            <div className="px-6 py-5 space-y-4">
              {/* Type toggle */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Type
                </label>
                <div className="flex gap-2">
                  {(["income", "expense"] as const).map((t) => (
                    <button
                      key={t}
                      type="button"
                      onClick={() => handleTypeChange(t)}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-semibold transition-all capitalize",
                        form.type === t
                          ? t === "income"
                            ? "bg-emerald-600 text-white shadow-sm"
                            : "bg-red-600 text-white shadow-sm"
                          : "bg-gray-50 text-gray-500 border border-gray-200 hover:bg-gray-100"
                      )}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              </div>

              {/* Category */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Category
                </label>
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm((prev) => ({
                      ...prev,
                      category: e.target.value as BudgetCategory,
                    }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                >
                  {(form.type === "income"
                    ? INCOME_CATEGORIES
                    : EXPENSE_CATEGORIES
                  ).map((cat) => (
                    <option key={cat} value={cat}>
                      {BUDGET_CATEGORY_LABELS[cat]}
                    </option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Description
                </label>
                <input
                  type="text"
                  value={form.description}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="e.g., Early bird ticket sales"
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                />
              </div>

              {/* Amount & Budgeted */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Actual Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.amount}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, amount: e.target.value }))
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                    Budgeted Amount ($)
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={form.budgeted}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, budgeted: e.target.value }))
                    }
                    placeholder="0.00"
                    className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                  />
                </div>
              </div>

              {/* Date */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, date: e.target.value }))
                  }
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 block">
                  Notes
                </label>
                <textarea
                  value={form.notes}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  placeholder="Optional details..."
                  rows={3}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-500/20 focus:border-wine-500 resize-none"
                />
              </div>
            </div>

            {/* Modal footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={!form.description.trim() || !(parseFloat(form.amount) > 0)}
                className="px-5 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-wine-700 to-wine-800 hover:from-wine-600 hover:to-wine-700 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed transition-all"
              >
                {editingId ? "Save Changes" : "Add Entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ---------- Sub-components ----------

function CategoryGroup({
  category,
  items,
  onEdit,
  onDelete,
  variant,
}: {
  category: BudgetCategory;
  items: BudgetItem[];
  onEdit: (item: BudgetItem) => void;
  onDelete: (id: string) => void;
  variant: "income" | "expense";
}) {
  const catTotal = items.reduce((s, i) => s + i.amount, 0);
  const catBudgeted = items.reduce((s, i) => s + i.budgeted, 0);

  return (
    <>
      {/* Category header row */}
      <tr
        className={cn(
          "border-b border-gray-50",
          variant === "income" ? "bg-emerald-50/40" : "bg-red-50/40"
        )}
      >
        <td
          colSpan={5}
          className="px-6 py-2.5 text-xs font-semibold uppercase tracking-wider"
        >
          <span className={variant === "income" ? "text-emerald-700" : "text-red-700"}>
            {BUDGET_CATEGORY_LABELS[category]}
          </span>
        </td>
        <td className="px-4 py-2.5 text-right text-xs font-semibold">
          <span className={variant === "income" ? "text-emerald-600" : "text-red-600"}>
            {formatCurrency(catTotal)}
          </span>
          {catBudgeted > 0 && (
            <span className="text-gray-400 ml-1">
              / {formatCurrency(catBudgeted)}
            </span>
          )}
        </td>
        <td></td>
      </tr>
      {/* Item rows */}
      {items
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .map((item) => (
          <tr
            key={item.id}
            onClick={() => onEdit(item)}
            className="border-b border-gray-50 hover:bg-cream-50 cursor-pointer transition-colors group"
          >
            <td className="px-6 py-3 font-medium text-gray-900">
              {item.description}
            </td>
            <td className="px-4 py-3 text-gray-500">
              {BUDGET_CATEGORY_LABELS[item.category]}
            </td>
            <td
              className={cn(
                "px-4 py-3 text-right font-semibold tabular-nums",
                variant === "income" ? "text-emerald-600" : "text-red-600"
              )}
            >
              {formatCurrency(item.amount)}
            </td>
            <td className="px-4 py-3 text-right text-gray-400 tabular-nums">
              {item.budgeted > 0 ? formatCurrency(item.budgeted) : "--"}
            </td>
            <td className="px-4 py-3 text-gray-500">
              {formatDate(item.date)}
            </td>
            <td className="px-4 py-3 text-gray-400 text-xs max-w-[200px] truncate">
              {item.notes || "--"}
            </td>
            <td className="px-4 py-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="p-1.5 rounded-lg text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                title="Delete entry"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </td>
          </tr>
        ))}
    </>
  );
}
