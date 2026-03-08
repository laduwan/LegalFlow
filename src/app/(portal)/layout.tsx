"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Scale,
  Briefcase,
  FileText,
  MessageSquare,
  Receipt,
  Menu,
  X,
  Phone,
  Mail,
  MapPin,
} from "lucide-react";
import { cn } from "@/lib/utils";

const portalNav = [
  { href: "/portal", label: "My Cases", icon: Briefcase },
  { href: "/portal/documents", label: "Documents", icon: FileText },
  { href: "/portal/messages", label: "Messages", icon: MessageSquare },
  { href: "/portal/invoices", label: "Invoices", icon: Receipt },
];

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex flex-col bg-blue-50/30">
      {/* Header */}
      <header className="bg-white border-b border-blue-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">
            {/* Branding */}
            <Link href="/portal" className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600">
                <Scale className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold text-blue-900">
                  LegalFlow
                </span>
                <span className="text-xs text-blue-500 block -mt-1">
                  Client Portal
                </span>
              </div>
            </Link>

            {/* Desktop navigation */}
            <nav className="hidden md:flex items-center gap-1">
              {portalNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/portal" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-800"
                        : "text-slate-600 hover:bg-blue-50 hover:text-blue-700"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>

            {/* Mobile menu button */}
            <button
              className="md:hidden p-2 text-slate-600 hover:bg-blue-50 rounded-lg"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>

          {/* Mobile navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden border-t border-blue-100 py-2 pb-3">
              {portalNav.map((item) => {
                const isActive =
                  pathname === item.href ||
                  (item.href !== "/portal" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-2 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                      isActive
                        ? "bg-blue-100 text-blue-800"
                        : "text-slate-600 hover:bg-blue-50"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 max-w-6xl mx-auto w-full px-4 sm:px-6 py-8">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-blue-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Scale className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-slate-800">
                  LegalFlow Immigration Law
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Dedicated to protecting your immigration rights.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <Phone className="h-3.5 w-3.5" />
                (555) 123-4567
              </div>
              <div className="flex items-center gap-1.5">
                <Mail className="h-3.5 w-3.5" />
                info@legalflow.com
              </div>
              <div className="flex items-center gap-1.5">
                <MapPin className="h-3.5 w-3.5" />
                123 Main Street, Suite 400, Miami, FL 33101
              </div>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-400">
              &copy; {new Date().getFullYear()} LegalFlow. All rights reserved.
              This is a secure portal. Do not share your login credentials.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
