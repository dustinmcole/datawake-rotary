"use client";

import { useEffect, useState, useMemo } from "react";
import {
  CheckSquare,
  Plus,
  LayoutGrid,
  List,
  Calendar,
  User,
  Tag,
  Trash2,
  X,
  Flag,
  GripVertical,
  Filter,
  Loader2,
} from "lucide-react";
import {
  Task,
  TaskStatus,
  TaskPriority,
  TaskCategory,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
  TASK_CATEGORY_LABELS,
  TEAM_MEMBERS,
} from "@/lib/types";
import { cn, formatDate } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const STATUSES: TaskStatus[] = ["todo", "in_progress", "review", "done"];

const COLUMN_COLORS: Record<TaskStatus, { strip: string; bg: string; text: string; badge: string }> = {
  todo: {
    strip: "bg-slate-400",
    bg: "bg-gray-50",
    text: "text-slate-700",
    badge: "bg-slate-100 text-slate-600",
  },
  in_progress: {
    strip: "bg-blue-500",
    bg: "bg-blue-50/40",
    text: "text-blue-700",
    badge: "bg-blue-100 text-blue-600",
  },
  review: {
    strip: "bg-amber-500",
    bg: "bg-amber-50/40",
    text: "text-amber-700",
    badge: "bg-amber-100 text-amber-600",
  },
  done: {
    strip: "bg-emerald-500",
    bg: "bg-emerald-50/40",
    text: "text-emerald-700",
    badge: "bg-emerald-100 text-emerald-600",
  },
};

const PRIORITY_STYLES: Record<TaskPriority, { bg: string; text: string; dot: string }> = {
  low: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  medium: { bg: "bg-blue-100", text: "text-blue-700", dot: "bg-blue-500" },
  high: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500" },
  urgent: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500" },
};

