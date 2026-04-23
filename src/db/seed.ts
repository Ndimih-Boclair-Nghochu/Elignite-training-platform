import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // ─── CEO User ───────────────────────────────────────────────
  const ceoPassword = await bcrypt.hash("admin123", 10);
  const ceo = await prisma.user.upsert({
    where: { email: "admin@edumanage.cm" },
    update: {},
    create: {
      email: "admin@edumanage.cm",
      password: ceoPassword,
      firstName: "Emmanuel",
      lastName: "Ngum",
      role: "ceo",
      phone: "+237677000001",
    },
  });
  console.log("✅ CEO created:", ceo.email);

  // ─── Teacher Users ──────────────────────────────────────────
  const teacherPassword = await bcrypt.hash("teacher123", 10);

  const teacher1User = await prisma.user.upsert({
    where: { email: "paul.ngum@edumanage.cm" },
    update: {},
    create: {
      email: "paul.ngum@edumanage.cm",
      password: teacherPassword,
      firstName: "Paul",
      lastName: "Ngum",
      role: "teacher",
      phone: "+237677100001",
    },
  });

  await prisma.teacher.upsert({
    where: { userId: teacher1User.id },
    update: {},
    create: {
      teacherId: "TCH001",
      userId: teacher1User.id,
      department: "Computer Science",
      specialization: "AI & Machine Learning",
      office: "Office 201, Block A",
    },
  });
  console.log("✅ Teacher created:", teacher1User.email);

  const teacher2User = await prisma.user.upsert({
    where: { email: "marie.atanga@edumanage.cm" },
    update: {},
    create: {
      email: "marie.atanga@edumanage.cm",
      password: teacherPassword,
      firstName: "Marie",
      lastName: "Atanga",
      role: "teacher",
      phone: "+237677100002",
    },
  });

  await prisma.teacher.upsert({
    where: { userId: teacher2User.id },
    update: {},
    create: {
      teacherId: "TCH002",
      userId: teacher2User.id,
      department: "Business",
      specialization: "Strategic Management",
      office: "Office 105, Block B",
    },
  });

  // ─── Student Users ──────────────────────────────────────────
  const studentPassword = await bcrypt.hash("student123", 10);

  const student1User = await prisma.user.upsert({
    where: { email: "amara.fonkeng@student.edumanage.cm" },
    update: {},
    create: {
      email: "amara.fonkeng@student.edumanage.cm",
      password: studentPassword,
      firstName: "Amara",
      lastName: "Fonkeng",
      role: "student",
      phone: "+237677200001",
    },
  });

  await prisma.student.upsert({
    where: { userId: student1User.id },
    update: {},
    create: {
      studentId: "STU2024001",
      userId: student1User.id,
      program: "bsc-computer-science",
      level: 2,
      gender: "female",
      address: "Bamenda, NW Region",
    },
  });
  console.log("✅ Student created:", student1User.email);

  const student2User = await prisma.user.upsert({
    where: { email: "brice.nkemdirim@student.edumanage.cm" },
    update: {},
    create: {
      email: "brice.nkemdirim@student.edumanage.cm",
      password: studentPassword,
      firstName: "Brice",
      lastName: "Nkemdirim",
      role: "student",
      phone: "+237677200002",
    },
  });

  await prisma.student.upsert({
    where: { userId: student2User.id },
    update: {},
    create: {
      studentId: "STU2024002",
      userId: student2User.id,
      program: "bsc-business-administration",
      level: 1,
      gender: "male",
      address: "Bamenda, NW Region",
    },
  });

  // ─── Programs ───────────────────────────────────────────────
  const programs = [
    { slug: "bsc-computer-science", title: "BSc Computer Science", category: "Technology", duration: "4 Years", description: "A comprehensive program covering software engineering, algorithms, AI, and systems design.", tuition: 2500000, requirements: "GCE O/L with 5 credits|Math and English mandatory", outcomes: "Software Developer|Data Scientist|AI Engineer|Systems Analyst" },
    { slug: "bsc-business-administration", title: "BSc Business Administration", category: "Business", duration: "3 Years", description: "Learn leadership, finance, marketing, and entrepreneurship.", tuition: 2000000, requirements: "GCE O/L with 5 credits|Math required", outcomes: "Business Manager|Entrepreneur|Marketing Manager" },
    { slug: "bsc-nursing", title: "BSc Nursing", category: "Health Sciences", duration: "4 Years", description: "Train to become a skilled, compassionate nursing professional.", tuition: 3000000, requirements: "GCE O/L with Biology & Chemistry|Health certificate", outcomes: "Registered Nurse|Clinical Specialist|Nurse Educator" },
    { slug: "bsc-education", title: "BSc Education", category: "Education", duration: "3 Years", description: "Become a qualified teacher with skills in pedagogy and curriculum design.", tuition: 1800000, requirements: "GCE O/L with 5 credits|English proficiency", outcomes: "Primary Teacher|Secondary Teacher|Education Admin" },
    { slug: "hnd-accounting", title: "HND Accounting & Finance", category: "Finance", duration: "2 Years", description: "Master accounting principles, financial reporting, and taxation.", tuition: 1500000, requirements: "GCE O/L with 5 credits|Math required", outcomes: "Accountant|Financial Analyst|Auditor" },
    { slug: "bsc-civil-engineering", title: "BSc Civil Engineering", category: "Engineering", duration: "5 Years", description: "Design, build, and maintain infrastructure with strong math and physics foundations.", tuition: 3500000, requirements: "GCE A/L with Math and Physics", outcomes: "Civil Engineer|Structural Engineer|Project Manager" },
  ];

  for (const p of programs) {
    await prisma.program.upsert({ where: { slug: p.slug }, update: {}, create: p });
  }
  console.log("✅ Programs seeded");

  // ─── Courses ────────────────────────────────────────────────
  const teacher1 = await prisma.teacher.findFirst({ where: { teacherId: "TCH001" } });
  const teacher2 = await prisma.teacher.findFirst({ where: { teacherId: "TCH002" } });

  const courses = [
    { code: "CS101", title: "Introduction to Programming", credits: 3, program: "bsc-computer-science", level: 1, semester: "Semester 1", year: 2024, teacherId: teacher1?.id, room: "Lab 1", schedule: "Mon/Wed 8-10am" },
    { code: "CS205", title: "Data Structures & Algorithms", credits: 3, program: "bsc-computer-science", level: 2, semester: "Semester 1", year: 2024, teacherId: teacher1?.id, room: "Lab 1", schedule: "Tue/Thu 2-4pm" },
    { code: "MATH201", title: "Calculus II", credits: 3, program: "bsc-computer-science", level: 2, semester: "Semester 1", year: 2024, teacherId: undefined, room: "Hall B", schedule: "Mon/Wed 10-12pm" },
    { code: "ENG102", title: "English Communication", credits: 2, program: "bsc-computer-science", level: 1, semester: "Semester 1", year: 2024, teacherId: undefined, room: "Room 14", schedule: "Fri 2-4pm" },
    { code: "BUS201", title: "Business Management", credits: 3, program: "bsc-business-administration", level: 2, semester: "Semester 1", year: 2024, teacherId: teacher2?.id, room: "Hall A", schedule: "Tue/Thu 10-12pm" },
  ];

  for (const c of courses) {
    await prisma.course.upsert({ where: { code: c.code }, update: {}, create: c });
  }
  console.log("✅ Courses seeded");

  // ─── Sample Results ──────────────────────────────────────────
  const student1 = await prisma.student.findFirst({ where: { studentId: "STU2024001" } });
  const cs205 = await prisma.course.findFirst({ where: { code: "CS205" } });
  const math201 = await prisma.course.findFirst({ where: { code: "MATH201" } });

  if (student1 && cs205) {
    await prisma.result.upsert({
      where: { studentId_courseId_semester_year: { studentId: student1.id, courseId: cs205.id, semester: "Semester 1", year: 2024 } },
      update: {},
      create: { studentId: student1.id, courseId: cs205.id, ca: 35, exam: 56, total: 91, grade: "A+", semester: "Semester 1", year: 2024 },
    });
  }
  if (student1 && math201) {
    await prisma.result.upsert({
      where: { studentId_courseId_semester_year: { studentId: student1.id, courseId: math201.id, semester: "Semester 1", year: 2024 } },
      update: {},
      create: { studentId: student1.id, courseId: math201.id, ca: 28, exam: 55, total: 83, grade: "A", semester: "Semester 1", year: 2024 },
    });
  }

  // ─── Sample Fees ─────────────────────────────────────────────
  if (student1) {
    await prisma.fee.createMany({
      data: [
        { studentId: student1.id, description: "Tuition Fee - Semester 1", amount: 625000, dueDate: new Date("2024-09-30"), paidDate: new Date("2024-09-15"), status: "paid", receiptNo: "REC-2024-001" },
        { studentId: student1.id, description: "Library Fee", amount: 25000, dueDate: new Date("2024-09-30"), paidDate: new Date("2024-09-15"), status: "paid", receiptNo: "REC-2024-002" },
        { studentId: student1.id, description: "Tuition Fee - Semester 2", amount: 625000, dueDate: new Date("2025-01-31"), status: "pending" },
        { studentId: student1.id, description: "Examination Fee", amount: 30000, dueDate: new Date("2024-12-01"), status: "overdue" },
      ],
    });
  }

  // ─── Announcements ───────────────────────────────────────────
  await prisma.announcement.createMany({
    data: [
      { title: "End of Semester Exams – Timetable Released", content: "The final exam timetable for Semester 1 (2024/2025) has been released. Exams run from December 9–20, 2024.", targetRole: "all", priority: "high", author: "Academic Office", userId: ceo.id },
      { title: "Fee Payment Deadline Extended to Nov 30", content: "The deadline for second installment tuition payment has been extended to November 30, 2024.", targetRole: "student", priority: "medium", author: "Finance Office", userId: ceo.id },
      { title: "Faculty Meeting – November", content: "Monthly faculty meeting on Nov 20 at 10am in Hall A.", targetRole: "teacher", priority: "low", author: "Director", userId: ceo.id },
    ],
  });
  console.log("✅ Announcements seeded");

  // ─── Testimonies ─────────────────────────────────────────────
  await prisma.testimony.createMany({
    data: [
      { userId: ceo.id, name: "Amara Fonkeng", program: "BSc Computer Science", year: "2023", text: "EduManage transformed my career. The faculty are exceptional and the facilities are world-class.", rating: 5, status: "approved" },
      { userId: ceo.id, name: "Brice Nkemdirim", program: "BSc Business Admin", year: "2022", text: "The best investment I ever made. The business program gave me real-world skills from day one.", rating: 5, status: "approved" },
      { userId: ceo.id, name: "Sandra Mbah", program: "BSc Nursing", year: "2023", text: "Compassionate training with hands-on clinical practice. I graduated ready to serve.", rating: 4, status: "approved" },
    ],
  });

  await prisma.aboutUs.upsert({
    where: { id: 1 },
    update: {
      vision: "To become the leading school management platform in the region by delivering accessible, trusted, and technology-driven learning experiences to every student.",
      visionImageUrl: "https://placehold.co/640x480?text=Vision",
      mission: "To equip learners with the skills, knowledge, and support they need to succeed in school and beyond through quality programs, caring faculty, and seamless administrative systems.",
      missionImageUrl: "https://placehold.co/640x480?text=Mission",
    },
    create: {
      vision: "To become the leading school management platform in the region by delivering accessible, trusted, and technology-driven learning experiences to every student.",
      visionImageUrl: "https://placehold.co/640x480?text=Vision",
      mission: "To equip learners with the skills, knowledge, and support they need to succeed in school and beyond through quality programs, caring faculty, and seamless administrative systems.",
      missionImageUrl: "https://placehold.co/640x480?text=Mission",
    },
  });

  await prisma.gallery.createMany({
    data: [
      { title: "Main Campus Building", category: "Campus", url: "https://placehold.co/640x480?text=Campus" },
      { title: "Graduation Day", category: "Events", url: "https://placehold.co/640x480?text=Graduation" },
      { title: "Computer Lab", category: "Facilities", url: "https://placehold.co/640x480?text=Lab" },
      { title: "Student Hub", category: "Campus", url: "https://placehold.co/640x480?text=Hub" },
    ],
  });

  await prisma.service.createMany({
    data: [
      { name: "Student Counseling", description: "Academic and psychological counseling services", category: "Welfare", icon: "HeartHandshake", isActive: true },
      { name: "Career Placement", description: "Job placement and internship matching services", category: "Career", icon: "Briefcase", isActive: true },
      { name: "Library Services", description: "Physical and digital library access and resources", category: "Academic", icon: "BookOpen", isActive: true },
      { name: "Health Clinic", description: "On-campus medical services and health support", category: "Health", icon: "Heart", isActive: true },
      { name: "Sports Complex", description: "Football, basketball, fitness facilities and sports programs", category: "Sports", icon: "Rocket", isActive: true },
      { name: "Hostel Accommodation", description: "On-campus housing for students with modern amenities", category: "Accommodation", icon: "Home", isActive: true },
    ],
  });

  // ─── School Settings ────────────────────────────────────────
  await prisma.schoolSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      schoolName: "Computer Training Institute",
      ceoFirstName: "Dr.",
      ceoLastName: "Emmanuel Ngum",
      ceoTitle: "Chief Executive Officer",
      schoolMotto: "Excellence in Technology Education",
      schoolAddress: "Bamenda, North West Region, Cameroon",
      schoolPhone: "+237677000001",
      schoolEmail: "admin@edumanage.cm",
      aiName: "EduAssistant",
    },
  });
  console.log("✅ School settings initialized");

  console.log("\n🎉 Seeding complete!\n");
  console.log("──────────────────────────────────────────");
  console.log("🔑 Login Credentials:");
  console.log("   CEO:     admin@edumanage.cm       / admin123");
  console.log("   Teacher: paul.ngum@edumanage.cm   / teacher123");
  console.log("   Student: amara.fonkeng@student.edumanage.cm / student123");
  console.log("──────────────────────────────────────────");
  console.log("🤖 AI Assistant: EduAssistant");
  console.log("   Configure the AI name in CEO Dashboard > Settings");
  console.log("──────────────────────────────────────────");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
