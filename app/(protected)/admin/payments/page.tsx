import { getPayments } from "@/actions/queries/payments/get-payments";
import { getPaymentsCount } from "@/actions/queries/payments/get-payments-count";
import { getReservationValues } from "@/actions/queries/reservations/get-reservation-values";
import AgencyFilter from "@/components/filters/agency-filter";
import SearchFilter from "@/components/filters/search-filter";
import { OpenDialogButton } from "@/components/open-dialog-button";
import { currentUser } from "@/lib/auth";
import PaymentsDashboard from "./_components/payments-dashboard";
import { db } from "@/lib/db";

async function PaymentsPage({
  searchParams,
}: {
  params: any;
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const currentPage = (await searchParams).page;
  const paymentsPerPage = 8;
  const user = await currentUser();
  const payments = await getPayments({
    user,
    searchParams,
    currentPage: Number(currentPage || "1"),
    paymentsPerPage,
  });
  const totalPayments = await getPaymentsCount({ searchParams });
  const agencies = await db.user.findMany({
    where: {
      payments: {
        some: {},
      },
    },
  });

  return (
    <div dir="rtl" className="space-y-10">
      <div className="pt-5 flex items-center justify-between">
        <div className="flex items-center gap-5">
          <SearchFilter
            inputClassName="pr-9 pl-4"
            url="/admin/payments"
            searchParams={await searchParams}
          />
          <OpenDialogButton title="اضافة دفعة" type="managePayment" data={{}} />
        </div>
        {user?.role === "ADMIN" && (
          <AgencyFilter
            agencies={agencies}
            searchParams={await searchParams}
            url={`/admin/payments`}
          />
        )}
      </div>
      <PaymentsDashboard
        currentPage={Number(currentPage || "1")}
        payments={payments}
        paymentsPerPage={paymentsPerPage}
        totalPayments={totalPayments}
        searchParams={await searchParams}
      />
    </div>
  );
}

export default PaymentsPage;
