const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash("admin123", 10);

  const existingAdmin = await prisma.user.findFirst({
    where: {
      role: "admin",
      email: "admin@example.com",
    },
  });

  if (!existingAdmin) {
    await prisma.user.create({
      data: {
        name: "Super Admin",
        email: "admin@internlink.com",
        password: hashedPassword,
        role: "admin",
        status:"approved",
        verified:true,
      },
    });

    console.log("✅ Admin user created.");
  } else {
    console.log("ℹ️ Admin already exists.");
  }
}

main()
  .catch((e) => {
    console.error("❌ Seeding error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
