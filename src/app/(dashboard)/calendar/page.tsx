"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MapPin,
  Calendar as CalendarIcon,
  AlertTriangle,
  Filter,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { EVENT_TYPES } from "@/lib/constants";
import { cn, formatDate, formatDateTime } from "@/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CalendarEvent {
  id: string;
  title: string;
  type: string;
  startDate: string;
  endDate: string;
  matterId?: string;
  matterName?: string;
  location: string;
  description: string;
  reminderDays: number;
}

// ---------------------------------------------------------------------------
// Demo data — events across March and April 2026
// ---------------------------------------------------------------------------

const demoEvents: CalendarEvent[] = [
  {
    id: "1",
    title: "Master Calendar Hearing - Garcia",
    type: "COURT_HEARING",
    startDate: "2026-03-09T09:00:00",
    endDate: "2026-03-09T10:00:00",
    matterId: "m5",
    matterName: "Garcia - Asylum",
    location: "Immigration Court, Room 3B",
    description: "Initial master calendar hearing for removal defense",
    reminderDays: 3,
  },
  {
    id: "2",
    title: "Client Consultation - Yamamoto",
    type: "CONSULTATION",
    startDate: "2026-03-10T10:30:00",
    endDate: "2026-03-10T11:30:00",
    matterName: "Yamamoto - Consultation",
    location: "Office - Conference Room A",
    description: "Initial consultation for O-1 visa petition",
    reminderDays: 1,
  },
  {
    id: "3",
    title: "USCIS Biometrics - Rodriguez",
    type: "DEADLINE",
    startDate: "2026-03-11T13:00:00",
    endDate: "2026-03-11T14:00:00",
    matterId: "m1",
    matterName: "Rodriguez - AOS",
    location: "USCIS Field Office, Miami",
    description: "Biometrics appointment for I-485",
    reminderDays: 2,
  },
  {
    id: "4",
    title: "Team Meeting - Case Review",
    type: "INTERNAL_MEETING",
    startDate: "2026-03-12T14:00:00",
    endDate: "2026-03-12T15:00:00",
    location: "Office - Main Conference Room",
    description: "Weekly team case review meeting",
    reminderDays: 0,
  },
  {
    id: "5",
    title: "Client Meeting - Patel Family",
    type: "CLIENT_MEETING",
    startDate: "2026-03-13T10:00:00",
    endDate: "2026-03-13T11:00:00",
    matterId: "m2",
    matterName: "Patel - H-1B Extension",
    location: "Office - Conference Room B",
    description: "Review H-1B extension petition documents",
    reminderDays: 1,
  },
  {
    id: "6",
    title: "RFE Response Deadline - Herrera",
    type: "FILING_DEADLINE",
    startDate: "2026-03-18T23:59:00",
    endDate: "2026-03-18T23:59:00",
    matterId: "m3",
    matterName: "Herrera - Family Based",
    location: "USCIS",
    description: "Deadline to respond to RFE for I-130 petition",
    reminderDays: 5,
  },
  {
    id: "7",
    title: "Patel EAD Expiration",
    type: "WORK_AUTH_EXPIRATION",
    startDate: "2026-03-22T00:00:00",
    endDate: "2026-03-22T23:59:00",
    matterId: "m2",
    matterName: "Patel - H-1B Extension",
    location: "",
    description: "Employment authorization document expires",
    reminderDays: 14,
  },
  {
    id: "8",
    title: "Client Meeting - Wei",
    type: "CLIENT_MEETING",
    startDate: "2026-03-20T15:00:00",
    endDate: "2026-03-20T16:00:00",
    matterId: "m4",
    matterName: "Wei - H-1B Transfer",
    location: "Video Call - Zoom",
    description: "Review employer petition letter draft",
    reminderDays: 1,
  },
  {
    id: "9",
    title: "Rodriguez H-1B Visa Expiration",
    type: "VISA_EXPIRATION",
    startDate: "2026-04-02T00:00:00",
    endDate: "2026-04-02T23:59:00",
    matterId: "m1",
    matterName: "Rodriguez - AOS",
    location: "",
    description: "H-1B visa expiration - AOS pending",
    reminderDays: 30,
  },
  {
    id: "10",
    title: "Individual Hearing - Garcia",
    type: "COURT_HEARING",
    startDate: "2026-04-07T09:30:00",
    endDate: "2026-04-07T12:00:00",
    matterId: "m5",
    matterName: "Garcia - Asylum",
    location: "Immigration Court, Room 3B",
    description: "Individual merits hearing for asylum claim",
    reminderDays: 7,
  },
  {
    id: "11",
    title: "I-485 Filing Deadline - Rodriguez",
    type: "FILING_DEADLINE",
    startDate: "2026-04-10T23:59:00",
    endDate: "2026-04-10T23:59:00",
    matterId: "m1",
    matterName: "Rodriguez - AOS",
    location: "USCIS Chicago Lockbox",
    description: "File adjustment of status application",
    reminderDays: 5,
  },
  {
    id: "12",
    title: "Team Meeting - Case Review",
    type: "INTERNAL_MEETING",
    startDate: "2026-03-19T14:00:00",
    endDate: "2026-03-19T15:00:00",
    location: "Office - Main Conference Room",
    description: "Weekly team case review",
    reminderDays: 0,
  },
  {
    id: "13",
    title: "Petrov L-1 Visa Expiration",
    type: "VISA_EXPIRATION",
    startDate: "2026-04-05T00:00:00",
    endDate: "2026-04-05T23:59:00",
    matterName: "Petrov - L-1 Extension",
    location: "",
    description: "L-1 visa expiration date",
    reminderDays: 30,
  },
  {
    id: "14",
    title: "Deposition - Garcia Asylum Witness",
    type: "DEPOSITION",
    startDate: "2026-03-25T10:00:00",
    endDate: "2026-03-25T12:00:00",
    matterId: "m5",
    matterName: "Garcia - Asylum",
    location: "Office - Conference Room A",
    description: "Expert witness deposition on country conditions",
    reminderDays: 3,
  },
  {
    id: "15",
    title: "Consultation - New Client Kim",
    type: "CONSULTATION",
    startDate: "2026-03-27T11:00:00",
    endDate: "2026-03-27T12:00:00",
    location: "Office - Conference Room A",
    description: "Initial consultation for EB-2 NIW",
    reminderDays: 1,
  },
];

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function getEventTypeColor(type: string): string {
  return EVENT_TYPES.find((t) => t.value === type)?.color ?? "#6B7280";
}

