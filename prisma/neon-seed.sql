BEGIN;

INSERT INTO "User" ("email","password","firstName","lastName","role","phone","isActivated","matricule","createdAt","updatedAt")
VALUES
('ceo@elignite.cm','$2a$10$.NT.vVUtbTXjWHKzxM0Xfu2LbxAddbC33uToGoO72J5azkjSBg/aK','Boclair','Nghochu','ceo','+237670768962',true,NULL,NOW(),NOW()),
('mentor@elignite.cm','$2a$10$275nHhLKHTvHEDYQLILFmO.OcVr4M1Tig7FC2hi3Wq3X0unBrWHru','Melissa','Ngwa','teacher','+237672320608',true,NULL,NOW(),NOW()),
('trainer.pending@elignite.cm','$2a$10$275nHhLKHTvHEDYQLILFmO.OcVr4M1Tig7FC2hi3Wq3X0unBrWHru','Pauline','Mbah','teacher','+237677000112',false,NULL,NOW(),NOW()),
('student@elignite.cm','$2a$10$y6jCwTVKWVPwZRNP2oxHTutXb1W8RxgIW0QiT8jBX7uG2.3NsEFpO','Amara','Fonkeng','student','+237677200001',true,'ELI-STU-1001',NOW(),NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Teacher" ("teacherId","matricle","userId","occupation","profession","department","specialization","qualifications","office","status","joinDate")
SELECT 'TCH1001','ELI-TCH-1001',u.id,'Lead Instructor','Software Engineer','Technology Training','Web Development and AI Tools','Full-stack engineer with project delivery experience','ELIGNITE Main Hub','active',NOW()
FROM "User" u
WHERE u.email = 'mentor@elignite.cm'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Teacher" ("teacherId","matricle","userId","occupation","profession","department","status","joinDate")
SELECT 'TCH1002','ELI-TCH-1002',u.id,'Trainer','Digital Skills Coach','Technology Training','inactive',NOW()
FROM "User" u
WHERE u.email = 'trainer.pending@elignite.cm'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Student" ("studentId","matricle","userId","program","level","gender","address","parentName","parentPhone","status","enrollmentDate")
SELECT 'STU1001','ELI-STU-1001',u.id,'web-development',1,'female','Bamenda, Cameroon','Mrs Fonkeng','+237677200099','active',NOW()
FROM "User" u
WHERE u.email = 'student@elignite.cm'
ON CONFLICT ("userId") DO NOTHING;

INSERT INTO "Program" ("slug","title","category","duration","description","tuition","requirements","outcomes","teacherId","status","createdAt","updatedAt")
VALUES
('web-development','Web Development','Software','8 Weeks','Learn HTML, CSS, JavaScript, React, deployment, and portfolio-ready frontend delivery.',180000,'Basic computer use, willingness to practice, internet access for assignments','Responsive websites, React interfaces, deployment workflow',(SELECT id FROM "Teacher" WHERE "teacherId"='TCH1001'),'published',NOW(),NOW()),
('software-engineering','Software Engineering','Engineering','12 Weeks','Build backend and frontend thinking with Git, APIs, testing, and team-ready software habits.',260000,'Comfort with beginner programming concepts or strong learning commitment','Project architecture, backend services, version control discipline',(SELECT id FROM "Teacher" WHERE "teacherId"='TCH1001'),'published',NOW(),NOW()),
('cloud-devops','Cloud & DevOps','Infrastructure','10 Weeks','Work through Linux basics, cloud deployment, CI/CD, and modern delivery workflows.',220000,'Basic technical confidence and laptop access','Deployment confidence, CI/CD familiarity, cloud operations basics',(SELECT id FROM "Teacher" WHERE "teacherId"='TCH1001'),'published',NOW(),NOW()),
('graphic-design','Graphic Design','Creative Tech','8 Weeks','Create digital brand assets, social media graphics, client-ready layouts, and visual campaigns.',140000,'Beginner-friendly, creativity and consistency','Design portfolio, brand systems, campaign graphics',(SELECT id FROM "Teacher" WHERE "teacherId"='TCH1001'),'published',NOW(),NOW()),
('ai-tools','AI Tools for Work','AI Productivity','5 Weeks','Use AI tools for writing, research, business workflows, and responsible productivity gains.',95000,'No technical background required','Prompt workflows, faster research, better digital output',(SELECT id FROM "Teacher" WHERE "teacherId"='TCH1001'),'published',NOW(),NOW())
ON CONFLICT ("slug") DO NOTHING;

INSERT INTO "Course" ("code","title","description","credits","program","level","semester","year","teacherId","room","schedule")
VALUES
('WEB101','Frontend Foundations','HTML, CSS, JavaScript and responsive UI build practice',3,'web-development',1,'Cohort A',2026,(SELECT id FROM "Teacher" WHERE "teacherId"='TCH1001'),'Lab 1','Mon/Wed/Fri 8:00-10:00')
ON CONFLICT ("code") DO NOTHING;

INSERT INTO "Enrollment" ("firstName","lastName","email","phone","program","status","matricle","publicAccessToken","approvedAt","approvedBy","createdAt","updatedAt")
VALUES
('Brice','Nkemdirim','newstudent@elignite.cm','+237677200222','software-engineering','approved','ELI-APP-1002','seed-public-token-1002',NOW(),(SELECT id FROM "User" WHERE email='ceo@elignite.cm'),NOW(),NOW())
ON CONFLICT ("email") DO NOTHING;

INSERT INTO "Settings" ("id","applicationsOpen","applicationYear","maintenanceMode","updatedAt","updatedBy")
VALUES
(1,true,'2026 Cohort',false,NOW(),(SELECT id FROM "User" WHERE email='ceo@elignite.cm'))
ON CONFLICT ("id") DO UPDATE SET
"applicationsOpen"=EXCLUDED."applicationsOpen",
"applicationYear"=EXCLUDED."applicationYear",
"maintenanceMode"=EXCLUDED."maintenanceMode",
"updatedAt"=NOW(),
"updatedBy"=EXCLUDED."updatedBy";

INSERT INTO "SchoolSettings" ("id","schoolName","ceoFirstName","ceoLastName","ceoTitle","schoolMotto","schoolAddress","schoolPhone","schoolEmail","aiName","createdAt","updatedAt")
VALUES
(1,'ELIGNITE Training Platform','Boclair','Nghochu','Chief Executive Officer','Practical digital skills for real work','Elegance Junction, UBa first gate, Bamenda','+237670768962 / +237672320608','ceo@elignite.cm','ELI Assist',NOW(),NOW())
ON CONFLICT ("id") DO UPDATE SET
"schoolName"=EXCLUDED."schoolName",
"ceoFirstName"=EXCLUDED."ceoFirstName",
"ceoLastName"=EXCLUDED."ceoLastName",
"ceoTitle"=EXCLUDED."ceoTitle",
"schoolMotto"=EXCLUDED."schoolMotto",
"schoolAddress"=EXCLUDED."schoolAddress",
"schoolPhone"=EXCLUDED."schoolPhone",
"schoolEmail"=EXCLUDED."schoolEmail",
"aiName"=EXCLUDED."aiName",
"updatedAt"=NOW();

INSERT INTO "AboutUs" ("id","vision","visionImageUrl","mission","missionImageUrl","createdAt","updatedAt")
VALUES
(1,'To become a trusted technology training platform where learners build practical digital skills with confidence and career direction.','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80','To help people move into modern tech work through guided learning, applied projects, and support that feels clear and professional.','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',NOW(),NOW())
ON CONFLICT ("id") DO UPDATE SET
"vision"=EXCLUDED."vision",
"visionImageUrl"=EXCLUDED."visionImageUrl",
"mission"=EXCLUDED."mission",
"missionImageUrl"=EXCLUDED."missionImageUrl",
"updatedAt"=NOW();

INSERT INTO "Service" ("name","description","category","icon","isActive","createdAt","updatedAt")
VALUES
('Career Guidance','Track selection, next-step advice, and learner support','Career','ShieldCheck',true,NOW(),NOW()),
('Portfolio Support','Project direction and presentation support for job-facing work','Academic','Briefcase',true,NOW(),NOW()),
('Mentorship','Ongoing coach accountability through the learning journey','Welfare','HeartHandshake',true,NOW(),NOW())
ON CONFLICT DO NOTHING;

INSERT INTO "Gallery" ("title","category","url","createdAt")
SELECT 'Live coding session','Training','https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Gallery" WHERE title='Live coding session');

INSERT INTO "Gallery" ("title","category","url","createdAt")
SELECT 'Design workshop','Creative Tech','https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=1200&q=80',NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Gallery" WHERE title='Design workshop');

INSERT INTO "Gallery" ("title","category","url","createdAt")
SELECT 'Mentor support','Coaching','https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=1200&q=80',NOW()
WHERE NOT EXISTS (SELECT 1 FROM "Gallery" WHERE title='Mentor support');

INSERT INTO "Testimony" ("userId","submitterType","name","program","year","text","rating","status","createdAt","updatedAt")
SELECT u.id,'student','Amara Fonkeng','Web Development','2026','The platform feels structured, clear, and practical. I could actually see my progress week after week.',5,'approved',NOW(),NOW()
FROM "User" u
WHERE u.email='student@elignite.cm'
AND NOT EXISTS (SELECT 1 FROM "Testimony" t WHERE t.name='Amara Fonkeng');

COMMIT;
