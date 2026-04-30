import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Edit2, Trash2, Plus } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export interface TimetableEntry {
  id: number;
  courseId: number;
  programId?: number | null;
  programTitle?: string | null;
  courseCode: string;
  courseTitle: string;
  program: string;
  level: number;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  room: string | null;
  teacherName: string | null;
  semester: string;
  year: number;
}

interface TimetableTableProps {
  entries: TimetableEntry[];
  title?: string;
  subtitle?: string;
  showProgram?: boolean;
  onEdit?: (entry: TimetableEntry) => void;
  onDelete?: (id: number) => void;
  onAdd?: () => void;
}

export function TimetableTable({
  entries,
  title = "Class Timetable",
  subtitle,
  showProgram = false,
  onEdit,
  onDelete,
  onAdd
}: TimetableTableProps) {
  const { user } = useAuth();
  const isCEO = user?.role === "ceo";

  const dayOrder = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

  // Group entries by day
  const groupedEntries = entries.reduce((acc, entry) => {
    if (!acc[entry.dayOfWeek]) {
      acc[entry.dayOfWeek] = [];
    }
    acc[entry.dayOfWeek].push(entry);
    return acc;
  }, {} as Record<string, TimetableEntry[]>);

  // Sort entries within each day by start time
  Object.keys(groupedEntries).forEach(day => {
    groupedEntries[day].sort((a, b) => a.startTime.localeCompare(b.startTime));
  });

  const formatDay = (day: string) => {
    return day.charAt(0).toUpperCase() + day.slice(1);
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {title}
            </CardTitle>
            {subtitle ? <p className="text-sm text-gray-500 mt-1">{subtitle}</p> : null}
          </div>
          <div className="flex gap-2">
            <Badge className="text-sm px-3 py-1">{new Date().getFullYear()}</Badge>
            {isCEO && onAdd && (
              <Button size="sm" onClick={onAdd}>
                <Plus className="h-4 w-4 mr-2" />
                Add Schedule
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        {dayOrder.map(day => {
          const dayEntries = groupedEntries[day] || [];
          if (dayEntries.length === 0) return null;

          return (
            <div key={day} className="mb-6 last:mb-0">
              <h3 className="text-lg font-semibold mb-3 text-gray-900">{formatDay(day)}</h3>
              <div className="space-y-2">
                {dayEntries.map((entry) => (
                  <div key={entry.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="text-sm font-medium text-gray-900">
                        {formatTime(entry.startTime)} - {formatTime(entry.endTime)}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-gray-900">{entry.courseCode}</div>
                        <div className="text-sm text-gray-600">{entry.courseTitle}</div>
                        {showProgram && (
                          <div className="text-xs text-gray-500 capitalize">
                            {(entry.programTitle || entry.program).replace(/-/g, " ")}
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.room && <div>Room: {entry.room}</div>}
                        {entry.teacherName && <div>Teacher: {entry.teacherName}</div>}
                      </div>
                    </div>
                    {isCEO && (onEdit || onDelete) && (
                      <div className="flex gap-2">
                        {onEdit && (
                          <Button size="sm" variant="outline" onClick={() => onEdit(entry)}>
                            <Edit2 className="h-3 w-3" />
                          </Button>
                        )}
                        {onDelete && (
                          <Button size="sm" variant="outline" onClick={() => onDelete(entry.id)}>
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {entries.length === 0 && (
          <div className="py-8 text-center text-sm text-gray-500">
            No timetable entries available.
            {isCEO && onAdd && (
              <div className="mt-2">
                <Button variant="outline" size="sm" onClick={onAdd}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Schedule
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
