"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ReservationPaymentStatus,
  ReservationStatus,
  User,
} from "@prisma/client";
import { useRouter } from "next/navigation";
import qs from "query-string";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
  url: string;
}

function ReservationPaymentStatusFilter({
  searchParams,
  url: pathname,
}: Props) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(paymentStatus) => {
        const { paymentStatus: curr, ...rest } = searchParams;

        const url = qs.stringifyUrl(
          {
            url: pathname,
            query: {
              ...rest,
              paymentStatus: paymentStatus !== "default" ? paymentStatus : null,
            },
          },
          { skipNull: true }
        );
        router.push(url);
      }}>
      <SelectTrigger dir="rtl" className="w-32 cursor-pointer">
        <SelectValue placeholder="الدفع" />
      </SelectTrigger>
      <SelectContent className="border-[#B9BEC7]">
        <SelectItem dir="rtl" value={"default"}>
          لا شيء
        </SelectItem>
        <SelectItem dir="rtl" value={ReservationPaymentStatus.COMPLETED}>
          مؤكد
        </SelectItem>
        <SelectItem dir="rtl" value={ReservationPaymentStatus.PENDING}>
          جزئي
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default ReservationPaymentStatusFilter;
