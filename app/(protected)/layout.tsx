import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "./_components/header";

async function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const user = await currentUser();

  return (
    <div className="min-h-screen w-[90%] md:!w-[85%] mx-auto">
      <Header user={user} />
      <div>{children}</div>
    </div>
  );
}

export default AdminLayout;
