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
import { deleteTravel } from "@/actions/mutations/travel/delete-travel";

export const DeleteTravelModal = () => {
  const { isOpen, onClose, type, onOpen, data } = useModal();
  const [isPending, startTranstion] = useTransition();

  const isModalOpen = isOpen && type === "deleteTravel";
  const travel = data?.travel;

  const onDelete = () => {
    startTranstion(() => {
      deleteTravel(travel?.id)
        .then(() => {
          toast.success("travel deleted !");
          onClose();
        })
        .catch(() => toast.error("Something went wrong ."));
    });
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => onOpen("manageTravel", { travel })}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <DialogTitle className="text-xl font-semibold text-left"></DialogTitle>
        </DialogHeader>
        <h1 className="text-lg font-medium text-center">
          You Sure you want to delete{" "}
          <span className="text-brand">@{travel?.name}</span> of the ref{" "}
          <span className="text-brand">{travel?.ref}</span>
        </h1>
        <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-3">
          <Button
            onClick={() => onOpen("manageTravel", { travel })}
            size={"lg"}
            className="w-full rounded-full">
            Cancel
          </Button>
          <Button
            disabled={isPending}
            onClick={onDelete}
            type="button"
            variant={"destructive"}
            size={"lg"}
            className="w-full rounded-full">
            Delete Travel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
