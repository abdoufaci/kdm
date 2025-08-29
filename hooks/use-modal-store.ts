import { create } from "zustand";
import { Hotel, Travel, User } from "@prisma/client";
import { ReservationWithMembers, TravelWithHotels } from "@/types/types";

export type ModalType =
  | "manageAgency"
  | "manageTravel"
  | "deleteUser"
  | "deleteTravel"
  | "manageReservation"
  | "setAgencyPassword"
  | "deleteReservation";

export interface ModalData {
  user?: User;
  travel?: TravelWithHotels;
  hotels?: Hotel[];
  isEdit?: boolean;
  reservation?: ReservationWithMembers;
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
