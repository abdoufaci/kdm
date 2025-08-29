"use client";

import { useState } from "react";
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
import {
  TravelWithHotels,
  TravelWithHotelsWithReservations,
} from "@/types/types";

interface Props {
  currentPage: number;
  travels: TravelWithHotelsWithReservations[];
  totalTravels: number;
  travelsPerPage: number;
  searchParams: Record<string, string | string[] | undefined>;
  hotels: Hotel[];
  isPublic?: boolean;
}

export default function TravelsDashboard({
  currentPage,
  travelsPerPage,
  totalTravels,
  searchParams,
  travels,
  hotels,
  isPublic = false,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { onOpen } = useModal();
  const user = useCurrentUser();

  const totalPages = Math.ceil(totalTravels / travelsPerPage);
  const { page, ...rest } = searchParams;

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const url = qs.stringifyUrl(
        {
          url: "/travels",
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
          url: "/travels",
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
                  <TableHead className="text-[#232323] font-medium"></TableHead>
                  {!isPublic && (
                    <TableHead className="text-[#232323] font-semibold text-center">
                      التي حجزتها
                    </TableHead>
                  )}
                  <TableHead className="text-[#232323] font-semibold text-center">
                    {isPublic ? "المقاعد" : "المتبقية"}
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    التوزيع
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    المدة
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    العودة
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    انطلاقة
                  </TableHead>
                  <TableHead className="text-[#232323] font-semibold text-center">
                    عمرة
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody lang="ar" className="space-y-2">
                {travels.map((travel) => {
                  const savedSpots = travel?.reservations
                    .filter((reservation) => reservation.status !== "CANCELLED")
                    .reduce(
                      (acc, reservation) =>
                        acc +
                        reservation.reservationRooms.reduce(
                          (acc, room) =>
                            acc +
                            room.reservationMembers.filter(
                              (member) => member.type === "ADULT"
                            ).length,
                          0
                        ),
                      0
                    );
                  const agencySavedSpots = isPublic
                    ? 0
                    : travel?.reservations
                        .filter(
                          (reservation) =>
                            reservation.status !== "CANCELLED" &&
                            reservation.userId === user?.id
                        )
                        .reduce(
                          (acc, reservation) =>
                            acc +
                            reservation.reservationRooms.reduce(
                              (acc, room) =>
                                acc +
                                room.reservationMembers.filter(
                                  (member) => member.type === "ADULT"
                                ).length,
                              0
                            ),
                          0
                        );
                  return (
                    <TableRow
                      onClick={() =>
                        !isPublic && router.push(`/travel/${travel.id}`)
                      }
                      key={travel.id}
                      className="relative hover:bg-transparent cursor-pointer">
                      {!isPublic && (
                        <TableCell>
                          <div className="flex items-center gap-4">
                            {Number(travel?.availabelSpots) - savedSpots >
                              0 && (
                              <Button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  e.preventDefault();
                                  onOpen("manageReservation", {
                                    travel,
                                    hotels: travel.hotels,
                                  });
                                }}
                                variant={"blackOutline"}
                                size={"sm"}
                                className="text-xs px-8">
                                احجز
                              </Button>
                            )}

                            {user?.role === "ADMIN" && (
                              <>
                                <PenLine
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    onOpen("manageTravel", {
                                      travel,
                                      hotels,
                                      isEdit: true,
                                    });
                                  }}
                                  className="h-4 w-4 text-[#8E8E8E] cursor-pointer"
                                />
                              </>
                            )}
                          </div>
                        </TableCell>
                      )}
                      {isPublic ? (
                        <TableCell></TableCell>
                      ) : (
                        <TableCell
                          dir="rtl"
                          className="text-[#646768] text-center">
                          {agencySavedSpots} مقعد
                        </TableCell>
                      )}
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center ">
                        {isPublic ? (
                          <div className="flex items-center justify-center">
                            <div
                              className={cn(
                                "h-8 px-4 w-fit flex items-center justify-center rounded-[5px] text-xs",
                                Number(travel?.availabelSpots) - savedSpots > 15
                                  ? "bg-[#15C84730] text-[#21D954]"
                                  : Number(travel?.availabelSpots) -
                                        savedSpots <=
                                      0
                                    ? "bg-[#F8030736] text-[#EB1F1F]"
                                    : "bg-[#F2BA0530] text-[#F2BA05]"
                              )}>
                              {Number(travel?.availabelSpots) - savedSpots > 15
                                ? "متوفرة"
                                : Number(travel?.availabelSpots) - savedSpots <=
                                    0
                                  ? " غير متوفرة"
                                  : "مقاعد محدودة"}
                            </div>
                          </div>
                        ) : (
                          <>
                            {Number(travel?.availabelSpots) - savedSpots} مقعد
                          </>
                        )}
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center">
                        {travel.meccahMadinaDays}
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center">
                        {travel.duration} ليالي
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center">
                        {travel.leavePlace} - {travel.arriveTime} -{" "}
                        {format(travel.arriveDate, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] text-center">
                        {travel.arrivePlace} - {travel.departTime} -
                        {format(travel.departDate, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell
                        dir="rtl"
                        className="text-[#646768] p-5 text-center">
                        <div
                          className={`absolute z-[-1] w-full h-[80%] top-[10%] left-0 border rounded-lg transition-colors group-hover:bg-muted/50 `}
                        />
                        {travel.name}
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:!flex-row md:!items-center justify-between gap-4">
            <div dir="rtl" className="text-sm text-gray-400">
              عرض {(currentPage - 1) * travelsPerPage + 1} إلى{" "}
              {Math.min(currentPage * travelsPerPage, totalTravels)} من{" "}
              {totalTravels} إدخالات
            </div>
            <div className="flex flex-wrap items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevPage}
                disabled={currentPage === 1}
                className="text-black">
                السابق
              </Button>
              {Array.from(Array(totalPages).keys()).map((_, idx) => {
                const url = qs.stringifyUrl(
                  {
                    url: "/travels",
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
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className="text-black">
                التالي
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
