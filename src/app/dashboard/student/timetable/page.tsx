"use client";
import { useEffect, useState } from "react";
import { TimetableTable, TimetableEntry } from "@/components/dashboard/TimetableTable";

interface TimetableResponse {
  role: string;
  program: string | null;
  timetable: TimetableEntry[];
  error?: string;
}

export default function TimetablePage() {
  const [data, setData] = useState<TimetableEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/timetable");
        const json = await res.json() as TimetableResponse;
        if (!res.ok || json.error) {
          setError(json.error || "Unable to load timetable");
          return;
        }
        setData(json.timetable || []);
      } catch (err) {
        setError("Unable to load timetable");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Timetable</h1>
          <p className="text-gray-500 text-sm">Courses scheduled for your enrolled program.</p>
        </div>
        <div className="rounded-full bg-slate-50 px-3 py-1 text-sm font-medium text-slate-700">Student View</div>
      </div>

      {loading ? (
        <div className="rounded-xl border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">Loading timetable…</div>
      ) : error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">{error}</div>
      ) : (
        <TimetableTable entries={data} />
      )}
    </div>
  );
}
