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
import { CalendarIcon, Camera, ChevronDown } from "lucide-react";
import { Calendar } from "../ui/calendar";
import { UploadEverything } from "../upload-everything";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Checkbox } from "../ui/checkbox";
import { useModal } from "@/hooks/use-modal-store";

export const ReservationMemberformSchema = z.object({
  id: z.string().optional(),
  name: z.string().optional(),
  sex: z.string().optional(),
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
  foodIclusions: z.boolean().optional(),
});

interface Props {
  field: ControllerRenderProps<
    {
      roomType: "DOUBLE" | "TRIPLE" | "QUADRUPLE" | "QUINTUPLE" | "COLLECTIVE";
      id?: string;
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
      adult?: string | undefined;
      child?: string | undefined;
      baby?: string | undefined;
      meccahHotel?:
        | {
            name: string;
            location: "MADINA" | "MECCAH";
            id: string;
          }
        | undefined;
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
  const { data } = useModal();

  const { travel } = data;

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
  const sex = form.watch("sex");
  const foodIclusions = form.watch("foodIclusions");

  useEffect(() => {
    if (
      name ||
      dob ||
      passportExpiryDate ||
      passportNumber ||
      passport ||
      sex ||
      foodIclusions
    ) {
      form.handleSubmit(onSubmit)();
    }
  }, [
    name,
    dob,
    passportExpiryDate,
    passportNumber,
    passport,
    sex,
    foodIclusions,
  ]);

  async function onSubmit(data: z.infer<typeof ReservationMemberformSchema>) {
    const members = field.value;
    members[idx] = {
      dob: data.dob || field.value[idx].dob,
      passportExpiryDate:
        data.passportExpiryDate || field.value[idx].passportExpiryDate,
      name: data.name || field.value[idx].name,
      sex: data.sex || field.value[idx].sex,
      passportNumber: data.passportNumber || field.value[idx].passportNumber,
      passport: data.passport || field.value[idx].passport,
      type: data.type || field.value[idx].type,
      id: data.id || field.value[idx].id,
      foodIclusions: data.foodIclusions || field.value[idx].foodIclusions,
    };
    field.onChange(members);
    return members;
  }

  return (
    <Form {...form}>
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
                    placeholder="اسم شخص"
                  />
                  <FormLabel
                    htmlFor="slogan"
                    className="absolute top-2 right-4 text-[9px]">
                    الاسم الكامل
                  </FormLabel>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="sex"
          render={({ field }) => (
            <FormItem className="space-y-1 w-full">
              <FormControl className="w-full">
                <DropdownMenu>
                  <DropdownMenuTrigger className="flex items-center cursor-pointer justify-between w-full rounded-lg border border-[#CFCFCF] px-4 py-2.5 focus:outline-none">
                    <ChevronDown className="size-4 text-[#A7ABAF]" />
                    <div dir="rtl" className="flex flex-col text-start">
                      <p className="text-[9px]">الجنس</p>
                      {field.value ? (
                        <p className="text-sm mt-0.5">{field.value}</p>
                      ) : (
                        <p className="text-sm text-[#A7ABAF] mt-0.5">
                          اختر جنس الشخص
                        </p>
                      )}
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-[460px]">
                    <DropdownMenuItem
                      onClick={() => {
                        field.onChange("ذكر");
                      }}
                      className="hover:cursor-pointer w-full">
                      ذكر
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => {
                        field.onChange("انثى");
                      }}
                      className="hover:cursor-pointer w-full">
                      انثى
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
                          "w-full text-sm rounded-lg border border-[#CFCFCF] px-4 pb-3 pt-7 h-14 justify-end text-left ",
                          !field.value && "text-gray-400"
                        )}>
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
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
                  <FormLabel className="absolute top-2 right-3 text-[9px]">
                    تاريخ الميلاد
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
                    placeholder="رقم جواز السفر"
                  />
                  <FormLabel
                    htmlFor="slogan"
                    className="absolute top-2 right-4 text-[9px]">
                    جواز السفر
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
                          "w-full text-sm rounded-lg border border-[#CFCFCF] px-4 pb-3 pt-7 h-14 justify-end text-left ",
                          !field.value && "text-gray-400"
                        )}>
                        {field.value ? (
                          format(field.value, "dd/MM/yyyy")
                        ) : (
                          <span>اختر التاريخ</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        captionLayout="dropdown"
                        toYear={2100}
                        disabled={(date) => {
                          const sixMonthsLater = new Date(
                            travel?.departDate || new Date()
                          );
                          sixMonthsLater.setMonth(
                            sixMonthsLater.getMonth() + 6
                          );
                          return date < sixMonthsLater;
                        }}
                      />
                    </PopoverContent>
                  </Popover>
                  <FormLabel className="absolute top-2 right-3 text-[9px]">
                    تاريخ اتهاء صلاحية جواز السفر
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
                    accept=".pdf, image/*"
                    imageContainerClassName="w-full !min-w-full aspect-square !h-full min-h-full"
                    setImagesToDelete={setImagesToDelete}>
                    <div className="w-full border border-[#CFCFCF] rounded-lg h-14 flex items-center justify-between px-3">
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
                      <div dir="rtl" className="space-y-1">
                        <h3 className="text-[9px]">
                          صورة جواز السفر او ملف انجاز{" "}
                        </h3>
                        <h1 className="text-sm text-[#A7ABAF]">حمل الملف</h1>
                      </div>
                    </div>
                  </UploadEverything>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="foodIclusions"
          render={({ field }) => (
            <FormItem className="w-full">
              <FormControl className="w-full">
                <div className="flex justify-end items-center gap-3 w-full relative">
                  <h1 className="text-lg">الاعاشة</h1>
                  <Checkbox
                    checked={!!field.value}
                    onChange={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}
                    onCheckedChange={(checked) => field.onChange(checked)}
                    className="data-[state=checked]:bg-brand data-[state=checked]:border-brand "
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </Form>
  );
}
