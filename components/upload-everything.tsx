"use client";

import { XIcon } from "lucide-react";
import Image from "next/image";
import { toast } from "sonner";
import { ScrollArea, ScrollBar } from "./ui/scroll-area";
import { FileIcon } from "./svgs/file-icon";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useTransition,
} from "react";
import { useModal } from "@/hooks/use-modal-store";
import { cn } from "@/lib/utils";
import { boolean } from "zod";
import { deleteEverythingFile } from "@/actions/mutations/delete-everthing-file";
import Dropzone from "./Dropzone";

interface Props {
  onChange: (url?: any) => void;
  value?: any[] | null;
  isMutliple?: boolean;
  accept?: string;
  imageClassName?: string;
  imageContainerClassName?: string;
  setImagesToDelete?: Dispatch<
    SetStateAction<
      {
        id: string;
        type: string;
      }[]
    >
  >;
  children: React.ReactNode;
}

export const UploadEverything = ({
  onChange,
  value,
  isMutliple = false,
  accept = "*",
  imageClassName,
  setImagesToDelete,
  children,
  imageContainerClassName,
}: Props) => {
  const [deletePedning, startDeleteTransition] = useTransition();
  const [shouldRenderIframe, setShouldRenderIframe] = useState(false);
  const { data } = useModal();

  const mutate = ({ id, type }: { id: string; type: string }) => {
    startDeleteTransition(async () => {
      if (!!data.isEdit) {
        setImagesToDelete &&
          setImagesToDelete((prev) => [...prev, { id, type }]);
        onChange(
          isMutliple
            ? value?.filter((file) => file.id !== id)
            : { id: "", type: "" }
        );
      } else {
        toast.loading("Deleting file...");
        deleteEverythingFile({ id, type })
          .then((response) => {
            if (response?.success) {
              toast.success("File deleted successfully.");
              toast.dismiss();
              onChange(
                isMutliple ? value?.filter((file) => file.id !== id) : undefined
              );
            } else {
              toast.error("Failed to delete file.");
            }
          })
          .catch((error) => {
            toast.error("An error occurred while deleting the file.");
          })
          .finally(() => toast.dismiss());
      }
    });
  };

  useEffect(() => {
    if (value) {
      const timer = setTimeout(() => {
        setShouldRenderIframe(true); // forces re-render
      }, 7000); // wait 7 seconds (adjust if needed)

      return () => clearTimeout(timer);
    }
  }, [value]);

  return (
    <ScrollArea className="w-full max-w-3xl md:!max-w-2xl">
      <div className="flex items-center gap-2 ">
        {!!value?.length &&
          value?.map((file: { id: string; type: string }) =>
            file?.type === "image" ? (
              <div
                key={file.id}
                className={cn(
                  "!w-[250px] min-w-[250px] !h-[185px] relative flex items-center justify-center",
                  imageContainerClassName
                )}>
                <Image
                  alt="image"
                  src={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME}/${file.id}`}
                  height={600}
                  width={300}
                  className={cn(
                    "rounded-lg w-full h-full object-cover",
                    imageClassName
                  )}
                />

                <XIcon
                  className="h-8 w-8 text-[#ED2323] bg-[#EB16194A] rounded-full p-1.5 cursor-pointer absolute top-2 right-2"
                  onClick={() => mutate(file)}
                />
              </div>
            ) : file?.type === "video" ? (
              <div className="relative">
                <iframe
                  key={file.id}
                  src={`https://iframe.mediadelivery.net/embed/${process.env.NEXT_PUBLIC_BUNNY_STREAM_LIBRARY_ID}/${file.id}`}
                  allow="autoplay; fullscreen"
                  allowFullScreen
                  className="h-[185px] aspect-video"></iframe>
                <XIcon
                  className="h-7 w-7 text-[#ED2323] bg-[#EB16194A] rounded-full p-1.5 cursor-pointer absolute top-1 right-1"
                  onClick={() => mutate(file)}
                />
              </div>
            ) : (
              <div className="relative w-[300px]">
                <div className="w-[300px] rounded-[19.14px] p-3 bg-brand">
                  <div className="flex items-start gap-4 mr-20">
                    <div className="h-12 w-12 rounded-full flex items-center justify-center bg-[#FFFFFF69]">
                      <FileIcon />
                    </div>
                    <div className="space-y-0">
                      <h1 className="text-white font-medium">Document</h1>
                    </div>
                  </div>
                </div>
                <XIcon
                  className="h-7 w-7 text-[#ED2323] bg-[#EB16194A] rounded-full p-1.5 cursor-pointer absolute top-1 right-1"
                  onClick={() => mutate(file)}
                />
              </div>
            )
          )}
        {(isMutliple || (!isMutliple && !value?.length)) && (
          <Dropzone
            onDrop={(files) => {
              onChange(!isMutliple ? files : [...files, ...(value || [])]);
            }}
            accept={accept}
            isMutliple={isMutliple}>
            {children}
          </Dropzone>
        )}
      </div>
      <ScrollBar orientation="horizontal" />
    </ScrollArea>
  );
};
