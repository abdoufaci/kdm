"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogOverlay,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
import { useTransition } from "react";
import { toast } from "sonner";
import { useModal } from "@/hooks/use-modal-store";
import { deleteUser } from "@/actions/mutations/users/delete-user";
import { deleteReservation } from "@/actions/mutations/reservation/delete-reservation";

export const DeleteReservationModal = () => {
  const { isOpen, onClose, type, onOpen, data } = useModal();
  const [isPending, startTranstion] = useTransition();

  const isModalOpen = isOpen && type === "deleteReservation";
  const reservation = data?.reservation;

  const onDelete = () => {
    startTranstion(() => {
      deleteReservation(reservation?.id)
        .then(() => {
          toast.success("Reservation deleted !");
          onClose();
        })
        .catch(() => toast.error("Something went wrong ."));
    });
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <DialogTitle className="text-xl font-semibold text-left"></DialogTitle>
        </DialogHeader>
        <h1 className="text-lg font-medium text-center">
          You Sure you want to delete reservation of the ref{" "}
          <span className="text-brand">{reservation?.ref}</span>
        </h1>
        <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-3">
          <Button onClick={onClose} size={"lg"} className="w-full rounded-full">
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={onDelete}
            type="button"
            variant={"destructive"}
            size={"lg"}
            className="w-full rounded-full">
            Delete Reservation
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
