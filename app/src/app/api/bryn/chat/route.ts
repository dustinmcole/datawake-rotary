import { NextRequest } from "next/server";
import { streamText, stepCountIs, type ModelMessage } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { auth } from "@clerk/nextjs/server";
import { getUserByClerkId, parseUserRoles } from "@/lib/queries/users";
import { buildSystemPrompt } from "@/lib/bryn/system-prompt";
import { getToolsForContext, getToolNames } from "@/lib/bryn/tools";
import { logToolExecution } from "@/lib/bryn/audit";

export async function POST(req: NextRequest) {
  const { userId: clerkId } = await auth();
  if (!clerkId) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const dbUser = await getUserByClerkId(clerkId);
  if (!dbUser) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await req.json();
  const {
    messages,
    agentContext = "member",
    threadId,
  } = body as {
    messages: ModelMessage[];
    agentContext?: string;
    threadId?: string;
  };

  const userRoles = parseUserRoles(dbUser);
  const userName = `${dbUser.firstName ?? ""} ${dbUser.lastName ?? ""}`.trim() || "Member";

  // Check if the last user message is a confirmation
  const lastMessage = messages[messages.length - 1];
  const isConfirmation =
    lastMessage?.role === "user" &&
    typeof lastMessage.content === "string" &&
    /\b(yes|confirm|proceed|go ahead|do it|approved?)\b/i.test(lastMessage.content);

  const toolNames = getToolNames(agentContext, userRoles);
  const systemPrompt = buildSystemPrompt({
    agentContext: agentContext as "member" | "website" | "operations" | "uncorked",
    userName,
    userRoles,
    toolNames,
  });

  const tools = getToolsForContext(agentContext, userRoles, {
    userId: dbUser.id,
    isConfirmation,
  });

  const result = streamText({
    model: anthropic("claude-sonnet-4-6"),
    system: systemPrompt,
    messages,
    tools,
    stopWhen: stepCountIs(5),
    onStepFinish: async ({ toolCalls }) => {
      if (!toolCalls || toolCalls.length === 0 || !threadId) return;
      for (const tc of toolCalls) {
        if ("input" in tc) {
          await logToolExecution({
            userId: dbUser.id,
            threadId,
            toolName: tc.toolName,
            args: (tc.input ?? {}) as Record<string, unknown>,
            result: null,
          });
        }
      }
    },
  });

  return result.toTextStreamResponse();
}
