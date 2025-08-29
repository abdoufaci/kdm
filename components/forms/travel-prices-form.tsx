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

export const TravelPricesformSchema = z.object({
  id: z.string().optional(),
  double: z.string().optional(),
  triple: z.string().optional(),
  quadruple: z.string().optional(),
  quintuple: z.string().optional(),
  child: z.string().optional(),
  babe: z.string().optional(),
  commission: z.string().optional(),
  hotelId: z.string().optional(),
  food: z.string().optional(),
});

interface Props {
  field: ControllerRenderProps<
    {
      airline: string;
      departTime: string;
      arriveTime: string;
      arrivePlace: string;
      leavePlace: string;
      name: string;
      departDate: Date;
      arriveDate: Date;
      duration: string;
      meccahDays: string;
      madinaDays: string;
      availabelSpots: string;
      description: string;
      meccahHotels: {
        name: string;
        location: "MADINA" | "MECCAH";
        id: string;
      }[];
      madinaHotels: {
        name: string;
        location: "MADINA" | "MECCAH";
        id: string;
      }[];
      prices: {
        id: string;
        double: string;
        triple: string;
        quadruple: string;
        quintuple: string;
        child: string;
        babe: string;
        commission: string;
        hotelId: string;
        food: string;
      }[];
    },
    "prices"
  >;
  idx: number;
}

export function TravelPricesForm({ field, idx }: Props) {
  const form = useForm<z.infer<typeof TravelPricesformSchema>>({
    resolver: zodResolver(TravelPricesformSchema),
    defaultValues: {
      ...field.value[idx],
    },
  });

  const double = form.watch("double");
  const triple = form.watch("triple");
  const quadruple = form.watch("quadruple");
  const quintuple = form.watch("quintuple");
  const child = form.watch("child");
  const babe = form.watch("babe");
  const food = form.watch("food");
  const commission = form.watch("commission");

  useEffect(() => {
    if (
      double ||
      triple ||
      quadruple ||
      quintuple ||
      child ||
      babe ||
      commission ||
      food
    ) {
      form.handleSubmit(onSubmit)();
    }
  }, [double, triple, quadruple, quintuple, child, babe, commission, food]);

  async function onSubmit(data: z.infer<typeof TravelPricesformSchema>) {
    const members = field.value;
    members[idx] = {
      triple: data.triple || field.value[idx].triple,
      quadruple: data.quadruple || field.value[idx].quadruple,
      double: data.double || field.value[idx].double,
      quintuple: data.quintuple || field.value[idx].quintuple,
      child: data.child || field.value[idx].child,
      babe: data.babe || field.value[idx].babe,
      commission: data.commission || field.value[idx].commission,
      id: data.id || field.value[idx].id,
      hotelId: data.hotelId || field.value[idx].hotelId,
      food: data.food || field.value[idx].food,
    };
    field.onChange(members);
    return members;
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col w-full">
        <div className="space-y-4 w-full">
          <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5 w-full">
            <FormField
              control={form.control}
              name="double"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="السعر"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        غرفة الثنائية
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="triple"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="السعر"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        غرفة الثلاثية
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quadruple"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="السعر"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        غرفة الرباعية
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quintuple"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="السعر"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        غرفة الخماسية
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
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="السعر"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        الطفل{" "}
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="babe"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="السعر"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 right-4 text-[9px]">
                        الرضيع{" "}
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="commission"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      type="number"
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                      placeholder="السعر"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 right-4 text-[9px] font-semibold">
                      العمولة
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="food"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      type="number"
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                      placeholder="السعر"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 right-4 text-[9px] font-semibold">
                      الاعاشة
                    </FormLabel>
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
