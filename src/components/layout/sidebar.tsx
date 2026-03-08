"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Briefcase,
  Users,
  FileText,
  Shield,
  Globe,
  Calendar,
  FolderOpen,
  Clock,
  Receipt,
  Landmark,
  ExternalLink,
  Settings,
  Link2,
  Scale,
  X,
} from "lucide-react";

interface SidebarProps {
  onClose?: () => void;
}

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface NavSection {
  heading: string;
  items: NavItem[];
}

const mainNavItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Matters", href: "/dashboard/matters", icon: Briefcase },
  { label: "Contacts", href: "/dashboard/contacts", icon: Users },
];

const immigrationSection: NavSection = {
  heading: "Immigration",
  items: [
    { label: "Forms", href: "/dashboard/immigration/forms", icon: FileText },
    {
      label: "Detainees",
      href: "/dashboard/immigration/detainees",
      icon: Shield,
    },
    {
      label: "Visa Tracking",
      href: "/dashboard/immigration/visas",
      icon: Globe,
    },
  ],
};

const middleNavItems: NavItem[] = [
  { label: "Calendar", href: "/dashboard/calendar", icon: Calendar },
  { label: "Documents", href: "/dashboard/documents", icon: FolderOpen },
];

const billingSection: NavSection = {
  heading: "Time & Billing",
  items: [
    {
      label: "Time Entries",
      href: "/dashboard/time-entries",
      icon: Clock,
    },
    { label: "Invoices", href: "/dashboard/invoices", icon: Receipt },
  ],
};

const bottomNavItems: NavItem[] = [
  {
    label: "Trust Accounting",
    href: "/dashboard/trust-accounting",
    icon: Landmark,
  },
  { label: "Client Portal", href: "/portal", icon: ExternalLink },
];

const settingsItems: NavItem[] = [
  { label: "Settings", href: "/dashboard/settings", icon: Settings },
  {
    label: "Connections",
    href: "/dashboard/settings/connections",
    icon: Link2,
  },
];

function NavLink({
  item,
  pathname,
  indented = false,
}: {
  item: NavItem;
  pathname: string;
  indented?: boolean;
}) {
  const isActive =
    pathname === item.href || pathname.startsWith(item.href + "/");
  const Icon = item.icon;

  return (
    <Link
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
        indented && "pl-9",
        isActive
          ? "bg-slate-800 text-amber-500"
          : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
      )}
    >
      <Icon className="h-4 w-4 shrink-0" />
      {item.label}
    </Link>
  );
}

function SectionHeading({ label }: { label: string }) {
  return (
    <p className="mb-1 mt-4 px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">
      {label}
    </p>
  );
}

export function Sidebar({ onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className="flex h-full flex-col bg-slate-900">
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-slate-800 px-4">
        <Link href="/dashboard" className="flex items-center gap-2">
          <Scale className="h-7 w-7 text-amber-500" />
          <span className="text-lg font-bold text-white tracking-tight">
            LegalFlow
          </span>
        </Link>
        <button
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:text-white lg:hidden"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-4">
        {/* Main nav */}
        {mainNavItems.map((item) => (
          <NavLink key={item.href} item={item} pathname={pathname} />
        ))}

        {/* Immigration section */}
        <SectionHeading label={immigrationSection.heading} />
        {immigrationSection.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            indented
          />
        ))}

        {/* Middle nav */}
        <div className="pt-2">
          {middleNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        {/* Time & Billing section */}
        <SectionHeading label={billingSection.heading} />
        {billingSection.items.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            indented
          />
        ))}

        {/* Bottom nav */}
        <div className="pt-2">
          {bottomNavItems.map((item) => (
            <NavLink key={item.href} item={item} pathname={pathname} />
          ))}
        </div>

        {/* Settings */}
        <SectionHeading label="Settings" />
        {settingsItems.map((item) => (
          <NavLink
            key={item.href}
            item={item}
            pathname={pathname}
            indented={item.label === "Connections"}
          />
        ))}
      </nav>
    </div>
  );
}
