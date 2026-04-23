export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { normalizeRole } from "@/lib/roles";

type Intent =
  | "greeting"
  | "thanks"
  | "help"
  | "programs"
  | "courses"
  | "enrollment"
  | "fees"
  | "attendance"
  | "results"
  | "dashboard"
  | "profile"
  | "fallback";

const INTENT_PATTERNS: Record<Exclude<Intent, "fallback">, RegExp[]> = {
  greeting: [/\b(hello|hi|hey|good\s?(morning|afternoon|evening)|howdy)\b/i],
  thanks: [/\b(thank\s?you|thanks|appreciate|grateful)\b/i],
  help: [/\b(help|assist|support|what\s+can\s+you\s+do|guide)\b/i],
  programs: [/\b(program|department|track|specialization|course\s+of\s+study)\b/i],
  courses: [/\b(course|subject|module|class)\b/i],
  enrollment: [/\b(enroll|enrollment|apply|application|admission|register)\b/i],
  fees: [/\b(fee|fees|payment|pay|tuition|receipt|invoice)\b/i],
  attendance: [/\b(attendance|present|absent|late|class\s+record)\b/i],
  results: [/\b(result|grade|score|transcript|performance|mark)\b/i],
  dashboard: [/\b(dashboard|tab|menu|sidebar|navigation|screen|page)\b/i],
  profile: [/\b(profile|account|settings|password|photo)\b/i],
};

function detectIntent(message: string): Intent {
  for (const [intent, patterns] of Object.entries(INTENT_PATTERNS) as Array<[
    Exclude<Intent, "fallback">,
    RegExp[]
  ]>) {
    if (patterns.some((pattern) => pattern.test(message))) {
      return intent;
    }
  }
  return "fallback";
}

function randomPick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function buildSystemSnapshot() {
  const [programCount, courseCount, studentCount, teacherCount, pendingEnrollments] =
    await Promise.all([
      prisma.program.count(),
      prisma.course.count(),
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.enrollment.count({ where: { status: "pending" } }),
    ]);

  return {
    programCount,
    courseCount,
    studentCount,
    teacherCount,
    pendingEnrollments,
  };
}

async function buildRoleSnapshot(userId?: number, role?: string | null) {
  const normalizedRole = normalizeRole(role);

  if (!userId) {
    return {
      role: null,
      headline: "You can ask me about enrollment, courses, fees, attendance, and dashboard usage.",
    };
  }

  if (normalizedRole === "ceo") {
    const [students, teachers, enrollments, unpaidFees] = await Promise.all([
      prisma.student.count(),
      prisma.teacher.count(),
      prisma.enrollment.count({ where: { status: "pending" } }),
      prisma.fee.count({ where: { status: { not: "paid" } } }),
    ]);

    return {
      role: "ceo",
      headline: `CEO view: ${students} students, ${teachers} teachers, ${enrollments} pending enrollments, ${unpaidFees} unpaid fee records.`,
    };
  }

  if (normalizedRole === "teacher") {
    const teacher = await prisma.teacher.findUnique({
      where: { userId },
      select: {
        id: true,
        courses: {
          select: {
            id: true,
            program: true,
          },
        },
      },
    });

    const courseCount = teacher?.courses.length ?? 0;
    const programCount = new Set(teacher?.courses.map((c) => c.program) ?? []).size;

    return {
      role: "teacher",
      headline: `Teacher view: you are assigned to ${courseCount} course(s) across ${programCount} program(s).`,
    };
  }

  const student = await prisma.student.findUnique({
    where: { userId },
    select: { id: true },
  });

  if (!student) {
    return {
      role: "student",
      headline: "Student profile is not linked yet. Please contact admin to complete account setup.",
    };
  }

  const [feesDue, attendanceCount, resultsCount] = await Promise.all([
    prisma.fee.count({ where: { studentId: student.id, status: { not: "paid" } } }),
    prisma.attendance.count({ where: { studentId: student.id } }),
    prisma.result.count({ where: { studentId: student.id } }),
  ]);

  return {
    role: "student",
    headline: `Student view: ${feesDue} pending fee record(s), ${attendanceCount} attendance record(s), ${resultsCount} result record(s).`,
  };
}

