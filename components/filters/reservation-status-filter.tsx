"use client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ReservationStatus, User } from "@prisma/client";
import { useRouter } from "next/navigation";
import qs from "query-string";

interface Props {
  searchParams: Record<string, string | string[] | undefined>;
  url: string;
}

function ReservationStatusFilter({ searchParams, url: pathname }: Props) {
  const router = useRouter();

  return (
    <Select
      onValueChange={(status) => {
        const { status: curr, ...rest } = searchParams;

        const url = qs.stringifyUrl(
          {
            url: pathname,
            query: {
              ...rest,
              status: status !== "default" ? status : null,
            },
          },
          { skipNull: true }
        );
        router.push(url);
      }}>
      <SelectTrigger dir="rtl" className="w-32 cursor-pointer">
        <SelectValue placeholder="حالة الحجز" />
      </SelectTrigger>
      <SelectContent className="border-[#B9BEC7]">
        <SelectItem dir="rtl" value={"default"}>
          لا شيء
        </SelectItem>
        <SelectItem dir="rtl" value={ReservationStatus.CONFIRMED}>
          مؤكد
        </SelectItem>
        <SelectItem dir="rtl" value={ReservationStatus.PENDING}>
          غير مؤكد
        </SelectItem>
        <SelectItem dir="rtl" value={ReservationStatus.CANCELLED}>
          ملغى
        </SelectItem>
      </SelectContent>
    </Select>
  );
}

export default ReservationStatusFilter;
