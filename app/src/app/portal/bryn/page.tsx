import { Bot } from "lucide-react";

export default function BrynPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Ask Bryn</h1>
        <p className="text-sm text-gray-500">Chat with your AI club assistant</p>
      </div>
      <div className="rounded-xl border border-gray-200 bg-white p-12 text-center text-gray-400">
        <Bot className="mx-auto mb-3 h-10 w-10" />
        Ask Bryn coming soon.
      </div>
    </div>
  );
}
