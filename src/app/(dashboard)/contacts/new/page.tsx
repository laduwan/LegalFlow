"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { COUNTRIES, LANGUAGES, IMMIGRATION_STATUSES } from "@/lib/constants";

// ---------------------------------------------------------------------------
// Constants for dropdowns
// ---------------------------------------------------------------------------

const CONTACT_TYPES = [
  { value: "CLIENT", label: "Client" },
  { value: "OPPOSING_PARTY", label: "Opposing Party" },
  { value: "WITNESS", label: "Witness" },
  { value: "EXPERT", label: "Expert" },
  { value: "COURT", label: "Court" },
  { value: "MEDICAL_PROVIDER", label: "Medical Provider" },
  { value: "INSURANCE", label: "Insurance" },
  { value: "GOVERNMENT_AGENCY", label: "Government Agency" },
  { value: "OTHER", label: "Other" },
];

const COMMUNICATION_PREFERENCES = [
  { value: "email", label: "Email" },
  { value: "phone", label: "Phone" },
  { value: "mail", label: "Mail" },
  { value: "text", label: "Text Message" },
];

// ---------------------------------------------------------------------------
// Form state type
// ---------------------------------------------------------------------------

interface ContactForm {
  type: string;
  firstName: string;
  middleName: string;
  lastName: string;
  suffix: string;
  preferredName: string;
  companyName: string;
  email: string;
  phone: string;
  altPhone: string;
  fax: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  language: string;
  communicationPreference: string;
  aNumber: string;
  dateOfBirth: string;
  countryOfBirth: string;
  countryOfCitizenship: string;
  currentImmigrationStatus: string;
  entryDate: string;
  visaExpirationDate: string;
  workAuthExpiration: string;
  passportNumber: string;
  passportExpiration: string;
}

const initialForm: ContactForm = {
  type: "CLIENT",
  firstName: "",
  middleName: "",
  lastName: "",
  suffix: "",
  preferredName: "",
  companyName: "",
  email: "",
  phone: "",
  altPhone: "",
  fax: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  zipCode: "",
  country: "US",
  language: "en",
  communicationPreference: "email",
  aNumber: "",
  dateOfBirth: "",
  countryOfBirth: "",
  countryOfCitizenship: "",
  currentImmigrationStatus: "",
  entryDate: "",
  visaExpirationDate: "",
  workAuthExpiration: "",
  passportNumber: "",
  passportExpiration: "",
};

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

interface FormErrors {
  [key: string]: string;
}

