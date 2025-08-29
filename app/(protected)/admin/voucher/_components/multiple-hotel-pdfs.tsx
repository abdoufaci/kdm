"use client";

import { VoucherDocument } from "@/components/pdfs/voucher-pdf";
import { pdf } from "@react-pdf/renderer";
import { useState } from "react";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import { Button } from "@/components/ui/button";
import {
  ReservationWithMembers,
  TravelWithHotelsWithReservations,
} from "@/types/types";
import { HotelBookingDocument } from "./hotel-document";

export const MultipleHotelPDFs = ({
  reservations,
  travel,
}: {
  travel: TravelWithHotelsWithReservations | null;
  reservations: ReservationWithMembers[];
}) => {
  const [loading, setLoading] = useState(false);

  const handleDownloadAll = async () => {
    setLoading(true);

    const zip = new JSZip();

    for (let i = 0; i < (travel?.hotels?.length || 0); i++) {
      const hotel = travel?.hotels?.[i];
      if (!hotel) continue;
      const blob = await pdf(
        <HotelBookingDocument
          rooms={
            reservations
              .flatMap((reservation) => reservation.reservationRooms)
              .filter((room) =>
                hotel.location === "MECCAH"
                  ? room.meccahHotelId == hotel.id
                  : room.madinaHotelId == hotel.id
              ) || []
          }
          travel={travel}
          reservations={reservations}
          idx={i}
        />
      ).toBlob();
      // Add to ZIP
      zip.file(`${hotel.name}.pdf`, blob);
    }

    // Create ZIP and download
    const content = await zip.generateAsync({ type: "blob" });
    saveAs(content, "all-hotel-bookings.zip");

    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-center mb-4">
        <Button
          onClick={handleDownloadAll}
          disabled={loading}
          className="text-brand bg-transparent hover:bg-transparent hover:text-brand border border-brand ring-0 outline-none">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 11.5V1.5M16.5 11.5V14.8333C16.5 15.2754 16.3244 15.6993 16.0118 16.0118C15.6993 16.3244 15.2754 16.5 14.8333 16.5H3.16667C2.72464 16.5 2.30072 16.3244 1.98816 16.0118C1.67559 15.6993 1.5 15.2754 1.5 14.8333V11.5"
              stroke="#D45847"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M4.83301 7.33331L8.99967 11.5L13.1663 7.33331"
              stroke="#D45847"
              strokeWidth="1.66667"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          تحميل الاسكان
        </Button>
      </div>
    </div>
  );
};