function getEventTypeLabel(type: string): string {
  return EVENT_TYPES.find((t) => t.value === type)?.label ?? type;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(d1: Date, d2: Date): boolean {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
}

function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function getWeekDates(date: Date): Date[] {
  const day = date.getDay();
  const start = new Date(date);
  start.setDate(start.getDate() - day);
  const dates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    dates.push(d);
  }
  return dates;
}

const HOURS = Array.from({ length: 14 }, (_, i) => i + 7); // 7 AM - 8 PM

// ---------------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------------

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<"month" | "week" | "day">("month");
  const [addEventOpen, setAddEventOpen] = useState(false);
  const [sidebarTypeFilter, setSidebarTypeFilter] = useState("");

  // Event form state
  const [eventTitle, setEventTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventStartDate, setEventStartDate] = useState("");
  const [eventStartTime, setEventStartTime] = useState("");
  const [eventEndDate, setEventEndDate] = useState("");
  const [eventEndTime, setEventEndTime] = useState("");
  const [eventMatter, setEventMatter] = useState("");
  const [eventLocation, setEventLocation] = useState("");
  const [eventDescription, setEventDescription] = useState("");
  const [eventReminderDays, setEventReminderDays] = useState("1");

  const currentYear = currentDate.getFullYear();
  const currentMonth = currentDate.getMonth();

  // Navigation
  function goToday() {
    setCurrentDate(new Date());
  }

  function goPrev() {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() - 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() - 7);
    } else {
      d.setDate(d.getDate() - 1);
    }
    setCurrentDate(d);
  }

  function goNext() {
    const d = new Date(currentDate);
    if (viewMode === "month") {
      d.setMonth(d.getMonth() + 1);
    } else if (viewMode === "week") {
      d.setDate(d.getDate() + 7);
    } else {
      d.setDate(d.getDate() + 1);
    }
    setCurrentDate(d);
  }

  // Upcoming events for sidebar (next 14 days)
  const upcomingEvents = useMemo(() => {
    const now = new Date();
    const twoWeeks = new Date(now);
    twoWeeks.setDate(twoWeeks.getDate() + 14);
    return demoEvents
      .filter((e) => {
        const start = new Date(e.startDate);
        if (start < now || start > twoWeeks) return false;
        if (sidebarTypeFilter && e.type !== sidebarTypeFilter) return false;
        return true;
      })
      .sort(
        (a, b) =>
          new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
      );
  }, [sidebarTypeFilter]);

  // Events for a specific date
  function eventsForDate(date: Date): CalendarEvent[] {
    return demoEvents.filter((e) => isSameDay(new Date(e.startDate), date));
  }

  function resetEventForm() {
    setEventTitle("");
    setEventType("");
    setEventStartDate("");
    setEventStartTime("");
    setEventEndDate("");
    setEventEndTime("");
    setEventMatter("");
    setEventLocation("");
    setEventDescription("");
    setEventReminderDays("1");
  }

  // Check if event type is immigration-specific expiration
  function isExpirationEvent(type: string): boolean {
    return type === "VISA_EXPIRATION" || type === "WORK_AUTH_EXPIRATION";
  }

  // ---------------------------------------------------------------------------
  // Month View
  // ---------------------------------------------------------------------------
  function renderMonthView() {
    const daysInMonth = getDaysInMonth(currentYear, currentMonth);
    const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
    const prevMonthDays = getDaysInMonth(currentYear, currentMonth - 1);

    const cells: { date: Date; isCurrentMonth: boolean }[] = [];

    // Previous month padding
    for (let i = firstDay - 1; i >= 0; i--) {
      const d = new Date(currentYear, currentMonth - 1, prevMonthDays - i);
      cells.push({ date: d, isCurrentMonth: false });
    }
    // Current month
    for (let day = 1; day <= daysInMonth; day++) {
      cells.push({
        date: new Date(currentYear, currentMonth, day),
        isCurrentMonth: true,
      });
    }
    // Next month padding
    const remaining = 42 - cells.length;
    for (let i = 1; i <= remaining; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
      });
    }

    return (
      <div className="border border-slate-200 rounded-lg overflow-hidden">
        {/* Day headers */}
        <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div
              key={d}
              className="px-2 py-2 text-xs font-medium text-slate-500 text-center"
            >
              {d}
            </div>
          ))}
        </div>
        {/* Date cells */}
        <div className="grid grid-cols-7">
          {cells.map((cell, idx) => {
            const dayEvents = eventsForDate(cell.date);
            const today = isToday(cell.date);
            return (
              <div
                key={idx}
                className={cn(
                  "min-h-[100px] border-b border-r border-slate-100 p-1",
                  !cell.isCurrentMonth && "bg-slate-50/50",
                  today && "bg-blue-50/50"
                )}
              >
                <div
                  className={cn(
                    "text-xs font-medium mb-1 w-6 h-6 flex items-center justify-center rounded-full",
                    today && "bg-blue-600 text-white",
                    !today && cell.isCurrentMonth && "text-slate-700",
                    !today && !cell.isCurrentMonth && "text-slate-400"
                  )}
                >
                  {cell.date.getDate()}
                </div>
                <div className="space-y-0.5">
                  {dayEvents.slice(0, 3).map((evt) => (
                    <div
                      key={evt.id}
                      className={cn(
                        "text-[10px] leading-tight px-1 py-0.5 rounded truncate font-medium",
                        isExpirationEvent(evt.type)
                          ? "border border-orange-300 bg-orange-50 text-orange-800 animate-pulse"
                          : "text-white"
                      )}
                      style={
                        !isExpirationEvent(evt.type)
                          ? { backgroundColor: getEventTypeColor(evt.type) }
                          : undefined
                      }
                      title={evt.title}
                    >
                      {evt.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div className="text-[10px] text-slate-400 px-1">
                      +{dayEvents.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Week View
  // ---------------------------------------------------------------------------
  function renderWeekView() {
    const weekDates = getWeekDates(currentDate);

    return (
      <div className="border border-slate-200 rounded-lg overflow-auto">
        {/* Day headers */}
        <div className="grid grid-cols-[60px_repeat(7,1fr)] bg-slate-50 border-b border-slate-200 sticky top-0 z-10">
          <div className="px-2 py-2 border-r border-slate-200" />
          {weekDates.map((date, i) => (
            <div
              key={i}
              className={cn(
                "px-2 py-2 text-center border-r border-slate-200",
                isToday(date) && "bg-blue-50"
              )}
            >
              <div className="text-[10px] text-slate-500 uppercase">
                {date.toLocaleDateString("en-US", { weekday: "short" })}
              </div>
              <div
                className={cn(
                  "text-sm font-medium",
                  isToday(date)
                    ? "text-blue-600 font-bold"
                    : "text-slate-700"
                )}
              >
                {date.getDate()}
              </div>
            </div>
          ))}
        </div>
        {/* Hour rows */}
        {HOURS.map((hour) => (
          <div
            key={hour}
            className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-slate-100"
          >
            <div className="px-2 py-3 text-[10px] text-slate-400 text-right pr-3 border-r border-slate-200">
              {hour > 12 ? hour - 12 : hour} {hour >= 12 ? "PM" : "AM"}
            </div>
            {weekDates.map((date, i) => {
              const dayEvents = eventsForDate(date).filter((e) => {
                const h = new Date(e.startDate).getHours();
                return h === hour;
              });
              return (
                <div
                  key={i}
                  className={cn(
                    "px-0.5 py-0.5 min-h-[48px] border-r border-slate-100 relative",
                    isToday(date) && "bg-blue-50/30"
                  )}
                >
                  {dayEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={cn(
                        "text-[10px] leading-tight px-1.5 py-1 rounded mb-0.5 font-medium truncate",
                        isExpirationEvent(evt.type)
                          ? "border border-orange-300 bg-orange-50 text-orange-800"
                          : "text-white"
                      )}
                      style={
                        !isExpirationEvent(evt.type)
                          ? { backgroundColor: getEventTypeColor(evt.type) }
                          : undefined
                      }
                      title={`${evt.title} - ${formatTime(evt.startDate)}`}
                    >
                      {formatTime(evt.startDate)} {evt.title}
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Day View
  // ---------------------------------------------------------------------------
  function renderDayView() {
    const dayEvents = eventsForDate(currentDate);

    return (
      <div className="border border-slate-200 rounded-lg overflow-auto">
        <div className="bg-slate-50 border-b border-slate-200 px-4 py-3">
          <div
            className={cn(
              "text-lg font-semibold",
              isToday(currentDate) ? "text-blue-600" : "text-slate-800"
            )}
          >
            {currentDate.toLocaleDateString("en-US", {
              weekday: "long",
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
            {isToday(currentDate) && (
              <Badge variant="secondary" className="ml-2 text-xs">
                Today
              </Badge>
            )}
          </div>
        </div>
        {HOURS.map((hour) => {
          const hourEvents = dayEvents.filter(
            (e) => new Date(e.startDate).getHours() === hour
          );
          return (
            <div
              key={hour}
              className="flex border-b border-slate-100 min-h-[56px]"
            >
              <div className="w-16 px-2 py-2 text-xs text-slate-400 text-right pr-3 border-r border-slate-200 flex-shrink-0">
                {hour > 12 ? hour - 12 : hour} {hour >= 12 ? "PM" : "AM"}
              </div>
              <div className="flex-1 px-2 py-1">
                {hourEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={cn(
                      "text-sm px-3 py-2 rounded mb-1 font-medium",
                      isExpirationEvent(evt.type)
                        ? "border-2 border-orange-400 bg-orange-50 text-orange-800"
                        : "text-white"
                    )}
                    style={
                      !isExpirationEvent(evt.type)
                        ? { backgroundColor: getEventTypeColor(evt.type) }
                        : undefined
                    }
                  >
                    <div className="flex items-center justify-between">
                      <span>{evt.title}</span>
                      <span className="text-xs opacity-80">
                        {formatTime(evt.startDate)} -{" "}
                        {formatTime(evt.endDate)}
                      </span>
                    </div>
                    {evt.location && (
                      <div className="text-xs opacity-75 mt-0.5 flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {evt.location}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  const monthLabel = currentDate.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Calendar</h1>
          <p className="text-sm text-slate-500">
            Manage hearings, deadlines, and appointments
          </p>
        </div>
        <Button onClick={() => setAddEventOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Event
        </Button>
      </div>

      <div className="flex gap-6">
        {/* Main calendar area */}
        <div className="flex-1 min-w-0">
          {/* Controls */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={goToday}>
                Today
              </Button>
              <Button variant="outline" size="sm" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
              <h2 className="text-lg font-semibold text-slate-800 ml-2">
                {monthLabel}
              </h2>
            </div>
            <div className="flex rounded-md border border-slate-200">
              {(["month", "week", "day"] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={cn(
                    "px-3 py-1.5 text-xs font-medium capitalize transition-colors",
                    mode === "month" && "rounded-l-md",
                    mode === "day" && "rounded-r-md",
                    viewMode === mode
                      ? "bg-slate-900 text-white"
                      : "bg-white text-slate-600 hover:bg-slate-50"
                  )}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          {/* Event type legend */}
          <div className="flex flex-wrap gap-3 mb-4">
            {EVENT_TYPES.map((et) => (
              <div key={et.value} className="flex items-center gap-1.5">
                <div
                  className={cn(
                    "h-2.5 w-2.5 rounded-full",
                    (et.value === "VISA_EXPIRATION" ||
                      et.value === "WORK_AUTH_EXPIRATION") &&
                      "ring-2 ring-orange-300"
                  )}
                  style={{ backgroundColor: et.color }}
                />
                <span className="text-[11px] text-slate-500">{et.label}</span>
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          {viewMode === "month" && renderMonthView()}
          {viewMode === "week" && renderWeekView()}
          {viewMode === "day" && renderDayView()}
        </div>

        {/* Sidebar - Upcoming events */}
        <div className="w-80 flex-shrink-0 hidden xl:block">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarIcon className="h-4 w-4 text-slate-500" />
                Upcoming Events
              </CardTitle>
              <p className="text-xs text-slate-500">Next 14 days</p>
              <div className="mt-2">
                <Select
                  value={sidebarTypeFilter}
                  onChange={(e) => setSidebarTypeFilter(e.target.value)}
                  className="text-xs"
                >
                  <option value="">All Types</option>
                  {EVENT_TYPES.map((et) => (
                    <option key={et.value} value={et.value}>
                      {et.label}
                    </option>
                  ))}
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {upcomingEvents.length === 0 && (
                  <p className="text-xs text-slate-400 text-center py-4">
                    No upcoming events
                  </p>
                )}
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={cn(
                      "rounded-lg p-3 border-l-4",
                      isExpirationEvent(evt.type)
                        ? "bg-orange-50 border-l-orange-500"
                        : "bg-slate-50"
                    )}
                    style={
                      !isExpirationEvent(evt.type)
                        ? { borderLeftColor: getEventTypeColor(evt.type) }
                        : undefined
                    }
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium text-slate-800 leading-snug">
                        {evt.title}
                      </p>
                      {isExpirationEvent(evt.type) && (
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500 flex-shrink-0 mt-0.5" />
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-1 text-[11px] text-slate-500">
                      <Clock className="h-3 w-3" />
                      {formatDateTime(evt.startDate)}
                    </div>
                    {evt.location && (
                      <div className="flex items-center gap-1 text-[11px] text-slate-400 mt-0.5">
                        <MapPin className="h-3 w-3" />
                        {evt.location}
                      </div>
                    )}
                    <div className="mt-1">
                      <span
                        className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium text-white"
                        style={{
                          backgroundColor: getEventTypeColor(evt.type),
                        }}
                      >
                        {getEventTypeLabel(evt.type)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Add Event dialog */}
      <Dialog open={addEventOpen} onOpenChange={setAddEventOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Add Event</DialogTitle>
            <DialogDescription>
              Create a new calendar event, hearing, or deadline.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <Label htmlFor="event-title">Title</Label>
              <Input
                id="event-title"
                value={eventTitle}
                onChange={(e) => setEventTitle(e.target.value)}
                placeholder="Event title..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-type">Type</Label>
              <Select
                id="event-type"
                value={eventType}
                onChange={(e) => setEventType(e.target.value)}
                className="mt-1"
              >
                <option value="">Select type...</option>
                {EVENT_TYPES.map((et) => (
                  <option key={et.value} value={et.value}>
                    {et.label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="event-start-date">Start Date</Label>
                <Input
                  id="event-start-date"
                  type="date"
                  value={eventStartDate}
                  onChange={(e) => setEventStartDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="event-start-time">Start Time</Label>
                <Input
                  id="event-start-time"
                  type="time"
                  value={eventStartTime}
                  onChange={(e) => setEventStartTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="event-end-date">End Date</Label>
                <Input
                  id="event-end-date"
                  type="date"
                  value={eventEndDate}
                  onChange={(e) => setEventEndDate(e.target.value)}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="event-end-time">End Time</Label>
                <Input
                  id="event-end-time"
                  type="time"
                  value={eventEndTime}
                  onChange={(e) => setEventEndTime(e.target.value)}
                  className="mt-1"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="event-matter">Matter (optional)</Label>
              <Select
                id="event-matter"
                value={eventMatter}
                onChange={(e) => setEventMatter(e.target.value)}
                className="mt-1"
              >
                <option value="">No matter linked</option>
                <option value="m1">Rodriguez - Adjustment of Status</option>
                <option value="m2">Patel - H-1B Extension</option>
                <option value="m3">Herrera - Family Based</option>
                <option value="m4">Wei - H-1B Transfer</option>
                <option value="m5">Garcia - Asylum</option>
              </Select>
            </div>
            <div>
              <Label htmlFor="event-location">Location</Label>
              <Input
                id="event-location"
                value={eventLocation}
                onChange={(e) => setEventLocation(e.target.value)}
                placeholder="Location or video link..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-desc">Description</Label>
              <Textarea
                id="event-desc"
                value={eventDescription}
                onChange={(e) => setEventDescription(e.target.value)}
                placeholder="Event details..."
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="event-reminder">Reminder (days before)</Label>
              <Input
                id="event-reminder"
                type="number"
                min="0"
                value={eventReminderDays}
                onChange={(e) => setEventReminderDays(e.target.value)}
                className="mt-1 w-24"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setAddEventOpen(false);
                resetEventForm();
              }}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setAddEventOpen(false);
                resetEventForm();
              }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Create Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
