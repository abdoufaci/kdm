import { getTravelsCount } from "@/actions/queries/travels/get-count-travels";
import { getTravels } from "@/actions/queries/travels/get-travels";
import { OpenDialogButton } from "@/components/open-dialog-button";
import { getTravelDistinctValues } from "@/actions/queries/travels/get-travel-distinct-values";
import SearchFilter from "@/components/filters/search-filter";
import { currentUser } from "@/lib/auth";
import { getHotels } from "@/actions/queries/travels/get-hotels";
import TravelsDashboard from "../(protected)/travels/_components/travels-dashboard";
import Image from "next/image";
import { Separator } from "@/components/ui/separator";

async function UmrahsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await currentUser();
  const currentPage = (await searchParams).page;
  const travelsPerPage = 8;
  const travels = await getTravels({
    currentPage: Number(currentPage || "1"),
    travelsPerPage,
    searchParams,
    user,
  });
  const totalTravels = await getTravelsCount(searchParams, user);
  const { departDates, distributions, durations } =
    await getTravelDistinctValues();
  const hotels = await getHotels();

  return (
    <div className="py-10 w-[90%] md:!w-[85%] mx-auto space-y-16">
      <div className="flex justify-center items-center gap-4">
        <Image
          alt="logo"
          src={"/dark-logo.svg"}
          height={20}
          width={100}
          className="object-contain"
        />
        <Separator
          orientation="vertical"
          className="w-1.5 min-w-0.5 h-1 min-h-12 bg-[#00000038] rounded-full"
        />
        <h1 className="text-[#3F3934] text-xl font-bold">العمرات المتوفرة</h1>
      </div>
      <TravelsDashboard
        currentPage={Number(currentPage || "1")}
        searchParams={await searchParams}
        totalTravels={totalTravels}
        travels={travels}
        travelsPerPage={travelsPerPage}
        hotels={hotels}
        isPublic
      />
    </div>
  );
}

export default UmrahsPage;
