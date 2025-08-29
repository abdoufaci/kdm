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
  CalendarIcon,
  Check,
  ChevronDown,
  Eye,
  EyeOff,
  Loader2,
  Plus,
  RefreshCcw,
  XIcon,
} from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import { checkUsernameAvailability } from "@/actions/mutations/users/check-username-availability";
import { addAgency } from "@/actions/mutations/users/add-agency";
import { updateAgency } from "@/actions/mutations/users/update-agency";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { format } from "date-fns";
import { Calendar } from "../ui/calendar";
import { Textarea } from "../ui/textarea";
import { updateTravel } from "@/actions/mutations/travel/update-travel";
import { addTravel } from "@/actions/mutations/travel/add-travel";
import { MultiSelect } from "../ui/multi-select";
import { HotelLocation } from "@prisma/client";
import { Checkbox } from "../ui/checkbox";
import { addHotel } from "@/actions/mutations/travel/add-hotel";
import { TravelPricesForm } from "./travel-prices-form";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

export const ManageTravelformSchema = z.object({
  name: z.string(),
  departDate: z.date(),
  arriveDate: z.date(),
  duration: z.string(),
  meccahDays: z.string(),
  madinaDays: z.string(),
  availabelSpots: z.string(),
  description: z.string(),
  meccahHotels: z
    .array(
      z.object({
        name: z.string().min(1),
        location: z.enum([HotelLocation.MADINA, HotelLocation.MECCAH]),
        id: z.string().min(1),
      })
    )
    .min(1)
    .nonempty("Please select at least one hotel."),
  airline: z.string(),
  departTime: z.string(),
  arriveTime: z.string(),
  arrivePlace: z.string(),
  leavePlace: z.string(),
  madinaHotels: z.array(
    z.object({
      name: z.string().min(1),
      location: z.enum([HotelLocation.MADINA, HotelLocation.MECCAH]),
      id: z.string().min(1),
    })
  ),
  prices: z.array(
    z.object({
      id: z.string(),
      double: z.string(),
      triple: z.string(),
      quadruple: z.string(),
      quintuple: z.string(),
      child: z.string(),
      babe: z.string(),
      commission: z.string(),
      hotelId: z.string(),
      food: z.string(),
    })
  ),
});

interface Props {
  setShowPrices: Dispatch<SetStateAction<boolean>>;
  showPrices: boolean;
}

