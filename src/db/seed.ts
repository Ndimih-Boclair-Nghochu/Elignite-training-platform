import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding ELIGNITE platform...");

  const ceoPassword = await bcrypt.hash("Elignite@2026", 10);
  const teacherPassword = await bcrypt.hash("Teacher@2026", 10);
  const studentPassword = await bcrypt.hash("Student@2026", 10);

  const ceo = await prisma.user.upsert({
    where: { email: "ceo@elignite.cm" },
    update: {
      password: ceoPassword,
      firstName: "MSAME",
      lastName: "RENE",
      role: "ceo",
      phone: "+237670768962",
      isActivated: true,
    },
    create: {
      email: "ceo@elignite.cm",
      password: ceoPassword,
      firstName: "MSAME",
      lastName: "RENE",
      role: "ceo",
      phone: "+237670768962",
      isActivated: true,
    },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "mentor@elignite.cm" },
    update: {
      password: teacherPassword,
      firstName: "Melissa",
      lastName: "Ngwa",
      role: "teacher",
      phone: "+237672320608",
      isActivated: true,
    },
    create: {
      email: "mentor@elignite.cm",
      password: teacherPassword,
      firstName: "Melissa",
      lastName: "Ngwa",
      role: "teacher",
      phone: "+237672320608",
      isActivated: true,
    },
  });

  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: {
      teacherId: "TCH1001",
      matricle: "ELI-TCH-1001",
      occupation: "Lead Instructor",
      profession: "Software Engineer",
      department: "Technology Training",
      specialization: "Web Development and AI Tools",
      qualifications: "Full-stack engineer with project delivery experience",
      office: "ELIGNITE Main Hub",
      status: "active",
    },
    create: {
      teacherId: "TCH1001",
      matricle: "ELI-TCH-1001",
      userId: teacherUser.id,
      occupation: "Lead Instructor",
      profession: "Software Engineer",
      department: "Technology Training",
      specialization: "Web Development and AI Tools",
      qualifications: "Full-stack engineer with project delivery experience",
      office: "ELIGNITE Main Hub",
      status: "active",
    },
  });

  const inactiveTeacherUser = await prisma.user.upsert({
    where: { email: "trainer.pending@elignite.cm" },
    update: {
      password: teacherPassword,
      firstName: "Pauline",
      lastName: "Mbah",
      role: "teacher",
      phone: "+237677000112",
      isActivated: false,
    },
    create: {
      email: "trainer.pending@elignite.cm",
      password: teacherPassword,
      firstName: "Pauline",
      lastName: "Mbah",
      role: "teacher",
      phone: "+237677000112",
      isActivated: false,
    },
  });

  await prisma.teacher.upsert({
    where: { userId: inactiveTeacherUser.id },
    update: {
      teacherId: "TCH1002",
      matricle: "ELI-TCH-1002",
      occupation: "Trainer",
      profession: "Digital Skills Coach",
      department: "Technology Training",
      status: "inactive",
    },
    create: {
      teacherId: "TCH1002",
      matricle: "ELI-TCH-1002",
      userId: inactiveTeacherUser.id,
      occupation: "Trainer",
      profession: "Digital Skills Coach",
      department: "Technology Training",
      status: "inactive",
    },
  });

  const studentUser = await prisma.user.upsert({
    where: { email: "student@elignite.cm" },
    update: {
      password: studentPassword,
      firstName: "Amara",
      lastName: "Fonkeng",
      role: "student",
      phone: "+237677200001",
      isActivated: true,
      matricule: "ELI-STU-1001",
    },
    create: {
      email: "student@elignite.cm",
      password: studentPassword,
      firstName: "Amara",
      lastName: "Fonkeng",
      role: "student",
      phone: "+237677200001",
      isActivated: true,
      matricule: "ELI-STU-1001",
    },
  });

  await prisma.student.upsert({
    where: { userId: studentUser.id },
    update: {
      studentId: "STU1001",
      matricle: "ELI-STU-1001",
      program: "web-development",
      level: 1,
      gender: "female",
      address: "Bamenda, Cameroon",
      parentName: "Mrs Fonkeng",
      parentPhone: "+237677200099",
      status: "active",
    },
    create: {
      studentId: "STU1001",
      matricle: "ELI-STU-1001",
      userId: studentUser.id,
      program: "web-development",
      level: 1,
      gender: "female",
      address: "Bamenda, Cameroon",
      parentName: "Mrs Fonkeng",
      parentPhone: "+237677200099",
      status: "active",
    },
  });

  await prisma.enrollment.upsert({
    where: { email: "newstudent@elignite.cm" },
    update: {
      firstName: "Brice",
      lastName: "Nkemdirim",
      phone: "+237677200222",
      program: "software-engineering",
      status: "approved",
      matricle: "ELI-APP-1002",
      approvedAt: new Date(),
      approvedBy: ceo.id,
    },
    create: {
      firstName: "Brice",
      lastName: "Nkemdirim",
      email: "newstudent@elignite.cm",
      phone: "+237677200222",
      program: "software-engineering",
      status: "approved",
      matricle: "ELI-APP-1002",
      publicAccessToken: "seed-public-token-1002",
      approvedAt: new Date(),
      approvedBy: ceo.id,
    },
  });

  const programsData = [
    { slug: "web-development", programCode: "WEB-01", title: "Web Development", category: "Software", duration: "8 Weeks", description: "Learn HTML, CSS, JavaScript, React, deployment, and portfolio-ready frontend delivery.", tuition: 180000, requirements: "Basic computer use, willingness to practice, internet access for assignments", outcomes: "Responsive websites, React interfaces, deployment workflow" },
    { slug: "software-engineering", programCode: "SWE-01", title: "Software Engineering", category: "Engineering", duration: "12 Weeks", description: "Build backend and frontend thinking with Git, APIs, testing, and team-ready software habits.", tuition: 260000, requirements: "Comfort with beginner programming concepts or strong learning commitment", outcomes: "Project architecture, backend services, version control discipline" },
    { slug: "cloud-devops", programCode: "CLD-01", title: "Cloud & DevOps", category: "Infrastructure", duration: "10 Weeks", description: "Work through Linux basics, cloud deployment, CI/CD, and modern delivery workflows.", tuition: 220000, requirements: "Basic technical confidence and laptop access", outcomes: "Deployment confidence, CI/CD familiarity, cloud operations basics" },
    { slug: "graphic-design", programCode: "GFX-01", title: "Graphic Design", category: "Creative Tech", duration: "8 Weeks", description: "Create digital brand assets, social media graphics, client-ready layouts, and visual campaigns.", tuition: 140000, requirements: "Beginner-friendly, creativity and consistency", outcomes: "Design portfolio, brand systems, campaign graphics" },
    { slug: "ai-tools", programCode: "AIT-01", title: "AI Tools for Work", category: "AI Productivity", duration: "5 Weeks", description: "Use AI tools for writing, research, business workflows, and responsible productivity gains.", tuition: 95000, requirements: "No technical background required", outcomes: "Prompt workflows, faster research, better digital output" },
  ];

  const createdPrograms: { id: number; slug: string }[] = [];
  for (const program of programsData) {
    const p = await prisma.program.upsert({
      where: { slug: program.slug },
      update: program,
      create: program,
    });
    createdPrograms.push({ id: p.id, slug: p.slug });
  }

  // Assign teacher to all programs via junction table
  for (const p of createdPrograms) {
    await prisma.teacherProgram.upsert({
      where: { teacherId_programId: { teacherId: teacher.id, programId: p.id } },
      update: {},
      create: { teacherId: teacher.id, programId: p.id },
    });
  }

  await prisma.course.upsert({
    where: { code: "WEB101" },
    update: {
      title: "Frontend Foundations",
      program: "web-development",
      teacherId: teacher.id,
      room: "Lab 1",
      schedule: "Mon/Wed/Fri 8:00-10:00",
    },
    create: {
      code: "WEB101",
      title: "Frontend Foundations",
      description: "HTML, CSS, JavaScript and responsive UI build practice",
      credits: 3,
      program: "web-development",
      level: 1,
      semester: "Cohort A",
      year: 2026,
      teacherId: teacher.id,
      room: "Lab 1",
      schedule: "Mon/Wed/Fri 8:00-10:00",
    },
  });

  await prisma.settings.upsert({
    where: { id: 1 },
    update: { applicationsOpen: true, applicationYear: "2026 Cohort", maintenanceMode: false, updatedBy: ceo.id },
    create: { id: 1, applicationsOpen: true, applicationYear: "2026 Cohort", maintenanceMode: false, updatedBy: ceo.id },
  });

  await prisma.schoolSettings.upsert({
    where: { id: 1 },
    update: {
      schoolName: "ELIGNITE Training Platform",
      ceoFirstName: "MSAME",
      ceoLastName: "RENE",
      ceoTitle: "Chief Executive Officer",
      schoolMotto: "Practical digital skills for real work",
      schoolAddress: "Elegance Junction, UBa first gate, Bamenda",
      schoolPhone: "+237670768962 / +237672320608",
      schoolEmail: "ceo@elignite.cm",
      aiName: "ELI Assist",
    },
    create: {
      id: 1,
      schoolName: "ELIGNITE Training Platform",
      ceoFirstName: "MSAME",
      ceoLastName: "RENE",
      ceoTitle: "Chief Executive Officer",
      schoolMotto: "Practical digital skills for real work",
      schoolAddress: "Elegance Junction, UBa first gate, Bamenda",
      schoolPhone: "+237670768962 / +237672320608",
      schoolEmail: "ceo@elignite.cm",
      aiName: "ELI Assist",
    },
  });

  await prisma.aboutUs.upsert({
    where: { id: 1 },
    update: {
      vision: "To become a trusted technology training platform where learners build practical digital skills with confidence and career direction.",
      visionImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      mission: "To help people move into modern tech work through guided learning, applied projects, and support that feels clear and professional.",
      missionImageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    },
    create: {
      id: 1,
      vision: "To become a trusted technology training platform where learners build practical digital skills with confidence and career direction.",
      visionImageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80",
      mission: "To help people move into modern tech work through guided learning, applied projects, and support that feels clear and professional.",
      missionImageUrl: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80",
    },
  });

  const services = [
    { name: "Career Guidance", description: "Track selection, next-step advice, and learner support", category: "Career", icon: "ShieldCheck" },
    { name: "Portfolio Support", description: "Project direction and presentation support for job-facing work", category: "Academic", icon: "Briefcase" },
    { name: "Mentorship", description: "Ongoing coach accountability through the learning journey", category: "Welfare", icon: "HeartHandshake" },
  ];

  for (const service of services) {
    const existing = await prisma.service.findFirst({ where: { name: service.name } });
    if (existing) {
      await prisma.service.update({ where: { id: existing.id }, data: { ...service, isActive: true } });
    } else {
      await prisma.service.create({ data: { ...service, isActive: true } });
    }
  }

  const gallery = [
    { title: "Live coding session", category: "Training", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80" },
    { title: "Design workshop", category: "Creative Tech", url: "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80" },
    { title: "Mentor support", category: "Coaching", url: "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80" },
  ];

  for (const item of gallery) {
    const existing = await prisma.gallery.findFirst({ where: { title: item.title } });
    if (existing) {
      await prisma.gallery.update({ where: { id: existing.id }, data: item });
    } else {
      await prisma.gallery.create({ data: item });
    }
  }

  const testimonyExists = await prisma.testimony.findFirst({ where: { name: "Amara Fonkeng" } });
  if (!testimonyExists) {
    await prisma.testimony.create({
      data: {
        userId: studentUser.id,
        name: "Amara Fonkeng",
        program: "Web Development",
        year: "2026",
        text: "The platform feels structured, clear, and practical. I could actually see my progress week after week.",
        rating: 5,
        status: "approved",
      },
    });
  }

  console.log("Seeding complete.");
  console.log("CEO login: ceo@elignite.cm / Elignite@2026");
  console.log("Teacher login: mentor@elignite.cm / Teacher@2026");
  console.log("Student login: student@elignite.cm / Student@2026");
  console.log("Approved registration record: newstudent@elignite.cm / matricule ELI-APP-1002");
  console.log("Pending teacher activation: trainer.pending@elignite.cm / teacher ID TCH1002");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
