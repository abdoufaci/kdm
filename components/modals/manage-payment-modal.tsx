"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useModal } from "@/hooks/use-modal-store";
import { ManagePaymentForm } from "../forms/manage-payment-form";

export const ManagePaymentModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "managePayment";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <DialogTitle className="text-xl text-[#232323] font-semibold text-right">
            اضافة دفعة
          </DialogTitle>
        </DialogHeader>
        <ManagePaymentForm />
      </DialogContent>
    </Dialog>
  );
};
