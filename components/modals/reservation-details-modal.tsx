"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { ScrollArea } from "../ui/scroll-area";
import { ManageAgencyForm } from "../forms/manage-agency-form";
import { ManageReservationForm } from "../forms/manage-reservation-form";
import { PenLine } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { format } from "date-fns";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ReservationStatus } from "@prisma/client";
import { toast } from "sonner";
import { useTransition } from "react";
import { updateReservationStatus } from "@/actions/mutations/reservation/update-reservation-status";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import ReservationDetailsForm from "../forms/reservation-details-form";

export const ReservationDetailsModal = () => {
  const { isOpen, onClose, type, data, onOpen } = useModal();

  const isModalOpen = isOpen && type === "reservationDetails";

  const reservation = data?.reservation;

  const [isPending, startTransition] = useTransition();
  const currentUser = useCurrentUser();

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

  if (!reservation) return <></>;
  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black !w-full !max-w-6xl">
        <DialogHeader className="py-2">
          <div dir="rtl" className="flex items-center gap-5">
            <DialogTitle
              dir="rtl"
              className="text-xl text-[#232323] font-semibold text-right">
              تفاصيل الحجز{" "}
            </DialogTitle>
            <PenLine
              onClick={() => onOpen("manageReservation", data)}
              className="h-4 w-4 cursor-pointer"
            />
            <div className="flex items-center space-x-3">
              <Avatar className="text-white">
                <AvatarImage
                  //@ts-ignore
                  src={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME}/${
                    //@ts-ignore
                    reservation.user?.image?.id
                  }`}
                  alt={reservation?.user?.name || ""}
                  className="object-cover"
                />
                <AvatarFallback className="bg-brand">
                  {reservation?.user?.name?.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{reservation?.user?.name}</span>
            </div>
            <h1 className="text-sm text-[#646768]">
              {format(reservation?.createdAt!, "dd/MM/yyyy")}
            </h1>
            {currentUser?.role === "ADMIN" ? (
              <DropdownMenu>
                <DropdownMenuTrigger
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  asChild>
                  <div
                    className={cn(
                      "h-8 px-4 w-fit flex items-center justify-center rounded-[5px] text-xs cursor-pointer",
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
                      onUpdateStatus({
                        reservationId: reservation.id,
                        status: "CONFIRMED",
                        oldStatus: reservation.status,
                      });
                    }}
                    disabled={isPending}
                    className="bg-[#15C84730] text-[#21D954] hover:!text-[#21D954] hover:!bg-[#15C84730] focus-within:bg-[#15C84730] cursor-pointer">
                    مؤكد
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    dir="rtl"
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateStatus({
                        reservationId: reservation.id,
                        status: "PENDING",
                        oldStatus: reservation.status,
                      });
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
            ) : (
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
            )}
          </div>
        </DialogHeader>
        <ScrollArea className="h-[270px]">
          <ReservationDetailsForm />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
