"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ListFilter } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { programDetailSlug } from "@/lib/programs";

type ProgramJumpSelectProps = {
  programs: Array<{ slug: string; title: string }>;
  className?: string;
  placeholder?: string;
};

export function ProgramJumpSelect({
  programs,
  className,
  placeholder = "Jump to a program",
}: ProgramJumpSelectProps) {
  const router = useRouter();
  const [value, setValue] = useState("all-programs");

  const items = useMemo(
    () =>
      [...programs].sort((a, b) => a.title.localeCompare(b.title, undefined, { sensitivity: "base" })),
    [programs]
  );

  return (
    <div className={className}>
      <div className="mb-3 flex items-center gap-2 text-sm font-medium text-slate-700">
        <ListFilter className="h-4 w-4 text-blue-600" />
        <span>Explore available programs</span>
      </div>
      <Select
        value={value}
        onValueChange={(nextValue) => {
          setValue(nextValue);

          if (nextValue === "all-programs") {
            router.push("/programs");
            return;
          }

          const selectedProgram = items.find((program) => program.slug === nextValue);
          router.push(`/programs/${programDetailSlug(selectedProgram || { slug: nextValue, title: nextValue })}`);
        }}
      >
        <SelectTrigger className="h-12 rounded-2xl border-blue-100 bg-white text-left text-sm shadow-sm">
          <div className="flex items-center gap-2">
            <SelectValue placeholder={placeholder} />
          </div>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all-programs">
            <div className="flex items-center gap-2">
              <span>Browse all programs</span>
              <ChevronRight className="h-4 w-4 text-slate-400" />
            </div>
          </SelectItem>
          {items.map((program) => (
            <SelectItem key={program.slug} value={program.slug}>
              {program.title}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
