"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useModal } from "@/hooks/use-modal-store";
import {
  Dispatch,
  SetStateAction,
  useEffect,
  useState,
  useTransition,
} from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { UploadEverything } from "../upload-everything";
import Image from "next/image";
import { Separator } from "../ui/separator";
import { generateRandomPassword } from "@/lib/generate-password";
import {
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  RefreshCcw,
  XIcon,
} from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import { checkUsernameAvailability } from "@/actions/mutations/users/check-username-availability";
import { addAgency } from "@/actions/mutations/users/add-agency";
import { updateAgency } from "@/actions/mutations/users/update-agency";
import { HotelLocation, MemberType, RoomType } from "@prisma/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { ScrollArea } from "../ui/scroll-area";
import { ReservationMemberForm } from "./reservation-member-form";
import { addReservation } from "@/actions/mutations/reservation/add-reservation";
import { updateReservation } from "@/actions/mutations/reservation/update-reservation";
import { id } from "date-fns/locale";
import { roomTypes } from "@/constants/room-type";
import { ReservationRoomForm } from "./reservation-room-form";
import cuid from "cuid";

export const ManageReservationformSchema = z.object({
  rooms: z.array(
    z.object({
      roomType: z.enum([
        RoomType.DOUBLE,
        RoomType.TRIPLE,
        RoomType.QUADRUPLE,
        RoomType.QUINTUPLE,
        RoomType.COLLECTIVE,
      ]),
      id: z.string(),
      adult: z.string(),
      child: z.string().optional(),
      baby: z.string().optional(),
      meccahHotel: z.object({
        name: z.string().min(1),
        location: z.enum([HotelLocation.MADINA, HotelLocation.MECCAH]),
        id: z.string().min(1),
      }),
      madinaHotel: z
        .object({
          name: z.string().min(1),
          location: z.enum([HotelLocation.MADINA, HotelLocation.MECCAH]),
          id: z.string().min(1),
        })
        .optional(),
      members: z
        .array(
          z.object({
            id: z.string().optional(),
            name: z.string().optional(),
            sex: z.string().optional(),
            type: z.enum([MemberType.ADULT, MemberType.BABY, MemberType.CHILD]),
            dob: z.date().optional(),
            passportExpiryDate: z.date().optional(),
            passportNumber: z.string().optional(),
            passport: z
              .object({
                id: z.string(),
                type: z.string(),
              })
              .optional(),
            foodIclusions: z.boolean().optional(),
          })
        )
        .min(1),
    })
  ),
});

interface Props {
  setSteps: Dispatch<SetStateAction<1 | 2 | 3>>;
  steps: 1 | 2 | 3;
  setChange: Dispatch<SetStateAction<number>>;
  change: number;
}

