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

export const DeleteUserModal = () => {
  const { isOpen, onClose, type, onOpen, data } = useModal();
  const [isPending, startTranstion] = useTransition();

  const isModalOpen = isOpen && type === "deleteUser";
  const user = data?.user;

  const onDelete = () => {
    startTranstion(() => {
      deleteUser(user?.id)
        .then(() => {
          toast.success("User deleted !");
          onClose();
        })
        .catch(() => toast.error("Something went wrong ."));
    });
  };

  return (
    <Dialog
      open={isModalOpen}
      onOpenChange={() => onOpen("manageAgency", { user })}>
      <DialogContent className="bg-white text-black w-full max-w-3xl">
        <DialogHeader className="py-2 ">
          <DialogTitle className="text-xl font-semibold text-left"></DialogTitle>
        </DialogHeader>
        <h1 dir="rtl" className="text-lg font-medium text-center">
          انت متأكد أنك تريد حذف{" "}
          <span className="text-brand">@{user?.name}</span> صاحب البريد
          الالكتروني <span className="text-brand">{user?.email}</span>
        </h1>
        <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-3">
          <Button
            onClick={() => onOpen("manageAgency", { user })}
            size={"lg"}
            className="w-full rounded-full">
            الغاء
          </Button>
          <Button
            disabled={isPending}
            onClick={onDelete}
            type="button"
            variant={"destructive"}
            size={"lg"}
            className="w-full rounded-full">
            حذف
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
