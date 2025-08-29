"use client";

import { Card, CardContent, CardFooter, CardHeader } from "../ui/card";
import { BackButton } from "./back-button";
import { Header } from "./header";
import { Social } from "./social";

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonHref: string;
  showSocial?: boolean;
}

export function CardWrapper({
  backButtonHref,
  backButtonLabel,
  children,
  headerLabel,
  showSocial,
}: CardWrapperProps) {
  return (
    <Card className="w-full max-w-[500px] px-8 shadow-md bg-[#8067673D] backdrop-blur-xl border-none">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocial && (
        <CardFooter>
          <Social />
        </CardFooter>
      )}
      {backButtonLabel && (
        <CardFooter>
          <BackButton href={backButtonHref} label={backButtonLabel} />
        </CardFooter>
      )}
    </Card>
  );
}