export function ManageReservationForm({
  setSteps,
  steps,
  change,
  setChange,
}: Props) {
  const { onClose, data, onOpen } = useModal();
  const { hotels, travel, reservation } = data;
  const form = useForm<z.infer<typeof ManageReservationformSchema>>({
    resolver: zodResolver(ManageReservationformSchema),
    defaultValues: {
      rooms:
        reservation?.reservationRooms.map((room) => ({
          roomType: room.roomType as RoomType,
          type: room.roomType as RoomType,
          id: room.id,
          adult: "1",
          madinaHotel: room?.madinaHotel
            ? {
                id: room?.madinaHotel?.id || "",
                location: room?.madinaHotel?.location || "MADINA",
                name: room?.madinaHotel?.name || "",
              }
            : undefined,
          meccahHotel: room?.meccahHotel
            ? {
                id: room?.meccahHotel?.id || "",
                location: room?.meccahHotel?.location || "MECCAH",
                name: room?.meccahHotel?.name || "",
              }
            : undefined,
          members:
            room?.reservationMembers.map((member) => ({
              dob: member.dob,
              name: member.name,
              passport: member.passport as { id: string; type: string },
              passportExpiryDate: member.passportExpiryDate,
              passportNumber: member.passportNumber,
              type: member.type,
              id: member.id,
              sex: member.sex,
              foodIclusions: member.foodIclusions,
            })) || [],
        })) || [],
    },
  });
  const [intialRooms, setIntialRooms] = useState<(RoomType | null)[]>([]);
  const [isPending, startTransition] = useTransition();
  const [imagesToDelete, setImagesToDelete] = useState<
    { id: string; type: string }[]
  >([]);

  const rooms = form.watch("rooms");

  const currentSavedSpots =
    travel?.reservations
      .filter((reservation) => reservation.status !== "CANCELLED")
      .reduce(
        (acc, reservation) =>
          acc +
          reservation.reservationRooms.reduce(
            (acc, room) =>
              acc +
              room.reservationMembers.filter(
                (member) => member.type === "ADULT"
              ).length,
            0
          ),
        0
      ) || 0;

  async function onSubmit(data: z.infer<typeof ManageReservationformSchema>) {
    startTransition(() => {
      reservation
        ? updateReservation({
            data,
            reservationId: reservation.id,
            imagesToDelete,
          })
            .then(() => {
              toast.success("Success");
              onClose();
            })
            .catch(() => toast.error("Something went wrong, try again."))
        : addReservation({
            data,
            travelId: travel?.id,
            currentSavedSpots,
            availabelSpots: Number(travel?.availabelSpots) || 0,
          })
            .then((res) => {
              if (res?.error) {
                toast.error(res.error);
              } else {
                toast.success("Success");
              }
              onClose();
            })
            .catch(() => toast.error("Something went wrong, try again."));
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col items-center justify-center w-full">
        <div className="space-y-4 w-full">
          {(steps !== 1 || !!reservation) && (
            <FormField
              control={form.control}
              name="rooms"
              render={({ field }) => (
                <FormItem className="space-y-5 w-full">
                  <FormControl className="flex flex-col gap-2 w-full">
                    <div className="space-y-5">
                      <ScrollArea className="h-[500px]">
                        <div className="w-full space-y-5">
                          {rooms.map((room, idx) => (
                            <div key={idx} className="space-y-3">
                              <h1
                                dir="rtl"
                                className="text-xl text-brand font-medium">
                                غرفة {idx + 1} - {roomTypes[room.roomType]}
                              </h1>
                              <ReservationRoomForm
                                field={field}
                                idx={idx}
                                setImagesToDelete={setImagesToDelete}
                                steps={steps}
                                key={change}
                                roomType={room.roomType}
                              />
                              {idx !== rooms.length - 1 && (
                                <Separator className="min-h-0.5 bg-[#C29A774F] mt-6" />
                              )}
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                      {steps === 2 && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            if (
                              rooms.some(
                                (room) => !room.madinaHotel || !room.meccahHotel
                              )
                            ) {
                              toast.error("املأ خانة الفنادق");
                              return;
                            }
                            const savedSpots =
                              currentSavedSpots +
                              rooms.reduce(
                                (acc, room) => acc + Number(room?.adult || "1"),
                                0
                              );
                            if (
                              Number(travel?.availabelSpots) - savedSpots <
                              0
                            ) {
                              toast.error("أماكن متوفرة غير كافية");
                              return;
                            }
                            form.setValue(
                              "rooms",
                              rooms.some((room) => !!room.members.length)
                                ? rooms.map((room) => {
                                    const AdultsNumber = Number(
                                      room.adult || "1"
                                    );
                                    const ChildsNumber = Number(
                                      room.child || "0"
                                    );
                                    const BabiesNumber = Number(
                                      room.baby || "0"
                                    );
                                    const adults = Array.from(
                                      Array(AdultsNumber).keys()
                                    ).map((idx) => ({
                                      id: cuid(),
                                      name:
                                        room.members.filter(
                                          (member) => member.type === "ADULT"
                                        )?.[idx]?.name || undefined,
                                      type: MemberType.ADULT,
                                      dob:
                                        room.members.filter(
                                          (member) => member.type === "ADULT"
                                        )?.[idx]?.dob || undefined,
                                      passportExpiryDate:
                                        room.members.filter(
                                          (member) => member.type === "ADULT"
                                        )?.[idx]?.passportExpiryDate ||
                                        undefined,
                                      passportNumber:
                                        room.members.filter(
                                          (member) => member.type === "ADULT"
                                        )?.[idx]?.passportNumber || undefined,
                                      passport:
                                        room.members.filter(
                                          (member) => member.type === "ADULT"
                                        )?.[idx]?.passport || undefined,
                                    }));
                                    const childs = Array.from(
                                      Array(ChildsNumber).keys()
                                    ).map((idx) => ({
                                      id: cuid(),
                                      name:
                                        room.members.filter(
                                          (member) => member.type === "CHILD"
                                        )?.[idx]?.name || undefined,
                                      type: MemberType.CHILD,
                                      dob:
                                        room.members.filter(
                                          (member) => member.type === "CHILD"
                                        )?.[idx]?.dob || undefined,
                                      passportExpiryDate:
                                        room.members.filter(
                                          (member) => member.type === "CHILD"
                                        )?.[idx]?.passportExpiryDate ||
                                        undefined,
                                      passportNumber:
                                        room.members.filter(
                                          (member) => member.type === "CHILD"
                                        )?.[idx]?.passportNumber || undefined,
                                      passport:
                                        room.members.filter(
                                          (member) => member.type === "CHILD"
                                        )?.[idx]?.passport || undefined,
                                    }));
                                    const babies = Array.from(
                                      Array(BabiesNumber).keys()
                                    ).map((idx) => ({
                                      id: cuid(),
                                      name:
                                        room.members.filter(
                                          (member) => member.type === "BABY"
                                        )?.[idx]?.name || undefined,
                                      type: MemberType.BABY,
                                      dob:
                                        room.members.filter(
                                          (member) => member.type === "BABY"
                                        )?.[idx]?.dob || undefined,
                                      passportExpiryDate:
                                        room.members.filter(
                                          (member) => member.type === "BABY"
                                        )?.[idx]?.passportExpiryDate ||
                                        undefined,
                                      passportNumber:
                                        room.members.filter(
                                          (member) => member.type === "BABY"
                                        )?.[idx]?.passportNumber || undefined,
                                      passport:
                                        room.members.filter(
                                          (member) => member.type === "BABY"
                                        )?.[idx]?.passport || undefined,
                                    }));

                                    return {
                                      ...room,
                                      members: [
                                        ...adults,
                                        ...childs,
                                        ...babies,
                                      ],
                                    };
                                  })
                                : rooms.map((room) => {
                                    const AdultsNumber = Number(
                                      room.adult || "1"
                                    );
                                    const ChildsNumber = Number(
                                      room.child || "0"
                                    );
                                    const BabiesNumber = Number(
                                      room.baby || "0"
                                    );
                                    const adults = Array.from(
                                      Array(AdultsNumber).keys()
                                    ).map(() => ({
                                      id: cuid(),
                                      name: undefined,
                                      type: MemberType.ADULT,
                                      dob: undefined,
                                      passportExpiryDate: undefined,
                                      passportNumber: undefined,
                                      passport: undefined,
                                    }));
                                    const childs = Array.from(
                                      Array(ChildsNumber).keys()
                                    ).map(() => ({
                                      id: cuid(),
                                      name: undefined,
                                      type: MemberType.CHILD,
                                      dob: undefined,
                                      passportExpiryDate: undefined,
                                      passportNumber: undefined,
                                      passport: undefined,
                                    }));
                                    const babies = Array.from(
                                      Array(BabiesNumber).keys()
                                    ).map(() => ({
                                      id: cuid(),
                                      name: undefined,
                                      type: MemberType.BABY,
                                      dob: undefined,
                                      passportExpiryDate: undefined,
                                      passportNumber: undefined,
                                      passport: undefined,
                                    }));

                                    return {
                                      ...room,
                                      members: [
                                        ...adults,
                                        ...childs,
                                        ...babies,
                                      ],
                                    };
                                  })
                            );
                            setChange((prev) => prev + 1);
                            setSteps(3);
                          }}
                          type="button"
                          variant={"brand"}
                          size={"lg"}
                          className="h-11 w-full">
                          التالي
                        </Button>
                      )}
                      {(steps === 3 || !!reservation) && (
                        <Button
                          disabled={isPending}
                          type="submit"
                          variant={"brand"}
                          size={"lg"}
                          className="h-11 w-full">
                          {isPending ? (
                            <Loader2 className="mx-auto animate-spin" />
                          ) : (
                            "حفظ التغييرات"
                          )}
                        </Button>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
          {steps === 1 && !reservation && (
            <div className="space-y-4">
              <div className="relative w-full">
                <Input
                  value={intialRooms.length.toString()}
                  onChange={(e) => {
                    setIntialRooms(
                      new Array(e.target.valueAsNumber).fill(null)
                    );
                  }}
                  type="number"
                  id="slogan"
                  className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                  placeholder="عدد الغرفة"
                />
                <h5 className="absolute top-2 right-4 text-[9px]">
                  عدد الغرفة{" "}
                </h5>
              </div>
              {intialRooms.map((room, idx) => (
                <DropdownMenu key={idx}>
                  <DropdownMenuTrigger className="flex cursor-pointer items-center justify-between w-full rounded-lg border border-[#CFCFCF] px-4 py-2.5 focus:outline-none">
                    <ChevronDown className="size-4 text-[#A7ABAF]" />
                    <div dir="rtl" className="flex flex-col text-start">
                      <p className="text-[9px]">نوع الغرفة</p>
                      {room ? (
                        <p className="text-sm mt-0.5">{roomTypes[room]}</p>
                      ) : (
                        <p className="text-sm text-[#A7ABAF] mt-0.5">
                          اختر نوع الغرفة {idx + 1}
                        </p>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[460px]">
                    <DropdownMenuItem
                      onClick={() => {
                        setIntialRooms((prev) => {
                          const newRooms = [...prev];
                          newRooms[idx] = RoomType.DOUBLE;
                          return newRooms;
                        });
                      }}
                      className="hover:cursor-pointer w-full">
                      ثنائية
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIntialRooms((prev) => {
                          const newRooms = [...prev];
                          newRooms[idx] = RoomType.TRIPLE;
                          return newRooms;
                        });
                      }}
                      className="hover:cursor-pointer w-full">
                      ثلاثية
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIntialRooms((prev) => {
                          const newRooms = [...prev];
                          newRooms[idx] = RoomType.QUADRUPLE;
                          return newRooms;
                        });
                      }}
                      className="hover:cursor-pointer w-full">
                      رباعية
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIntialRooms((prev) => {
                          const newRooms = [...prev];
                          newRooms[idx] = RoomType.QUINTUPLE;
                          return newRooms;
                        });
                      }}
                      className="hover:cursor-pointer w-full">
                      خماسية
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        setIntialRooms((prev) => {
                          const newRooms = [...prev];
                          newRooms[idx] = RoomType.COLLECTIVE;
                          return newRooms;
                        });
                      }}
                      className="hover:cursor-pointer w-full">
                      جماعية
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ))}
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  form.setValue(
                    "rooms",
                    !!rooms.length
                      ? intialRooms.map((room, idx) => ({
                          roomType: room!,
                          id: cuid(),
                          adult:
                            room === "DOUBLE"
                              ? "2"
                              : room === "TRIPLE"
                                ? "3"
                                : room === "QUADRUPLE"
                                  ? "4"
                                  : room === "QUINTUPLE"
                                    ? "5"
                                    : "",
                          meccahHotel: rooms?.[idx]?.meccahHotel || {
                            name: "",
                            location: "MECCAH",
                            id: cuid(),
                          },
                          madinaHotel: rooms?.[idx]?.madinaHotel || undefined,
                          members: rooms?.[idx]?.members || [],
                        }))
                      : intialRooms.map((room) => ({
                          roomType: room!,
                          id: cuid(),
                          adult:
                            room === "DOUBLE"
                              ? "2"
                              : room === "TRIPLE"
                                ? "3"
                                : room === "QUADRUPLE"
                                  ? "4"
                                  : room === "QUINTUPLE"
                                    ? "5"
                                    : "",
                          meccahHotel: {
                            name: "",
                            location: "MECCAH",
                            id: cuid(),
                          },
                          madinaHotel: undefined,
                          members: [],
                        }))
                  );
                  setChange((prev) => prev + 1);
                  setSteps(2);
                }}
                type="button"
                variant={"brand"}
                size={"lg"}
                className="h-11 w-full">
                التالي
              </Button>
            </div>
          )}
        </div>
      </form>
    </Form>
  );
}
