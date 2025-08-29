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
import { Check, Eye, EyeOff, Loader2, RefreshCcw, XIcon } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import { checkUsernameAvailability } from "@/actions/mutations/users/check-username-availability";
import { addAgency } from "@/actions/mutations/users/add-agency";
import { updateAgency } from "@/actions/mutations/users/update-agency";

export const ManageAgencyformSchema = z.object({
  image: z
    .object({
      id: z.string(),
      type: z.string(),
    })
    .optional(),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  address: z.string(),
  password: z.string().optional(),
  username: z.string(),
});

export function ManageAgencyForm() {
  const { onClose, data, onOpen } = useModal();
  const { user } = data;
  const form = useForm<z.infer<typeof ManageAgencyformSchema>>({
    resolver: zodResolver(ManageAgencyformSchema),
    defaultValues: {
      address: user?.address,
      email: user?.email,
      name: user?.name,
      username: user?.username,
      image: user?.image as { id: string; type: string },
      phone: user?.phone,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [isUsernamePending, startUsernameTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(true);
  const [availabilityStatus, setAvailabilityStatus] = useState<
    "available" | "taken" | null
  >(null);
  const [imagesToDelete, setImagesToDelete] = useState<
    { id: string; type: string }[]
  >([]);

  const watchedValue = form.watch("username");
  const debouncedValue = useDebounce(watchedValue, 500);

  useEffect(() => {
    const checkUsername = async () => {
      if (!debouncedValue || debouncedValue.length < 3) {
        setAvailabilityStatus(null);
        return;
      }
      setAvailabilityStatus(null);
      startUsernameTransition(() => {
        checkUsernameAvailability(debouncedValue)
          .then((isAvailable) => {
            setAvailabilityStatus(!isAvailable ? "available" : "taken");
          })
          .catch((error) => console.error("Error checking username:", error));
      });
    };

    checkUsername();
  }, [debouncedValue, form]);

  const getStatusIcon = () => {
    if (isUsernamePending) {
      return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    }

    if (availabilityStatus === "available") {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    if (availabilityStatus === "taken") {
      return (
        <XIcon
          onClick={() => form.setValue("username", "")}
          className="h-4 w-4 text-red-500 cursor-pointer"
        />
      );
    }

    return null;
  };

  async function onSubmit(data: z.infer<typeof ManageAgencyformSchema>) {
    if (!user && !data.password) {
      toast.error("Password is required");
      return;
    }
    startTransition(() => {
      !!user
        ? updateAgency({ data, userId: user?.id, imagesToDelete })
            .then(() => {
              toast.success("Success");

              onClose();
            })
            .catch(() => toast.error("Something went wrong, try again."))
        : addAgency(data)
            .then((res) => {
              if (res.success) {
                toast.success("Success");
              }
              if (res.error) {
                toast.error(res.error);
              }
              onClose();
            })
            .catch((ee) => toast.error("Something went wrong, try again."));
    });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 flex flex-col items-center justify-center">
        <div className="flex flex-col items-center gap-5">
          <FormField
            control={form.control}
            name="image"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="flex justify-center items-center gap-3 w-full relative">
                    <UploadEverything
                      value={
                        field.value &&
                        field.value.id !== "" &&
                        field.value.type !== ""
                          ? [field.value]
                          : []
                      }
                      onChange={field.onChange}
                      accept="image/*"
                      imageClassName="rounded-full h-44 w-44 aspect-square"
                      setImagesToDelete={setImagesToDelete}>
                      <Image
                        alt="Upload Logo"
                        src={"/add-agency.svg"}
                        height={150}
                        width={150}
                        className="object-cover"
                      />
                    </UploadEverything>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            onClick={(e) => {
              e.stopPropagation();
              e.preventDefault();
              onOpen("setAgencyPassword", {
                user,
              });
            }}
            variant={"blackOutline"}
            size={"sm"}
            className="text-xs">
            Set Password
          </Button>
        </div>
        <div className="space-y-4 w-full">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      type="text"
                      id="slogan"
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                      placeholder="Nom de l’agence"
                      {...field}
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
            name="email"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      type="text"
                      id="slogan"
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                      placeholder="xxx@gmail.com"
                      {...field}
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      Email
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
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
                      placeholder="telephone"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      Telephone
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                <FormControl>
                  <div className="relative w-full">
                    <Input
                      {...field}
                      className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 focus:outline-none 
                    focus:ring-0 h-14"
                      placeholder="address"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 left-4 text-[9px]">
                      Adresse
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Separator className="bg-[#C29A774F]" />
          <div className="flex items-center gap-x-5">
            <FormField
              control={form.control}
              name={"username"}
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        value={field.value}
                        onChange={field.onChange}
                        type="text"
                        className={cn(
                          "w-full text-xs rounded-lg border px-4 pb-2.5 pt-6 focus:outline-none focus:ring-0 h-14",
                          availabilityStatus === "available"
                            ? "border-green-600"
                            : availabilityStatus === "taken"
                              ? "border-red-600"
                              : "border-[#CFCFCF]"
                        )}
                        placeholder="username"
                      />
                      <FormLabel
                        htmlFor="username"
                        className={cn(
                          "absolute top-2 left-4 text-[9px]",
                          availabilityStatus === "available"
                            ? "text-green-600"
                            : availabilityStatus === "taken" && "text-red-600"
                        )}>
                        Username
                      </FormLabel>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2">
                        {getStatusIcon()}
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem className="flex flex-col items-start w-full text-[#15091B]">
                  <FormControl>
                    <div className="relative w-full">
                      <Input
                        type={showPassword ? "text" : "password"}
                        id="password"
                        className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 pr-20 focus:outline-none focus:ring-0 h-14"
                        placeholder="••••••••"
                        {...field}
                      />
                      <FormLabel
                        htmlFor="password"
                        className="absolute top-2 left-4 text-[9px]">
                        Password
                      </FormLabel>
                      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => {
                            const password = generateRandomPassword();
                            form.setValue("password", password);
                          }}
                          title="Generate random password">
                          <RefreshCcw className="h-4 w-4 text-gray-500" />
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 hover:bg-gray-100"
                          onClick={() => setShowPassword(!showPassword)}
                          title={
                            showPassword ? "Hide password" : "Show password"
                          }>
                          {showPassword ? (
                            <EyeOff className="h-4 w-4 text-gray-500" />
                          ) : (
                            <Eye className="h-4 w-4 text-gray-500" />
                          )}
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        {!user ? (
          <Button
            disabled={isPending || availabilityStatus !== "available"}
            type="submit"
            variant={"brand"}
            size={"lg"}
            className="h-11 w-full">
            Ajouter
          </Button>
        ) : (
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
              onClick={() => onOpen("deleteUser", { user })}
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
