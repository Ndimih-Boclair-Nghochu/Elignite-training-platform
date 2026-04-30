BEGIN;

INSERT INTO "User" ("email","password","firstName","lastName","role","phone","isActivated","matricule","createdAt","updatedAt")
VALUES
('ceo@elignite.cm','$2a$10$.NT.vVUtbTXjWHKzxM0Xfu2LbxAddbC33uToGoO72J5azkjSBg/aK','Boclair','Nghochu','ceo','+237670768962',true,NULL,NOW(),NOW()),
('mentor@elignite.cm','$2a$10$275nHhLKHTvHEDYQLILFmO.OcVr4M1Tig7FC2hi3Wq3X0unBrWHru','Melissa','Ngwa','teacher','+237672320608',true,NULL,NOW(),NOW()),
('trainer.pending@elignite.cm','$2a$10$275nHhLKHTvHEDYQLILFmO.OcVr4M1Tig7FC2hi3Wq3X0unBrWHru','Pauline','Mbah','teacher','+237677000112',false,NULL,NOW(),NOW()),
('student@elignite.cm','$2a$10$y6jCwTVKWVPwZRNP2oxHTutXb1W8RxgIW0QiT8jBX7uG2.3NsEFpO','Amara','Fonkeng','student','+237677200001',true,'ELI-STU-1001',NOW(),NOW()),
('newstudent@elignite.cm','$2a$10$y6jCwTVKWVPwZRNP2oxHTutXb1W8RxgIW0QiT8jBX7uG2.3NsEFpO','Brice','Nkemdirim','student','+237677200222',false,NULL,NOW(),NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Teacher" ("teacherId","matricle","userId","occupation","profession","department","specialization","qualifications","office","status","joinDate")
SELECT 'TCH1001','ELI-TCH-1001',u.id,'Lead Instructor','Software Engineer','Technology Training','Web Development and AI Tools','Full-stack engineer with project delivery experience','ELIGNITE Main Hub','active',NOW()
FROM "User" u
WHERE u.email = 'mentor@elignite.cm'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Teacher" ("teacherId","matricle","userId","occupation","profession","department","specialization","office","status","joinDate")
SELECT 'TCH1002','ELI-TCH-1002',u.id,'Trainer','Digital Skills Coach','Technology Training','Digital Productivity and Design','Remote support desk','inactive',NOW()
FROM "User" u
WHERE u.email = 'trainer.pending@elignite.cm'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Program" ("programCode","slug","title","category","duration","description","tuition","requirements","outcomes","imageUrl","status","createdAt","updatedAt")
VALUES
('PRG-001','web-development','Web Development','Software Engineering','8 Weeks','Learn HTML, CSS, JavaScript, React, and deployment with project-based delivery.',180000,'Basic computer use, consistency, and internet access for assignments.','Build responsive websites, React interfaces, and portfolio-ready frontend projects.','https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80','published',NOW(),NOW()),
('PRG-002','software-engineering','Software Engineering','Engineering','12 Weeks','Build backend and frontend thinking with Git, APIs, testing, and team-ready software habits.',260000,'Comfort with beginner programming concepts or a strong willingness to learn.','Understand software architecture, backend services, version control, and collaborative delivery.','https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80','published',NOW(),NOW()),
('PRG-003','cloud-devops','Cloud & DevOps','Infrastructure','10 Weeks','Work through Linux basics, cloud deployment, CI/CD, and modern delivery workflows.',220000,'Basic technical confidence and laptop access.','Deploy applications, manage CI/CD workflows, and understand cloud operations.','https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&w=1200&q=80','published',NOW(),NOW()),
('PRG-004','graphic-design','Graphic Design','Creative Tech','8 Weeks','Create digital brand assets, social media graphics, and client-ready campaign layouts.',140000,'Beginner-friendly and suitable for motivated creative learners.','Produce design portfolio pieces, campaign assets, and reusable brand systems.','https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80','published',NOW(),NOW()),
('PRG-005','ai-tools','AI Tools for Work','AI Productivity','5 Weeks','Use AI tools for writing, research, business workflows, and practical productivity gains.',95000,'No technical background required.','Design better prompts, automate repetitive work, and improve digital output.','https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=1200&q=80','published',NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "TeacherProgram" ("teacherId","programId","assignedAt")
SELECT t.id, p.id, NOW()
FROM "Teacher" t
JOIN "Program" p ON p.slug IN ('web-development','software-engineering','cloud-devops','graphic-design','ai-tools')
WHERE t."teacherId" = 'TCH1001'
ON CONFLICT ("teacherId","programId") DO NOTHING;

INSERT INTO "Student" ("studentId","matricle","userId","program","level","gender","address","parentName","parentPhone","status","graduationCounted","enrollmentDate")
SELECT 'STU1001','ELI-STU-1001',u.id,'web-development',1,'female','Bamenda, Cameroon','Mrs Fonkeng','+237677200099','active',false,NOW()
FROM "User" u
WHERE u.email = 'student@elignite.cm'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Student" ("studentId","matricle","userId","program","level","gender","address","parentName","parentPhone","status","graduationCounted","enrollmentDate")
SELECT 'STU1002','ELI-APP-1002',u.id,'software-engineering',1,'male','Bamenda, Cameroon','Mr Nkemdirim','+237677200333','active',false,NOW()
FROM "User" u
WHERE u.email = 'newstudent@elignite.cm'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "StudentProgram" ("studentId","programId","enrolledAt","isPrimary")
SELECT s.id, p.id, NOW(), true
FROM "Student" s
JOIN "Program" p ON p.slug = 'web-development'
WHERE s."studentId" = 'STU1001'
ON CONFLICT ("studentId","programId") DO NOTHING;

INSERT INTO "StudentProgram" ("studentId","programId","enrolledAt","isPrimary")
SELECT s.id, p.id, NOW(), true
FROM "Student" s
JOIN "Program" p ON p.slug = 'software-engineering'
WHERE s."studentId" = 'STU1002'
ON CONFLICT ("studentId","programId") DO NOTHING;

INSERT INTO "Course" ("code","title","description","credits","program","programId","level","semester","year","teacherId","room","schedule")
SELECT 'WEB101','Frontend Foundations','HTML, CSS, JavaScript and responsive UI build practice',3,'web-development',p.id,1,'Semester 1',2026,t.id,'Lab 1','Mon/Wed/Fri 08:00-10:00'
FROM "Program" p
JOIN "Teacher" t ON t."teacherId" = 'TCH1001'
WHERE p.slug = 'web-development'
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Course" ("code","title","description","credits","program","programId","level","semester","year","teacherId","room","schedule")
SELECT 'SWE201','Backend and API Engineering','REST APIs, data modeling, testing, and deployment basics',3,'software-engineering',p.id,1,'Semester 1',2026,t.id,'Lab 2','Tue/Thu 10:00-12:00'
FROM "Program" p
JOIN "Teacher" t ON t."teacherId" = 'TCH1001'
WHERE p.slug = 'software-engineering'
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Timetable" ("courseId","dayOfWeek","startTime","endTime","room","semester","year","createdAt","updatedAt")
SELECT c.id,'Monday','08:00','10:00','Lab 1','Semester 1',2026,NOW(),NOW()
FROM "Course" c
WHERE c.code = 'WEB101'
ON CONFLICT ("courseId","dayOfWeek","startTime","semester","year") DO NOTHING;

INSERT INTO "Timetable" ("courseId","dayOfWeek","startTime","endTime","room","semester","year","createdAt","updatedAt")
SELECT c.id,'Tuesday','10:00','12:00','Lab 2','Semester 1',2026,NOW(),NOW()
FROM "Course" c
WHERE c.code = 'SWE201'
ON CONFLICT ("courseId","dayOfWeek","startTime","semester","year") DO NOTHING;

INSERT INTO "Project" ("code","title","description","program","dueDate","maxScore","teacherId","createdAt","updatedAt")
SELECT 'PRJ-WEB-01','Landing Page Build','Build a responsive landing page with reusable sections and polished UI.','web-development',NOW() + INTERVAL '21 days',100,t.id,NOW(),NOW()
FROM "Teacher" t
WHERE t."teacherId" = 'TCH1001'
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Fee" ("studentId","description","amount","dueDate","status","createdAt")
SELECT s.id,'Tuition - First Installment',90000,NOW() + INTERVAL '14 days','pending',NOW()
FROM "Student" s
WHERE s."studentId" = 'STU1001'
AND NOT EXISTS (
  SELECT 1 FROM "Fee" f WHERE f."studentId" = s.id AND f.description = 'Tuition - First Installment'
);

INSERT INTO "Fee" ("studentId","description","amount","dueDate","status","createdAt")
SELECT s.id,'Tuition - First Installment',130000,NOW() + INTERVAL '14 days','pending',NOW()
FROM "Student" s
WHERE s."studentId" = 'STU1002'
AND NOT EXISTS (
  SELECT 1 FROM "Fee" f WHERE f."studentId" = s.id AND f.description = 'Tuition - First Installment'
);

INSERT INTO "Payment" ("studentId","amount","paidAt","createdAt")
SELECT s.id,50000,NOW() - INTERVAL '2 days',NOW() - INTERVAL '2 days'
FROM "Student" s
WHERE s."studentId" = 'STU1001'
AND NOT EXISTS (
  SELECT 1 FROM "Payment" p WHERE p."studentId" = s.id AND p.amount = 50000
);

UPDATE "Fee"
SET "status" = 'paid', "paidDate" = NOW() - INTERVAL '2 days', "receiptNo" = COALESCE("receiptNo", 'RCT-STU1001-001')
WHERE "studentId" = (SELECT id FROM "Student" WHERE "studentId" = 'STU1001')
  AND "description" = 'Tuition - First Installment'
  AND EXISTS (
    SELECT 1 FROM "Payment" p WHERE p."studentId" = "Fee"."studentId" AND p.amount >= "Fee".amount
  );

INSERT INTO "Attendance" ("studentId","courseId","date","status")
SELECT s.id,c.id,NOW()::date - INTERVAL '1 day','present'
FROM "Student" s
JOIN "Course" c ON c.code = 'WEB101'
WHERE s."studentId" = 'STU1001'
ON CONFLICT ("studentId","courseId","date") DO NOTHING;

INSERT INTO "Result" ("studentId","courseId","ca","exam","total","grade","semester","year")
SELECT s.id,c.id,18,52,70,'B','Semester 1',2026
FROM "Student" s
JOIN "Course" c ON c.code = 'WEB101'
WHERE s."studentId" = 'STU1001'
ON CONFLICT ("studentId","courseId","semester","year") DO NOTHING;

INSERT INTO "Certificate" ("certNo","studentId","title","issuedDate","status","createdAt")
SELECT 'CERT202600001',s.id,'Certificate of Completion in Web Development',NOW() - INTERVAL '5 days','issued',NOW() - INTERVAL '5 days'
FROM "Student" s
WHERE s."studentId" = 'STU1001'
ON CONFLICT ("certNo") DO NOTHING;

UPDATE "Student"
SET "status" = CASE WHEN "studentId" = 'STU1001' THEN 'graduated' ELSE "status" END,
    "graduationCounted" = CASE WHEN "studentId" = 'STU1001' THEN true ELSE "graduationCounted" END
WHERE "studentId" IN ('STU1001','STU1002');

INSERT INTO "Enrollment" ("firstName","lastName","email","phone","program","status","matricle","publicAccessToken","approvedAt","approvedBy","createdAt","updatedAt")
VALUES
('Brice','Nkemdirim','applicant@elignite.cm','+237677200444','software-engineering','pending',NULL,'seed-public-token-1001',NULL,NULL,NOW(),NOW()),
('Amira','Tanyi','approvedstudent@elignite.cm','+237677200555','web-development','approved','ELI-APP-1003','seed-public-token-1003',NOW(),(SELECT id FROM "User" WHERE email='ceo@elignite.cm'),NOW(),NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Announcement" ("title","content","targetRole","priority","author","userId","createdAt")
SELECT
  'Orientation Week Schedule',
  'Orientation begins next Monday. Students should report by 08:00 with their enrollment confirmation and learning materials.',
  'student',
  'high',
  'Boclair Nghochu',
  u.id,
  NOW() - INTERVAL '1 day'
FROM "User" u
WHERE u.email = 'ceo@elignite.cm'
AND NOT EXISTS (
  SELECT 1 FROM "Announcement" a WHERE a.title = 'Orientation Week Schedule'
);

INSERT INTO "Message" ("fromName","fromEmail","fromRole","fromUserId","toRole","subject","body","read","createdAt")
SELECT
  'Website Visitor',
  'visitor@example.com',
  'guest',
  NULL,
  'ceo',
  'Need details about weekend classes',
  'Hello, I would like to know whether your software engineering track supports weekend classes for working learners.',
  false,
  NOW() - INTERVAL '3 hours'
WHERE NOT EXISTS (
  SELECT 1 FROM "Message" m WHERE m.subject = 'Need details about weekend classes'
);

INSERT INTO "Event" ("title","slug","category","excerpt","description","eventDate","location","coverImageUrl","videoUrl","galleryItems","isPublished","createdAt","updatedAt")
VALUES
('ELIGNITE Graduation Showcase 2026','elignite-graduation-showcase-2026','Graduation','Highlights from the latest graduation showcase featuring student projects and celebration moments.','A full event recap covering our graduation showcase, project presentations, community recognition, and closing celebration for the 2026 training cohort.',NOW() - INTERVAL '10 days','Bamenda, Cameroon','https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80',NULL,'["https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1200&q=80","https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80"]',true,NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Settings" ("id","applicationsOpen","applicationYear","maintenanceMode","sessionStudentCount","lifetimeStudentCount","lifetimeGraduateCount","updatedAt","updatedBy")
VALUES
(1,true,'2026 Cohort',false,0,0,0,NOW(),(SELECT id FROM "User" WHERE email='ceo@elignite.cm'))
ON CONFLICT ("id") DO UPDATE SET
"applicationsOpen" = EXCLUDED."applicationsOpen",
"applicationYear" = EXCLUDED."applicationYear",
"maintenanceMode" = EXCLUDED."maintenanceMode",
"updatedBy" = EXCLUDED."updatedBy",
"updatedAt" = NOW();

UPDATE "Settings"
SET
  "sessionStudentCount" = (SELECT COUNT(*) FROM "Student"),
  "lifetimeStudentCount" = GREATEST(COALESCE("Settings"."lifetimeStudentCount", 0), (SELECT COUNT(*) FROM "Student")),
  "lifetimeGraduateCount" = GREATEST(COALESCE("Settings"."lifetimeGraduateCount", 0), (SELECT COUNT(*) FROM "Certificate" WHERE status = 'issued')),
  "updatedAt" = NOW()
WHERE "id" = 1;

INSERT INTO "SchoolSettings" ("id","schoolName","ceoFirstName","ceoLastName","ceoTitle","schoolMotto","schoolAddress","schoolPhone","schoolEmail","aiName","createdAt","updatedAt")
VALUES
(1,'ELIGNITE Training Platform','Boclair','Nghochu','Chief Executive Officer','Practical digital skills for real work','Elegance Junction, UBa first gate, Bamenda','+237670768962 / +237672320608','ceo@elignite.cm','ELI Assist',NOW(),NOW())
ON CONFLICT ("id") DO UPDATE SET
"schoolName" = EXCLUDED."schoolName",
"ceoFirstName" = EXCLUDED."ceoFirstName",
"ceoLastName" = EXCLUDED."ceoLastName",
"ceoTitle" = EXCLUDED."ceoTitle",
"schoolMotto" = EXCLUDED."schoolMotto",
"schoolAddress" = EXCLUDED."schoolAddress",
"schoolPhone" = EXCLUDED."schoolPhone",
"schoolEmail" = EXCLUDED."schoolEmail",
"aiName" = EXCLUDED."aiName",
"updatedAt" = NOW();

INSERT INTO "AboutUs" ("id","vision","visionImageUrl","mission","missionImageUrl","createdAt","updatedAt")
VALUES
(1,'To become a trusted technology training platform where learners build practical digital skills with confidence and career direction.','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80','To help people move into modern tech work through guided learning, applied projects, and support that feels clear and professional.','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',NOW(),NOW())
ON CONFLICT ("id") DO UPDATE SET
"vision" = EXCLUDED."vision",
"visionImageUrl" = EXCLUDED."visionImageUrl",
"mission" = EXCLUDED."mission",
"missionImageUrl" = EXCLUDED."missionImageUrl",
"updatedAt" = NOW();

INSERT INTO "Service" ("name","description","category","icon","imageUrl","isActive","createdAt","updatedAt")
VALUES
('Career Guidance','Track selection, next-step advice, and learner support for ambitious technology learners.','Career','ShieldCheck','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1000&q=80',true,NOW(),NOW()),
('Portfolio Support','Project direction and presentation support for job-facing work and client-ready delivery.','Academic','Briefcase','https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',true,NOW(),NOW()),
('Mentorship','Ongoing accountability, check-ins, and practical coaching through the learning journey.','Welfare','HeartHandshake','https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1000&q=80',true,NOW(),NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Gallery" ("title","category","url","createdAt")
SELECT 'Live coding session','Training','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Gallery" WHERE title = 'Live coding session');

INSERT INTO "Gallery" ("title","category","url","createdAt")
SELECT 'Design workshop','Creative Tech','https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Gallery" WHERE title = 'Design workshop');

INSERT INTO "Gallery" ("title","category","url","createdAt")
SELECT 'Mentor support','Coaching','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Gallery" WHERE title = 'Mentor support');

INSERT INTO "Testimony" ("userId","submitterType","name","program","year","text","rating","status","createdAt","updatedAt")
SELECT
  u.id,
  'student',
  'Amara Fonkeng',
  'Web Development',
  '2026',
  'The platform feels structured, clear, and practical. I could actually see my progress week after week.',
  5,
  'approved',
  NOW(),
  NOW()
FROM "User" u
WHERE u.email = 'student@elignite.cm'
AND NOT EXISTS (
  SELECT 1 FROM "Testimony" t WHERE t.name = 'Amara Fonkeng'
);

COMMIT;
