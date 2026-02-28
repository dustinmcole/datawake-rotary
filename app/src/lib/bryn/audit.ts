import { createMessage } from "@/lib/queries/chat";
import { generateId } from "@/lib/utils";

export async function logToolExecution(params: {
  userId: string;
  threadId: string;
  toolName: string;
  args: Record<string, unknown>;
  result: unknown;
}): Promise<void> {
  try {
    await createMessage({
      id: generateId(),
      threadId: params.threadId,
      role: "assistant",
      content: `[Tool: ${params.toolName}]`,
      toolCalls: JSON.stringify([
        {
          name: params.toolName,
          args: params.args,
          result: params.result,
          timestamp: new Date().toISOString(),
          userId: params.userId,
        },
      ]),
    });
  } catch (err) {
    console.error("[bryn/audit] Failed to log tool execution:", err);
  }
}
