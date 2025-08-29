import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { ExtendedUser } from "@/types/next-auth";

export const getPaymentsCount = async ({
  user,
  searchParams,
}: {
  user?: ExtendedUser;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) => {
  const { agency, search } = await searchParams;

  return await db.payment.count({
    where: {
      ...(search && {
        OR: [
          {
            paymentRef: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            reservationRef: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            reservation: {
              travel: {
                name: {
                  contains: search,
                  mode: "insensitive",
                },
              },
            },
          },
          {
            user: {
              username: {
                contains: search,
                mode: "insensitive",
              },
            },
          },
        ],
      }),
      ...(agency && {
        userId: agency,
      }),
      ...(user?.role === "USER" && {
        userId: user.id || "",
      }),
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};
