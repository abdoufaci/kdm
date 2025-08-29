"use client";

import {
  ReservationWithMembers,
  TravelWithHotels,
  TravelWithHotelsWithReservations,
} from "@/types/types";
import { OpenDialogButton } from "@/components/open-dialog-button";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import {
  Clock4,
  Eye,
  EyeOff,
  Plane,
  PlaneLanding,
  PlaneTakeoff,
  UsersRound,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Separator } from "./ui/separator";
import { MultipleHotelPDFs } from "@/app/(protected)/admin/voucher/_components/multiple-hotel-pdfs";
import { ExtendedUser } from "@/types/next-auth";
import { Hotel, ReservationMember } from "@prisma/client";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";

type HotelWithMembers = {
  hotel: Hotel;
  members: ReservationMember[];
};
interface Props {
  travel: TravelWithHotelsWithReservations;
  reservations: ReservationWithMembers[];
  user?: ExtendedUser;
}

function TraveDetails({ travel, reservations, user }: Props) {
  const [show, setShow] = useState(false);

  const savedSpots = travel.reservations
    .filter((reservation) => reservation.status !== "CANCELLED")
    .reduce(
      (acc, reservation) =>
        acc +
        reservation.reservationRooms.reduce(
          (acc, room) =>
            acc +
            room.reservationMembers.filter((member) => member.type === "ADULT")
              .length,
          0
        ),
      0
    );

  const manMembers = travel.reservations
    .filter((reservation) => reservation.status !== "CANCELLED")
    .flatMap((reservation) =>
      reservation.reservationRooms.filter(
        (room) => room.roomType === "COLLECTIVE"
      )
    )
    .flatMap((reservation) =>
      reservation.reservationMembers.filter((member) => member.sex === "ذكر")
    );

  const womanMembers = travel.reservations
    .filter((reservation) => reservation.status !== "CANCELLED")
    .flatMap((reservation) =>
      reservation.reservationRooms.filter(
        (room) => room.roomType === "COLLECTIVE"
      )
    )
    .flatMap((reservation) =>
      reservation.reservationMembers.filter((member) => member.sex !== "ذكر")
    );

  function getHotelsWithMembers(
    travel: TravelWithHotelsWithReservations,
    sex: string
  ): HotelWithMembers[] {
    return travel.hotels.map((hotel) => {
      const members: ReservationMember[] = [];

      travel.reservations
        .filter((reservation) => reservation.status !== "CANCELLED")
        .forEach((reservation) => {
          reservation.reservationRooms
            .filter((room) => room.roomType === "COLLECTIVE")
            .forEach((room) => {
              // check if this room is linked to the current hotel
              if (
                room.meccahHotelId === hotel.id ||
                room.madinaHotelId === hotel.id
              ) {
                members.push(
                  ...room.reservationMembers.filter((m) => m.sex === sex)
                );
              }
            });
        });

      return { hotel, members };
    });
  }

  function roomDistribution(
    hotelsWithMembers: { hotel: Hotel; members: ReservationMember[] }[]
  ) {
    const membersPerRoom = 5;

    return hotelsWithMembers.map(({ hotel, members }) => {
      const rooms = Math.ceil(members.length / membersPerRoom);
      const emptyPlaces = rooms * membersPerRoom - members.length;

      return {
        hotel,
        emptyPlaces,
        rooms,
      };
    });
  }

  const manHotels = roomDistribution(getHotelsWithMembers(travel, "ذكر"));
  const womanHotels = roomDistribution(getHotelsWithMembers(travel, "انثى"));

  const manRooms = manHotels.reduce((acc, hotel) => acc + hotel.rooms, 0);
  const womanRooms = womanHotels.reduce((acc, hotel) => acc + hotel.rooms, 0);

  console.log({
    man: getHotelsWithMembers(travel, "ذكر"),
    manHotels,
  });
  const manEmptyPlaces = manHotels.reduce(
    (acc, hotel) => acc + hotel.emptyPlaces,
    0
  );
  const womanEmptyPlaces = womanHotels.reduce(
    (acc, hotel) => acc + hotel.emptyPlaces,
    0
  );

  return (
    <div className="space-y-20">
      <div className="space-y-5">
        <h1 className="text-2xl font-semibold">{travel?.name}</h1>
        <div className="space-y-8">
          <div className="flex items-center gap-7 flex-wrap">
            <div className="flex items-center gap-5">
              <Plane className="h-5 w-5 text-brand fill-brand" />
              <h3 className="text-[#646768]">{travel.airline}</h3>
            </div>
            <div className="flex items-center gap-5">
              <PlaneTakeoff className="h-5 w-5 text-brand fill-brand" />
              <h3 className="text-[#646768]">
                {travel.arrivePlace} - {travel.departTime} -
                {format(travel.departDate, "dd/MM/yyyy")}
              </h3>
            </div>
            <div className="flex items-center gap-5">
              <PlaneLanding className="h-5 w-5 text-brand fill-brand" />
              <h3 className="text-[#646768]">
                {travel.leavePlace} - {travel.arriveTime} -{" "}
                {format(travel.arriveDate, "dd/MM/yyyy")}
              </h3>
            </div>
            <div className="flex items-center gap-5">
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.5 21C4.70114 21 0 16.2989 0 10.5C0 4.70114 4.70114 0 10.5 0C16.2989 0 21 4.70114 21 10.5C21 16.2989 16.2989 21 10.5 21ZM11.4545 4.29545H9.54545V10.8952L13.3636 14.7134L14.7134 13.3636L11.4545 10.1048V4.29545Z"
                  fill="#D45847"
                  fillOpacity="0.98"
                />
              </svg>

              <h3 className="text-[#646768]">{travel.duration} ليالي</h3>
            </div>
            <div className="flex items-center gap-5">
              <svg
                width="26"
                height="13"
                viewBox="0 0 26 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 6.09421C14.4829 6.09421 15.7583 4.77007 15.7583 3.04571C15.7583 1.34225 14.476 0.0803223 13 0.0803223C11.524 0.0803223 10.2412 1.37011 10.2412 3.05964C10.2412 4.77007 11.5171 6.09421 13 6.09421ZM5.06211 6.25254C6.34493 6.25254 7.46246 5.09414 7.46246 3.59775C7.46246 2.11482 6.33796 1.01818 5.06211 1.01818C3.77929 1.01818 2.64829 2.14221 2.65525 3.61121C2.65525 5.09414 3.77232 6.253 5.06211 6.253M20.9379 6.253C22.2277 6.253 23.3447 5.09461 23.3447 3.61168C23.3447 2.14268 22.2207 1.01864 20.9379 1.01864C19.662 1.01864 18.5375 2.11529 18.5375 3.59775C18.5375 5.09461 19.6551 6.253 20.9379 6.253ZM1.21364 12.4805H6.45543C5.73811 11.4391 6.61375 9.34236 8.09668 8.19743C7.33061 7.68718 6.34493 7.30786 5.05561 7.30786C1.94443 7.30786 0 9.60421 0 11.5147C0 12.1355 0.344964 12.4805 1.21364 12.4805ZM24.7864 12.4805C25.662 12.4805 26 12.1355 26 11.5147C26 9.60421 24.0551 7.30786 20.9449 7.30786C19.6551 7.30786 18.6689 7.68718 17.9038 8.19743C19.3862 9.34236 20.2624 11.4391 19.545 12.4805H24.7864ZM8.66171 12.4805H17.3309C18.4136 12.4805 18.7999 12.1699 18.7999 11.563C18.7999 9.78389 16.5722 7.32875 12.993 7.32875C9.42082 7.32875 7.19318 9.78389 7.19318 11.563C7.19318 12.1699 7.579 12.4805 8.66171 12.4805Z"
                  fill="#D55B4B"
                />
              </svg>

              <h3 className="text-[#646768]">
                {Number(travel.availabelSpots) - savedSpots} مقعد متبقي
              </h3>
            </div>
            {/* <div className="flex items-center gap-5">
              <svg
                width="26"
                height="13"
                viewBox="0 0 26 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 6.09421C14.4829 6.09421 15.7583 4.77007 15.7583 3.04571C15.7583 1.34225 14.476 0.0803223 13 0.0803223C11.524 0.0803223 10.2412 1.37011 10.2412 3.05964C10.2412 4.77007 11.5171 6.09421 13 6.09421ZM5.06211 6.25254C6.34493 6.25254 7.46246 5.09414 7.46246 3.59775C7.46246 2.11482 6.33796 1.01818 5.06211 1.01818C3.77929 1.01818 2.64829 2.14221 2.65525 3.61121C2.65525 5.09414 3.77232 6.253 5.06211 6.253M20.9379 6.253C22.2277 6.253 23.3447 5.09461 23.3447 3.61168C23.3447 2.14268 22.2207 1.01864 20.9379 1.01864C19.662 1.01864 18.5375 2.11529 18.5375 3.59775C18.5375 5.09461 19.6551 6.253 20.9379 6.253ZM1.21364 12.4805H6.45543C5.73811 11.4391 6.61375 9.34236 8.09668 8.19743C7.33061 7.68718 6.34493 7.30786 5.05561 7.30786C1.94443 7.30786 0 9.60421 0 11.5147C0 12.1355 0.344964 12.4805 1.21364 12.4805ZM24.7864 12.4805C25.662 12.4805 26 12.1355 26 11.5147C26 9.60421 24.0551 7.30786 20.9449 7.30786C19.6551 7.30786 18.6689 7.68718 17.9038 8.19743C19.3862 9.34236 20.2624 11.4391 19.545 12.4805H24.7864ZM8.66171 12.4805H17.3309C18.4136 12.4805 18.7999 12.1699 18.7999 11.563C18.7999 9.78389 16.5722 7.32875 12.993 7.32875C9.42082 7.32875 7.19318 9.78389 7.19318 11.563C7.19318 12.1699 7.579 12.4805 8.66171 12.4805Z"
                  fill="#D55B4B"
                />
              </svg>

              <h3 className="text-[#646768]">
                {reservations.reduce(
                  (acc, reservation) =>
                    acc +
                    reservation.reservationMembers.filter(
                      (member) => member.type === "ADULT"
                    ).length,
                  0
                )}{" "}
                مقعد متبقي
              </h3>
            </div> */}
          </div>
          <div className="flex flex-wrap justify-between items-center gap-5">
            <p className="text-[#585757] w-full max-w-5xl">
              {travel.description}
            </p>
            {Number(travel.availabelSpots) - savedSpots > 0 && (
              <OpenDialogButton
                type="manageReservation"
                title="احجز"
                data={{ travel, hotels: travel.hotels }}
              />
            )}
          </div>
        </div>
      </div>
      <div className="overflow-x-auto">
        <div className="flex items-center w-full">
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 rounded-tr-sm min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">فنادق مكة</h1>
          </div>
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">الثنائية</h1>
          </div>
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">الثلاثية</h1>
          </div>
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">الرباعية</h1>
          </div>
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">الخماسية</h1>
          </div>
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">الطفل</h1>
          </div>
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">الرضيع</h1>
          </div>
          <div className="border border-[#00000059] border-l-0 flex items-center justify-center p-3 min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">الإعاشة</h1>
          </div>
          <div className="border border-[#00000059] flex items-center gap-5 justify-center p-3 rounded-tl-sm min-w-48 w-full">
            <h1 className="text-[#00000094] text-sm">
              {show ? "العمولة" : "******"}
            </h1>
            {show ? (
              <EyeOff
                onClick={() => setShow(false)}
                className="h-5 w-5 cursor-pointer text-[#A4A4A4]"
              />
            ) : (
              <Eye
                onClick={() => setShow(true)}
                className="h-5 w-5 cursor-pointer text-[#A4A4A4]"
              />
            )}
          </div>
        </div>
        {travel.prices.map((price, idx) => (
          <div key={price.id} className="flex items-center w-full">
            <div
              className={cn(
                "border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx === travel.prices.length - 1 && "rounded-br-sm",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              <h1 className="text-[#00000094] text-sm">{price.hotel.name}</h1>
            </div>
            <div
              dir="ltr"
              className={cn(
                "text-[#00000094] text-sm border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {price.double} da
            </div>
            <div
              dir="ltr"
              className={cn(
                "text-[#00000094] text-sm border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {price.triple} da
            </div>
            <div
              dir="ltr"
              className={cn(
                "text-[#00000094] text-sm border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {price.quadruple} da
            </div>
            <div
              dir="ltr"
              className={cn(
                "text-[#00000094] text-sm border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {price.quintuple} da
            </div>
            <div
              dir="ltr"
              className={cn(
                "text-[#00000094] text-sm border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {price.child} da
            </div>
            <div
              dir="ltr"
              className={cn(
                "text-[#00000094] text-sm border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {price.babe} da
            </div>
            <div
              dir="ltr"
              className={cn(
                "text-[#00000094] text-sm border border-[#00000059] border-l-0 border-t-0 flex items-center justify-center p-3 min-w-48 w-full",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {price.food} da
            </div>
            <div
              dir="ltr"
              className={cn(
                "border border-[#00000059] border-t-0 flex items-center justify-center p-3  min-w-48 w-full text-[#00000094] text-sm",
                idx === travel.prices.length - 1 && "rounded-bl-sm",
                idx !== travel.prices.length - 1 && "border-b-[#D9D9D96B]"
              )}>
              {show ? price.commission : "******"} da
            </div>
          </div>
        ))}
      </div>
      <div className="overflow-x-auto h-fit overflow-y-hidden flex items-end justify-between gap-20">
        <div className="flex items-end gap-14 ">
          <div className="space-y-4">
            <h1 className="text-xl font-bold">الغرف المحجوزة</h1>
            <div className="flex items-center gap-16">
              <div className="space-y-1">
                <h1 className="text-[#807878]">ثنائية</h1>
                <h1 className="text-7xl font-medium text-brand">
                  {travel.reservations
                    .filter((reservation) => reservation.status !== "CANCELLED")
                    .reduce(
                      (acc, reservation) =>
                        acc +
                        reservation.reservationRooms.filter(
                          (room) => room.roomType === "DOUBLE"
                        ).length,
                      0
                    )}
                </h1>
              </div>
              <div className="space-y-1">
                <h1 className="text-[#807878]">ثلاثية</h1>
                <h1 className="text-7xl font-medium text-brand">
                  {travel.reservations
                    .filter((reservation) => reservation.status !== "CANCELLED")
                    .reduce(
                      (acc, reservation) =>
                        acc +
                        reservation.reservationRooms.filter(
                          (room) => room.roomType === "TRIPLE"
                        ).length,
                      0
                    )}
                </h1>
              </div>
              <div className="space-y-1">
                <h1 className="text-[#807878]">رباعية</h1>
                <h1 className="text-7xl font-medium text-brand">
                  {travel.reservations
                    .filter((reservation) => reservation.status !== "CANCELLED")
                    .reduce(
                      (acc, reservation) =>
                        acc +
                        reservation.reservationRooms.filter(
                          (room) => room.roomType === "QUADRUPLE"
                        ).length,
                      0
                    )}
                </h1>
              </div>
              <div className="space-y-1">
                <h1 className="text-[#807878]">خماسية</h1>
                <h1 className="text-7xl font-medium text-brand">
                  {travel.reservations
                    .filter((reservation) => reservation.status !== "CANCELLED")
                    .reduce(
                      (acc, reservation) =>
                        acc +
                        reservation.reservationRooms.filter(
                          (room) => room.roomType === "QUINTUPLE"
                        ).length,
                      0
                    )}
                </h1>
              </div>
              <div className="space-y-1">
                <h1 className="text-[#807878]">الرجالية</h1>
                <h1 className="text-7xl font-medium text-brand">{manRooms}</h1>
              </div>
              <div className="space-y-1">
                <h1 className="text-[#807878]">النسائية</h1>
                <h1 className="text-7xl font-medium text-brand">
                  {womanRooms}
                </h1>
              </div>
            </div>
          </div>
          <Separator
            orientation="vertical"
            className="w-0.5 min-w-0.5 min-h-20 h-20 bg-[#D9D9D97A]"
          />
          <div className="space-y-4">
            <h1 className="text-xl font-bold">الاماكن الشاغرة</h1>
            <div className="flex items-center gap-16">
              <HoverCard>
                <HoverCardTrigger>
                  <div className="space-y-1 cursor-pointer">
                    <h1 className="text-[#807878]">رجال</h1>
                    <h1
                      className={cn(
                        "text-7xl font-medium",
                        manEmptyPlaces > 0 ? "text-[#F71D1D]" : "text-[#15C847]"
                      )}>
                      {manEmptyPlaces}
                    </h1>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="p-3 w-fit">
                  <div className="space-y-3">
                    {manHotels.map((hotel) => (
                      <div className="flex items-center gap-4 w-full justify-between">
                        <h1 className="font-semibold text-sm">
                          {hotel.emptyPlaces}
                        </h1>
                        <span className="text-[#8C8C8C] text-sm text-right">
                          {hotel.hotel.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
              <HoverCard>
                <HoverCardTrigger>
                  <div className="space-y-1 cursor-pointer">
                    <h1 className="text-[#807878]">نساء</h1>
                    <h1
                      className={cn(
                        "text-7xl font-medium",
                        womanEmptyPlaces > 0
                          ? "text-[#F71D1D]"
                          : "text-[#15C847]"
                      )}>
                      {womanEmptyPlaces}
                    </h1>
                  </div>
                </HoverCardTrigger>
                <HoverCardContent className="p-3 w-fit">
                  <div className="space-y-3">
                    {womanHotels.map((hotel) => (
                      <div className="flex items-center gap-4 w-full justify-between">
                        <h1 className="font-semibold text-sm">
                          {hotel.emptyPlaces}
                        </h1>
                        <span className="text-[#8C8C8C] text-sm text-right">
                          {hotel.hotel.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
          </div>
        </div>
        {user?.role === "ADMIN" && (
          <MultipleHotelPDFs reservations={reservations} travel={travel} />
        )}
      </div>
    </div>
  );
}

export default TraveDetails;
