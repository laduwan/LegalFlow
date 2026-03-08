"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Building2,
  Users,
  Shield,
  Link2,
  Bell,
  Palette,
  FileText,
  Globe,
  ChevronRight,
  Mail,
  Phone,
  MapPin,
  Clock,
} from "lucide-react";

const settingsSections = [
  {
    title: "Firm Profile",
    description: "Manage your firm's name, address, logo, and contact information",
    icon: Building2,
    href: "/settings",
    current: true,
  },
  {
    title: "Team Members",
    description: "Invite and manage attorneys, paralegals, and staff",
    icon: Users,
    href: "/settings",
  },
  {
    title: "Roles & Permissions",
    description: "Configure role-based access control for your team",
    icon: Shield,
    href: "/settings",
  },
  {
    title: "Connections & Integrations",
    description: "View and manage all external service connections and API integrations",
    icon: Link2,
    href: "/settings/connections",
    badge: "9 services",
  },
  {
    title: "Notifications",
    description: "Configure email, in-app, and deadline alert preferences",
    icon: Bell,
    href: "/settings",
  },
  {
    title: "Templates",
    description: "Manage document templates, form templates, and email templates",
    icon: FileText,
    href: "/settings",
  },
  {
    title: "Client Portal",
    description: "Configure portal branding, access settings, and document sharing rules",
    icon: Globe,
    href: "/settings",
  },
  {
    title: "Appearance",
    description: "Customize the look and feel of your LegalFlow instance",
    icon: Palette,
    href: "/settings",
  },
];

const demoFirm = {
  name: "Rodriguez & Associates Immigration Law",
  email: "info@rodriguezimmigration.com",
  phone: "(305) 555-0142",
  address: "1200 Brickell Avenue, Suite 400, Miami, FL 33131",
  website: "www.rodriguezimmigration.com",
  timezone: "America/New_York",
  trustState: "FL",
};

const teamMembers = [
  { name: "Maria Rodriguez", email: "maria@rodriguezimmigration.com", role: "ADMIN", status: "active" },
  { name: "Carlos Mendez", email: "carlos@rodriguezimmigration.com", role: "ATTORNEY", status: "active" },
  { name: "Ana Gutierrez", email: "ana@rodriguezimmigration.com", role: "PARALEGAL", status: "active" },
  { name: "David Chen", email: "david@rodriguezimmigration.com", role: "LEGAL_ASSISTANT", status: "active" },
  { name: "Sarah Johnson", email: "sarah@rodriguezimmigration.com", role: "ATTORNEY", status: "invited" },
];

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState("firm");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="text-slate-500 mt-1">Manage your firm settings and integrations</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {settingsSections.map((section) => (
          <Link key={section.title} href={section.href}>
            <Card className={`hover:shadow-md transition-shadow cursor-pointer h-full ${section.current ? "ring-2 ring-blue-500" : ""}`}>
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-slate-100 rounded-lg">
                      <section.icon className="h-5 w-5 text-slate-700" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                        {section.title}
                        {section.badge && (
                          <Badge variant="secondary" className="text-xs">{section.badge}</Badge>
                        )}
                      </h3>
                      <p className="text-sm text-slate-500 mt-1">{section.description}</p>
                    </div>
                  </div>
                  <ChevronRight className="h-5 w-5 text-slate-400 flex-shrink-0" />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Firm Profile Section */}
      <Card>
        <CardHeader>
          <CardTitle>Firm Profile</CardTitle>
          <CardDescription>Your firm&apos;s core information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-sm font-medium text-slate-700">Firm Name</label>
              <Input defaultValue={demoFirm.name} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Website</label>
              <Input defaultValue={demoFirm.website} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Mail className="h-4 w-4" /> Email
              </label>
              <Input defaultValue={demoFirm.email} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Phone className="h-4 w-4" /> Phone
              </label>
              <Input defaultValue={demoFirm.phone} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <MapPin className="h-4 w-4" /> Address
              </label>
              <Input defaultValue={demoFirm.address} className="mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700 flex items-center gap-2">
                <Clock className="h-4 w-4" /> Timezone
              </label>
              <select className="mt-1 w-full rounded-md border border-slate-200 px-3 py-2 text-sm">
                <option value="America/New_York">Eastern (America/New_York)</option>
                <option value="America/Chicago">Central (America/Chicago)</option>
                <option value="America/Denver">Mountain (America/Denver)</option>
                <option value="America/Los_Angeles">Pacific (America/Los_Angeles)</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium text-slate-700">Trust Account State (IOLTA)</label>
              <Input defaultValue={demoFirm.trustState} className="mt-1" />
            </div>
          </div>
          <div className="flex justify-end">
            <Button>Save Changes</Button>
          </div>
        </CardContent>
      </Card>

      {/* Team Members */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Team Members</CardTitle>
            <CardDescription>{teamMembers.length} members</CardDescription>
          </div>
          <Button size="sm">Invite Member</Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {teamMembers.map((member) => (
              <div key={member.email} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-full bg-slate-200 flex items-center justify-center text-sm font-medium text-slate-700">
                    {member.name.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">{member.name}</p>
                    <p className="text-xs text-slate-500">{member.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={member.status === "active" ? "default" : "outline"}>
                    {member.status === "active" ? member.role.replace("_", " ") : "Invited"}
                  </Badge>
                  <Button variant="ghost" size="sm">Edit</Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
