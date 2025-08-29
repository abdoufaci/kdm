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
import { SetAgencyPasswordForm } from "../forms/set-agency-password-form";

export const SetAgencyPasswordModal = () => {
  const { isOpen, onClose, type, data } = useModal();

  const isModalOpen = isOpen && type === "setAgencyPassword";

  return (
    <Dialog open={isModalOpen} onOpenChange={onClose}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <DialogTitle
            dir="rtl"
            className="text-xl text-[#232323] font-semibold text-right">
            تعيين كلمة المرور{" "}
            <span className="text-base text-brand font-normal">
              {data?.user?.username}
            </span>
          </DialogTitle>
        </DialogHeader>
        <SetAgencyPasswordForm />
      </DialogContent>
    </Dialog>
  );
};
