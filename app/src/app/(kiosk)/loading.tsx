export default function KioskLoading() {
  return (
    <div className="bg-white min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full border-4 border-blue-600 border-t-transparent animate-spin" />
        <p className="text-gray-500 text-sm font-medium">Loading…</p>
      </div>
    </div>
  );
}
