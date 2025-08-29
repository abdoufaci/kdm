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
import { setAgencyPassword } from "@/actions/mutations/users/set-agency-password";

export const SetAgencyPasswordformSchema = z.object({
  password: z.string(),
});

export function SetAgencyPasswordForm() {
  const { onClose, data, onOpen } = useModal();
  const { user } = data;
  const form = useForm<z.infer<typeof SetAgencyPasswordformSchema>>({
    resolver: zodResolver(SetAgencyPasswordformSchema),
  });
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(true);

  async function onSubmit(data: z.infer<typeof SetAgencyPasswordformSchema>) {
    startTransition(() => {
      setAgencyPassword({ data, userId: user?.id })
        .then(() => {
          toast.success("Success");
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
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem className="flex flex-col items-start w-full text-[#15091B]">
              <FormControl>
                <div className="relative w-full">
                  <Input
                    type={showPassword ? "text" : "password"}
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    id="password"
                    className="w-full text-xs rounded-lg border border-[#CFCFCF] px-4 pb-2.5 pt-6 pl-20 focus:outline-none focus:ring-0 h-14"
                    placeholder="••••••••"
                  />
                  <FormLabel
                    htmlFor="password"
                    className="absolute top-2 right-4 text-[9px]">
                    كلمة المرور الجديدة
                  </FormLabel>
                  <div className="absolute left-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
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
                      title={showPassword ? "Hide password" : "Show password"}>
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
        <Button
          disabled={isPending}
          type="submit"
          variant={"brand"}
          size={"lg"}
          className="h-11 w-full">
          تأكيد
        </Button>
      </form>
    </Form>
  );
}
