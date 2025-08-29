import React from "react";
import SearchFilter from "@/components/filters/search-filter";
import { DateFilter } from "@/components/filters/date-filter";
import { getAgencies } from "@/actions/queries/users/get-agencies";
import { getAgenciesCount } from "@/actions/queries/users/get-count-agencies";
import AgenciesDashboard from "./_components/agencies-dashboard";
import { OpenDialogButton } from "@/components/open-dialog-button";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === "USER") {
    redirect("/travels");
  }

  const currentPage = (await searchParams).page;
  const agenciesPerPage = 8;
  const agencies = await getAgencies(
    Number(currentPage || "1"),
    agenciesPerPage,
    searchParams
  );
  const totalAgencies = await getAgenciesCount(searchParams);

  return (
    <div dir="rtl" className="py-10 space-y-5">
      <div className="flex flex-col md:!flex-row items-start justify-between gap-5">
        <div className="flex flex-col sm:!flex-row items-start gap-5 w-full">
          <SearchFilter
            searchParams={await searchParams}
            url="/admin/agencies"
            inputClassName="pr-9"
          />
          <OpenDialogButton title="اضافة وكالة" type="manageAgency" />
        </div>
        <DateFilter searchParams={await searchParams} url="/admin/agencies" />
      </div>
      <AgenciesDashboard
        currentPage={Number(currentPage || "1")}
        agencies={agencies}
        agenciesPerPage={agenciesPerPage}
        searchParams={await searchParams}
        totalAgencies={totalAgencies}
      />
    </div>
  );
}

export default AdminPage;
