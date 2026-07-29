import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create a dummy user
  const user = await prisma.profile.upsert({
    where: { username: "peternak_dummy" },
    update: {},
    create: {
      username: "peternak_dummy",
      password: "password123",
      fullName: "Bapak Peternak",
      role: "PRODUCER",
      farmName: "Peternakan Sejahtera",
    },
  });

  // Create Commodity Prices (Bapanas Simulation)
  await prisma.commodityPrice.createMany({
    data: [
      {
        commodity: "CORN",
        pricePerKg: 5400,
        region: "Jawa Timur",
      },
      {
        commodity: "SOYBEAN",
        pricePerKg: 12500,
        region: "Jawa Timur",
      },
      {
        commodity: "RICE_BRAN",
        pricePerKg: 3200,
        region: "Jawa Timur",
      },
    ],
  });

  // Create some Financial Transactions
  await prisma.transaction.createMany({
    data: [
      {
        type: "EXPENSE",
        category: "FEED",
        amount: 1500000,
        description: "Purchased 300kg Corn",
        userId: user.id,
      },
      {
        type: "EXPENSE",
        category: "VACCINE",
        amount: 250000,
        description:
          "NDV Vaccine for Batch A",
        userId: user.id,
      },
    ],
  });

  // Create Seller Events
  await prisma.sellerEvent.createMany({
    data: [
      {
        title: "Panen Jagung",
        description:
          "Panen jagung musim ini",
        eventDate: new Date(),
        type: "HARVEST",
        sellerId: user.id,
      },
    ],
  });

  console.log(
    "Database seeded successfully!",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
