"use client";

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
  currentPage: number;
  agencies: User[];
  totalAgencies: number;
  agenciesPerPage: number;
  searchParams: Record<string, string | string[] | undefined>;
}

export default function AgenciesDashboard({
  currentPage,
  agenciesPerPage,
  totalAgencies,
  searchParams,
  agencies,
}: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const { onOpen } = useModal();

  const totalPages = Math.ceil(totalAgencies / agenciesPerPage);

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      const url = qs.stringifyUrl(
        {
          url: "/admin",
          query: {
            page: currentPage + 1,
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
    if (currentPage > 1) {
      const url = qs.stringifyUrl(
        {
          url: "/admin",
          query: {
            page: currentPage === 2 ? null : currentPage - 1,
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
          <div className="rounded-md  overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="border-none">
                  <TableHead className="text-[#232323] font-medium">
                    Agence
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Email
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Telephone
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Adress
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Date de création
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Username
                  </TableHead>
                  <TableHead className="text-[#232323] font-medium">
                    Password
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="space-y-2">
                {agencies.map((agency) => (
                  <TableRow
                    key={agency.id}
                    className="relative hover:bg-transparent">
                    <TableCell className="font-medium p-4">
                      <div
                        className={`absolute z-[-1] w-full h-[80%] top-[10%] left-0 border rounded-lg transition-colors group-hover:bg-muted/50 `}
                      />
                      <div className="flex items-center space-x-3">
                        <Avatar>
                          <AvatarImage
                            //@ts-ignore
                            src={`https://${
                              process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME
                            }/${
                              //@ts-ignore
                              agency?.image?.id
                            }`}
                            alt={agency.name || ""}
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-brand text-white">
                            {agency.name?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <span>{agency.name}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {agency.email}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {agency.phone}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {agency.address}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {format(agency.createdAt, "dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      {agency?.username}
                    </TableCell>
                    <TableCell className="text-[#646768]">
                      <Button
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onOpen("setAgencyPassword", {
                            user: agency,
                          });
                        }}
                        variant={"blackOutline"}
                        size={"sm"}
                        className="text-xs">
                        Set Password
                      </Button>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-4">
                        <PenLine
                          onClick={() =>
                            onOpen("manageAgency", {
                              user: agency,
                              isEdit: true,
                            })
                          }
                          className="h-4 w-4 text-[#8E8E8E] cursor-pointer"
                        />
                        <Trash2
                          onClick={() => onOpen("deleteUser", { user: agency })}
                          className="h-4 w-4 text-[#CE2A2A] cursor-pointer"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex flex-col md:!flex-row md:!items-center justify-between gap-4">
            <div className="text-sm text-gray-400">
              Showing {(currentPage - 1) * agenciesPerPage + 1} to{" "}
              {Math.min(currentPage * agenciesPerPage, totalAgencies)} of{" "}
              {totalAgencies} entries
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
                    url: "/admin",
                    query: {
                      page: idx + 1,
                      search: searchParams.search,
                      dateFrom: searchParams.dateFrom,
                      dateTo: searchParams.dateTo,
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
