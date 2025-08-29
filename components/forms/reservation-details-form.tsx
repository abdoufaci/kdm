"use client";

import { roomTypes } from "@/constants/room-type";
import { useCurrentUser } from "@/hooks/use-current-user";
import { useModal } from "@/hooks/use-modal-store";
import { format } from "date-fns";
import Link from "next/link";
import { ScrollArea } from "../ui/scroll-area";
import { cn } from "@/lib/utils";
import { Separator } from "../ui/separator";
import { Plus } from "lucide-react";
import { MultipleUmrahPDFs } from "@/app/(protected)/admin/voucher/_components/multiple-umrah-pdfs";

function ReservationDetailsForm() {
  const { data, onOpen } = useModal();
  const { reservation } = data;

  const currentUser = useCurrentUser();

  const total =
    reservation?.reservationRooms.reduce((acc, room) => {
      const target = reservation?.travel.prices.find(
        (price) => price.hotelId === room.meccahHotelId
      );
      return (
        acc +
        Number(
          room.roomType === "DOUBLE"
            ? target?.double
            : room.roomType === "TRIPLE"
              ? target?.triple
              : room.roomType === "QUADRUPLE"
                ? target?.quadruple
                : target?.quintuple
        ) +
        room.reservationMembers
          .filter((member) => !!member.foodIclusions)
          .reduce((acc) => acc + Number(target?.food), 0)
      );
    }, 0) || 0;
  const totalPayments =
    reservation?.payments.reduce((acc, curr) => acc + Number(curr.amount), 0) ||
    0;

  return (
    <div className="space-y-7 px-5">
      <div className="grid grid-cols-1 md:grid-cols-[25%_75%] gap-4">
        <div>
          <div className="space-y-5">
            <MultipleUmrahPDFs reservation={reservation} />
            <div className="flex items-center justify-between">
              <div
                className={cn(
                  "h-8 px-4 w-fit flex items-center justify-center rounded-[5px] text-xs",
                  reservation?.paymentStatus === "COMPLETED"
                    ? "bg-[#15C84730] text-[#21D954]"
                    : "bg-[#F2BA0530] text-[#F2BA05]"
                )}>
                {reservation?.paymentStatus === "COMPLETED" ? "كلي" : "جزئي"}
              </div>
              <h1 className="text-lg text-brand font-medium">الدفع</h1>
            </div>
            <div className="space-y-3">
              <div className="flex items-center gap-4 w-full justify-between">
                <h1 className="font-medium text-[#5E5757] text-sm">
                  {total} da
                </h1>
                <span className="text-[#9E9696] text-sm text-right">
                  الإجمالي
                </span>
              </div>
              <div className="flex items-center gap-4 w-full justify-between">
                <h1 className="font-medium text-[#5E5757] text-sm">
                  {total - totalPayments} da
                </h1>
                <span className="text-[#9E9696] text-sm text-right">
                  المبلغ المتبقي
                </span>
              </div>
              <div className="flex  items-center gap-4 w-full justify-between">
                <h1 className="font-medium text-[#5E5757] text-sm">
                  {totalPayments} da
                </h1>
                <span className="text-[#9E9696] text-sm text-right">
                  المبلغ المدفوع
                </span>
              </div>
            </div>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-end gap-2">
                {currentUser?.role === "ADMIN" &&
                  reservation?.paymentStatus === "PENDING" && (
                    <div
                      onClick={() => onOpen("managePayment", { reservation })}
                      className="h-4 w-4 border border-[#5A5A5A] text-[#5A5A5A] flex items-center justify-center cursor-pointer rounded-sm">
                      <Plus className="h-3 w-3 text-[#5A5A5A]" />
                    </div>
                  )}
                <h1 className="font-medium">الدفوعات</h1>
              </div>
              <div className="space-y-3">
                {reservation?.payments.map((payment) => (
                  <div
                    key={payment.id}
                    className="p-4 py-3 space-y-1 border border-[#B5B5B5] rounded-sm flex flex-col items-end">
                    <div className="">
                      <h5 className="text-xs text-[#646768] text-right">
                        {format(payment.createdAt, "dd/MM/yyyy")}
                      </h5>
                      <h1 className="font-medium text-right">
                        {payment.paymentRef}
                      </h1>
                    </div>
                    <div className="flex justify-end items-center gap-4 w-full">
                      <h1 className="text-brand">{payment.amount} da</h1>
                      <span className="text-[#9E9E9E]  text-right">المبلغ</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="border-l-[3px] border-l-[#D9D9D96B]">
          <div className="space-y-5">
            {reservation?.reservationRooms.map((room, idx) => (
              <div key={room.id} className="space-y-3">
                <div className="pb-1 w-full max-w-sm ml-auto border-b">
                  <h1 dir="rtl" className="text-brand font-semibold">
                    غرفة {idx + 1} - {roomTypes[room.roomType]}
                  </h1>
                </div>
                <div className="overflow-x-auto space-y-2">
                  {room.reservationMembers.map((member) => (
                    <div
                      dir="rtl"
                      key={member.id}
                      className="grid grid-cols-9 text-[#646768] w-full">
                      <h1 className="col-span-2">{member.name}</h1>
                      <h1>
                        {member.sex} -{" "}
                        {member.type === "ADULT"
                          ? "بالغ"
                          : member.type === "CHILD"
                            ? "طفل"
                            : "رضيع"}{" "}
                      </h1>
                      <h1 className="col-span-2">
                        {format(member.dob, "dd/MM/yyyy")}
                      </h1>
                      <h1 className="col-span-3">
                        {member.passportNumber} ينتهي في{" "}
                        {format(member.passportExpiryDate, "dd-MM-yyyy")}
                      </h1>
                      <Link
                        target="_blank"
                        href={`https://${
                          process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME
                        }/${
                          //@ts-ignore
                          member.passport?.id
                        }`}>
                        <svg
                          width="25"
                          height="25"
                          viewBox="0 0 25 25"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M5.50018 5.50003C5.50027 5.30705 5.44452 5.11817 5.33965 4.95616C5.23478 4.79416 5.08528 4.66596 4.90918 4.58703C5.05318 4.47403 5.22718 4.39703 5.41918 4.36903L16.2172 2.82603C16.5009 2.78548 16.79 2.80637 17.0649 2.88728C17.3398 2.96819 17.5941 3.10723 17.8106 3.29499C18.0271 3.48275 18.2007 3.71484 18.3197 3.97554C18.4386 4.23624 18.5002 4.51946 18.5002 4.80603V5.62603C18.1735 5.54204 17.8375 5.4997 17.5002 5.50003H5.50018ZM10.2502 13.5C10.2502 12.9033 10.4872 12.331 10.9092 11.909C11.3311 11.4871 11.9034 11.25 12.5002 11.25C13.0969 11.25 13.6692 11.4871 14.0912 11.909C14.5131 12.331 14.7502 12.9033 14.7502 13.5C14.7502 14.0968 14.5131 14.6691 14.0912 15.091C13.6692 15.513 13.0969 15.75 12.5002 15.75C11.9034 15.75 11.3311 15.513 10.9092 15.091C10.4872 14.6691 10.2502 14.0968 10.2502 13.5Z"
                            fill="#D45847"
                          />
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M18.5 6.67C19.665 7.083 20.5 8.194 20.5 9.5V19.5C20.5 20.2956 20.1839 21.0587 19.6213 21.6213C19.0587 22.1839 18.2956 22.5 17.5 22.5H7.5C6.70435 22.5 5.94129 22.1839 5.37868 21.6213C4.81607 21.0587 4.5 20.2956 4.5 19.5V5.5C4.5 5.76522 4.60536 6.01957 4.79289 6.20711C4.98043 6.39464 5.23478 6.5 5.5 6.5H17.5C17.85 6.5 18.187 6.56 18.5 6.67ZM12.5 9.75C11.5054 9.75 10.5516 10.1451 9.84835 10.8483C9.14509 11.5516 8.75 12.5054 8.75 13.5C8.75 14.4946 9.14509 15.4484 9.84835 16.1517C10.5516 16.8549 11.5054 17.25 12.5 17.25C13.4946 17.25 14.4484 16.8549 15.1517 16.1517C15.8549 15.4484 16.25 14.4946 16.25 13.5C16.25 12.5054 15.8549 11.5516 15.1517 10.8483C14.4484 10.1451 13.4946 9.75 12.5 9.75ZM10.5 18.75C10.3011 18.75 10.1103 18.829 9.96967 18.9697C9.82902 19.1103 9.75 19.3011 9.75 19.5C9.75 19.6989 9.82902 19.8897 9.96967 20.0303C10.1103 20.171 10.3011 20.25 10.5 20.25H14.5C14.6989 20.25 14.8897 20.171 15.0303 20.0303C15.171 19.8897 15.25 19.6989 15.25 19.5C15.25 19.3011 15.171 19.1103 15.0303 18.9697C14.8897 18.829 14.6989 18.75 14.5 18.75H10.5Z"
                            fill="#D45847"
                          />
                        </svg>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {currentUser?.role === "ADMIN" && (
        <div dir="rtl" className="space-y-7">
          <h1 className="font-semibold text-xl">تتبع التغييرات</h1>
          <div className="space-y-4">
            {reservation?.history?.map((action) => (
              <div className="flex items-center gap-5">
                <div className="flex items-center gap-1">
                  <span className="text-lg text-brand font-medium">
                    {action.user?.name}
                  </span>
                  {action.type === "DATA" && (
                    <h1 className="font-semibold">
                      قام بتغيير معلومات في الحجز
                    </h1>
                  )}
                  {action.type === "PAYMENT" && (
                    <h1>
                      أضاف دفعة بقيمة{" "}
                      <span className="font-semibold" dir="ltr">
                        {action.amount}da
                      </span>
                    </h1>
                  )}
                  {action.type === "STATUS" && (
                    <h1>
                      غير حالة الحجز من{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          action.oldStatus === "CONFIRMED"
                            ? "text-[#15C847]"
                            : action.oldStatus === "CANCELLED"
                              ? "text-[#F00000]"
                              : "text-[#F2BA05]"
                        )}>
                        {action.oldStatus === "CANCELLED"
                          ? "ملغى"
                          : action.oldStatus === "CONFIRMED"
                            ? "مؤكد"
                            : "غير مؤكد"}
                      </span>{" "}
                      الى{" "}
                      <span
                        className={cn(
                          "font-semibold",
                          action.newStatus === "CONFIRMED"
                            ? "text-[#15C847]"
                            : action.newStatus === "CANCELLED"
                              ? "text-[#F00000]"
                              : "text-[#F2BA05]"
                        )}>
                        {action.newStatus === "CANCELLED"
                          ? "ملغى"
                          : action.newStatus === "CONFIRMED"
                            ? "مؤكد"
                            : "غير مؤكد"}
                      </span>
                    </h1>
                  )}
                </div>
                <h3 className="text-xs text-[#767070]">
                  {format(action.createdAt, "dd/MM/yyyy HH:mm")}
                </h3>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ReservationDetailsForm;
