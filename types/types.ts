import {
  Hotel,
  Reservation,
  ReservationMember,
  Travel,
  User,
} from "@prisma/client";

export type TravelWithHotelsWithReservations = Travel & {
  hotels: Hotel[];
  reservations: (Reservation & {
    reservationMembers: ReservationMember[];
  })[];
};

export type TravelWithHotels = Travel & {
  hotels: Hotel[];
};

export type ReservationWithMembers = Reservation & {
  reservationMembers: ReservationMember[];
  user?: User;
  travel: TravelWithHotels;
  madinaHotel: Hotel | null;
  meccahHotel: Hotel;
};
