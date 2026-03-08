import Link from "next/link";
import { Scale, Shield, Globe, FileText, Clock, Landmark, Users, Briefcase } from "lucide-react";

const features = [
  {
    icon: Briefcase,
    title: "Case Management",
    description: "Track immigration cases from intake to resolution with customizable workflows and status tracking.",
  },
  {
    icon: FileText,
    title: "USCIS Form Tracking",
    description: "Manage 23+ USCIS/EOIR forms with status pipeline, RFE alerts, and receipt number tracking.",
  },
  {
    icon: Globe,
    title: "Visa & Status Monitoring",
    description: "Track visa expirations, work authorization, and priority dates with automated alerts.",
  },
  {
    icon: Shield,
    title: "Detainee Management",
    description: "Track detained clients across facilities with bond status, transfer history, and communication logs.",
  },
  {
    icon: Clock,
    title: "Time & Billing",
    description: "Built-in timer, time entries, invoicing, and payment tracking with multiple billing types.",
  },
  {
    icon: Landmark,
    title: "IOLTA Trust Accounting",
    description: "Compliant trust accounting with three-way reconciliation and negative balance protection.",
  },
  {
    icon: Users,
    title: "Client Portal",
    description: "Secure portal for clients to upload documents, check case status, and communicate with attorneys.",
  },
  {
    icon: Scale,
    title: "Calendar & Deadlines",
    description: "Track court hearings, filing deadlines, and visa expirations with escalating reminders.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-8 w-8 text-blue-400" />
            <span className="text-2xl font-bold text-white">LegalFlow</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-slate-300 hover:text-white transition-colors text-sm"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-4 py-1.5 mb-8">
          <Globe className="h-4 w-4 text-blue-400" />
          <span className="text-sm text-blue-300">Built for Immigration Law</span>
        </div>
        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight">
          Practice Management<br />
          <span className="text-blue-400">for Immigration Attorneys</span>
        </h1>
        <p className="text-xl text-slate-400 max-w-2xl mx-auto mb-10">
          Track cases, manage USCIS forms, monitor visa expirations, handle trust
          accounting, and serve clients — all in one platform designed specifically
          for immigration law practices.
        </p>
        <div className="flex items-center justify-center gap-4">
          <Link
            href="/register"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
          >
            Start Free Trial
          </Link>
          <Link
            href="/login"
            className="border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white px-8 py-3 rounded-lg font-medium transition-colors text-lg"
          >
            Sign In
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl font-bold text-white text-center mb-4">
          Everything Your Immigration Practice Needs
        </h2>
        <p className="text-slate-400 text-center mb-16 max-w-2xl mx-auto">
          Purpose-built tools for immigration attorneys, from USCIS form tracking to
          detainee management and IOLTA compliance.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/30 transition-colors"
            >
              <div className="bg-blue-500/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4">
                <feature.icon className="h-6 w-6 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 rounded-2xl p-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            Ready to Streamline Your Practice?
          </h2>
          <p className="text-blue-100 mb-8 max-w-xl mx-auto">
            Join immigration law firms using LegalFlow to manage cases more efficiently,
            meet every deadline, and serve clients better.
          </p>
          <Link
            href="/register"
            className="bg-white text-blue-700 px-8 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors inline-block"
          >
            Get Started Today
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-700/50 py-8">
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-slate-500" />
            <span className="text-slate-500 text-sm">LegalFlow</span>
          </div>
          <p className="text-slate-500 text-sm">
            &copy; {new Date().getFullYear()} LegalFlow. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
