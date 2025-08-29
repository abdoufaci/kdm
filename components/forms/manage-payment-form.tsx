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
import { toast } from "sonner";
import { Check, Loader2, XIcon } from "lucide-react";
import { useDebounce } from "@uidotdev/usehooks";
import { cn } from "@/lib/utils";
import { checkReservationAvailability } from "@/actions/mutations/reservation/check-reservation-availability";
import { checkPaymentAvailability } from "@/actions/mutations/payment/check-payment-availability";
import { updatePayment } from "@/actions/mutations/payment/update-payment";
import { addPayment } from "@/actions/mutations/payment/add-payment";

export const ManagePaymentformSchema = z.object({
  reservationRef: z.string(),
  paymentRef: z.string(),
  amount: z.string(),
});

export function ManagePaymentForm() {
  const { onClose, data, onOpen } = useModal();
  const { payment, reservation } = data;
  const form = useForm<z.infer<typeof ManagePaymentformSchema>>({
    resolver: zodResolver(ManagePaymentformSchema),
    defaultValues: {
      amount: payment?.amount,
      paymentRef: payment?.paymentRef,
      reservationRef: payment?.reservationRef || reservation?.ref,
    },
  });
  const [isPending, startTransition] = useTransition();
  const [isReservationRefPending, startReservationRefTransition] =
    useTransition();
  const [isPaymentRefPending, startPaymentRefTransition] = useTransition();

  const [paymentRefAvailabilityStatus, setPaymentRefAvailabilityStatus] =
    useState<"available" | "taken" | null>(null);

  const [
    reservationRefAvailabilityStatus,
    setReservationRefAvailabilityStatus,
  ] = useState<"available" | "taken" | null>(null);

  const watchedReservationRef = form.watch("reservationRef");
  const debouncedReservationRefValue = useDebounce(watchedReservationRef, 500);

  const watchedPaymentRef = form.watch("paymentRef");
  const debouncedPaymentRefValue = useDebounce(watchedPaymentRef, 500);

  useEffect(() => {
    const checkReservation = async () => {
      if (
        !debouncedReservationRefValue ||
        debouncedReservationRefValue.length < 3
      ) {
        setReservationRefAvailabilityStatus(null);
        return;
      }
      setReservationRefAvailabilityStatus(null);
      startReservationRefTransition(() => {
        checkReservationAvailability(debouncedReservationRefValue)
          .then((isAvailable) => {
            setReservationRefAvailabilityStatus(
              isAvailable ? "available" : "taken"
            );
          })
          .catch((error) => console.error("Error checking username:", error));
      });
    };

    checkReservation();
  }, [debouncedReservationRefValue, form]);

  useEffect(() => {
    const checkPayment = async () => {
      if (!debouncedPaymentRefValue || debouncedPaymentRefValue.length < 3) {
        setPaymentRefAvailabilityStatus(null);
        return;
      }
      setPaymentRefAvailabilityStatus(null);
      startPaymentRefTransition(() => {
        checkPaymentAvailability(debouncedPaymentRefValue)
          .then((isAvailable) => {
            setPaymentRefAvailabilityStatus(
              !isAvailable ? "available" : "taken"
            );
          })
          .catch((error) => console.error("Error checking username:", error));
      });
    };

    checkPayment();
  }, [debouncedPaymentRefValue, form]);

  const getPaymentStatusIcon = () => {
    if (isPaymentRefPending) {
      return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    }

    if (paymentRefAvailabilityStatus === "available") {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    if (paymentRefAvailabilityStatus === "taken") {
      return (
        <XIcon
          onClick={() => form.setValue("paymentRef", "")}
          className="h-4 w-4 text-red-500 cursor-pointer"
        />
      );
    }
  };

  const getStatusIcon = () => {
    if (isReservationRefPending) {
      return <Loader2 className="h-4 w-4 text-gray-400 animate-spin" />;
    }

    if (reservationRefAvailabilityStatus === "available") {
      return <Check className="h-4 w-4 text-green-500" />;
    }

    if (reservationRefAvailabilityStatus === "taken") {
      return (
        <XIcon
          onClick={() => form.setValue("reservationRef", "")}
          className="h-4 w-4 text-red-500 cursor-pointer"
        />
      );
    }

    return null;
  };

  async function onSubmit(data: z.infer<typeof ManagePaymentformSchema>) {
    startTransition(() => {
      !!payment
        ? updatePayment({ data, paymentId: payment.id })
            .then(() => {
              toast.success("Success");
              onClose();
            })
            .catch(() => toast.error("Something went wrong, try again."))
        : addPayment({ data })
            .then(() => {
              toast.success("Success");
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
        <div className="space-y-4 w-full">
          <FormField
            control={form.control}
            name={"reservationRef"}
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
                        reservationRefAvailabilityStatus === "available"
                          ? "border-green-600"
                          : reservationRefAvailabilityStatus === "taken"
                            ? "border-red-600"
                            : "border-[#CFCFCF]"
                      )}
                      placeholder="اكتب رقم الحجز الخاص بالدفع"
                    />
                    <FormLabel
                      className={cn(
                        "absolute top-2 right-4 text-[9px]",
                        reservationRefAvailabilityStatus === "available"
                          ? "text-green-600"
                          : reservationRefAvailabilityStatus === "taken" &&
                              "text-red-600"
                      )}>
                      رقم الحجز
                    </FormLabel>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
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
            name={"paymentRef"}
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
                        paymentRefAvailabilityStatus === "available"
                          ? "border-green-600"
                          : paymentRefAvailabilityStatus === "taken"
                            ? "border-red-600"
                            : "border-[#CFCFCF]"
                      )}
                      placeholder="اكتب رقم الدفع"
                    />
                    <FormLabel
                      htmlFor="username"
                      className={cn(
                        "absolute top-2 right-4 text-[9px]",
                        paymentRefAvailabilityStatus === "available"
                          ? "text-green-600"
                          : paymentRefAvailabilityStatus === "taken" &&
                              "text-red-600"
                      )}>
                      رقم الدفع
                    </FormLabel>
                    <div className="absolute left-4 top-1/2 -translate-y-1/2">
                      {getPaymentStatusIcon()}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
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
                      placeholder="المبلغ"
                    />
                    <FormLabel
                      htmlFor="slogan"
                      className="absolute top-2 right-4 text-[9px]">
                      المبلغ
                    </FormLabel>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        {!payment ? (
          <Button
            disabled={
              isPending || reservationRefAvailabilityStatus !== "available"
            }
            type="submit"
            variant={"brand"}
            size={"lg"}
            className="h-11 w-full">
            تأكيد
          </Button>
        ) : (
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
              onClick={() => onOpen("deletePayment", { payment })}
              variant={"delete"}
              size={"lg"}
              className="h-11 w-full">
              حذف
            </Button>
          </div>
        )}
      </form>
    </Form>
  );
}
