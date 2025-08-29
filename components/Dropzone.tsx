"use client";

import { cn } from "@/lib/utils";
import { Minus, XIcon } from "lucide-react";
import Image from "next/image";
import { useState, useTransition } from "react";
import DropzoneComponent from "react-dropzone";
import { toast } from "sonner";
import { Button } from "./ui/button";
import * as tus from "tus-js-client";
import { createVideosInfos } from "@/actions/mutations/videos/create-video-infos";

interface Props {
  isMutliple?: boolean;
  onDrop: (files: any) => void;
  accept?: string;
  children: React.ReactNode;
}

function Dropzone({
  isMutliple = false,
  onDrop: onDropCompleted,
  accept = "image/*",
  children,
}: Props) {
  const [isPending, startTranstion] = useTransition();

  const onDrop = async (selectedFiles: File[]) => {
    const videos = selectedFiles.filter((item) => item.type.includes("video"));
    const notVideos = selectedFiles.filter(
      (item) => !item.type.includes("video")
    );

    let uploadedFiles: { id: string; type: string }[] = [];
    let uploadedVideos: { id: string; type: string }[] = [];

    startTranstion(async () => {
      try {
        if (!!notVideos.length) {
          toast.loading("Uploading files...", { id: "uploading" });
          const formData = new FormData();
          for (const file of notVideos) {
            formData.append("imageFile", file); // Same name as <input name="videos">
          }

          const response = await fetch("/api/upload-everything", {
            method: "POST",
            body: formData,
          });

          const data = await response.json();

          uploadedFiles = data.files;

          if (response.ok) {
          } else {
            toast.error(data.message || "File upload failed.");
          }
        }
        if (!!videos.length) {
          const tusUploadPromises = videos.map((selectedFile) => {
            return new Promise<{ id: string; type: string }>(
              (resolve, reject) => {
                createVideosInfos({
                  files: [
                    {
                      fileName: selectedFile.name,
                      fileType: selectedFile.type,
                    },
                  ],
                }).then((uploadInfos) => {
                  const upload = new tus.Upload(selectedFile, {
                    endpoint: "https://video.bunnycdn.com/tusupload",
                    retryDelays: [0, 3000, 5000, 10000, 20000],
                    //@ts-ignore
                    headers: uploadInfos[0].headers,
                    metadata: uploadInfos[0].metadata,
                    onError: function (tusError) {
                      console.log({ tusError });
                      toast.dismiss("uploadToastId");
                      toast.error("Something went wrong.");
                      reject(tusError);
                    },
                    onProgress: function (bytesUploaded, bytesTotal) {
                      const percent = Math.round(
                        (bytesUploaded / bytesTotal) * 100
                      );
                      toast.loading(`Uploading... ${percent}%`, {
                        id: "uploadToastId",
                      });
                    },
                    onSuccess: function () {
                      toast.dismiss("uploadToastId");
                      toast.success("Video uploaded successfully!");
                      resolve({
                        id: uploadInfos[0].videoId,
                        type: "video",
                      });
                    },
                  });

                  upload.start();
                });
              }
            );
          });

          uploadedVideos = await Promise.all(tusUploadPromises);
        }
        if (!!uploadedFiles.length && !!uploadedVideos.length) {
          onDropCompleted([...uploadedFiles, ...uploadedVideos]);
        }
        if (!!uploadedFiles.length && !uploadedVideos.length) {
          onDropCompleted(isMutliple ? uploadedFiles : uploadedFiles[0]);
        }
        if (!uploadedFiles.length && !!uploadedVideos.length) {
          onDropCompleted(isMutliple ? uploadedVideos : uploadedVideos[0]);
        }
      } catch (err) {
        console.log({ err });
        toast.error("An unexpected error occurred.");
      } finally {
        toast.dismiss("uploading");
        toast.dismiss("uploadToastId");
      }
    });
  };

  const maxSize = 10737418240; // 10 GB in bytes

  return (
    <DropzoneComponent
      minSize={0}
      maxSize={maxSize}
      multiple={isMutliple}
      onDrop={(acceptedFiles: File[]) => onDrop(acceptedFiles)}>
      {({
        getRootProps,
        getInputProps,
        isDragActive,
        isDragReject,
        fileRejections,
      }) => {
        const isFileTooLarge =
          fileRejections.length > 0 && fileRejections[0].file.size > maxSize;
        return (
          <section className=" w-full">
            <div {...getRootProps()}>
              <input
                disabled={isPending}
                {...getInputProps()}
                accept={accept}
              />
              {children}
              {isDragActive && !isDragReject && "drop to upload this file !"}
              {isDragReject && "File type not accepted, sorry!"}
              {isFileTooLarge && (
                <div className="text-danger mt-2">File is too large.</div>
              )}
            </div>
          </section>
        );
      }}
    </DropzoneComponent>
  );
}

export default Dropzone;
