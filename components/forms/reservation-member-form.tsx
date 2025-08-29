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
import { MemberType } from "@prisma/client";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CalendarIcon, Camera } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { UploadEverything } from "../upload-everything";

export const ReservationMemberformSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  type: z
    .enum([MemberType.ADULT, MemberType.BABY, MemberType.CHILD])
    .optional(),
  dob: z.date().optional(),
  passportExpiryDate: z.date().optional(),
  passportNumber: z.string().optional(),
  passport: z
    .object({
      id: z.string(),
      type: z.string(),
    })
    .optional(),
});

interface Props {
  field: ControllerRenderProps<
    {
      adult: string;
      child?: string;
      baby?: string;
      meccahHotel: {
        name: string;
        location: "MADINA" | "MECCAH";
        id: string;
      };
      members: {
        id?: string;
        name?: string;
        type: "ADULT" | "BABY" | "CHILD";
        dob?: Date;
        passportExpiryDate?: Date;
        passportNumber?: string;
        passport?: {
          type: string;
          id: string;
        };
      }[];
      madinaHotel?:
        | {
            name: string;
            location: "MADINA" | "MECCAH";
            id: string;
          }
        | undefined;
    },
    "members"
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
}

export function ReservationMemberForm({
  field,
  idx,
  setImagesToDelete,
}: Props) {
  const form = useForm<z.infer<typeof ReservationMemberformSchema>>({
    resolver: zodResolver(ReservationMemberformSchema),
    defaultValues: {
      ...field.value[idx],
    },
  });

  const name = form.watch("name");
  const dob = form.watch("dob");
  const passportExpiryDate = form.watch("passportExpiryDate");
  const passportNumber = form.watch("passportNumber");
  const passport = form.watch("passport");

  useEffect(() => {
    if (name || dob || passportExpiryDate || passportNumber || passport) {
      form.handleSubmit(onSubmit)();
    }
  }, [name, dob, passportExpiryDate, passportNumber, passport]);

  async function onSubmit(data: z.infer<typeof ReservationMemberformSchema>) {
    const members = field.value;
    members[idx] = {
      dob: data.dob || field.value[idx].dob,
      passportExpiryDate:
        data.passportExpiryDate || field.value[idx].passportExpiryDate,
      name: data.name || field.value[idx].name,
      passportNumber: data.passportNumber || field.value[idx].passportNumber,
      passport: data.passport || field.value[idx].passport,
      type: data.type || field.value[idx].type,
      id: data.id || field.value[idx].id,
    };
    field.onChange(members);
    return members;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col">
        <div className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                      placeholder="Nom de client"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      Nom
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"dob"}
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full">
                <FormControl>
                  <div className="relative w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full text-sm rounded-lg border border-[#CFCFCF] px-4 pb-3 pt-7 h-14 justify-start text-left ",
                            !field.value && "text-gray-400"
                          )}>
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>date de naissance de person</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                        />
                      </PopoverContent>
                    </Popover>
                    <FormLabel className="absolute top-2 left-3 text-[9px]">
                      date de naissance
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passportNumber"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      type="number"
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                              focus:ring-0 h-14"
                      placeholder="numéro de passeport"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      PASSEPORT
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name={"passportExpiryDate"}
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full">
                <FormControl>
                  <div className="relative w-full">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full text-sm rounded-lg border border-[#CFCFCF] px-4 pb-3 pt-7 h-14 justify-start text-left ",
                            !field.value && "text-gray-400"
                          )}>
                          {field.value ? (
                            format(field.value, "dd/MM/yyyy")
                          ) : (
                            <span>date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          captionLayout="dropdown"
                          toYear={2100}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormLabel className="absolute top-2 left-3 text-[9px]">
                      Date d'expiration de passeport
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="passport"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl className="w-full">
                  <div className="flex justify-center items-center gap-3 w-full relative">
                    <UploadEverything
                      value={
                        field.value?.id !== "" &&
                        field.value?.type !== "" &&
                        field.value
                          ? [field.value]
                          : []
                      }
                      onChange={field.onChange}
                      accept="image/*"
                      imageContainerClassName="w-full !min-w-full aspect-square !h-full min-h-full"
                      setImagesToDelete={setImagesToDelete}>
                      <div className="w-full border border-[#CFCFCF] rounded-lg h-14 flex items-center justify-between px-3">
                        <div className="space-y-1">
                          <h3 className="text-[9px]">PHOTO DE PASSEPORT</h3>
                          <h1 className="text-sm text-[#A7ABAF]">
                            Première page de passeport
                          </h1>
                        </div>
                        <svg
                          width="20"
                          height="16"
                          viewBox="0 0 20 16"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            fillRule="evenodd"
                            clipRule="evenodd"
                            d="M6.57143 0.428537C6.70633 0.248679 6.91803 0.142822 7.14286 0.142822H12.8571C13.082 0.142822 13.2937 0.248679 13.4286 0.428537L15.3571 2.99997H17.8571C18.4254 2.99997 18.9706 3.22574 19.3724 3.62759C19.7743 4.02945 20 4.57449 20 5.14282V13.7143C20 14.2825 19.7743 14.8277 19.3724 15.2295C18.9706 15.6314 18.4254 15.8571 17.8571 15.8571H2.14286C1.57453 15.8571 1.02949 15.6314 0.627629 15.2295C0.225764 14.8277 0 14.2825 0 13.7143V5.14282C0 4.57451 0.225764 4.02945 0.627629 3.62759C1.02949 3.22574 1.57453 2.99997 2.14286 2.99997H4.64286L6.57143 0.428537ZM13.5162 9.01614C13.5162 10.9581 11.9419 12.5323 9.99999 12.5323C8.05806 12.5323 6.48381 10.9581 6.48381 9.01614C6.48381 7.07421 8.05806 5.49997 9.99999 5.49997C11.9419 5.49997 13.5162 7.07421 13.5162 9.01614Z"
                            fill="#D45847"
                          />
                        </svg>
                      </div>
                    </UploadEverything>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </form>
    </Form>
  );
}
