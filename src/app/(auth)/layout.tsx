import { Scale } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="flex items-center space-x-2">
            <Scale className="h-10 w-10 text-amber-500" />
            <span className="text-3xl font-bold text-white tracking-tight">
              LegalFlow
            </span>
          </div>
          <p className="text-sm text-slate-400">
            Modern Legal Practice Management
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 shadow-2xl backdrop-blur">
          {children}
        </div>
        <p className="text-center text-xs text-slate-500">
          &copy; {new Date().getFullYear()} LegalFlow. All rights reserved.
        </p>
      </div>
    </div>
  );
}
