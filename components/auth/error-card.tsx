import { Header } from "./header";
import { BackButton } from "./back-button";
import { Card, CardFooter, CardHeader } from "../ui/card";

import React from "react";

function ErrorCard() {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label="Oops ! Something went wrong" />
      </CardHeader>
      <CardFooter>
        <BackButton href="/auth/login" label="Back to login" />
      </CardFooter>
    </Card>
  );
}

export default ErrorCard;
