"use client";
import { roomTypes } from "@/constants/room-type";
import {
  ReservationWithMembers,
  TravelWithHotelsWithReservations,
} from "@/types/types";
import {
  Hotel,
  ReservationMember,
  ReservationRoom,
  RoomType,
} from "@prisma/client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  PDFViewer,
  PDFDownloadLink,
  Font,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";
import { useState, useEffect } from "react";

Font.register({
  family: "Arabic",
  src: "/fonts/Tajawal-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 20,
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Arabic",
  },
  brandFooter: {
    position: "absolute",
    bottom: 20,
    left: "50%",
    transform: "translate(-15%, 0%)",
    right: 0,
    textAlign: "center",
    fontSize: 12,
    fontWeight: "bold",
    color: "#333",
    height: 20,
    width: 60,
  },
});

export const HotelBookingDocument = ({
  reservations,
  travel,
  rooms,
  idx,
}: {
  rooms: (ReservationRoom & {
    reservationMembers: ReservationMember[];
    madinaHotel: Hotel | null;
    meccahHotel: Hotel;
  })[];
  travel: TravelWithHotelsWithReservations | null;
  reservations: ReservationWithMembers[];
  idx: number;
}) => {
  function chunkArrayToObjects(arr: ReservationMember[], size = 5) {
    const result = [];
    for (let i = 0; i < arr.length; i += size) {
      result.push({
        type: RoomType.COLLECTIVE,
        members: arr.slice(i, i + size).map((member) => ({
          ...member,
          agency: reservations.find((reservation) =>
            reservation.reservationRooms.some((room) =>
              room.reservationMembers.some((item) => item?.id === member?.id)
            )
          )?.user?.name,
        })),
      });
    }
    return result;
  }

  const collectiveRooms = chunkArrayToObjects(
    rooms
      .filter((room) => room.roomType === "COLLECTIVE")
      .flatMap((room) => room.reservationMembers)
  );

  const doubleRooms = rooms
    .filter((room) => room.roomType === "DOUBLE")
    .map((room) => ({
      type: room.roomType,
      members: room.reservationMembers.map((member) => ({
        ...member,
        agency: reservations.find((reservation) =>
          reservation.reservationRooms.some((room) =>
            room.reservationMembers.some((item) => item?.id === member?.id)
          )
        )?.user?.name,
      })),
    }));
  const tripleRooms = rooms
    .filter((room) => room.roomType === "TRIPLE")
    .map((room) => ({
      type: room.roomType,
      members: room.reservationMembers.map((member) => ({
        ...member,
        agency: reservations.find((reservation) =>
          reservation.reservationRooms.some((room) =>
            room.reservationMembers.some((item) => item?.id === member?.id)
          )
        )?.user?.name,
      })),
    }));
  const quadrupleRooms = rooms
    .filter((room) => room.roomType === "QUADRUPLE")
    .map((room) => ({
      type: room.roomType,
      members: room.reservationMembers.map((member) => ({
        ...member,
        agency: reservations.find((reservation) =>
          reservation.reservationRooms.some((room) =>
            room.reservationMembers.some((item) => item?.id === member?.id)
          )
        )?.user?.name,
      })),
    }));
  const quintupleRooms = rooms
    .filter((room) => room.roomType === "QUINTUPLE")
    .map((room) => ({
      type: room.roomType,
      members: room.reservationMembers.map((member) => ({
        ...member,
        agency: reservations.find((reservation) =>
          reservation.reservationRooms.some((room) =>
            room.reservationMembers.some((item) => item?.id === member?.id)
          )
        )?.user?.name,
      })),
    }));

  const convertedRooms = [
    ...doubleRooms,
    ...tripleRooms,
    ...quadrupleRooms,
    ...quintupleRooms,
    ...collectiveRooms,
  ];

  const allMembers = convertedRooms.flatMap((room) => room.members);

  const name = travel?.hotels?.[idx]?.name || "فندق غير معروف";

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 0,
            alignItems: "center",
          }}>
          <Text
            style={{
              fontSize: 18,
              textAlign: "center",
              marginBottom: 20,
              fontWeight: 700,
              color: "#313233",
            }}>
            توزيع الغرف لفندق
          </Text>
          <Text style={{ fontSize: 14, textAlign: "center", marginBottom: 10 }}>
            {name}
          </Text>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 15,
          }}>
          <View
            style={{
              padding: 15,
              border: "1.15px solid #B5B5B5",
              borderRadius: "6.92px",
              display: "flex",
              flexDirection: "column",
              gap: 7,
              width: "176.5px",
              height: "90px",
            }}>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "space-between",
              }}>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  gap: 15,
                }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontSize: "8.09px",
                    }}>
                    CH5
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {quintupleRooms.length + collectiveRooms.length}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontSize: "8.09px",
                    }}>
                    CH4
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {quadrupleRooms.length}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontSize: "8.09px",
                    }}>
                    CH3
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {tripleRooms.length}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontSize: "8.09px",
                    }}>
                    CH2
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {doubleRooms.length}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}>
                <Text
                  style={{
                    color: "#403B3B",
                    fontSize: "8.09px",
                  }}>
                  Num
                </Text>
                <Text
                  style={{
                    fontSize: "8.09px",
                  }}>
                  {convertedRooms.length}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: "152px",
                height: "1px",
                backgroundColor: "#D9D9D9",
              }}></View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                gap: 25,
                paddingLeft: 10,
              }}>
              <View
                style={{
                  display: "flex",
                  gap: 5,
                }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 3,
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontWeight: 500,
                      fontSize: "8.09px",
                    }}>
                    ENF
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {
                      allMembers.filter((member) => member.type === "CHILD")
                        .length
                    }
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 3,
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontWeight: 500,
                      fontSize: "8.09px",
                    }}>
                    FEM
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {
                      allMembers.filter(
                        (member) =>
                          member.type === "ADULT" && member.sex !== "ذكر"
                      ).length
                    }
                  </Text>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  gap: 5,
                }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 3,
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontWeight: 500,
                      fontSize: "8.09px",
                    }}>
                    CHD
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {
                      allMembers.filter((member) => member.type === "BABY")
                        .length
                    }
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 3,
                    alignItems: "center",
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontWeight: 500,
                      fontSize: "8.09px",
                    }}>
                    MAL
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {
                      allMembers.filter(
                        (member) =>
                          member.type === "ADULT" && member.sex === "ذكر"
                      ).length
                    }
                  </Text>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  gap: 5,
                }}>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    gap: 3,
                  }}>
                  <Text
                    style={{
                      color: "#403B3B",
                      fontWeight: 500,
                      fontSize: "8.09px",
                    }}>
                    MTN
                  </Text>
                  <Text
                    style={{
                      fontSize: "8.09px",
                    }}>
                    {allMembers.length}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <View
            style={{
              padding: 15,
              border: "1.15px solid #B5B5B5",
              borderRadius: "6.92px",
              display: "flex",
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 15,
              width: "176.5px",
              height: "90px",
            }}>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 5,
              }}>
              <Text
                style={{
                  fontWeight: 500,
                  fontSize: "10.95px",
                  textAlign: "right",
                }}>
                العودة
              </Text>
              <Text
                style={{
                  fontSize: "9.33px",
                  textAlign: "right",
                  color: "#8D8888",
                }}>
                {travel?.arriveTime}
              </Text>
              <Text
                style={{
                  fontSize: "9.33px",
                  textAlign: "right",
                  color: "#8D8888",
                }}>
                {travel?.arriveDate
                  ? format(new Date(travel.arriveDate), "dd-MM-yyyy")
                  : "--"}
              </Text>
              <Text
                style={{
                  fontSize: "9.33px",
                  textAlign: "right",
                  color: "#8D8888",
                }}>
                {travel?.leavePlace}
              </Text>
            </View>
            <View
              style={{
                height: "50.75817108154297px",
                width: "1.153594732284546px",
                backgroundColor: "#D9D9D9",
              }}></View>
            <View
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 5,
              }}>
              <Text
                style={{
                  fontWeight: 500,
                  fontSize: "10.95px",
                  textAlign: "right",
                }}>
                الذهاب
              </Text>
              <Text
                style={{
                  fontSize: "9.33px",
                  textAlign: "right",
                  color: "#8D8888",
                }}>
                {travel?.departTime}
              </Text>
              <Text
                style={{
                  fontSize: "9.33px",
                  textAlign: "right",
                  color: "#8D8888",
                }}>
                {travel?.departDate
                  ? format(new Date(travel.departDate), "dd-MM-yyyy")
                  : "--"}
              </Text>
              <Text
                style={{
                  fontSize: "9.33px",
                  textAlign: "right",
                  color: "#8D8888",
                }}>
                {travel?.arrivePlace}
              </Text>
            </View>
          </View>
          <View
            style={{
              padding: 15,
              border: "1.15px solid #B5B5B5",
              borderRadius: "6.92px",
              display: "flex",
              flexDirection: "column",
              alignItems: "flex-end",
              gap: 15,
              width: "156.88888549804688px",
              height: "90px",
            }}>
            <Text
              style={{
                fontWeight: 500,
                fontSize: "8.65px",
              }}>
              الوكالة لسياحة و السفر
            </Text>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}>
              <Text
                style={{
                  color: "#8D8888",
                  fontSize: "8.65px",
                  fontWeight: 500,
                }}>
                {format(travel?.departDate!, "dd-MM-yyyy")}
              </Text>
              <Text
                style={{
                  fontSize: "8.65px",
                  fontWeight: 500,
                }}>
                : الدخول
              </Text>
            </View>
            <View
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                gap: 5,
              }}>
              <Text
                style={{
                  color: "#8D8888",
                  fontSize: "8.65px",
                  fontWeight: 500,
                }}>
                {format(travel?.arriveDate!, "dd-MM-yyyy")}
              </Text>
              <Text
                style={{
                  fontSize: "8.65px",
                  fontWeight: 500,
                }}>
                : العودة
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "flex-end",
            gap: 15,
            flexWrap: "wrap",
            paddingLeft: 10,
            paddingRight: 10,
            marginTop: "25px",
          }}>
          {convertedRooms.map((room, idx) => (
            <View
              key={idx}
              style={{
                width: "160px",
                height: "200px",
                border: "1.15px solid #B5B5B5",
                borderRadius: "3px",
              }}>
              <View
                style={{
                  backgroundColor: "#D9D9D952",
                  width: "100%",
                  height: "26px",
                  borderTopLeftRadius: "3px",
                  borderTopRightRadius: "3px",
                  position: "relative",
                }}>
                <Text
                  style={{
                    fontWeight: "500",
                    fontSize: "13px",
                    position: "absolute",
                    top: "8px",
                    left: "12px",
                  }}>
                  N°
                </Text>
                <Text
                  style={{
                    fontWeight: "500",
                    fontSize: "13px",
                    position: "absolute",
                    top: "8px",
                    right: "12px",
                  }}>
                  {roomTypes[room.type] ?? room.type}
                </Text>
              </View>
              <View
                style={{
                  padding: 15,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 7,
                }}>
                {room.members.map((member) => (
                  <View
                    key={member?.id}
                    style={{
                      display: "flex",
                      gap: 2,
                      alignItems: "flex-end",
                    }}>
                    <Text
                      style={{
                        fontSize: "10px",
                        textAlign: "right",
                      }}>
                      {member.name}
                    </Text>
                    <Text
                      style={{
                        fontSize: "9px",
                        color: "#AAAAAA",
                        textAlign: "right",
                      }}>
                      {member.agency}
                    </Text>
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
        <Image src={"/logo.png"} style={styles.brandFooter} />
      </Page>
    </Document>
  );
};
