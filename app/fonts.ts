import { Poppins, Montserrat, Tajawal } from "next/font/google";

export const tajawal = Tajawal({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const poppins = Poppins({
  subsets: ["latin"],
  weight: ["600"],
});

export const montserrat = Montserrat({
  subsets: ["latin"],
});
