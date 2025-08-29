import { getReservations } from "@/actions/queries/reservations/get-reservations";
import { getTravelById } from "@/actions/queries/travels/get-travel-by-id";
import { currentUser } from "@/lib/auth";
import { MultipleHotelPDFs } from "./_components/multiple-hotel-pdfs";

export default async function Home({
  params,
  searchParams,
}: {
  params: any;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await currentUser();
  const travel = await getTravelById("cmeo5dlnc0001kpagivdnw0bh");
  const reservations = await getReservations({
    travelId: "cmeo5dlnc0001kpagivdnw0bh",
    user,
    searchParams,
    currentPage: 1,
  });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8">
          Umrah Booking PDF Generator
        </h1>

        <MultipleHotelPDFs reservations={reservations} travel={travel} />
      </div>
    </div>
  );
}
