import { SignIn } from "@clerk/nextjs";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Fullerton Rotary Club</h1>
          <p className="text-gray-500 mt-1">Member Portal</p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
