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
import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";

export const ManageReservationModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const [steps, setSteps] = useState<1 | 2 | 3>(1);
  const isModalOpen = isOpen && type === "manageReservation";
  const [change, setChange] = useState(0);

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => {
        setSteps(1);
        onClose();
      }}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <div
            className={cn(
              "flex items-center",
              steps > 1 && !data?.reservation
                ? "justify-between"
                : "justify-end"
            )}>
            {steps > 1 && !data?.reservation && (
              <ArrowLeft
                onClick={() => {
                  setChange((prev) => prev - 1);
                  setSteps(
                    //@ts-ignore
                    (prev) => prev - 1
                  );
                }}
                className="h-5 w-5 cursor-pointer"
              />
            )}
            <DialogTitle
              dir="rtl"
              className="text-xl text-[#232323] font-semibold text-right">
              تفاصيل الحجز{" "}
              {data?.reservation && (
                <span className="text-brand text-xs">
                  {data.reservation.ref}
                </span>
              )}
            </DialogTitle>
          </div>
        </DialogHeader>
        <ManageReservationForm
          steps={steps}
          setSteps={setSteps}
          change={change}
          setChange={setChange}
        />
      </DialogContent>
    </Dialog>
  );
};