function validate(form: ContactForm): FormErrors {
  const errors: FormErrors = {};
  if (!form.firstName.trim()) errors.firstName = "First name is required";
  if (!form.lastName.trim()) errors.lastName = "Last name is required";
  if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
    errors.email = "Invalid email address";
  }
  if (form.aNumber && !/^A-?\d{3}-?\d{3}-?\d{3}$/i.test(form.aNumber)) {
    errors.aNumber = "A-Number must be in format A-XXX-XXX-XXX";
  }
  return errors;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function NewContactPage() {
  const router = useRouter();
  const [form, setForm] = useState<ContactForm>(initialForm);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  function updateField(field: keyof ContactForm, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  async function handleSave() {
    const validationErrors = validate(form);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create contact");
      }

      const created = await res.json();
      router.push(`/contacts/${created.id}`);
    } catch (err: any) {
      setErrors({ _form: err.message });
    } finally {
      setSaving(false);
    }
  }

  function fieldInput(
    field: keyof ContactForm,
    label: string,
    opts?: { type?: string; placeholder?: string; required?: boolean }
  ) {
    return (
      <div className="space-y-1.5">
        <Label htmlFor={field}>
          {label}
          {opts?.required && <span className="text-red-500 ml-0.5">*</span>}
        </Label>
        <Input
          id={field}
          type={opts?.type ?? "text"}
          placeholder={opts?.placeholder}
          value={form[field]}
          onChange={(e) => updateField(field, e.target.value)}
          className={errors[field] ? "border-red-500 focus-visible:ring-red-500" : ""}
        />
        {errors[field] && (
          <p className="text-xs text-red-600">{errors[field]}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/contacts")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">New Contact</h1>
          <p className="text-sm text-slate-500">
            Add a new client or contact to your system.
          </p>
        </div>
      </div>

      {errors._form && (
        <div className="rounded-md bg-red-50 border border-red-200 p-4 text-sm text-red-800">
          {errors._form}
        </div>
      )}

      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Basic Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-1.5">
              <Label htmlFor="type">Contact Type</Label>
              <Select
                id="type"
                value={form.type}
                onChange={(e) => updateField("type", e.target.value)}
              >
                {CONTACT_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
            </div>
            {fieldInput("firstName", "First Name", { required: true, placeholder: "First name" })}
            {fieldInput("middleName", "Middle Name", { placeholder: "Middle name" })}
            {fieldInput("lastName", "Last Name", { required: true, placeholder: "Last name" })}
            {fieldInput("suffix", "Suffix", { placeholder: "Jr., Sr., III, etc." })}
            {fieldInput("preferredName", "Preferred Name", { placeholder: "Preferred / nickname" })}
            <div className="sm:col-span-2 lg:col-span-3">
              {fieldInput("companyName", "Company / Organization", { placeholder: "Company name (if applicable)" })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Contact Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            {fieldInput("email", "Email", { type: "email", placeholder: "email@example.com" })}
            {fieldInput("phone", "Phone", { type: "tel", placeholder: "(555) 555-0000" })}
            {fieldInput("altPhone", "Alternate Phone", { type: "tel", placeholder: "(555) 555-0000" })}
            {fieldInput("fax", "Fax", { type: "tel", placeholder: "(555) 555-0000" })}
          </div>
        </CardContent>
      </Card>

      {/* Address */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Address</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="sm:col-span-2 lg:col-span-3">
              {fieldInput("addressLine1", "Address Line 1", { placeholder: "Street address" })}
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              {fieldInput("addressLine2", "Address Line 2", { placeholder: "Apt, suite, unit, etc." })}
            </div>
            {fieldInput("city", "City", { placeholder: "City" })}
            {fieldInput("state", "State / Province", { placeholder: "State" })}
            {fieldInput("zipCode", "ZIP / Postal Code", { placeholder: "ZIP code" })}
            <div className="space-y-1.5">
              <Label htmlFor="country">Country</Label>
              <Select
                id="country"
                value={form.country}
                onChange={(e) => updateField("country", e.target.value)}
              >
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="language">Language</Label>
              <Select
                id="language"
                value={form.language}
                onChange={(e) => updateField("language", e.target.value)}
              >
                {LANGUAGES.map((l) => (
                  <option key={l.value} value={l.value}>
                    {l.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="communicationPreference">Communication Preference</Label>
              <Select
                id="communicationPreference"
                value={form.communicationPreference}
                onChange={(e) => updateField("communicationPreference", e.target.value)}
              >
                {COMMUNICATION_PREFERENCES.map((p) => (
                  <option key={p.value} value={p.value}>
                    {p.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Immigration Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Immigration Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fieldInput("aNumber", "A-Number", { placeholder: "A-XXX-XXX-XXX" })}
            {fieldInput("dateOfBirth", "Date of Birth", { type: "date" })}
            <div className="space-y-1.5">
              <Label htmlFor="countryOfBirth">Country of Birth</Label>
              <Select
                id="countryOfBirth"
                value={form.countryOfBirth}
                onChange={(e) => updateField("countryOfBirth", e.target.value)}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="countryOfCitizenship">Country of Citizenship</Label>
              <Select
                id="countryOfCitizenship"
                value={form.countryOfCitizenship}
                onChange={(e) => updateField("countryOfCitizenship", e.target.value)}
              >
                <option value="">Select country</option>
                {COUNTRIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="currentImmigrationStatus">Current Immigration Status</Label>
              <Select
                id="currentImmigrationStatus"
                value={form.currentImmigrationStatus}
                onChange={(e) => updateField("currentImmigrationStatus", e.target.value)}
              >
                <option value="">Select status</option>
                {IMMIGRATION_STATUSES.map((s) => (
                  <option key={s.value} value={s.value}>
                    {s.label}
                  </option>
                ))}
              </Select>
            </div>
            {fieldInput("entryDate", "Entry Date (US)", { type: "date" })}
            {fieldInput("visaExpirationDate", "Visa Expiration Date", { type: "date" })}
            {fieldInput("workAuthExpiration", "Work Authorization Expiration", { type: "date" })}
            {fieldInput("passportNumber", "Passport Number", { placeholder: "Passport number" })}
            {fieldInput("passportExpiration", "Passport Expiration Date", { type: "date" })}
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3 pb-8">
        <Button variant="outline" onClick={() => router.push("/contacts")}>
          Cancel
        </Button>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "Save Contact"}
        </Button>
      </div>
    </div>
  );
}
