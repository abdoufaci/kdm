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
import { useEffect, useState, useTransition } from "react";
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
import { HotelLocation, MemberType } from "@prisma/client";
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

export const ManageReservationformSchema = z.object({
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
      })
    )
    .min(1),
});

export function ManageReservationForm() {
  const { onClose, data, onOpen } = useModal();
  const { hotels, travel, reservation } = data;
  const form = useForm<z.infer<typeof ManageReservationformSchema>>({
    resolver: zodResolver(ManageReservationformSchema),
    defaultValues: {
      adult: "1",
      madinaHotel: reservation?.madinaHotel
        ? {
            id: reservation?.madinaHotel?.id || "",
            location: reservation?.madinaHotel?.location || "MADINA",
            name: reservation?.madinaHotel?.name || "",
          }
        : undefined,
      meccahHotel: reservation?.meccahHotel
        ? {
            id: reservation?.meccahHotel?.id || "",
            location: reservation?.meccahHotel?.location || "MECCAH",
            name: reservation?.meccahHotel?.name || "",
          }
        : undefined,
      members:
        reservation?.reservationMembers.map((member) => ({
          dob: member.dob,
          name: member.name,
          passport: member.passport as { id: string; type: string },
          passportExpiryDate: member.passportExpiryDate,
          passportNumber: member.passportNumber,
          type: member.type,
          id: member.id,
        })) || [],
    },
  });
  const [showMembers, setShowMembers] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [imagesToDelete, setImagesToDelete] = useState<
    { id: string; type: string }[]
  >([]);

  const members = form.watch("members");

  async function onSubmit(data: z.infer<typeof ManageReservationformSchema>) {
    if (
      reservation &&
      !!data.members.some(
        (member) =>
          !member.dob ||
          !member.id ||
          !member.name ||
          !member.passport ||
          !member.passportExpiryDate ||
          !member.passportNumber ||
          !member.type
      )
    ) {
      toast.error("Some fields for the persones are empty");
      return;
    }
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
            currentAvailabelSports: Number(travel?.availabelSpots || "0"),
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
        className="space-y-8 flex flex-col items-center justify-center">
        <div className="space-y-4 w-full">
          {(showMembers || !!reservation) && !!members.length ? (
            <ScrollArea
              className={cn(
                "",
                members.length === 1 ? "h-[450px]" : "h-[500px]"
              )}>
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
                              <h1 className="text-xl text-brand font-medium">
                                {idx + 1}
                                {idx === 0 ? "er" : "eme"} Person -{" "}
                                {value.type === "ADULT"
                                  ? "Adult"
                                  : value.type === "CHILD"
                                    ? "Enfant"
                                    : "Bebe"}
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
                {reservation ? (
                  <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5 w-full">
                    <Button
                      disabled={isPending}
                      type="submit"
                      variant={"brand"}
                      size={"lg"}
                      className="h-11 w-full">
                      Edit
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
                      Delete
                    </Button>
                  </div>
                ) : (
                  <Button
                    disabled={isPending}
                    type="submit"
                    variant={"brand"}
                    size={"lg"}
                    className="h-11 w-full">
                    Ajouter
                  </Button>
                )}
              </div>
            </ScrollArea>
          ) : (
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
                          onChange={field.onChange}
                          type="number"
                          className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                          placeholder="+19ans"
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 left-4 text-[9px]">
                          N° Adult
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
                          placeholder="entre 2-19 ans"
                          {...field}
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 left-4 text-[9px]">
                          N° Enfant
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
                          placeholder="entre 0-2 ans"
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 left-4 text-[9px]">
                          N° bebe
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
                          <div className="flex flex-col text-start">
                            <p className="text-[9px]">HOTEL MECCAH</p>
                            {field.value ? (
                              <p className="text-sm mt-0.5">
                                {field.value.name}
                              </p>
                            ) : (
                              <p className="text-sm text-[#A7ABAF] mt-0.5">
                                Choisissez l’hotel
                              </p>
                            )}
                          </div>
                          <ChevronDown className="size-4 text-[#A7ABAF]" />
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
                            <div className="flex flex-col text-start">
                              <p className="text-[9px]">HOTEL MADINA</p>
                              {field.value ? (
                                <p className="text-sm mt-0.5">
                                  {field.value?.name}
                                </p>
                              ) : (
                                <p className="text-sm text-[#A7ABAF] mt-0.5">
                                  Choisissez l’hotel
                                </p>
                              )}
                            </div>
                            <ChevronDown className="size-4 text-[#A7ABAF]" />
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
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  const AdultsNumber = Number(form.watch("adult"));
                  const ChildsNumber = Number(form.watch("child") || "0");
                  const BabiesNumber = Number(form.watch("baby") || "0");
                  const adults = Array.from(Array(AdultsNumber).keys()).map(
                    () => ({
                      id: undefined,
                      name: undefined,
                      type: MemberType.ADULT,
                      dob: undefined,
                      passportExpiryDate: undefined,
                      passportNumber: undefined,
                      passport: undefined,
                    })
                  );
                  const childs = Array.from(Array(ChildsNumber).keys()).map(
                    () => ({
                      id: undefined,
                      name: undefined,
                      type: MemberType.CHILD,
                      dob: undefined,
                      passportExpiryDate: undefined,
                      passportNumber: undefined,
                      passport: undefined,
                    })
                  );
                  const babies = Array.from(Array(BabiesNumber).keys()).map(
                    () => ({
                      id: undefined,
                      name: undefined,
                      type: MemberType.BABY,
                      dob: undefined,
                      passportExpiryDate: undefined,
                      passportNumber: undefined,
                      passport: undefined,
                    })
                  );
                  form.setValue("members", [...adults, ...childs, ...babies]);
                  setShowMembers(true);
                }}
                type="button"
                variant={"brand"}
                size={"lg"}
                className="h-11 w-full">
                Continue
              </Button>
            </>
          )}
        </div>
      </form>
    </Form>
  );
}
