import { getReservations } from "@/actions/queries/reservations/get-reservations";
import { getReservationValues } from "@/actions/queries/reservations/get-reservation-values";
import { getTravelById } from "@/actions/queries/travels/get-travel-by-id";
import AgencyFilter from "@/components/filters/agency-filter";
import { DateFilter } from "@/components/filters/date-filter";
import ReservationsTable from "@/components/reservations-table";
import TraveDetails from "@/components/trave-details";
import { currentUser } from "@/lib/auth";

async function TravelPage({
  params,
  searchParams,
}: {
  params: any;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const { travelId } = await params;
  const travel = await getTravelById(travelId);
  const user = await currentUser();
  const reservations = await getReservations({
    travelId,
    user,
    searchParams,
    currentPage: 1,
  });
  const { agencies } = await getReservationValues(travelId);

  if (!travel) {
    return null;
  }

  return (
    <div className="py-16 space-y-20">
      <TraveDetails travel={travel} />
      <div className="w-full space-y-7">
        <div className="flex items-start justify-between flex-wrap gap-5">
          <h1 className="text-xl font-semibold">
            {user?.role === "USER" && "Vos"} Reservations
          </h1>
          {user?.role === "ADMIN" && (
            <div className="flex items-center gap-5">
              <AgencyFilter
                agencies={agencies}
                searchParams={await searchParams}
                url={`/travel/${travelId}`}
              />
              <DateFilter
                searchParams={await searchParams}
                url={`/travel/${travelId}`}
              />
            </div>
          )}
        </div>
        <ReservationsTable
          reservations={reservations}
          searchParams={await searchParams}
        />
      </div>
    </div>
  );
}

export default TravelPage;
