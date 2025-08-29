import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function Home() {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/login");
  }

  redirect("/travels");

  return <div className="text-brand">home</div>;
}
