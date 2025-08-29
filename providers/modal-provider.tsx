"use client";

import { DeleteReservationModal } from "@/components/modals/delete-reservation-modal";
import { DeleteTravelModal } from "@/components/modals/delete-travel-modal";
import { DeleteUserModal } from "@/components/modals/delete-user-modal";
import { ManageAgencyModal } from "@/components/modals/manage-agency-modal";
import { ManagePaymentModal } from "@/components/modals/manage-payment-modal";
import { ManageReservationModal } from "@/components/modals/manage-reservation-modal";
import { ManageTravelModal } from "@/components/modals/manage-travel-modal";
import { ReservationDetailsModal } from "@/components/modals/reservation-details-modal";
import { SetAgencyPasswordModal } from "@/components/modals/set-agency-password-modal";
import { useEffect, useState } from "react";

export const ModalProvider = () => {
  //code for hydrations error
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }
  //code for hydrations error

  return (
    <>
      <ManageAgencyModal />
      <ManageTravelModal />
      <DeleteUserModal />
      <DeleteTravelModal />
      <ManageReservationModal />
      <SetAgencyPasswordModal />
      <DeleteReservationModal />
      <ManagePaymentModal />
      <ReservationDetailsModal />
    </>
  );
};
