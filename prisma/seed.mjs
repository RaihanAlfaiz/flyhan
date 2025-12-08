import { PrismaClient } from "@prisma/client";
import { hashSync } from "@node-rs/bcrypt";

const prisma = new PrismaClient();

async function main() {
  const userSeed = await prisma.user.create({
    data: {
      name: "Raihan",
      role: "ADMIN",
      email: "raihan@example.com",
      password: hashSync("password", 10),
    },
  });

  console.log(userSeed);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
