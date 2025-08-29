"use client";

import { Button } from "@/components/ui/button";
import { ModalData, ModalType, useModal } from "@/hooks/use-modal-store";

interface Props {
  type: ModalType;
  data?: ModalData;
  title: string;
}

export function OpenDialogButton({ data = {}, type, title }: Props) {
  const { onOpen } = useModal();

  return (
    <Button
      onClick={() => onOpen(type, data)}
      variant={"brand"}
      className="text-white/90">
      {title}
    </Button>
  );
}
