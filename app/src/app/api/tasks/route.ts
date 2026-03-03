import { NextRequest, NextResponse } from "next/server";
import { getAllTasks, createTask } from "@/lib/queries/tasks";
import { generateId } from "@/lib/utils";
import { validate } from "@/lib/validations/api-validate";
import { createTaskSchema } from "@/lib/validations";

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
    const validated = validate(body, createTaskSchema);
    if (validated instanceof NextResponse) return validated;
    const { data } = validated;
    const task = await createTask({ ...data, id: generateId() });
    return NextResponse.json(task, { status: 201 });
  } catch (err) {
    console.error("POST /api/tasks error:", err);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
