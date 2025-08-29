"use client";

import Link from "next/link";
import { Button } from "../ui/button";

interface BackButtonProps {
  href: string;
  label: string;
}

export function BackButton({ href, label }: BackButtonProps) {
  return (
    <Button
      variant={"link"}
      className="font-normal w-full text-[#A4A4A4]"
      size={"sm"}
      asChild>
      <Link href={href}>{label}</Link>
    </Button>
  );
}
