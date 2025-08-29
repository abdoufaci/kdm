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
import { ManageTravelForm } from "../forms/manage-travel-form";

export const ManageTravelModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "manageTravel";
  const travel = data?.travel;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <DialogTitle className="text-xl text-[#232323] font-semibold text-left">
            {travel ? "Manager" : "Ajouter"} Umrah{" "}
            {travel && (
              <>
                <span className="text-sm">- {travel?.ref}</span>
              </>
            )}
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="h-[500px]">
          <ManageTravelForm />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
