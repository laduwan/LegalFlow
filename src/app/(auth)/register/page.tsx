"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle, Loader2 } from "lucide-react";

interface FormData {
  organizationName: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function RegisterPage() {
  const router = useRouter();

  const [formData, setFormData] = useState<FormData>({
    organizationName: "",
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.organizationName.trim()) {
      newErrors.organizationName = "Organization name is required";
    }
    if (!formData.firstName.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = "Last name is required";
    }
    if (!formData.email.trim()) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationName: formData.organizationName,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setServerError(data.error || "Registration failed. Please try again.");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fieldConfig = [
    {
      name: "organizationName",
      label: "Organization / Firm Name",
      type: "text",
      placeholder: "Acme Law Group",
      colSpan: "full",
    },
    {
      name: "firstName",
      label: "First Name",
      type: "text",
      placeholder: "Jane",
      colSpan: "half",
    },
    {
      name: "lastName",
      label: "Last Name",
      type: "text",
      placeholder: "Doe",
      colSpan: "half",
    },
    {
      name: "email",
      label: "Email",
      type: "email",
      placeholder: "jane@lawfirm.com",
      colSpan: "full",
    },
    {
      name: "password",
      label: "Password",
      type: "password",
      placeholder: "Minimum 8 characters",
      colSpan: "half",
    },
    {
      name: "confirmPassword",
      label: "Confirm Password",
      type: "password",
      placeholder: "Re-enter password",
      colSpan: "half",
    },
  ];

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-white">
          Create your account
        </h1>
        <p className="text-sm text-slate-400">
          Set up your organization and admin account
        </p>
      </div>

      {serverError && (
        <div className="flex items-center gap-2 rounded-md border border-red-800 bg-red-950/50 p-3 text-sm text-red-400">
          <AlertCircle className="h-4 w-4 shrink-0" />
          {serverError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          {fieldConfig.map((field) => (
            <div
              key={field.name}
              className={`space-y-2 ${
                field.colSpan === "full" ? "col-span-2" : "col-span-1"
              }`}
            >
              <Label htmlFor={field.name} className="text-slate-300">
                {field.label}
              </Label>
              <Input
                id={field.name}
                name={field.name}
                type={field.type}
                placeholder={field.placeholder}
                value={formData[field.name as keyof FormData]}
                onChange={handleChange}
                disabled={isLoading}
                className="border-slate-700 bg-slate-800 text-white placeholder:text-slate-500 focus-visible:ring-amber-500"
              />
              {errors[field.name] && (
                <p className="text-xs text-red-400">{errors[field.name]}</p>
              )}
            </div>
          ))}
        </div>

        <Button
          type="submit"
          disabled={isLoading}
          className="w-full bg-amber-600 text-white hover:bg-amber-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>

      <p className="text-center text-sm text-slate-400">
        Already have an account?{" "}
        <Link
          href="/login"
          className="font-medium text-amber-500 hover:text-amber-400"
        >
          Sign in
        </Link>
      </p>
    </div>
  );
}
