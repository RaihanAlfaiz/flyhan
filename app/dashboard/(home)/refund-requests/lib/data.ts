import prisma from "@/lib/prisma";

export async function getRefundRequests() {
  return prisma.refundRequest.findMany({
    include: {
      ticket: {
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          flight: {
            include: {
              plane: true,
            },
          },
          seat: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getRefundRequestById(id: string) {
  return prisma.refundRequest.findUnique({
    where: { id },
    include: {
      ticket: {
        include: {
          customer: true,
          flight: {
            include: {
              plane: true,
            },
          },
          seat: true,
          passenger: true,
        },
      },
    },
  });
}
