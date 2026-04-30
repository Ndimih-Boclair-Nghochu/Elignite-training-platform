import { prisma } from "@/lib/prisma";

export async function ensureSettingsRow() {
  return prisma.settings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
    },
  });
}

export async function syncPlatformCountersFromDatabase() {
  await ensureSettingsRow();

  const [currentStudents, issuedCertificates, settings] = await Promise.all([
    prisma.student.count(),
    prisma.certificate.count({
      where: {
        status: "issued",
      },
    }),
    prisma.settings.findUnique({
      where: { id: 1 },
      select: {
        lifetimeStudentCount: true,
        lifetimeGraduateCount: true,
      },
    }),
  ]);

  return prisma.settings.update({
    where: { id: 1 },
    data: {
      sessionStudentCount: currentStudents,
      lifetimeStudentCount: Math.max(settings?.lifetimeStudentCount ?? 0, currentStudents),
      lifetimeGraduateCount: Math.max(settings?.lifetimeGraduateCount ?? 0, issuedCertificates),
    },
  });
}

export async function recordStudentCreated() {
  await ensureSettingsRow();
  await prisma.settings.update({
    where: { id: 1 },
    data: {
      sessionStudentCount: { increment: 1 },
      lifetimeStudentCount: { increment: 1 },
    },
  });
}

export async function recordStudentGraduated(studentId: number) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    select: { graduationCounted: true, status: true },
  });

  if (!student || student.graduationCounted) {
    return;
  }

  await ensureSettingsRow();

  await prisma.$transaction([
    prisma.student.update({
      where: { id: studentId },
      data: {
        graduationCounted: true,
        status: "graduated",
      },
    }),
    prisma.settings.update({
      where: { id: 1 },
      data: {
        lifetimeGraduateCount: { increment: 1 },
      },
    }),
  ]);
}
