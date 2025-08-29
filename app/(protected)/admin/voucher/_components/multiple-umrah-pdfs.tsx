"use client";

import { VoucherDocument } from "@/components/pdfs/voucher-pdf";
import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import { ReservationWithMembers } from "@/types/types";

export const MultipleUmrahPDFs = ({
  reservation,
}: {
  reservation?: ReservationWithMembers | null;
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadAll = async () => {
    setLoading(true);

    const zip = new JSZip();

    for (let i = 0; i < (reservation?.reservationRooms?.length || 0); i++) {
      //@ts-ignore
      if (reservation?.reservationRooms[i].roomType === "COLLECTIVE") {
        for (
          let j = 0;
          j < reservation?.reservationRooms[i].reservationMembers.length;
          j++
        ) {
          const blob = await pdf(
            <VoucherDocument
              reservation={reservation}
              room={{
                ...reservation?.reservationRooms[i]!,
                reservationMembers: [
                  reservation?.reservationRooms[i].reservationMembers[j],
                ],
              }}
            />
          ).toBlob();

          // Add to ZIP
          zip.file(`collective-umrah-booking-${i + 1}.${j + 1}.pdf`, blob);
        }
      } else {
        const blob = await pdf(
          <VoucherDocument
            reservation={reservation}
            room={reservation?.reservationRooms[i]!}
          />
        ).toBlob();

        // Add to ZIP
        zip.file(`umrah-booking-${i + 1}.pdf`, blob);
      }
    }

    // Create ZIP and download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "all-bookings.zip");

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <Button
          onClick={handleDownloadAll}
          disabled={loading}
          className="text-[#00000033] bg-transparent hover:bg-transparent hover:text-[#00000033] border border-[#00000033] ring-0 outline-none">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 11.5V1.5M16.5 11.5V14.8333C16.5 15.2754 16.3244 15.6993 16.0118 16.0118C15.6993 16.3244 15.2754 16.5 14.8333 16.5H3.16667C2.72464 16.5 2.30072 16.3244 1.98816 16.0118C1.67559 15.6993 1.5 15.2754 1.5 14.8333V11.5"
              stroke="black"
              strokeOpacity="0.2"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.8335 7.33325L9.00016 11.4999L13.1668 7.33325"
              stroke="black"
              strokeOpacity="0.2"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          تحميل الفوتشر
        </Button>
      </div>
    </div>
  );
};
