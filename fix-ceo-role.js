const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function fixCeoRole() {
  try {
    console.log("🔧 Fixing CEO role authorization...\n");

    // Find the CEO user (assuming it's the admin user)
    const ceoUser = await prisma.user.findFirst({
      where: {
        email: {
          in: [
            "admin@edumanage.cm",
            "admin@school.com",
            "ceo@school.com",
          ],
        },
      },
    });

    if (!ceoUser) {
      console.log("❌ No CEO user found with common admin emails");
      console.log("   Checking all non-student users...\n");

      const users = await prisma.user.findMany({
        where: {
          role: { not: "student" },
        },
      });

      if (users.length === 0) {
        console.log("⚠️  No non-student users found. Here are all users:");
        const allUsers = await prisma.user.findMany();
        allUsers.forEach((u) => {
          console.log(`   ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`);
        });
      } else {
        console.log("Found potential CEO/Admin users:");
        users.forEach((u) => {
          console.log(`   ID: ${u.id}, Email: ${u.email}, Role: ${u.role}`);
        });
      }

      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`Found CEO user: ${ceoUser.email}`);
    console.log(`Current role: ${ceoUser.role}\n`);

    if (ceoUser.role === "ceo") {
      console.log("✅ CEO role is already correctly set!");
    } else {
      // Update the role to "ceo"
      const updated = await prisma.user.update({
        where: { id: ceoUser.id },
        data: { role: "ceo" },
      });

      console.log(`✅ Successfully updated role from "${ceoUser.role}" to "ceo"`);
      console.log(`   User: ${updated.email}`);
    }

    console.log("\n🎉 Fix complete! Your CEO account now has full permissions.");
    console.log(
      "   - You can now add staff members"
    );
    console.log("   - You can now record student payments");
    console.log("\n💡 Tip: Log out and log back in for changes to take effect.");
  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixCeoRole();