const CATEGORY_COLORS: Record<TaskCategory, string> = {
  venue: "bg-purple-100 text-purple-700",
  sponsors: "bg-gold-100 text-gold-700",
  vendors: "bg-teal-100 text-teal-700",
  marketing: "bg-pink-100 text-pink-700",
  logistics: "bg-indigo-100 text-indigo-700",
  volunteers: "bg-emerald-100 text-emerald-700",
  entertainment: "bg-orange-100 text-orange-700",
  general: "bg-gray-100 text-gray-600",
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function getAvatarColor(name: string): string {
  const colors = [
    "bg-wine-600",
    "bg-blue-600",
    "bg-emerald-600",
    "bg-amber-600",
    "bg-purple-600",
    "bg-rose-600",
    "bg-teal-600",
    "bg-indigo-600",
    "bg-orange-600",
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

function emptyTask(): Omit<Task, "id" | "createdAt" | "updatedAt"> {
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    assignee: "Unassigned",
    category: "general",
    dueDate: "",
  };
}

function isDueSoon(dateStr: string): boolean {
  if (!dateStr) return false;
  const diff = new Date(dateStr).getTime() - Date.now();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
}

function isOverdue(dateStr: string): boolean {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function TasksPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [view, setView] = useState<"kanban" | "list">("kanban");
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [form, setForm] = useState(emptyTask());
  const [showFilters, setShowFilters] = useState(false);
  const [filterAssignee, setFilterAssignee] = useState("");
  const [filterPriority, setFilterPriority] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);
  const [sortField, setSortField] = useState<"dueDate" | "priority" | "title" | "status">("dueDate");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load tasks on mount
  useEffect(() => {
    fetch("/api/tasks")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setTasks(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Filtered tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filterAssignee && t.assignee !== filterAssignee) return false;
      if (filterPriority && t.priority !== filterPriority) return false;
      if (filterCategory && t.category !== filterCategory) return false;
      return true;
    });
  }, [tasks, filterAssignee, filterPriority, filterCategory]);

  // Sorted tasks (for list view)
  const sortedTasks = useMemo(() => {
    const priorityOrder: Record<TaskPriority, number> = { urgent: 0, high: 1, medium: 2, low: 3 };
    const statusOrder: Record<TaskStatus, number> = { todo: 0, in_progress: 1, review: 2, done: 3 };
    return [...filteredTasks].sort((a, b) => {
      let cmp = 0;
      switch (sortField) {
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "priority":
          cmp = priorityOrder[a.priority] - priorityOrder[b.priority];
          break;
        case "status":
          cmp = statusOrder[a.status] - statusOrder[b.status];
          break;
        case "dueDate":
        default:
          if (!a.dueDate && !b.dueDate) cmp = 0;
          else if (!a.dueDate) cmp = 1;
          else if (!b.dueDate) cmp = -1;
          else cmp = new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [filteredTasks, sortField, sortDir]);

  // Active filter count
  const activeFilterCount = [filterAssignee, filterPriority, filterCategory].filter(Boolean).length;

  // -----------------------------------------------------------------------
  // Handlers
  // -----------------------------------------------------------------------

  function openNewTask() {
    setEditingTask(null);
    setForm(emptyTask());
    setShowModal(true);
  }

  function openEditTask(task: Task) {
    setEditingTask(task);
    setForm({
      title: task.title,
      description: task.description,
      status: task.status,
      priority: task.priority,
      assignee: task.assignee,
      category: task.category,
      dueDate: task.dueDate,
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!form.title.trim()) return;
    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const updated: Task = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === editingTask.id ? updated : t)));
      }
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const created: Task = await res.json();
        setTasks((prev) => [...prev, created]);
      }
    }
    setShowModal(false);
  }

  async function handleDelete(id: string) {
    await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setDeleteConfirm(null);
    setShowModal(false);
  }

  function handleDragStart(e: React.DragEvent, taskId: string) {
    e.dataTransfer.setData("text/plain", taskId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragOver(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDragOverColumn(status);
  }

  function handleDragLeave() {
    setDragOverColumn(null);
  }

  async function handleDrop(e: React.DragEvent, status: TaskStatus) {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData("text/plain");
    if (!taskId) return;
    const res = await fetch(`/api/tasks/${taskId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated: Task = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
    }
  }

  function toggleSort(field: typeof sortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir("asc");
    }
  }

  function clearFilters() {
    setFilterAssignee("");
    setFilterPriority("");
    setFilterCategory("");
  }

  // -----------------------------------------------------------------------
  // Render helpers
  // -----------------------------------------------------------------------

  function PriorityBadge({ priority }: { priority: TaskPriority }) {
    const s = PRIORITY_STYLES[priority];
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold", s.bg, s.text)}>
        <span className={cn("w-1.5 h-1.5 rounded-full", s.dot)} />
        {TASK_PRIORITY_LABELS[priority]}
      </span>
    );
  }

  function CategoryTag({ category }: { category: TaskCategory }) {
    return (
      <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium", CATEGORY_COLORS[category])}>
        <Tag className="w-3 h-3" />
        {TASK_CATEGORY_LABELS[category]}
      </span>
    );
  }

  function AssigneeAvatar({ name, size = "sm" }: { name: string; size?: "sm" | "md" }) {
    if (name === "Unassigned") {
      return (
        <div
          className={cn(
            "rounded-full bg-gray-200 flex items-center justify-center",
            size === "sm" ? "w-6 h-6" : "w-8 h-8"
          )}
        >
          <User className={cn("text-gray-400", size === "sm" ? "w-3 h-3" : "w-4 h-4")} />
        </div>
      );
    }
    return (
      <div
        className={cn(
          "rounded-full text-white flex items-center justify-center font-semibold",
          getAvatarColor(name),
          size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"
        )}
        title={name}
      >
        {getInitials(name)}
      </div>
    );
  }

  function DueDateLabel({ date, status }: { date: string; status: TaskStatus }) {
    if (!date) return null;
    const overdue = status !== "done" && isOverdue(date);
    const soon = status !== "done" && isDueSoon(date);
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1 text-[11px]",
          overdue ? "text-red-600 font-semibold" : soon ? "text-amber-600 font-medium" : "text-gray-400"
        )}
      >
        <Calendar className="w-3 h-3" />
        {formatDate(date)}
      </span>
    );
  }

  // -----------------------------------------------------------------------
  // Task Card (Kanban)
  // -----------------------------------------------------------------------

  function TaskCard({ task }: { task: Task }) {
    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        onClick={() => openEditTask(task)}
        className="group bg-white rounded-lg border border-gray-100 p-3 cursor-pointer card-hover shadow-sm hover:shadow-md transition-all duration-200"
      >
        <div className="flex items-start gap-2 mb-2">
          <GripVertical className="w-4 h-4 text-gray-300 mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab shrink-0" />
          <h4 className="text-sm font-semibold text-gray-900 leading-snug flex-1 line-clamp-2">
            {task.title}
          </h4>
        </div>

        {task.description && (
          <p className="text-xs text-gray-500 mb-2 line-clamp-2 ml-6">{task.description}</p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-2.5 ml-6">
          <PriorityBadge priority={task.priority} />
          <CategoryTag category={task.category} />
        </div>

        <div className="flex items-center justify-between ml-6">
          <div className="flex items-center gap-2">
            <AssigneeAvatar name={task.assignee} />
            {task.assignee !== "Unassigned" && (
              <span className="text-[11px] text-gray-500 truncate max-w-[80px]">{task.assignee}</span>
            )}
          </div>
          <DueDateLabel date={task.dueDate} status={task.status} />
        </div>
      </div>
    );
  }

  // -----------------------------------------------------------------------
  // Kanban Board
  // -----------------------------------------------------------------------

  const kanbanBoard = (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {STATUSES.map((status) => {
          const col = COLUMN_COLORS[status];
          const columnTasks = filteredTasks.filter((t) => t.status === status);
          const isOver = dragOverColumn === status;

          return (
            <div
              key={status}
              className={cn(
                "kanban-column rounded-xl border transition-all duration-200",
                isOver ? "border-wine-300 ring-2 ring-wine-200 scale-[1.01]" : "border-gray-200",
                col.bg
              )}
              onDragOver={(e) => handleDragOver(e, status)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, status)}
            >
              {/* Column Header */}
              <div className="relative overflow-hidden rounded-t-xl">
                <div className={cn("h-1.5", col.strip)} />
                <div className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    <h3 className={cn("text-sm font-bold", col.text)}>
                      {TASK_STATUS_LABELS[status]}
                    </h3>
                    <span
                      className={cn(
                        "text-[11px] font-semibold px-2 py-0.5 rounded-full",
                        col.badge
                      )}
                    >
                      {columnTasks.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Cards */}
              <div className="px-3 pb-3 space-y-2 min-h-[100px]">
                {columnTasks.length === 0 && (
                  <div className="flex items-center justify-center h-24 rounded-lg border-2 border-dashed border-gray-200 text-xs text-gray-400">
                    Drop tasks here
                  </div>
                )}
                {columnTasks.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </div>
          );
        })}
      </div>
  );

  // -----------------------------------------------------------------------
  // List View
  // -----------------------------------------------------------------------

  const taskSortHeader = (field: typeof sortField, children: React.ReactNode) => {
    const active = sortField === field;
    return (
      <button
        onClick={() => toggleSort(field)}
        className={cn(
          "flex items-center gap-1 text-xs font-semibold uppercase tracking-wider",
          active ? "text-wine-700" : "text-gray-400 hover:text-gray-600"
        )}
      >
        {children}
        {active && <span className="text-wine-500">{sortDir === "asc" ? "\u2191" : "\u2193"}</span>}
      </button>
    );
  };

  const listView = (
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {/* Table Header */}
        <div className="grid grid-cols-[1fr_100px_110px_120px_120px_100px_40px] gap-2 px-4 py-3 border-b border-gray-100 bg-gray-50/80">
          {taskSortHeader("title", "Task")}
          {taskSortHeader("status", "Status")}
          {taskSortHeader("priority", "Priority")}
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Category</div>
          <div className="text-xs font-semibold uppercase tracking-wider text-gray-400">Assignee</div>
          {taskSortHeader("dueDate", "Due")}
          <div />
        </div>

        {/* Rows */}
        {sortedTasks.length === 0 ? (
          <div className="py-16 text-center text-gray-400 text-sm">
            No tasks match your filters.
          </div>
        ) : (
          sortedTasks.map((task) => {
            const statusCol = COLUMN_COLORS[task.status];
            return (
              <div
                key={task.id}
                onClick={() => openEditTask(task)}
                className="grid grid-cols-[1fr_100px_110px_120px_120px_100px_40px] gap-2 px-4 py-3 border-b border-gray-50 hover:bg-cream-50 cursor-pointer transition-colors group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <GripVertical className="w-4 h-4 text-gray-300 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  <span className="text-sm font-medium text-gray-900 truncate">{task.title}</span>
                </div>
                <div>
                  <span className={cn("status-badge text-[11px]", statusCol.badge)}>
                    {TASK_STATUS_LABELS[task.status]}
                  </span>
                </div>
                <div>
                  <PriorityBadge priority={task.priority} />
                </div>
                <div>
                  <CategoryTag category={task.category} />
                </div>
                <div className="flex items-center gap-1.5">
                  <AssigneeAvatar name={task.assignee} />
                  <span className="text-xs text-gray-500 truncate">{task.assignee}</span>
                </div>
                <div className="flex items-center">
                  <DueDateLabel date={task.dueDate} status={task.status} />
                </div>
                <div className="flex items-center justify-center">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeleteConfirm(task.id);
                    }}
                    className="p-1 rounded text-gray-300 hover:text-red-500 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
  );

  // -----------------------------------------------------------------------
  // Main Render
  // -----------------------------------------------------------------------

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 className="w-8 h-8 animate-spin text-wine-400" />
        <span className="ml-3 text-gray-500">Loading tasks...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-wine-600 to-wine-800 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-wine-950">Task Management</h1>
            <p className="text-sm text-gray-500">
              {tasks.length} task{tasks.length !== 1 ? "s" : ""} &middot;{" "}
              {tasks.filter((t) => t.status === "done").length} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Filter Toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={cn(
              "relative inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium border transition-colors",
              showFilters || activeFilterCount > 0
                ? "bg-wine-50 border-wine-200 text-wine-700"
                : "bg-white border-gray-200 text-gray-600 hover:bg-gray-50"
            )}
          >
            <Filter className="w-4 h-4" />
            <span className="hidden sm:inline">Filter</span>
            {activeFilterCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-wine-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>

          {/* View Toggle */}
          <div className="flex items-center rounded-lg border border-gray-200 bg-white overflow-hidden">
            <button
              onClick={() => setView("kanban")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                view === "kanban"
                  ? "bg-wine-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
              <span className="hidden sm:inline">Board</span>
            </button>
            <button
              onClick={() => setView("list")}
              className={cn(
                "flex items-center gap-1.5 px-3 py-2 text-sm font-medium transition-colors",
                view === "list"
                  ? "bg-wine-600 text-white"
                  : "text-gray-500 hover:bg-gray-50"
              )}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">List</span>
            </button>
          </div>

          {/* New Task */}
          <button
            onClick={openNewTask}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-gradient-to-r from-wine-600 to-wine-700 text-white text-sm font-semibold shadow-sm hover:from-wine-700 hover:to-wine-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            New Task
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      {showFilters && (
        <div className="flex flex-wrap items-center gap-3 p-4 rounded-xl bg-white border border-gray-200 animate-fade-in">
          <div className="flex items-center gap-1.5 text-sm text-gray-500">
            <Filter className="w-4 h-4" />
            <span className="font-medium">Filters:</span>
          </div>

          <select
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
          >
            <option value="">All Assignees</option>
            {TEAM_MEMBERS.map((m) => (
              <option key={m} value={m}>
                {m}
              </option>
            ))}
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
          >
            <option value="">All Priorities</option>
            {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
              <option key={p} value={p}>
                {TASK_PRIORITY_LABELS[p]}
              </option>
            ))}
          </select>

          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm text-gray-700 bg-white focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
          >
            <option value="">All Categories</option>
            {(Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((c) => (
              <option key={c} value={c}>
                {TASK_CATEGORY_LABELS[c]}
              </option>
            ))}
          </select>

          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="inline-flex items-center gap-1 px-2 py-1 rounded text-xs font-medium text-wine-600 hover:bg-wine-50 transition-colors"
            >
              <X className="w-3 h-3" />
              Clear
            </button>
          )}
        </div>
      )}

      {/* Empty State */}
      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 animate-fade-in">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-wine-100 to-wine-200 flex items-center justify-center mb-6">
            <CheckSquare className="w-10 h-10 text-wine-400" />
          </div>
          <h2 className="text-xl font-bold text-wine-900 mb-2">No tasks yet</h2>
          <p className="text-sm text-gray-500 mb-6 max-w-sm text-center">
            Start planning Fullerton Uncorked by adding your first task.
            Organize work across venues, sponsors, vendors, and more.
          </p>
          <button
            onClick={openNewTask}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-wine-600 to-wine-700 text-white text-sm font-semibold shadow-sm hover:from-wine-700 hover:to-wine-800 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create First Task
          </button>
        </div>
      ) : (
        <>
          {view === "kanban" ? kanbanBoard : listView}
        </>
      )}

      {/* Task Modal */}
      {showModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-overlay animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowModal(false);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-lg font-bold text-wine-950">
                {editingTask ? "Edit Task" : "New Task"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-5 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Confirm venue deposit"
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300 placeholder:text-gray-400"
                  autoFocus
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  placeholder="Details about the task..."
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300 placeholder:text-gray-400 resize-none"
                />
              </div>

              {/* Status & Priority */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <Flag className="w-3.5 h-3.5 inline mr-1" />
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as TaskStatus })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {TASK_STATUS_LABELS[s]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
                  >
                    {(Object.keys(TASK_PRIORITY_LABELS) as TaskPriority[]).map((p) => (
                      <option key={p} value={p}>
                        {TASK_PRIORITY_LABELS[p]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Category & Assignee */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <Tag className="w-3.5 h-3.5 inline mr-1" />
                    Category
                  </label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
                  >
                    {(Object.keys(TASK_CATEGORY_LABELS) as TaskCategory[]).map((c) => (
                      <option key={c} value={c}>
                        {TASK_CATEGORY_LABELS[c]}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    <User className="w-3.5 h-3.5 inline mr-1" />
                    Assignee
                  </label>
                  <select
                    value={form.assignee}
                    onChange={(e) => setForm({ ...form, assignee: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
                  >
                    {TEAM_MEMBERS.map((m) => (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  <Calendar className="w-3.5 h-3.5 inline mr-1" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-wine-200 focus:border-wine-300"
                />
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
              <div>
                {editingTask && (
                  <button
                    onClick={() => setDeleteConfirm(editingTask.id)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                    Delete
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={!form.title.trim()}
                  className={cn(
                    "px-5 py-2 rounded-lg text-sm font-semibold text-white transition-all",
                    form.title.trim()
                      ? "bg-gradient-to-r from-wine-600 to-wine-700 hover:from-wine-700 hover:to-wine-800 shadow-sm"
                      : "bg-gray-300 cursor-not-allowed"
                  )}
                >
                  {editingTask ? "Save Changes" : "Create Task"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center p-4 modal-overlay animate-fade-in"
          onClick={() => setDeleteConfirm(null)}
        >
          <div
            className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 animate-slide-in"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Delete Task</h3>
                <p className="text-sm text-gray-500">This action cannot be undone.</p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
