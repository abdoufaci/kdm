"use client";

import { CardWrapper } from "./card-wrapper";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { LoginSchema } from "@/schemas";
import * as z from "zod";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { FormError } from "../form-error";
import { FormSuccess } from "../form-success";
import { login } from "@/actions/auth/login";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { DEFAULT_LOGIN_REDIRECT } from "@/routes";

export function LoginForm() {
  const searchParams = useSearchParams();
  const urlError =
    searchParams.get("error") === "OAuthAccountNotLinked"
      ? "Email already in use with different provider"
      : "";

  const router = useRouter();

  const [showTwoFactor, setShowTwoFactor] = useState(false);
  const [error, setError] = useState<string | undefined>("");
  const [success, setSuccess] = useState<string | undefined>("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof LoginSchema>>({
    resolver: zodResolver(LoginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });

  const onSubmit = (values: z.infer<typeof LoginSchema>) => {
    setError("");
    setSuccess("");
    startTransition(() => {
      login(values)
        .then((data) => {
          if (data?.error) {
            form.reset();
            setError(data?.error);
            return;
          }
          if (data?.success) {
            form.reset();
            setSuccess(data?.success);
            return;
          }
          if (data?.twoFactor) {
            setShowTwoFactor(true);
            return;
          }

          router.push("/travels");
        })
        .catch((err) => {
          setError("Something went wrong .");
        });
    });
  };

  return (
    <CardWrapper
      headerLabel="الدخول إلى منصة العمرة"
      backButtonHref="/auth/register">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {showTwoFactor && (
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Two Factor Code</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        disabled={isPending}
                        placeholder="123456"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            {!showTwoFactor && (
              <>
                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel className="text-[#A4A4A4] flex justify-end text-right w-full">
                        اسم المستخدم
                      </FormLabel>
                      <FormControl>
                        <Input
                          className="auth-input placeholder:text-white/50 text-white border-none"
                          {...field}
                          disabled={isPending}
                          placeholder="اسم المستخدم"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[#A4A4A4] flex justify-end text-right">
                        كلمة المرور
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="auth-input placeholder:text-white/50 text-white border-none"
                          disabled={isPending}
                          placeholder="******"
                          type="password"
                        />
                      </FormControl>
                      <Button
                        size={"sm"}
                        variant={"link"}
                        asChild
                        className="px-0 font-normal text-[#A4A4A4] flex justify-end">
                        <Link href={"/auth/reset"}>نسيت كلمة المرور ؟</Link>
                      </Button>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
          </div>
          <FormError message={error || urlError} />
          <FormSuccess message={success} />
          <Button
            type="submit"
            variant={"brand"}
            disabled={isPending}
            className="w-full">
            {showTwoFactor ? "Confirm" : "تسجيل دخول"}
          </Button>
        </form>
      </Form>
    </CardWrapper>
  );
}
