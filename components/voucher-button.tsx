"use client";

import { generateVoucher } from "@/lib/generate-voucher";
import { Button } from "@/components/ui/button";

export default function VoucherButton() {
  const handleClick = () => {
    generateVoucher({
      programme: "Kuala lumpur / Langkawi",
      hotel: "Signature royal / holiday villa",
      duree: "11 JOURS 8 NUITS",
      chambre: "DOUBLE",
      adulte: 2,
      enfant: 0,
      places: 2,
      tel: "0799999903",
      voyageurs: [
        {
          nom: "HOUFANI",
          prenom: "MUSTAPHA",
          age: "1967-07-23",
          passport: "187680367",
        },
        {
          nom: "AMEUR",
          prenom: "FADHILA",
          age: "1969-01-04",
          passport: "305785845",
        },
        {
          nom: "AMEUR",
          prenom: "FADHILA",
          age: "1969-01-04",
          passport: "305785845",
        },
        {
          nom: "AMEUR",
          prenom: "FADHILA",
          age: "1969-01-04",
          passport: "305785845",
        },
        {
          nom: "AMEUR",
          prenom: "FADHILA",
          age: "1969-01-04",
          passport: "305785845",
        },
      ],
      compagnie: "SAUDIA AIRLINES",
      destination: "Malaisie",
      aller: "2025-08-19",
      retour: "2025-08-29",
    });
  };

  return (
    <Button
      onClick={handleClick}
      className="px-4 py-2 bg-blue-600 text-white rounded-md">
      Generate Voucher
    </Button>
  );
}
