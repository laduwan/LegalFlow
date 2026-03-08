"use client";

import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, LogOut, Menu, Search } from "lucide-react";
import { getInitials } from "@/lib/utils";

interface HeaderProps {
  onMenuClick?: () => void;
}

const routeTitles: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/dashboard/matters": "Matters",
  "/dashboard/contacts": "Contacts",
  "/dashboard/immigration/forms": "Immigration Forms",
  "/dashboard/immigration/detainees": "Detainees",
  "/dashboard/immigration/visas": "Visa Tracking",
  "/dashboard/calendar": "Calendar",
  "/dashboard/documents": "Documents",
  "/dashboard/time-entries": "Time Entries",
  "/dashboard/invoices": "Invoices",
  "/dashboard/trust-accounting": "Trust Accounting",
  "/dashboard/settings": "Settings",
  "/dashboard/settings/connections": "Connections",
};

function getPageTitle(pathname: string): string {
  // Check exact match first
  if (routeTitles[pathname]) return routeTitles[pathname];

  // Check for partial match (e.g., /dashboard/matters/123)
  const segments = pathname.split("/");
  while (segments.length > 1) {
    segments.pop();
    const parent = segments.join("/");
    if (routeTitles[parent]) return routeTitles[parent];
  }

  return "Dashboard";
}

export function Header({ onMenuClick }: HeaderProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user as any;

  const pageTitle = getPageTitle(pathname);
  const initials = getInitials(user?.firstName, user?.lastName);
  const displayName = user
    ? `${user.firstName || ""} ${user.lastName || ""}`.trim()
    : "";
  const role = user?.role || "";

  return (
    <header className="flex h-16 shrink-0 items-center gap-4 border-b border-slate-200 bg-white px-4 lg:px-6">
      {/* Mobile menu button */}
      <button
        onClick={onMenuClick}
        className="rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700 lg:hidden"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Page title */}
      <h1 className="text-lg font-semibold text-slate-900">{pageTitle}</h1>

      {/* Spacer */}
      <div className="flex-1" />

      {/* Search */}
      <div className="hidden w-72 md:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <Input
            type="search"
            placeholder="Search matters, contacts..."
            className="pl-9"
          />
        </div>
      </div>

      {/* Notification bell */}
      <button className="relative rounded-md p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-700">
        <Bell className="h-5 w-5" />
        <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-500" />
      </button>

      {/* User menu */}
      <div className="flex items-center gap-3 border-l border-slate-200 pl-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-medium text-white">
          {initials}
        </div>
        <div className="hidden md:block">
          <p className="text-sm font-medium text-slate-900">{displayName}</p>
          <p className="text-xs text-slate-500">{role}</p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: "/login" })}
          title="Sign out"
          className="text-slate-500 hover:text-slate-700"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
