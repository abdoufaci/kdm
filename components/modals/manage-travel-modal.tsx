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
import { useState } from "react";
import { ArrowRight } from "lucide-react";

export const ManageTravelModal = () => {
  const { isOpen, onClose, type, data } = useModal();
  const [showPrices, setShowPrices] = useState(false);

  const isModalOpen = isOpen && type === "manageTravel";
  const travel = data?.travel;

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="flex flex-row justify-end">
          <DialogTitle className="text-xl text-[#232323] font-semibold text-right">
            اضافة رحلة عمرة {showPrices && "- أسعار"}
            {travel && (
              <>
                <span className="text-sm">- {travel?.ref}</span>
              </>
            )}
          </DialogTitle>

          {showPrices && (
            <ArrowRight
              onClick={() => setShowPrices(false)}
              className="h-5 w-5 text-[#0000004D] cursor-pointer"
            />
          )}
        </DialogHeader>
        <ScrollArea className="h-[500px]">
          <ManageTravelForm
            setShowPrices={setShowPrices}
            showPrices={showPrices}
          />
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
