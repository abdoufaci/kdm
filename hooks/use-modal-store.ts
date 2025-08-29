import { create } from "zustand";
import { Hotel, Travel, User } from "@prisma/client";
import {
  PaymentWithUserWithReservation,
  ReservationWithMembers,
  TravelWithHotels,
  TravelWithHotelsWithReservations,
} from "@/types/types";

export type ModalType =
  | "manageAgency"
  | "manageTravel"
  | "deleteUser"
  | "deleteTravel"
  | "manageReservation"
  | "setAgencyPassword"
  | "deleteReservation"
  | "managePayment"
  | "deletePayment"
  | "reservationDetails";

export interface ModalData {
  user?: User;
  travel?: TravelWithHotelsWithReservations;
  hotels?: Hotel[];
  isEdit?: boolean;
  reservation?: ReservationWithMembers;
  payment?: PaymentWithUserWithReservation;
}

interface ModalStore {
  type: ModalType | null;
  data: ModalData;
  isOpen: boolean;
  onOpen: (type: ModalType, data?: ModalData) => void;
  onClose: () => void;
}

export const useModal = create<ModalStore>((set) => ({
  type: null,
  data: {},
  isOpen: false,
  onOpen: (type, data) => set({ isOpen: true, type, data }),
  onClose: () => set({ type: null, data: {}, isOpen: false }),
}));
