import { cn } from "@/lib/utils";
import Image from "next/image";
import React from "react";
import { poppins } from "../fonts";

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundImage: "url('/auth-bg.png')",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
      className="h-screen w-full flex flex-col items-center bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-400 to-blue-800">
      <div className="w-full flex justify-center h-20">
        <Image
          alt="logo"
          src={"/white-logo.svg"}
          height={20}
          width={100}
          className="object-contain"
        />
      </div>
      <div className="flex flex-col items-center justify-center h-[calc(100vh-80px)] gap-10 w-[90%] mx-auto">
        <div className="flex flex-col items-center justify-center gap-5">
          <h1
            className={cn(
              "text-4xl text-white text-center",
              poppins.className
            )}>
            .نظّم رحلات العمرة. واجعل الرحلة المباركة أكثر سلاسة
          </h1>
          <h3 className="text-white text-sm text-center">
            منصة خاصة لوكالات KDM لتنظيم رحلات العمرة، ومتابعة المواعيد،
            والأسعار، والحجوزات — كل ذلك في مكان واحد.
          </h3>
        </div>
        {children}
      </div>
    </div>
  );
}

export default AuthLayout;