async function buildIntentResponse(intent: Intent, message: string, userId?: number, role?: string | null) {
  const lower = message.toLowerCase();

  switch (intent) {
    case "greeting":
      return randomPick([
        "Hello 👋 I’m your on-platform assistant. I can chat naturally and answer questions using the school database.",
        "Hi there! I’m ready. Ask me about programs, courses, enrollment, fees, attendance, results, or dashboard tasks.",
      ]);

    case "thanks":
      return randomPick([
        "You’re welcome! If you want, I can also give a quick dashboard summary for your role.",
        "Happy to help 🙌 Ask anything else about the platform anytime.",
      ]);

    case "help":
      return [
        "Here’s what I can do (no external AI APIs):",
        "• Basic conversation (greetings, follow-up guidance)",
        "• Explain how each dashboard tab works",
        "• Answer enrollment, fee, attendance, result, and profile questions",
        "• Pull quick live summaries from your database",
        "• Give role-specific tips for CEO, teacher, and student workflows",
      ].join("\n");

    case "programs": {
      const programs = await prisma.program.findMany({
        select: { title: true, category: true, duration: true, status: true },
        orderBy: { title: "asc" },
        take: 6,
      });

      if (programs.length === 0) {
        return "No programs are currently available in the database yet.";
      }

      const list = programs
        .map((p) => `• ${p.title} (${p.category}, ${p.duration}) — ${p.status}`)
        .join("\n");

      return `Current programs (sample):\n${list}`;
    }

    case "courses": {
      const courses = await prisma.course.findMany({
        select: { code: true, title: true, program: true, semester: true, year: true },
        orderBy: [{ year: "desc" }, { code: "asc" }],
        take: 8,
      });

      if (courses.length === 0) {
        return "No courses are currently available in the database yet.";
      }

      const list = courses
        .map((c) => `• ${c.code} — ${c.title} (${c.program}, ${c.semester} ${c.year})`)
        .join("\n");

      return `Current courses (sample):\n${list}`;
    }

    case "enrollment": {
      const [pending, approved, rejected] = await Promise.all([
        prisma.enrollment.count({ where: { status: "pending" } }),
        prisma.enrollment.count({ where: { status: "approved" } }),
        prisma.enrollment.count({ where: { status: "rejected" } }),
      ]);

      return [
        `Enrollment overview: ${pending} pending, ${approved} approved, ${rejected} rejected.`,
        "Flow: Enroll form → CEO review → approval/rejection → activation for learner/teacher account.",
      ].join("\n");
    }

    case "fees": {
      const [pending, paid, overdue] = await Promise.all([
        prisma.fee.count({ where: { status: "pending" } }),
        prisma.fee.count({ where: { status: "paid" } }),
        prisma.fee.count({ where: { status: "overdue" } }),
      ]);

      return `Fee snapshot: ${pending} pending, ${paid} paid, ${overdue} overdue record(s).`;
    }

    case "attendance": {
      const [present, absent, late] = await Promise.all([
        prisma.attendance.count({ where: { status: "present" } }),
        prisma.attendance.count({ where: { status: "absent" } }),
        prisma.attendance.count({ where: { status: "late" } }),
      ]);

      return `Attendance snapshot: ${present} present, ${absent} absent, ${late} late entries.`;
    }

    case "results": {
      const count = await prisma.result.count();
      return `There are ${count} academic result record(s) in the system. You can review details from the Results/Academic tabs.`;
    }

    case "dashboard": {
      const snapshot = await buildRoleSnapshot(userId, role);
      return [
        snapshot.headline,
        "Need help with a specific tab? Tell me the tab name (e.g., Students, Courses, Attendance, Fees, Projects, Settings).",
      ].join("\n");
    }

    case "profile":
      return "Profile updates are available in Settings/Profile tabs. You can usually edit personal info, password, and photo there (based on role permissions).";

    case "fallback":
    default: {
      if (lower.includes("summary") || lower.includes("overview")) {
        const stats = await buildSystemSnapshot();
        return `System summary: ${stats.studentCount} students, ${stats.teacherCount} teachers, ${stats.programCount} programs, ${stats.courseCount} courses, ${stats.pendingEnrollments} pending enrollments.`;
      }

      return [
        "I understand basic conversation and school-platform questions.",
        "Try asking:",
        "• “show me enrollment status”",
        "• “how many programs do we have?”",
        "• “explain teacher dashboard tabs”",
        "• “give me fee overview”",
      ].join("\n");
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();

    if (!message || typeof message !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    const session = await getSession();
    const intent = detectIntent(message);
    const response = await buildIntentResponse(intent, message, session.userId, session.role);

    return NextResponse.json({
      response,
      meta: {
        intent,
      },
    });
  } catch (error) {
    console.error("AI Chat Error:", error);
    return NextResponse.json(
      { error: "Failed to process your message" },
      { status: 500 }
    );
  }
}
