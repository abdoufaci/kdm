"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ControllerRenderProps, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Dispatch, SetStateAction, useEffect } from "react";
import { Textarea } from "../ui/textarea";
import { HotelLocation, MemberType, RoomType } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Camera, ChevronDown } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { UploadEverything } from "../upload-everything";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { useModal } from "@/hooks/use-modal-store";
import { Separator } from "../ui/separator";
import { ScrollArea } from "../ui/scroll-area";
import { ReservationMemberForm } from "./reservation-member-form";

export const ReservationRoomformSchema = z.object({
  roomType: z.enum([
    RoomType.DOUBLE,
    RoomType.TRIPLE,
    RoomType.QUADRUPLE,
    RoomType.QUINTUPLE,
    RoomType.COLLECTIVE,
  ]),
  id: z.string().optional(),
  adult: z.string().optional(),
  child: z.string().optional(),
  baby: z.string().optional(),
  meccahHotel: z
    .object({
      name: z.string().min(1),
      location: z.enum([HotelLocation.MADINA, HotelLocation.MECCAH]),
      id: z.string().min(1),
    })
    .optional(),
  madinaHotel: z
    .object({
      name: z.string().min(1),
      location: z.enum([HotelLocation.MADINA, HotelLocation.MECCAH]),
      id: z.string().min(1),
    })
    .optional(),
  members: z.array(
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
  ),
});

interface Props {
  field: ControllerRenderProps<
    {
      rooms: {
        roomType:
          | "DOUBLE"
          | "TRIPLE"
          | "QUADRUPLE"
          | "QUINTUPLE"
          | "COLLECTIVE";
        id: string;
        adult: string;
        meccahHotel: {
          name: string;
          location: "MADINA" | "MECCAH";
          id: string;
        };
        members: {
          type: "ADULT" | "BABY" | "CHILD";
          id?: string | undefined;
          name?: string | undefined;
          sex?: string | undefined;
          dob?: Date | undefined;
          passportExpiryDate?: Date | undefined;
          passportNumber?: string | undefined;
          passport?:
            | {
                id: string;
                type: string;
              }
            | undefined;
          foodIclusions?: boolean | undefined;
        }[];
        child?: string | undefined;
        baby?: string | undefined;
        madinaHotel?:
          | {
              name: string;
              location: "MADINA" | "MECCAH";
              id: string;
            }
          | undefined;
      }[];
    },
    "rooms"
  >;
  idx: number;
  setImagesToDelete: Dispatch<
    SetStateAction<
      {
        id: string;
        type: string;
      }[]
    >
  >;
  steps: 1 | 2 | 3;
  roomType: RoomType;
}

