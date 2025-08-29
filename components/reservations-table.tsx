"use client";

import { ReservationWithMembers } from "@/types/types";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { ReservationStatus, User } from "@prisma/client";
import { format } from "date-fns";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useTransition } from "react";
import { toast } from "sonner";
import { roomTypes } from "@/constants/room-type";
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import { updateReservationStatus } from "@/actions/mutations/reservation/update-reservation-status";

interface Props {
  reservations: ReservationWithMembers[];
  totalReservations?: number;
  reservationsPerPage?: number;
  currentPage?: number;
  searchParams: Record<string, string | string[] | undefined>;
  showTravel?: boolean;
}

function ReservationsTable({
  reservations,
  currentPage,
  reservationsPerPage,
  totalReservations,
  searchParams,
  showTravel = false,
}: Props) {
  const router = useRouter();
  const { onOpen } = useModal();
  const user = useCurrentUser();
  const [isPending, startTransition] = useTransition();

  const totalPages = Math.ceil(
    (totalReservations || 0) / (reservationsPerPage || 1)
  );
  const { page, ...rest } = searchParams;

  const savedSpots = reservations
    .filter((reservation) => reservation.status !== "CANCELLED")
    .reduce(
      (acc, reservation) =>
        acc +
        reservation.reservationRooms.reduce(
          (acc, room) =>
            acc +
            room.reservationMembers.filter((member) => member.type === "ADULT")
              .length,
          0
        ),
      0
    );

  const handleNextPage = () => {
    if ((currentPage || 0) < totalPages) {
      const url = qs.stringifyUrl(
        {
          url: "/reservations",
          query: {
            page: (currentPage || 0) + 1,
            search: searchParams.search,
            dateFrom: searchParams.dateFrom,
            dateTo: searchParams.dateTo,
          },
        },
        { skipNull: true }
      );
      router.push(url);
    }
  };

  const handlePrevPage = () => {
    if ((currentPage || 0) > 1) {
      const url = qs.stringifyUrl(
        {
          url: "/reservations",
          query: {
            page: currentPage === 2 ? null : (currentPage || 0) - 1,
            search: searchParams.search,
            dateFrom: searchParams.dateFrom,
            dateTo: searchParams.dateTo,
          },
        },
        { skipNull: true }
      );
      router.push(url);
    }
  };

  const onUpdateStatus = async (data: {
    reservationId: string;
    status: ReservationStatus;
    oldStatus: ReservationStatus;
  }) => {
    toast.loading("جاري تحديث الحالة...");
    startTransition(() => {
      updateReservationStatus(data)
        .then(() => toast.success("تم تحديث الحالة"))
        .catch(() => toast.error("حدث خطأ ما"))
        .finally(() => toast.dismiss());
    });
  };

  return (
    <div className="h-fit rounded-2xl border border-[#B5B5B56B] p-5">
      <div className="">
        <div className="flex flex-col space-y-6">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  {showTravel && (
                    <TableHead className="text-[#232323] font-medium text-center">
                      عمرة
                    </TableHead>
                  )}
                  {user?.role === "ADMIN" && (
                    <TableHead className="text-[#232323] font-medium text-center">
                      الوكالة
                    </TableHead>
                  )}
                  <TableHead className="text-[#232323] font-medium text-center">
                    رقم الحجز
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    اسم
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    جنس
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    تاريخ الحجز
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    فندق
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    غرفة
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    حالة الحجز
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    مبلغ الحجز
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium text-center">
                    الدفع
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="space-y-2">
                {reservations.map((reservation, reservationIdx) => {
                  const total = reservation.reservationRooms.reduce(
                    (acc, room) => {
                      const target = reservation.travel.prices.find(
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
                  const totalPayments = reservation.payments.reduce(
                    (acc, curr) => acc + Number(curr.amount),
                    0
                  );
                  return reservation.reservationRooms.map((room, idx) =>
                    room.reservationMembers.map((member, memberIdx) => (
                      <TableRow
                        onClick={() =>
                          onOpen("reservationDetails", {
                            reservation,
                            travel: reservation.travel,
                            isEdit: true,
                          })
                        }
                        key={`${reservation.id}-${member.id}`}
                        className="relative hover:bg-transparent cursor-pointer">
                        {showTravel && (
                          <>
                            {idx === 0 ? (
                              <TableCell className="text-[#646768] p-4">
                                {reservation.travel.name}
                              </TableCell>
                            ) : (
                              <TableCell></TableCell>
                            )}
                          </>
                        )}
                        {user?.role === "ADMIN" && !!reservation.user && (
                          <>
                            {memberIdx === 0 && idx === 0 ? (
                              <TableCell className="font-medium">
                                <div className="flex items-center space-x-3">
                                  <Avatar className="text-white">
                                    <AvatarImage
                                      //@ts-ignore
                                      src={`https://${
                                        process.env
                                          .NEXT_PUBLIC_BUNNY_CDN_HOSTNAME
                                      }/${
                                        //@ts-ignore
                                        reservation.user?.image?.id
                                      }`}
                                      alt={reservation.user?.name || ""}
                                      className="object-cover"
                                    />
                                    <AvatarFallback className="bg-brand">
                                      {reservation.user.name?.charAt(0)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span>{reservation.user.name}</span>
                                </div>
                              </TableCell>
                            ) : (
                              <TableCell></TableCell>
                            )}
                          </>
                        )}
                        {memberIdx === 0 && idx === 0 ? (
                          <TableCell className="text-[#646768] text-center">
                            {reservation.ref}
                          </TableCell>
                        ) : (
                          <TableCell></TableCell>
                        )}
                        <TableCell
                          dir="rtl"
                          className={cn(
                            "text-[#646768] p-4 text-center",
                            memberIdx === room.reservationMembers.length - 1 &&
                              idx !== reservation.reservationRooms.length - 1 &&
                              "border-b"
                          )}>
                          {memberIdx === room.reservationMembers.length - 1 &&
                            idx === reservation.reservationRooms.length - 1 &&
                            reservationIdx !== reservations.length - 1 && (
                              <div
                                className={`absolute z-[-1] w-full h-[80%] top-[10%] left-0 border-b rounded-lg transition-colors group-hover:bg-muted/50 `}
                              />
                            )}
                          <div className="flex items-center justify-center gap-2">
                            <h1>{member.name}</h1>
                            {member.foodIclusions && (
                              <svg
                                width="14"
                                height="18"
                                viewBox="0 0 14 18"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg">
                                <path
                                  d="M0.349271 1.57566C0.364278 1.39323 0.44903 1.2236 0.585901 1.10206C0.722772 0.980515 0.901228 0.916408 1.08416 0.923071C1.26708 0.929735 1.4404 1.00665 1.56807 1.13784C1.69573 1.26902 1.76792 1.44436 1.76961 1.6274V5.26031C1.76961 5.3943 1.82284 5.52282 1.9176 5.61757C2.01235 5.71232 2.14086 5.76555 2.27486 5.76555C2.40886 5.76555 2.53737 5.71232 2.63212 5.61757C2.72687 5.52282 2.7801 5.3943 2.7801 5.26031V1.52231C2.7801 1.36151 2.84398 1.2073 2.95768 1.09359C3.07138 0.979893 3.22559 0.916016 3.38639 0.916016C3.54719 0.916016 3.7014 0.979893 3.81511 1.09359C3.92881 1.2073 3.99269 1.36151 3.99269 1.52231V5.26031C3.99269 5.3943 4.04592 5.52282 4.14067 5.61757C4.23542 5.71232 4.36393 5.76555 4.49793 5.76555C4.63193 5.76555 4.76044 5.71232 4.85519 5.61757C4.94994 5.52282 5.00317 5.3943 5.00317 5.26031V1.6274C5.00487 1.44436 5.07705 1.26902 5.20472 1.13784C5.33239 1.00665 5.5057 0.929735 5.68863 0.923071C5.87156 0.916408 6.05001 0.980515 6.18689 1.10206C6.32376 1.2236 6.40851 1.39323 6.42352 1.57566C6.45828 2.0704 6.61995 4.44868 6.61995 5.76636C6.61995 6.85768 6.07833 7.8229 5.25216 8.40737C5.07755 8.53105 5.03551 8.66201 5.03955 8.7283C5.13898 10.2465 5.40737 14.4016 5.40737 15.0604C5.40737 15.5964 5.19445 16.1105 4.81544 16.4895C4.43643 16.8685 3.92239 17.0814 3.38639 17.0814C2.8504 17.0814 2.33635 16.8685 1.95735 16.4895C1.57834 16.1105 1.36542 15.5964 1.36542 15.0604C1.36542 14.4008 1.6338 10.2465 1.73324 8.7283C1.73728 8.66201 1.69524 8.53105 1.52063 8.40737C1.09793 8.10875 0.75308 7.71302 0.515067 7.25346C0.277054 6.79389 0.152829 6.2839 0.152832 5.76636C0.152832 4.44868 0.31451 2.0704 0.349271 1.57566ZM7.83254 5.56426C7.83254 4.33147 8.32226 3.14917 9.19398 2.27745C10.0657 1.40574 11.248 0.916016 12.4808 0.916016C12.6416 0.916016 12.7958 0.979893 12.9095 1.09359C13.0232 1.2073 13.0871 1.36151 13.0871 1.52231V8.39363C13.0871 8.65069 13.1728 9.92553 13.269 11.3378L13.273 11.4049C13.3781 12.9473 13.4913 14.6247 13.4913 15.0604C13.4913 15.5964 13.2783 16.1105 12.8993 16.4895C12.5203 16.8685 12.0063 17.0814 11.4703 17.0814C10.9343 17.0814 10.4203 16.8685 10.0413 16.4895C9.66224 16.1105 9.44932 15.5964 9.44932 15.0604C9.44932 14.6449 9.55279 12.9497 9.65304 11.3952C9.70316 10.6102 9.75408 9.84954 9.79208 9.28528L9.81067 8.99992H9.24722C9.06144 8.99992 8.87748 8.96333 8.70585 8.89223C8.53421 8.82114 8.37826 8.71693 8.24689 8.58557C8.11553 8.4542 8.01132 8.29825 7.94023 8.12661C7.86913 7.95497 7.83254 7.77101 7.83254 7.58524V5.56426Z"
                                  fill="#D45847"
                                />
                              </svg>
                            )}
                          </div>
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-[#646768] text-center",
                            memberIdx === room.reservationMembers.length - 1 &&
                              idx !== reservation.reservationRooms.length - 1 &&
                              "border-b"
                          )}>
                          {member.sex} -{" "}
                          {member.type === "ADULT"
                            ? "بالغ"
                            : member.type === "CHILD"
                              ? "طفل"
                              : "رضيع"}{" "}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-[#646768] text-center",
                            memberIdx === room.reservationMembers.length - 1 &&
                              idx !== reservation.reservationRooms.length - 1 &&
                              "border-b"
                          )}>
                          {format(reservation.createdAt, "dd/MM/yyyy")}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-[#646768] text-center",
                            memberIdx === room.reservationMembers.length - 1 &&
                              idx !== reservation.reservationRooms.length - 1 &&
                              "border-b"
                          )}>
                          {room.meccahHotel.name}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "text-[#646768] text-center",
                            memberIdx === room.reservationMembers.length - 1 &&
                              idx !== reservation.reservationRooms.length - 1 &&
                              "border-b"
                          )}>
                          {roomTypes[room.roomType as keyof typeof roomTypes]}
                        </TableCell>
                        {memberIdx === 0 && idx === 0 ? (
                          <TableCell className="text-[#646768] text-center flex justify-center">
                            <DropdownMenu>
                              <DropdownMenuTrigger
                                onClick={(e) => {
                                  e.stopPropagation();
                                }}
                                asChild>
                                <div
                                  className={cn(
                                    "h-8 px-4 w-fit flex items-center justify-center rounded-[5px] text-xs",
                                    reservation.status === "CONFIRMED"
                                      ? "bg-[#15C84730] text-[#21D954]"
                                      : reservation.status === "CANCELLED"
                                        ? "bg-[#F8030736] text-[#EB1F1F]"
                                        : "bg-[#F2BA0530] text-[#F2BA05]"
                                  )}>
                                  {reservation.status === "CONFIRMED"
                                    ? "مؤكد"
                                    : reservation.status === "CANCELLED"
                                      ? "ملغي"
                                      : "غير مؤكد"}
                                </div>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent className="space-y-1">
                                <DropdownMenuItem
                                  dir="rtl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      Number(
                                        reservation.travel.availabelSpots
                                      ) -
                                        (savedSpots +
                                          reservation.reservationRooms.reduce(
                                            (acc, room) =>
                                              acc +
                                              room.reservationMembers.length,
                                            0
                                          )) <=
                                        0 &&
                                      reservation.status === "CANCELLED"
                                    ) {
                                      toast.error("اماكن غير كافية");
                                    } else {
                                      onUpdateStatus({
                                        reservationId: reservation.id,
                                        status: "CONFIRMED",
                                        oldStatus: reservation.status,
                                      });
                                    }
                                  }}
                                  disabled={isPending}
                                  className="bg-[#15C84730] text-[#21D954] hover:!text-[#21D954] hover:!bg-[#15C84730] focus-within:bg-[#15C84730] cursor-pointer">
                                  مؤكد
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  dir="rtl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (
                                      Number(
                                        reservation.travel.availabelSpots
                                      ) -
                                        (savedSpots +
                                          reservation.reservationRooms.reduce(
                                            (acc, room) =>
                                              acc +
                                              room.reservationMembers.length,
                                            0
                                          )) <=
                                        0 &&
                                      reservation.status === "CANCELLED"
                                    ) {
                                      toast.error("اماكن غير كافية");
                                    } else {
                                      onUpdateStatus({
                                        reservationId: reservation.id,
                                        status: "PENDING",
                                        oldStatus: reservation.status,
                                      });
                                    }
                                  }}
                                  disabled={isPending}
                                  className="bg-[#F2BA0530] text-[#F2BA05] hover:!text-[#F2BA05] hover:!bg-[#F2BA0530] focus-within:bg-[#F2BA0530] cursor-pointer">
                                  غير مؤكد
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  dir="rtl"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onUpdateStatus({
                                      reservationId: reservation.id,
                                      status: "CANCELLED",
                                      oldStatus: reservation.status,
                                    });
                                  }}
                                  disabled={isPending}
                                  className="bg-[#F8030736] text-[#EB1F1F] hover:!text-[#EB1F1F] hover:!bg-[#F8030736] focus-within:bg-[#F8030736] cursor-pointer">
                                  ملغى
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        ) : (
                          <TableCell></TableCell>
                        )}
                        {memberIdx === 0 && idx === 0 ? (
                          <TableCell
                            dir="ltr"
                            className="text-[#646768] text-center">
                            {total} da
                          </TableCell>
                        ) : (
                          <TableCell></TableCell>
                        )}
                        {memberIdx === 0 && idx === 0 ? (
                          <TableCell className="text-[#646768] text-center flex justify-center">
                            <HoverCard>
                              <HoverCardTrigger>
                                <div
                                  className={cn(
                                    "h-8 px-4 w-fit flex items-center justify-center rounded-[5px] text-xs",
                                    reservation.paymentStatus === "COMPLETED"
                                      ? "bg-[#15C84730] text-[#21D954]"
                                      : "bg-[#F2BA0530] text-[#F2BA05]"
                                  )}>
                                  {reservation.paymentStatus === "COMPLETED"
                                    ? "كلي"
                                    : "جزئي"}
                                </div>
                              </HoverCardTrigger>
                              <HoverCardContent className="p-3 w-fit">
                                <div className="space-y-3">
                                  <div className="flex items-center gap-4 w-full justify-between">
                                    <h1 className="font-semibold text-sm">
                                      {total - totalPayments} da
                                    </h1>
                                    <span className="text-[#8C8C8C] text-sm text-right">
                                      المبلغ المتبقي
                                    </span>
                                  </div>
                                  <div className="flex  items-center gap-4 w-full justify-between">
                                    <h1 className="font-semibold text-sm">
                                      {totalPayments} da
                                    </h1>
                                    <span className="text-[#8C8C8C] text-sm text-right">
                                      المبلغ المدفوع
                                    </span>
                                  </div>
                                </div>
                              </HoverCardContent>
                            </HoverCard>
                          </TableCell>
                        ) : (
                          <TableCell></TableCell>
                        )}
                      </TableRow>
                    ))
                  );
                })}
              </TableBody>
            </Table>
          </div>
          {currentPage && totalReservations && reservationsPerPage && (
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
                عرض {(currentPage - 1) * reservationsPerPage + 1} إلى{" "}
                {Math.min(currentPage * reservationsPerPage, totalReservations)}{" "}
                من {totalReservations} إدخالات
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReservationsTable;
