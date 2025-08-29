import {
  Hotel,
  Payment,
  Reservation,
  ReservationHistory,
  ReservationMember,
  ReservationRoom,
  Travel,
  TravelPrices,
  User,
} from "@prisma/client";

export type PaymentWithUserWithReservation = Payment & {
  user: User;
  reservation: Reservation & {
    travel: Travel & {
      prices: TravelPrices[];
    };
    payments: Payment[];
    reservationRooms: (ReservationRoom & {
      reservationMembers: ReservationMember[];
    })[];
  };
};

export type TravelWithHotelsWithReservations = Travel & {
  hotels: Hotel[];
  reservations: (Reservation & {
    reservationRooms: (ReservationRoom & {
      reservationMembers: ReservationMember[];
    })[];
  })[];

  prices: (TravelPrices & {
    hotel: Hotel;
  })[];
};

export type TravelWithHotels = Travel & {
  hotels: Hotel[];
  prices: (TravelPrices & {
    hotel: Hotel;
  })[];
};

export type ReservationWithMembers = Reservation & {
  reservationRooms: (ReservationRoom & {
    reservationMembers: ReservationMember[];
    madinaHotel: Hotel | null;
    meccahHotel: Hotel;
  })[];
  user?: User;
  travel: TravelWithHotelsWithReservations;
  payments: Payment[];
  history?: (ReservationHistory & {
    user?: User | null;
  })[];
};
