import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, createTask } from "@/lib/queries/tasks";
import { generateId } from "@/lib/utils";

export async function GET() {
  try {
    const tasks = await getAllTasks();
    return NextResponse.json(tasks);
  } catch (err) {
    console.error("GET /api/tasks error:", err);
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const task = await createTask({
      ...body,
      id: body.id || generateId(),
    });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
