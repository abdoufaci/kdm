import { getReservationValues } from "@/actions/queries/reservations/get-reservation-values";
import { getReservations } from "@/actions/queries/reservations/get-reservations";
import { getReservationsCount } from "@/actions/queries/reservations/get-reservations-count";
import { getTravelById } from "@/actions/queries/travels/get-travel-by-id";
import { DateFilter } from "@/components/filters/date-filter";
import SearchFilter from "@/components/filters/search-filter";
import ReservationsTable from "@/components/reservations-table";
import TraveDetails from "@/components/trave-details";
import { currentUser } from "@/lib/auth";
import DepartDatesFilter from "../travels/_components/depart-dates-filter";

async function ReservationsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const currentPage = (await searchParams).page;
  const reservationsPerPage = 8;
  const user = await currentUser();
  const reservations = await getReservations({
    user,
    searchParams,
    currentPage: Number(currentPage || "1"),
    reservationsPerPage,
  });
  const totalReservations = await getReservationsCount({ searchParams });
  const { departDates } = await getReservationValues();

  return (
    <div className="py-16 space-y-7">
      <div className="flex items-center justify-between gap-5 flex-wrap w-full">
        <SearchFilter searchParams={await searchParams} url="/reservations" />
        <div className="flex items-center gap-5">
          <DepartDatesFilter
            url="/reservations"
            searchParams={await searchParams}
            departs={departDates}
          />
          <DateFilter searchParams={await searchParams} url="/reservations" />
        </div>
      </div>
      <ReservationsTable
        reservations={reservations}
        currentPage={Number(currentPage || "1")}
        reservationsPerPage={reservationsPerPage}
        totalReservations={totalReservations}
        searchParams={await searchParams}
        showTravel
      />
    </div>
  );
}

export default ReservationsPage;
