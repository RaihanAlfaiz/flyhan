import { PrismaClient } from "@prisma/client";
import { hashSync } from "@node-rs/bcrypt";

const prisma = new PrismaClient();

async function main() {
  const password = hashSync("password", 10);

  const user = await prisma.user.upsert({
    where: { email: "raihan@example.com" },
    update: {},
    create: {
      name: "Raihan",
      role: "ADMIN",
      email: "raihan@example.com",
      password,
    },
  });

  const promo1 = await prisma.promoCode.upsert({
    where: { code: "FLYHAN50" },
    update: {},
    create: {
      code: "FLYHAN50",
      discount: 50000,
    },
  });

  const promo2 = await prisma.promoCode.upsert({
    where: { code: "MAKINHEMAT" },
    update: {},
    create: {
      code: "MAKINHEMAT",
      discount: 100000,
    },
  });

  console.log({ user, promo1, promo2 });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
