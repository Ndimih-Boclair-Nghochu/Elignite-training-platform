"use client";
import { useEffect, useState } from "react";
import { TimetableTable, TimetableEntry } from "@/components/dashboard/TimetableTable";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Loader2, Plus, Edit2, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TimetableResponse {
  role: string;
  program: string | null;
  timetable: TimetableEntry[];
  error?: string;
}

interface Course {
  id: number;
  code: string;
  title: string;
  program: string;
  level: number;
  semester: string;
  year: number;
}

export default function CeoTimetablePage() {
  const { toast } = useToast();
  const [data, setData] = useState<TimetableEntry[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    courseId: "",
    dayOfWeek: "",
    startTime: "",
    endTime: "",
    room: "",
    year: new Date().getFullYear().toString(),
  });

  async function fetchTimetable() {
    try {
      setLoading(true);
      const res = await fetch("/api/timetable");
      const json = await res.json() as TimetableResponse;
      if (!res.ok || json.error) {
        toast({ title: json.error || "Unable to load timetable", variant: "destructive" });
        return;
      }
      setData(json.timetable || []);
    } catch (err) {
      toast({ title: "Unable to load timetable", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function fetchCourses() {
    try {
      setCoursesLoading(true);
      const res = await fetch("/api/courses");
      if (res.ok) {
        const coursesData = await res.json();
        setCourses(coursesData);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setCoursesLoading(false);
    }
  }

  useEffect(() => {
    fetchTimetable();
    fetchCourses();
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const method = editingId ? "PATCH" : "POST";
      const url = editingId ? `/api/timetable/${editingId}` : "/api/timetable";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          courseId: parseInt(form.courseId),
          year: parseInt(form.year),
        }),
      });

      if (res.ok) {
        toast({ title: editingId ? "Timetable updated successfully" : "Timetable created successfully" });
        setOpenDialog(false);
        resetForm();
        fetchTimetable();
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to save timetable", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Are you sure you want to delete this timetable entry?")) return;

    try {
      const res = await fetch(`/api/timetable/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast({ title: "Timetable entry deleted successfully" });
        fetchTimetable();
      } else {
        const error = await res.json();
        toast({ title: error.error || "Failed to delete timetable", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "An error occurred", variant: "destructive" });
    }
  }

  function resetForm() {
    setForm({
      courseId: "",
      dayOfWeek: "",
      startTime: "",
      endTime: "",
      room: "",
      year: new Date().getFullYear().toString(),
    });
    setEditingId(null);
  }

  function handleEdit(entry: TimetableEntry) {
    setEditingId(entry.id);
    setForm({
      courseId: entry.courseId.toString(),
      dayOfWeek: entry.dayOfWeek,
      startTime: entry.startTime,
      endTime: entry.endTime,
      room: entry.room || "",
      year: entry.year.toString(),
    });
    setOpenDialog(true);
  }

  function handleAdd() {
    resetForm();
    setOpenDialog(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Timetable Management</h1>
          <p className="text-gray-500 text-sm">Schedule courses and manage class timetables.</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-10">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
        </div>
      ) : (
        <TimetableTable
          entries={data}
          showProgram
          onEdit={handleEdit}
          onDelete={handleDelete}
          onAdd={handleAdd}
        />
      )}

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Timetable Entry" : "Schedule New Class"}</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Course *</Label>
                <Select value={form.courseId} onValueChange={(value) => setForm((f) => ({ ...f, courseId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesLoading ? (
                      <div className="p-2 text-center text-sm text-gray-500">Loading courses...</div>
                    ) : (
                      courses.map((course) => (
                        <SelectItem key={course.id} value={course.id.toString()}>
                          {course.code} - {course.title}
                        </SelectItem>
                      ))
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Day of Week *</Label>
                <Select value={form.dayOfWeek} onValueChange={(value) => setForm((f) => ({ ...f, dayOfWeek: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select day" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monday">Monday</SelectItem>
                    <SelectItem value="tuesday">Tuesday</SelectItem>
                    <SelectItem value="wednesday">Wednesday</SelectItem>
                    <SelectItem value="thursday">Thursday</SelectItem>
                    <SelectItem value="friday">Friday</SelectItem>
                    <SelectItem value="saturday">Saturday</SelectItem>
                    <SelectItem value="sunday">Sunday</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Start Time *</Label>
                <Input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm((f) => ({ ...f, startTime: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time *</Label>
                <Input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm((f) => ({ ...f, endTime: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Room</Label>
                <Input
                  value={form.room}
                  onChange={(e) => setForm((f) => ({ ...f, room: e.target.value }))}
                  placeholder="e.g., Room 101"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Year *</Label>
              <Input
                type="number"
                value={form.year}
                onChange={(e) => setForm((f) => ({ ...f, year: e.target.value }))}
                placeholder="2024"
                required
              />
            </div>

            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</> : "Save Schedule"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
