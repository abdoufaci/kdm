import { RoomType } from "@prisma/client";

export const roomTypes: Record<RoomType, string> = {
  DOUBLE: "ثنائية",
  TRIPLE: "ثلاثية",
  QUADRUPLE: "رباعية",
  QUINTUPLE: "خماسية",
  COLLECTIVE: "جماعية",
};
