const {
  PrismaClient,
} = require("@prisma/client");
const bcrypt = require("bcrypt");

const prisma = new PrismaClient();

async function migratePasswords() {
  console.log(
    "Starting password migration...",
  );
  const profiles =
    await prisma.profile.findMany();
  let migratedCount = 0;

  for (const profile of profiles) {
    // Check if password is NOT a bcrypt hash (bcrypt hashes usually start with $2b$ or $2a$ and are 60 chars long)
    if (
      !profile.password.startsWith("$2b$") &&
      !profile.password.startsWith("$2a$")
    ) {
      console.log(
        `Migrating password for user: ${profile.username}`,
      );
      const hashedPassword =
        await bcrypt.hash(
          profile.password,
          12,
        );
      await prisma.profile.update({
        where: { id: profile.id },
        data: { password: hashedPassword },
      });
      migratedCount++;
    }
  }

  console.log(
    `Migration complete! Migrated ${migratedCount} passwords.`,
  );
  await prisma.$disconnect();
}

migratePasswords().catch((e) => {
  console.error(e);
  prisma.$disconnect();
  process.exit(1);
});