export function ReservationRoomForm({
  field,
  idx,
  setImagesToDelete,
  steps,
  roomType,
}: Props) {
  const { data } = useModal();
  const { hotels, reservation } = data;
  const form = useForm<z.infer<typeof ReservationRoomformSchema>>({
    resolver: zodResolver(ReservationRoomformSchema),
    defaultValues: {
      ...field.value[idx],
    },
  });

  const adult = form.watch("adult");
  const child = form.watch("child");
  const baby = form.watch("baby");
  const madinaHotel = form.watch("madinaHotel");
  const meccahHotel = form.watch("meccahHotel");
  const members = form.watch("members");

  useEffect(() => {
    if (
      adult ||
      child ||
      baby ||
      madinaHotel ||
      meccahHotel ||
      !!members.length
    ) {
      form.handleSubmit(onSubmit)();
    }
  }, [adult, child, baby, madinaHotel, meccahHotel, members]);

  async function onSubmit(data: z.infer<typeof ReservationRoomformSchema>) {
    const rooms = field.value;
    rooms[idx] = {
      child: data.child || field.value[idx].child,
      baby: data.baby || field.value[idx].baby,
      adult: data.adult || field.value[idx].adult,
      members: data.members || field.value[idx].members,
      madinaHotel: data.madinaHotel || field.value[idx].madinaHotel,
      meccahHotel: data.meccahHotel || field.value[idx].meccahHotel,
      roomType: data.roomType || field.value[idx].roomType,
      id: data.id || field.value[idx].id,
    };
    field.onChange(rooms);
    return rooms;
  }

  return (
    <Form {...form}>
      <div className="space-y-4 w-full">
        {(steps === 3 || !!reservation) && !!members.length && (
          <>
            <div className="space-y-7">
              <FormField
                control={form.control}
                name="members"
                render={({ field }) => (
                  <FormItem className="space-y-5">
                    <FormControl className="flex flex-col gap-2 w-full">
                      <div className="w-full space-y-5">
                        {members?.map((value, idx) => (
                          <div key={idx} className="space-y-3">
                            <h1
                              dir="rtl"
                              className="text-xl text-brand font-medium">
                              شخص {idx + 1} -{" "}
                              {value.type === "ADULT"
                                ? "بالغ"
                                : value.type === "CHILD"
                                  ? "طفل"
                                  : "رضيع"}
                            </h1>
                            <ReservationMemberForm
                              field={field}
                              idx={idx}
                              setImagesToDelete={setImagesToDelete}
                            />
                            {idx !== members.length - 1 && (
                              <Separator className="min-h-0.5 bg-[#C29A774F] mt-6" />
                            )}
                          </div>
                        ))}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* {reservation ? (
                  <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5 w-full">
                    <Button
                      disabled={isPending}
                      type="submit"
                      variant={"brand"}
                      size={"lg"}
                      className="h-11 w-full">
                      تغيير
                    </Button>
                    <Button
                      disabled={isPending}
                      type="button"
                      onClick={() =>
                        onOpen("deleteReservation", { reservation })
                      }
                      variant={"delete"}
                      size={"lg"}
                      className="h-11 w-full">
                      حذف
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled={isPending}
                    type="submit"
                    variant={"brand"}
                    size={"lg"}
                    className="h-11 w-full">
                    اظافة
                  </Button>
                )} */}
            </div>
          </>
        )}
        {steps === 2 && (
          <>
            <FormField
              control={form.control}
              name="adult"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        value={field.value ?? ""}
                        onChange={(e) =>
                          roomType === "COLLECTIVE"
                            ? field.onChange(e.target.value)
                            : {}
                        }
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                              focus:ring-0 h-14"
                        placeholder="اكثر من 19 سنة"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        عدد البالغين
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="child"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        type="number"
                        id="slogan"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                              focus:ring-0 h-14"
                        placeholder="ما بين 2-12 سنة"
                        {...field}
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        عدد ااطفال
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="baby"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        id="slogan"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                              focus:ring-0 h-14"
                        placeholder="اقل من 2سنة"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        عدد الرضع
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Separator className="bg-[#D9D9D994] min-h-[2.5px]" />
            <FormField
              control={form.control}
              name="meccahHotel"
              render={({ field }) => (
                <FormItem className="space-y-1 w-full">
                  <FormControl className="w-full">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="flex items-center cursor-pointer justify-between w-full rounded-lg border border-[#CFCFCF] px-4 py-2.5 focus:outline-none">
                        <ChevronDown className="size-4 text-[#A7ABAF]" />
                        <div dir="rtl" className="flex flex-col text-start">
                          <p className="text-[9px]">فندق مكة</p>
                          {field.value ? (
                            <p className="text-sm mt-0.5">{field.value.name}</p>
                          ) : (
                            <p className="text-sm text-[#A7ABAF] mt-0.5">
                              اختر الفندق
                            </p>
                          )}
                        </div>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="w-[460px]">
                        {hotels
                          ?.filter((hotel) => hotel.location === "MECCAH")
                          .map((hotel, idx) => (
                            <DropdownMenuItem
                              key={idx}
                              onClick={() => {
                                field.onChange(hotel);
                              }}
                              className="hover:cursor-pointer w-full">
                              {hotel.name}
                            </DropdownMenuItem>
                          ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!!hotels?.filter((hotel) => hotel.location === "MADINA")
              .length && (
              <FormField
                control={form.control}
                name="madinaHotel"
                render={({ field }) => (
                  <FormItem className="space-y-1 w-full">
                    <FormControl className="w-full">
                      <DropdownMenu>
                        <DropdownMenuTrigger className="flex cursor-pointer items-center justify-between w-full rounded-lg border border-[#CFCFCF] px-4 py-2.5 focus:outline-none">
                          <ChevronDown className="size-4 text-[#A7ABAF]" />
                          <div dir="rtl" className="flex flex-col text-start">
                            <p className="text-[9px]">فندق المدينة</p>
                            {field.value ? (
                              <p className="text-sm mt-0.5">
                                {field.value?.name}
                              </p>
                            ) : (
                              <p className="text-sm text-[#A7ABAF] mt-0.5">
                                اختر الفندق
                              </p>
                            )}
                          </div>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-[460px]">
                          {hotels
                            ?.filter((hotel) => hotel.location === "MADINA")
                            .map((hotel, idx) => (
                              <DropdownMenuItem
                                key={idx}
                                onClick={() => {
                                  field.onChange(hotel);
                                }}
                                className="hover:cursor-pointer w-full">
                                {hotel.name}
                              </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </>
        )}
      </div>
    </Form>
  );
}
