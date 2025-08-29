import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

async function AdminPage() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  if (user.role === "USER") {
    redirect("/travels");
  }
  return <div className="py-10 space-y-5">admin</div>;
}

export default AdminPage;
