"use client";

import { ReservationWithMembers } from "@/types/types";
import { PenLine, Trash2 } from "lucide-react";
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
import { User } from "@prisma/client";
import { format } from "date-fns";
import qs from "query-string";
import { useModal } from "@/hooks/use-modal-store";

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

  const totalPages = Math.ceil(
    (totalReservations || 0) / (reservationsPerPage || 1)
  );
  const { page, ...rest } = searchParams;

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

  return (
    <div className="h-fit rounded-2xl border border-[#B5B5B56B] p-5">
      <div className="">
        <div className="flex flex-col space-y-6">
          <div className="rounded-md overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  {showTravel && (
                    <TableHead className="text-[#232323] font-medium">
                      Umrah
                    </TableHead>
                  )}
                  {!!reservations.some((reservation) => !!reservation.user) && (
                    <TableHead className="text-[#232323] font-medium">
                      Agence
                    </TableHead>
                  )}
                  <TableHead className="text-[#232323] font-medium">
                    Ref
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Nom de client
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    person
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Date de naissance
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    N° passport
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Date de reseravtion
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Hotel
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="space-y-2">
                {reservations.map((reservation, reservationIdx) =>
                  reservation.reservationMembers.map((member, idx) => (
                    <TableRow
                      onClick={() =>
                        onOpen("manageReservation", {
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
                      {!!reservation?.user && (
                        <>
                          {idx === 0 ? (
                            <TableCell className="font-medium">
                              <div className="flex items-center space-x-3">
                                <Avatar className="text-white">
                                  <AvatarImage
                                    //@ts-ignore
                                    src={`https://${
                                      process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME
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
                      {idx === 0 ? (
                        <TableCell className="text-[#646768]">
                          {reservation.ref}
                        </TableCell>
                      ) : (
                        <TableCell></TableCell>
                      )}
                      <TableCell className="text-[#646768] p-4">
                        {idx === reservation.reservationMembers.length - 1 &&
                          reservationIdx !== reservations.length - 1 && (
                            <div
                              className={`absolute z-[-1] w-full h-[80%] top-[10%] left-0 border-b rounded-lg transition-colors group-hover:bg-muted/50 `}
                            />
                          )}
                        {member.name}
                      </TableCell>
                      <TableCell className="text-[#646768]">
                        {member.type === "ADULT"
                          ? "Adult"
                          : member.type === "CHILD"
                            ? "Enfant"
                            : "Bebe"}
                      </TableCell>
                      <TableCell className="text-[#646768]">
                        {format(member.dob, "dd/MM/yyyy")}
                      </TableCell>
                      <TableCell className="text-[#646768]">
                        {member.passportNumber}
                      </TableCell>
                      {idx === 0 ? (
                        <TableCell className="text-[#646768]">
                          {format(reservation.createdAt, "dd/MM/yyyy")}
                        </TableCell>
                      ) : (
                        <TableCell></TableCell>
                      )}
                      {idx === 0 ? (
                        <TableCell className="text-[#646768]">
                          {reservation.meccahHotel.name}
                          {reservation.madinaHotel &&
                            `, ${reservation.madinaHotel.name}`}
                        </TableCell>
                      ) : (
                        <TableCell></TableCell>
                      )}
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
          {currentPage && totalReservations && reservationsPerPage && (
            <div className="flex flex-col md:!flex-row md:!items-center justify-between gap-4">
              <div className="text-sm text-gray-400">
                Showing {(currentPage - 1) * reservationsPerPage + 1} to{" "}
                {Math.min(currentPage * reservationsPerPage, totalReservations)}{" "}
                of {totalReservations} entries
              </div>
              <div className="flex flex-wrap items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="text-black">
                  Previous
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
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="text-black">
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ReservationsTable;