export function ManageTravelForm({ setShowPrices, showPrices }: Props) {
  const { onClose, data, onOpen } = useModal();
  const { travel, hotels: currentHotels } = data;
  const [hotels, setHotels] = useState<
    { name: string; location: HotelLocation; id: string }[]
  >(
    currentHotels?.map((hotel) => ({
      name: hotel.name,
      location: hotel.location,
      id: hotel.id,
    })) || []
  );
  const [newHotelNameInput, setNewHotelNameInput] = useState("");
  const [showAdd, setShowAdd] = useState(false);
  const [hotelsToRemove, setHotelsToRemove] = useState<
    { name: string; location: HotelLocation; id: string }[]
  >([]);

  const [isPending, startTransition] = useTransition();
  const [isAddingHotelPending, startAddingHotelTransition] = useTransition();

  useEffect(() => {
    setHotels(
      currentHotels?.map((hotel) => ({
        name: hotel.name,
        location: hotel.location,
        id: hotel.id,
      })) || []
    );
  }, [currentHotels]);

  const form = useForm<z.infer<typeof ManageTravelformSchema>>({
    resolver: zodResolver(ManageTravelformSchema),
    defaultValues: {
      name: travel?.name,
      departDate: travel?.departDate,
      arriveDate: travel?.arriveDate,
      availabelSpots: travel?.availabelSpots,
      description: travel?.description,
      duration: travel?.duration,
      meccahDays: travel?.meccahMadinaDays.split("-")[1].split(" ")[1],
      madinaDays: travel?.meccahMadinaDays.split("-")[0].split(" ")[0],
      airline: travel?.airline,
      arrivePlace: travel?.arrivePlace,
      leavePlace: travel?.leavePlace,
      arriveTime: travel?.arriveTime,
      departTime: travel?.departTime,
      prices:
        travel?.prices.map(
          ({
            babe,
            child,
            commission,
            double,
            id,
            quadruple,
            quintuple,
            triple,
            hotelId,
            food,
          }) => ({
            babe,
            child,
            commission,
            double,
            id,
            quadruple,
            quintuple,
            triple,
            hotelId,
            food,
          })
        ) || [],
      madinaHotels:
        travel?.hotels
          .filter((hotel) => hotel.location === "MADINA")
          .map((hotel) => ({
            id: hotel.id,
            location: hotel.location,
            name: hotel.name,
          })) || [],
      meccahHotels:
        travel?.hotels
          .filter((hotel) => hotel.location === "MECCAH")
          .map((hotel) => ({
            id: hotel.id,
            location: hotel.location,
            name: hotel.name,
          })) || [],
    },
  });

  async function onSubmit(data: z.infer<typeof ManageTravelformSchema>) {
    startTransition(() => {
      travel
        ? updateTravel({ data, travelId: travel?.id, hotelsToRemove })
            .then(() => {
              toast.success("Success");
              onClose();
            })
            .catch(() => toast.error("Something went wrong, try again."))
        : addTravel(data)
            .then(() => {
              toast.success("Success");
              onClose();
            })
            .catch(() => toast.error("Something went wrong, try again."));
    });
  }

  const handleAddHotel = (location: HotelLocation) => {
    const trimmedName = newHotelNameInput.trim();
    if (
      trimmedName &&
      !hotels.map((hotel) => hotel.name).includes(trimmedName)
    ) {
      startAddingHotelTransition(() => {
        addHotel({
          name: trimmedName,
          location,
        })
          .then((res) => {
            setHotels((prev) => [
              { name: trimmedName, location, id: res.id },
              ...prev,
            ]);
            // Update React Hook Form's state to include the newly added hotel as selected
            const currentSelected =
              form.getValues(
                location === "MADINA" ? "madinaHotels" : "meccahHotels"
              ) || [];
            form.setValue(
              location === "MADINA" ? "madinaHotels" : "meccahHotels",
              [
                {
                  name: trimmedName,
                  location,
                  id: res.id,
                },
                ...currentSelected,
              ],
              { shouldValidate: true }
            );
            form.clearErrors(
              location === "MADINA" ? "madinaHotels" : "meccahHotels"
            ); // Clear validation error if it was due to no selection
            setNewHotelNameInput(""); // Clear the local input state
            setShowAdd(false);
          })
          .catch(() => toast.error("Something went wrong ."));
      });
    }
  };

  const currentSelectedMeccahHotels = form.watch("meccahHotels");
  const currentSelectedMadinaHotels = form.watch("madinaHotels");
  const prices = form.watch("prices");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col items-center justify-center">
        {showPrices ? (
          <>
            <FormField
              control={form.control}
              name="prices"
              render={({ field }) => (
                <FormItem className="space-y-5 w-full">
                  <FormControl className="flex flex-col gap-2 w-full">
                    <div className="w-full space-y-5">
                      {prices?.map((value, idx) => (
                        <div key={idx} className="space-y-3 w-full">
                          <h1 className="text-xl text-brand font-medium text-right">
                            {
                              currentSelectedMeccahHotels.find(
                                (hotel) => hotel.id === value.hotelId
                              )?.name
                            }
                          </h1>
                          <TravelPricesForm field={field} idx={idx} />
                          {idx !== prices.length - 1 && (
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

            {!travel ? (
              <Button
                disabled={isPending}
                type="submit"
                variant={"brand"}
                size={"lg"}
                className="h-11 w-full">
                {travel ? "Enregistrer" : "Ajouter"}
              </Button>
            ) : (
              <div className="grid grid-cols-1  place-items-center gap-5 w-full">
                <Button
                  disabled={isPending}
                  type="submit"
                  variant={"brand"}
                  size={"lg"}
                  className="h-11 w-full">
                  حفظ
                </Button>
                {/* <Button
                  disabled={isPending}
                  type="button"
                  onClick={() => onOpen("deleteTravel", { travel })}
                  variant={"delete"}
                  size={"lg"}
                  className="h-11 w-full">
                  Delete
                </Button> */}
              </div>
            )}
          </>
        ) : (
          <>
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
                          placeholder="اسم الرحلة"
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 right-4 text-[9px]">
                          الاسم
                        </FormLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="airline"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          {...field}
                          className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                          placeholder="اسم خطوط الطيران"
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 right-4 text-[9px]">
                          الطيران
                        </FormLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5">
                <FormField
                  control={form.control}
                  name={"arriveDate"}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full">
                      <FormControl>
                        <div className="relative w-full">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full text-sm rounded-lg border border-[#CFCFCF] px-3 pb-3 pt-7 h-14 justify-end ",
                                  !field.value && "text-gray-400"
                                )}>
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormLabel className="absolute top-2 right-3 text-[9px]">
                            تاريخ العودة
                          </FormLabel>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name={"departDate"}
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full">
                      <FormControl>
                        <div className="relative w-full">
                          <Popover>
                            <PopoverTrigger asChild>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "w-full text-sm rounded-lg border border-[#CFCFCF] px-3 pb-3 pt-7 h-14 justify-end text-right ",
                                  !field.value && "text-gray-400"
                                )}>
                                {field.value ? (
                                  format(field.value, "dd/MM/yyyy")
                                ) : (
                                  <span>dd/mm/yyyy</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                            <PopoverContent
                              className="w-auto p-0"
                              align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                captionLayout="dropdown"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormLabel className="absolute top-2 right-3 text-[9px]">
                            تاريخ الانطلاق
                          </FormLabel>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5">
                <FormField
                  control={form.control}
                  name="arriveTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            {...field}
                            className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                            placeholder="hh:mm"
                          />
                          <FormLabel
                            htmlFor="slogan"
                            className="absolute top-2 right-4 text-[9px]">
                            وقت العودة
                          </FormLabel>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="departTime"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                      <FormControl>
                        <div className="relative w-full">
                          <Input
                            {...field}
                            className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                            placeholder="hh:mm"
                          />
                          <FormLabel
                            htmlFor="slogan"
                            className="absolute top-2 right-4 text-[9px]">
                            وقت الانطلاق
                          </FormLabel>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5">
                <FormField
                  control={form.control}
                  name="leavePlace"
                  render={({ field }) => (
                    <FormItem className="space-y-1 w-full">
                      <FormControl className="w-full">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex items-center justify-between w-full rounded-lg border 
                          border-[#CFCFCF] px-4 py-2.5 focus:outline-none cursor-pointer">
                            <ChevronDown className="size-4 text-[#A7ABAF]" />
                            <div className="flex flex-col items-end text-start">
                              <p className="text-[9px]">المغادرة</p>
                              {field.value ? (
                                <p className="text-xs">{field.value}</p>
                              ) : (
                                <p className="text-xs text-[#A7ABAF]">
                                  مكان المغادرة
                                </p>
                              )}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[350px]">
                            <DropdownMenuItem
                              onClick={() => {
                                field.onChange("جدة");
                              }}
                              className="hover:cursor-pointer w-full">
                              جدة
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                field.onChange("مدينة");
                              }}
                              className="hover:cursor-pointer w-full">
                              مدينة
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
                  name="arrivePlace"
                  render={({ field }) => (
                    <FormItem className="space-y-1 w-full">
                      <FormControl className="w-full">
                        <DropdownMenu>
                          <DropdownMenuTrigger
                            className="flex items-center justify-between w-full rounded-lg border 
                          border-[#CFCFCF] px-4 py-2.5 focus:outline-none cursor-pointer">
                            <ChevronDown className="size-4 text-[#A7ABAF]" />
                            <div className="flex flex-col items-end text-start">
                              <p className="text-[9px]">الوصول</p>
                              {field.value ? (
                                <p className="text-xs">{field.value}</p>
                              ) : (
                                <p className="text-xs text-[#A7ABAF]">
                                  مكان الوصول{" "}
                                </p>
                              )}
                            </div>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent className="w-[350px]">
                            <DropdownMenuItem
                              onClick={() => {
                                field.onChange("جدة");
                              }}
                              className="hover:cursor-pointer w-full">
                              جدة
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => {
                                field.onChange("مدينة");
                              }}
                              className="hover:cursor-pointer w-full">
                              مدينة
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="duration"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          {...field}
                          type="number"
                          className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                          placeholder="مدة العمرة"
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 right-4 text-[9px]">
                          المدة
                        </FormLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="availabelSpots"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                    <FormControl>
                      <div className="relative w-full">
                        <Input
                          {...field}
                          type="number"
                          className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                          placeholder="عدد الاماكن المتوفرة "
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 right-4 text-[9px]">
                          الاماكن
                        </FormLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Separator className="min-h-[1px] bg-[#C29A774F]" />
              <div className="grid grid-cols-1 md:!grid-cols-[70%_30%] place-items-center gap-2">
                <FormField
                  control={form.control}
                  name="meccahHotels"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="h-14 relative w-full max-w-full min-w-fit border border-[#CFCFCF] cursor-pointer rounded-lg bg-background px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none flex justify-between items-center">
                              <ChevronDown className="h-4 w-4 opacity-50" />
                              <div className="flex flex-col items-end space-y-1">
                                <span className="text-[9px] uppercase">
                                  فندق مكة
                                </span>
                                <span
                                  className={cn(
                                    "text-sm",
                                    !!currentSelectedMeccahHotels.length
                                      ? ""
                                      : "text-[#A7ABAF]"
                                  )}>
                                  {currentSelectedMeccahHotels.length > 0
                                    ? `${currentSelectedMeccahHotels.length} hotels`
                                    : "اختر الفندق"}
                                </span>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="pb-1 w-full" align="start">
                            <div className="space-y-2">
                              <div className="space-y-1">
                                {hotels
                                  .filter(
                                    (hotel) => hotel.location === "MECCAH"
                                  )
                                  .map((hotel) => (
                                    <div
                                      key={hotel.id}
                                      className="flex items-center gap-2">
                                      <Checkbox
                                        className="cursor-pointer data-[state=checked]:bg-brand data-[state=checked]:border-brand border border-[#0000006B]"
                                        checked={field.value
                                          ?.map((item) => item.id)
                                          .includes(hotel.id)}
                                        onCheckedChange={(checked) => {
                                          if (!checked && travel) {
                                            setHotelsToRemove((prev) => [
                                              ...prev,
                                              hotel,
                                            ]);
                                          }

                                          if (checked && travel) {
                                            setHotelsToRemove((prev) =>
                                              prev.filter(
                                                (item) => item.id !== hotel.id
                                              )
                                            );
                                          }
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                hotel,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value.name !== hotel.name
                                                )
                                              );
                                        }}
                                      />
                                      <h1 className="text-[#232323]">
                                        {hotel.name}
                                      </h1>
                                    </div>
                                  ))}
                              </div>
                              <div>
                                {showAdd ? (
                                  <Input
                                    className="mb-2"
                                    disabled={isAddingHotelPending}
                                    type="text"
                                    placeholder="nom de l'hotel"
                                    value={newHotelNameInput}
                                    onChange={(e) =>
                                      setNewHotelNameInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault(); // Prevent form submission on Enter for this input
                                        handleAddHotel("MECCAH");
                                      }
                                    }}
                                  />
                                ) : (
                                  <Button
                                    type="button" // Important: type="button" to prevent submitting the form
                                    onClick={() => setShowAdd(true)}
                                    variant="brand_link"
                                    className="!p-0">
                                    <Plus className="h-4 w-4" />
                                    Ajouter Hotel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="meccahDays"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                      <FormControl>
                        <div className="relative w-full md:!w-[92%]">
                          <Input
                            {...field}
                            type="number"
                            className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                            placeholder="عدد ليالي"
                          />
                          <FormLabel
                            htmlFor="slogan"
                            className="absolute top-2 right-4 text-[9px]">
                            مكة
                          </FormLabel>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="grid grid-cols-1 md:!grid-cols-[70%_30%] place-items-center gap-2">
                <FormField
                  control={form.control}
                  name="madinaHotels"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                      <FormControl>
                        <Popover>
                          <PopoverTrigger asChild>
                            <div className="h-14 relative w-full border border-[#CFCFCF] cursor-pointer rounded-lg bg-background px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none flex justify-between items-center">
                              <ChevronDown className="h-4 w-4 opacity-50" />
                              <div className="flex flex-col items-end space-y-1">
                                <span className="text-[9px] uppercase">
                                  فندق المدينة
                                </span>
                                <span
                                  className={cn(
                                    "text-sm",
                                    !!currentSelectedMadinaHotels.length
                                      ? ""
                                      : "text-[#A7ABAF]"
                                  )}>
                                  {currentSelectedMadinaHotels.length > 0
                                    ? `${currentSelectedMadinaHotels.length} hotels`
                                    : "اختر الفندق"}
                                </span>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="pb-1 w-full" align="start">
                            <div className="space-y-2">
                              <div className="space-y-1">
                                {hotels
                                  .filter(
                                    (hotel) => hotel.location === "MADINA"
                                  )
                                  .map((hotel) => (
                                    <div className="flex items-center gap-2">
                                      <Checkbox
                                        className="cursor-pointer data-[state=checked]:bg-brand data-[state=checked]:border-brand border border-[#0000006B]"
                                        checked={field.value
                                          ?.map((item) => item.name)
                                          .includes(hotel.name)}
                                        onCheckedChange={(checked) => {
                                          if (!checked && travel) {
                                            setHotelsToRemove((prev) => [
                                              ...prev,
                                              hotel,
                                            ]);
                                          }

                                          if (checked && travel) {
                                            setHotelsToRemove((prev) =>
                                              prev.filter(
                                                (item) => item.id !== hotel.id
                                              )
                                            );
                                          }
                                          return checked
                                            ? field.onChange([
                                                ...field.value,
                                                hotel,
                                              ])
                                            : field.onChange(
                                                field.value?.filter(
                                                  (value) =>
                                                    value.name !== hotel.name
                                                )
                                              );
                                        }}
                                      />
                                      <h1 className="text-[#232323]">
                                        {hotel.name}
                                      </h1>
                                    </div>
                                  ))}
                              </div>
                              <div>
                                {showAdd ? (
                                  <Input
                                    className="mb-2"
                                    disabled={isAddingHotelPending}
                                    type="text"
                                    placeholder="nom de l'hotel"
                                    value={newHotelNameInput}
                                    onChange={(e) =>
                                      setNewHotelNameInput(e.target.value)
                                    }
                                    onKeyDown={(e) => {
                                      if (e.key === "Enter") {
                                        e.preventDefault(); // Prevent form submission on Enter for this input
                                        handleAddHotel("MADINA");
                                      }
                                    }}
                                  />
                                ) : (
                                  <Button
                                    type="button" // Important: type="button" to prevent submitting the form
                                    onClick={() => setShowAdd(true)}
                                    variant="brand_link"
                                    className="!p-0">
                                    <Plus className="h-4 w-4" />
                                    Ajouter Hotel
                                  </Button>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="madinaDays"
                  render={({ field }) => (
                    <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                      <FormControl>
                        <div className="relative w-full md:!w-[92%]">
                          <Input
                            {...field}
                            type="number"
                            className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                            placeholder="عدد ليالي"
                          />
                          <FormLabel
                            htmlFor="slogan"
                            className="absolute top-2 right-4 text-[9px]">
                            المدينة
                          </FormLabel>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Separator className="min-h-[1px] bg-[#C29A774F]" />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                    <FormControl>
                      <div className="relative w-full">
                        <Textarea
                          className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-40 resize-none"
                          placeholder="اكتب اي تفاصيل"
                          {...field}
                        />
                        <FormLabel
                          htmlFor="slogan"
                          className="absolute top-2 right-4 text-[9px]">
                          تفاصيل اضافية
                        </FormLabel>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                const meccahHotels = currentSelectedMeccahHotels.map(
                  (hotel, idx) => ({
                    id: !!prices.length ? prices?.[idx]?.id || "" : "",
                    hotelId: hotel.id,
                    double: !!prices.length ? prices?.[idx]?.double || "" : "",
                    triple: !!prices.length ? prices?.[idx]?.triple || "" : "",
                    quadruple: !!prices.length
                      ? prices?.[idx]?.quadruple || ""
                      : "",
                    quintuple: !!prices.length
                      ? prices?.[idx]?.quintuple || ""
                      : "",
                    child: !!prices.length ? prices?.[idx]?.child || "" : "",
                    babe: !!prices.length ? prices?.[idx]?.babe || "" : "",
                    commission: !!prices.length
                      ? prices?.[idx]?.commission || ""
                      : "",
                    food: !!prices.length ? prices?.[idx]?.food || "" : "",
                  })
                );
                form.setValue("prices", [...meccahHotels]);
                setShowPrices(true);
              }}
              type="button"
              variant={"brand"}
              size={"lg"}
              className="h-11 w-full">
              التالي
            </Button>
          </>
        )}
      </form>
    </Form>
  );
}
