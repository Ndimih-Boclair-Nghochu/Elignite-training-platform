import { prisma } from "@/lib/prisma";
import { requirePartner } from "@/lib/session";
import { slugifyProgramValue } from "@/lib/programs";

export function computePartnerProfileCompletion(profile: {
  institutionName?: string | null;
  logoUrl?: string | null;
  country?: string | null;
  city?: string | null;
  address?: string | null;
  website?: string | null;
  contactPerson?: string | null;
  contactEmail?: string | null;
  contactPhone?: string | null;
  description?: string | null;
  accreditationInfo?: string | null;
  verificationDocuments?: unknown;
}) {
  const checks = [
    profile.institutionName,
    profile.logoUrl,
    profile.country,
    profile.city,
    profile.address,
    profile.website,
    profile.contactPerson,
    profile.contactEmail,
    profile.contactPhone,
    profile.description,
    profile.accreditationInfo,
    Array.isArray(profile.verificationDocuments) && profile.verificationDocuments.length > 0 ? "docs" : "",
  ];

  const complete = checks.filter((value) => String(value || "").trim()).length;
  return Math.round((complete / checks.length) * 100);
}

export async function getPartnerProfileForSession() {
  const session = await requirePartner();
  let profile = await prisma.schoolPartnerProfile.findUnique({
    where: { userId: session.userId },
  });

  if (!profile) {
    const user = await prisma.user.findUnique({
      where: { id: session.userId },
      select: {
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
      },
    });

    profile = await prisma.schoolPartnerProfile.create({
      data: {
        userId: session.userId,
        institutionName: `${user?.firstName || "Partner"} ${user?.lastName || "Institution"}`.trim(),
        contactPerson: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
        contactEmail: user?.email || null,
        contactPhone: user?.phone || null,
        profileCompletion: computePartnerProfileCompletion({
          institutionName: `${user?.firstName || "Partner"} ${user?.lastName || "Institution"}`.trim(),
          contactPerson: `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || null,
          contactEmail: user?.email || null,
          contactPhone: user?.phone || null,
        }),
      },
    });
  }

  return { session, profile };
}

export async function generateUniquePartnerProgramSlug(title: string, excludeId?: number) {
  const base = slugifyProgramValue(title) || "partner-program";
  let slug = base;
  let counter = 2;

  while (true) {
    const existing = await prisma.partnerProgram.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) {
      return slug;
    }
    slug = `${base}-${counter}`;
    counter += 1;
  }
}
