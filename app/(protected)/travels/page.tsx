import { getTravelsCount } from "@/actions/queries/travels/get-count-travels";
import { getTravels } from "@/actions/queries/travels/get-travels";
import { OpenDialogButton } from "@/components/open-dialog-button";
import TravelsDashboard from "./_components/travels-dashboard";
import { getTravelDistinctValues } from "@/actions/queries/travels/get-travel-distinct-values";
import DurationsFilter from "./_components/durations-filter";
import DepartDatesFilter from "./_components/depart-dates-filter";
import DistributionsFilter from "./_components/distributions-filter";
import SearchFilter from "@/components/filters/search-filter";
import { currentUser } from "@/lib/auth";
import { getHotels } from "@/actions/queries/travels/get-hotels";

async function TravelsPage({
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
    <div className="py-10 space-y-5">
      <div className="flex flex-col md:!flex-row items-start justify-between gap-5">
        <div className="flex flex-wrap items-center  gap-5 w-full">
          <DistributionsFilter
            searchParams={await searchParams}
            distributions={distributions}
          />
          <DepartDatesFilter
            url="/travels"
            searchParams={await searchParams}
            departs={departDates}
          />
          <DurationsFilter
            searchParams={await searchParams}
            durations={durations}
          />
        </div>{" "}
        <div className="flex flex-col sm:!flex-row items-start justify-end gap-5 w-full">
          {user?.role === "ADMIN" && (
            <OpenDialogButton
              title="اضافة رحلة عمرة"
              type="manageTravel"
              data={{ hotels }}
            />
          )}
          <SearchFilter url="/travels" searchParams={await searchParams} />
        </div>
      </div>
      <TravelsDashboard
        currentPage={Number(currentPage || "1")}
        searchParams={await searchParams}
        totalTravels={totalTravels}
        travels={travels}
        travelsPerPage={travelsPerPage}
        hotels={hotels}
      />
    </div>
  );
}

export default TravelsPage;
