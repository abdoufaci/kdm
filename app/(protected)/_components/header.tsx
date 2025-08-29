"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useCurrentUser } from "@/hooks/use-current-user";
import { ExtendedUser } from "@/types/next-auth";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useTransition } from "react";
import { logout } from "@/actions/auth/logout";
import { routeTitles } from "@/constants/route-titles";
import Link from "next/link";
import { adminNavigations, clientNavigations } from "@/constants/navigations";

interface Props {
  user?: ExtendedUser;
}

function Header({ user }: Props) {
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const subRoute = pathname.split("/")[2];
  const title =
    routeTitles[subRoute] ??
    routeTitles[pathname.split("/")[1]] ??
    "Umrah Réservation";

  return (
    <div className="flex items-center justify-between pt-8">
      <div className="flex items-center gap-4">
        <Link href={"/travels"}>
          <Image
            alt="logo"
            src={"/dark-logo.svg"}
            height={20}
            width={100}
            className="object-contain"
          />
        </Link>
        <Separator
          orientation="vertical"
          className="w-1.5 min-w-0.5 h-1 min-h-12 bg-[#00000038] rounded-full"
        />
        <h1 className="text-[#3F3934] text-xl font-medium">{title}</h1>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger className="cursor-pointer" asChild>
          <div className="flex items-center gap-4">
            <h1 className="text-[#373434] max-md:!hidden font-medium">
              {user?.name}
            </h1>
            <Avatar className="w-10 h-10">
              <AvatarImage
                className="object-cover"
                src={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME}/${user?.image?.id}`}
              />
              <AvatarFallback className="bg-brand text-white">
                {user?.name?.charAt(0) || "U"}
              </AvatarFallback>
            </Avatar>
          </div>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {(user?.role === "ADMIN" ? adminNavigations : clientNavigations).map(
            ({ title, href }, idx) => (
              <Link key={idx} href={href}>
                <DropdownMenuItem className="cursor-pointer">
                  <h1>{title}</h1>
                </DropdownMenuItem>
              </Link>
            )
          )}
          <DropdownMenuItem
            disabled={isPending}
            onClick={() =>
              startTransition(() => {
                logout().then(() => router.push("/"));
              })
            }
            className="bg-[#FF00000F] text-[#FF0000] hover:!text-[#FF0000] hover:!bg-[#FF00000F] focus-within:bg-[#FF00000F] cursor-pointer">
            <h1>Logout</h1>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

export default Header;
