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

export const ManageReservationModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "manageReservation";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <DialogTitle className="text-xl text-[#232323] font-semibold text-left">
            Detail de réservation{" "}
            {data?.reservation && (
              <span className="text-brand text-xs">{data.reservation.ref}</span>
            )}
          </DialogTitle>
        </DialogHeader>
        <ManageReservationForm />
      </DialogContent>
    </Dialog>
  );
};
