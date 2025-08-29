"use client";

import { use, useState } from "react";
import { Search, Check, BadgeCheck, PenLine, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { Hotel, Travel, User } from "@prisma/client";
import { format } from "date-fns";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";
import { useCurrentUser } from "@/hooks/use-current-user";
import { PaymentWithUserWithReservation } from "@/types/types";

interface Props {
  currentPage: number;
  payments: PaymentWithUserWithReservation[];
  totalPayments: number;
  paymentsPerPage: number;
  searchParams: Record<string, string | string[] | undefined>;
}

export default function PaymentsDashboard({
  currentPage,
  paymentsPerPage,
  totalPayments,
  searchParams,
  payments,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { onOpen } = useModal();
  const user = useCurrentUser();

  const totalPages = Math.ceil(totalPayments / paymentsPerPage);
  const { page, ...rest } = searchParams;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const url = qs.stringifyUrl(
        {
          url: "/admin/payments",
          query: {
            page: currentPage + 1,
            ...rest,
          },
        },
        { skipNull: true }
      );
      router.push(url);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      const url = qs.stringifyUrl(
        {
          url: "/admin/payments",
          query: {
            page: currentPage === 2 ? null : currentPage - 1,
            ...rest,
          },
        },
        { skipNull: true }
      );
      router.push(url);
    }
  };

  return (
    <div className="h-fit rounded-2xl border border-[#B5B5B56B] p-5">
      <div className="">
        <div className="flex flex-col space-y-6">
          <div className="rounded-md  overflow-hidden">
            <Table lang="ar">
              <TableHeader lang="ar">
                <TableRow className="border-none">
                  {user?.role === "ADMIN" && (
                    <TableHead className="text-[#232323] font-semibold text-right">
                      وكالة
                    </TableHead>
                  )}
                  <TableHead className="text-[#232323] font-semibold text-center">
                    عمرة
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    رقم الحجز
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    الوقت
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    رقم الدفع
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    المدفوع
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    المتبقي
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody lang="ar" className="space-y-2">
                {payments.map((payment) => {
                  const totalPayments = payment.reservation.payments.reduce(
                    (acc, curr) => acc + Number(curr.amount),
                    0
                  );
                  const total = payment.reservation.reservationRooms.reduce(
                    (acc, room) => {
                      const target = payment.reservation.travel.prices.find(
                        (price) => price.hotelId === room.meccahHotelId
                      );
                      return (
                        acc +
                        Number(
                          room.roomType === "DOUBLE"
                            ? target?.double
                            : room.roomType === "TRIPLE"
                              ? target?.triple
                              : room.roomType === "QUADRUPLE"
                                ? target?.quadruple
                                : target?.quintuple
                        ) +
                        room.reservationMembers
                          .filter((member) => !!member.foodIclusions)
                          .reduce((acc) => acc + Number(target?.food), 0)
                      );
                    },
                    0
                  );
                  return (
                    <TableRow
                      // onClick={() => onOpen("managePayment", { payment })}
                      key={payment.id}
                      className="relative hover:bg-transparent cursor-pointer">
                      {user?.role === "ADMIN" && (
                        <TableCell className="font-medium">
                          <div className="flex items-center space-x-3">
                            <Avatar className="text-white">
                              <AvatarImage
                                //@ts-ignore
                                src={`https://${
                                  process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME
                                }/${
                                  //@ts-ignore
                                  payment.user?.image?.id
                                }`}
                                alt={payment.user?.name || ""}
                                className="object-cover"
                              />
                              <AvatarFallback className="bg-brand">
                                {payment.user.name?.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <span>{payment.user.username}</span>
                          </div>
                        </TableCell>
                      )}
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center p-5">
                        <div
                          className={`absolute z-[-1] w-full h-[80%] top-[10%] left-0 border rounded-lg transition-colors group-hover:bg-muted/50 `}
                        />
                        {payment.reservation.travel.name}
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center">
                        {payment.reservationRef}
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center">
                        {format(payment.createdAt, "dd/MM/yyyy HH:mm")}
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center">
                        {payment.paymentRef}
                      </TableCell>
                      <TableCell
                        dir="ltr"
                        className="text-[#646768] text-center">
                        {payment.amount} da
                      </TableCell>
                      <TableCell
                        dir="ltr"
                        className="text-[#646768] text-center">
                        {total - totalPayments} da
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
          <div className="flex flex-col md:!flex-row md:!items-center justify-between gap-4">
            <div className="flex flex-wrap items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-black">
                التالي
              </Button>
              {Array.from(Array(totalPages).keys()).map((_, idx) => {
                const url = qs.stringifyUrl(
                  {
                    url: "/reservations",
                    query: {
                      page: idx + 1,
                      ...rest,
                    },
                  },
                  { skipNull: true }
                );

                return (
                  <Button
                    key={idx}
                    variant="outline"
                    size="sm"
                    className={cn(
                      "text-white",
                      idx + 1 === currentPage
                        ? "bg-brand border-brand hover:bg-brand/90 hover:text-white"
                        : "text-black hover:bg-brand hover:text-white"
                    )}
                    asChild>
                    <Link href={url}>{idx + 1}</Link>
                  </Button>
                );
              })}
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="text-black">
                السابق
              </Button>
            </div>
            <div dir="rtl" className="text-sm text-gray-400">
              عرض {(currentPage - 1) * paymentsPerPage + 1} إلى{" "}
              {Math.min(currentPage * paymentsPerPage, totalPayments)} من{" "}
              {totalPayments} إدخالات
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
