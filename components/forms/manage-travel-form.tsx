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

export const ManageTravelformSchema = z.object({
  name: z.string(),
  departDate: z.date(),
  arriveDate: z.date(),
  duration: z.string(),
  meccahDays: z.string(),
  madinaDays: z.string(),
  availabelSpots: z.string(),
  double: z.string(),
  triple: z.string(),
  quadruple: z.string(),
  quintuple: z.string(),
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
  madinaHotels: z.array(
    z.object({
      name: z.string().min(1),
      location: z.enum([HotelLocation.MADINA, HotelLocation.MECCAH]),
      id: z.string().min(1),
    })
  ),
});

export function ManageTravelForm() {
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
      double: travel?.double,
      duration: travel?.duration,
      meccahDays: travel?.meccahMadinaDays.split("-")[1].split(" ")[1],
      madinaDays: travel?.meccahMadinaDays.split("-")[0].split(" ")[0],
      quadruple: travel?.quadruple,
      quintuple: travel?.quintuple,
      triple: travel?.triple,
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

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col items-center justify-center">
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
                      placeholder="Nom de voyage"
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
          <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5">
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
                              "w-full text-sm rounded-lg border border-[#CFCFCF] px-4 pb-3 pt-7 h-14 justify-start text-left ",
                              !field.value && "text-gray-400"
                            )}>
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>dd/mm/yyyy</span>
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
                        DATE DE DEPART
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
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
                              "w-full text-sm rounded-lg border border-[#CFCFCF] px-4 pb-3 pt-7 h-14 justify-start text-left ",
                              !field.value && "text-gray-400"
                            )}>
                            {field.value ? (
                              format(field.value, "dd/MM/yyyy")
                            ) : (
                              <span>dd/mm/yyyy</span>
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
                        DATE D'ARRIVAGE
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
                      placeholder="xx nuit"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      Duration
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid grid-cols-1 md:!grid-cols-[30%_70%] place-items-center gap-3">
            <FormField
              control={form.control}
              name="meccahDays"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="xx nuit"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 left-4 text-[9px]">
                        MECCAH
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="meccahHotels"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="h-14 relative w-[96%] border border-[#CFCFCF] cursor-pointer rounded-lg bg-background px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none flex justify-between items-center">
                          <div className="flex flex-col items-start space-y-1">
                            <span className="text-[9px] uppercase">
                              MECCAH HOTEL
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
                                : "Choisissez les hotels"}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="pb-1 w-full" align="start">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            {hotels
                              .filter((hotel) => hotel.location === "MECCAH")
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
          </div>
          <div className="grid grid-cols-1 md:!grid-cols-[30%_70%] place-items-center gap-3">
            <FormField
              control={form.control}
              name="madinaDays"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        {...field}
                        type="number"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                        placeholder="xx nuit"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 left-4 text-[9px]">
                        MADINA
                      </FormLabel>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="madinaHotels"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <Popover>
                      <PopoverTrigger asChild>
                        <div className="h-14 relative w-[96%] border border-[#CFCFCF] cursor-pointer rounded-lg bg-background px-3 py-2 text-sm transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none flex justify-between items-center">
                          <div className="flex flex-col items-start space-y-1">
                            <span className="text-[9px] uppercase">
                              MADINA HOTEL
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
                                : "Choisissez les hotels"}
                            </span>
                          </div>
                          <ChevronDown className="h-4 w-4 opacity-50" />
                        </div>
                      </PopoverTrigger>
                      <PopoverContent className="pb-1 w-full" align="start">
                        <div className="space-y-2">
                          <div className="space-y-1">
                            {hotels
                              .filter((hotel) => hotel.location === "MADINA")
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
          </div>

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
                      placeholder="place"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      PLACE DISPONIBLE
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="bg-[#C29A774F]" />
          <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5">
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
                        placeholder="prix"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 left-4 text-[9px]">
                        CHAMBER DOUBLE (2)
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
                        placeholder="prix"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 left-4 text-[9px]">
                        CHAMBER TRIBLE (3)
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
                        placeholder="prix"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 left-4 text-[9px]">
                        CHAMBER quadruple (4)
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
                        placeholder="prix"
                      />
                      <FormLabel
                        htmlFor="slogan"
                        className="absolute top-2 left-4 text-[9px]">
                        CHAMBER quintuple (5)
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
            name="description"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Textarea
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-40 resize-none"
                      placeholder="Tout les details de voayge"
                      {...field}
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      Descrpition
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
          <div className="grid grid-cols-1 md:!grid-cols-2 place-items-center gap-5 w-full">
            <Button
              disabled={isPending}
              type="submit"
              variant={"brand"}
              size={"lg"}
              className="h-11 w-full">
              Save
            </Button>
            <Button
              disabled={isPending}
              type="button"
              onClick={() => onOpen("deleteTravel", { travel })}
              variant={"delete"}
              size={"lg"}
              className="h-11 w-full">
              Delete
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
