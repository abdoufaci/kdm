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
}

export default function TravelsDashboard({
  currentPage,
  travelsPerPage,
  totalTravels,
  searchParams,
  travels,
  hotels,
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
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="text-[#232323] font-medium">
                    Umrah
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Ref
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    date de départ
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    date l'arrivée
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    duration
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    distribution
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    place restant
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Vous reserve
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="space-y-2">
                {travels.map((travel) => (
                  <TableRow
                    onClick={() => router.push(`/travel/${travel.id}`)}
                    key={travel.id}
                    className="relative hover:bg-transparent cursor-pointer">
                    <TableCell className="text-[#646768] p-5">
                      <div
                        className={`absolute z-[-1] w-full h-[80%] top-[10%] left-0 border rounded-lg transition-colors group-hover:bg-muted/50 `}
                      />
                      {travel.name}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {travel.ref}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {format(travel.departDate, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {format(travel.arriveDate, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {travel.duration} nuits
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {travel.meccahMadinaDays}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {travel?.availabelSpots} Place
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {travel?.reservations.reduce(
                        (acc, reservation) =>
                          acc +
                          reservation.reservationMembers.filter(
                            (member) => member.type !== "BABY"
                          ).length,
                        0
                      )}{" "}
                      Place
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
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
                          className="text-xs">
                          Reserve
                        </Button>

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
                            <Trash2
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                onOpen("deleteTravel", { travel });
                              }}
                              className="h-4 w-4 text-[#CE2A2A] cursor-pointer"
                            />
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:!flex-row md:!items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * travelsPerPage + 1} to{" "}
              {Math.min(currentPage * travelsPerPage, totalTravels)} of{" "}
              {totalTravels} entries
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
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
