"use client";

import { roomTypes } from "@/constants/room-type";
import { ReservationWithMembers } from "@/types/types";
import { Hotel, ReservationMember, ReservationRoom } from "@prisma/client";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Image,
} from "@react-pdf/renderer";
import { format } from "date-fns";

Font.register({
  family: "Arabic",
  src: "/fonts/Tajawal-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 20,
    fontFamily: "Arabic",
  },
  header: {
    fontSize: 18,
    textAlign: "center",
    marginBottom: 20,
    fontWeight: "bold",
    color: "#333",
  },
  container: {
    border: "1px solid #B2AFAF",
    padding: 15,
    marginBottom: 20,
    marginTop: 10,
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

export const VoucherDocument = ({
  reservation,
  room,
}: {
  reservation?: ReservationWithMembers | null;
  room: ReservationRoom & {
    reservationMembers: ReservationMember[];
    madinaHotel: Hotel | null;
    meccahHotel: Hotel;
  };
}) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.header}>حجز العمرة</Text>
        <View style={styles.container}>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              gap: 10,
              alignItems: "center",
              justifyContent: "flex-end",
            }}>
            <Text
              style={{
                color: "#000000D1",
                fontSize: 13,
                textAlign: "center",
              }}>
              {reservation?.user?.name || "User"}
            </Text>
            {
              //@ts-ignore
              reservation?.user?.image?.id ? (
                <Image
                  src={`https://${process.env.NEXT_PUBLIC_BUNNY_CDN_HOSTNAME}/${
                    //@ts-ignore
                    reservation?.user?.image?.id || currentUser?.image?.id
                  }`}
                  style={{
                    width: 30,
                    height: 30,
                    borderRadius: "999px",
                    objectFit: "cover",
                  }}
                />
              ) : (
                <View
                  style={{
                    width: 30,
                    height: 30,
                    backgroundColor: "#D45847",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "flex-end",
                    borderRadius: "999px",
                    color: "#FFFFFF",
                    position: "relative",
                  }}>
                  <Text
                    style={{
                      color: "#FFFFFF",
                      fontSize: 12,
                      transform: "translate(0%, -5.5%)",
                    }}>
                    {reservation?.user?.name?.charAt(0) || "U"}
                  </Text>
                </View>
              )
            }
          </View>
          <View
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              marginTop: 10,
            }}>
            <View
              style={{
                width: "30%",

                paddingRight: 10,
                paddingTop: 20,
                paddingLeft: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 15,
              }}>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700 !important",
                  color: "#D45847",
                }}>
                تفاصيل الطيران
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 5,
                }}>
                <Text
                  style={{
                    color: "#AFADAD",
                    fontSize: 11,
                  }}>
                  شركة الطيران
                </Text>
                <Text
                  style={{
                    color: "#373434",
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                  {reservation?.travel.airline}
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 10,
                  justifyContent: "flex-end",
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
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    العودة
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    {format(
                      reservation?.travel.arriveDate || new Date(),
                      "dd/MM/yyyy"
                    )}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    {"<-"}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    الذهاب
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    {format(
                      reservation?.travel.departDate || new Date(),
                      "dd/MM/yyyy"
                    )}
                  </Text>
                </View>
              </View>
            </View>
            <View
              style={{
                width: "70%",
                borderLeft: "1px solid #D9D9D9",
                paddingLeft: 10,
                paddingTop: 20,
                paddingRight: 5,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 15,
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
                    color: "#AFADAD",
                    fontSize: 11,
                  }}>
                  البرنامج
                </Text>
                <Text
                  style={{
                    color: "#373434",
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                  {reservation?.travel.name}
                </Text>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 35,
                  justifyContent: "flex-end",
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
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    المدة
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    أيام {reservation?.travel.duration}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    الفندق
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 600,
                    }}>
                    {room?.meccahHotel.name}
                  </Text>
                </View>
              </View>
              <View
                style={{
                  display: "flex",
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 35,
                  justifyContent: "flex-end",
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
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    عدد المقاعد
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    {room.reservationMembers.length}
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    الأطفال
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    {
                      room.reservationMembers.filter(
                        (member) => member.type === "CHILD"
                      ).length
                    }
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    البالغون
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    {
                      room.reservationMembers.filter(
                        (member) => member.type === "ADULT"
                      ).length
                    }
                  </Text>
                </View>
                <View
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "flex-end",
                    gap: 5,
                  }}>
                  <Text
                    style={{
                      color: "#AFADAD",
                      fontSize: 11,
                    }}>
                    الغرفة
                  </Text>
                  <Text
                    style={{
                      color: "#373434",
                      fontSize: 11,
                      fontWeight: 500,
                    }}>
                    {roomTypes[room.roomType]}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700 !important",
                  color: "#D45847",
                }}>
                تفاصيل الحجز
              </Text>
              <View
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "flex-end",
                  gap: 5,
                }}>
                <Text
                  style={{
                    color: "#AFADAD",
                    fontSize: 11,
                  }}>
                  الهاتف
                </Text>
                <Text
                  style={{
                    color: "#373434",
                    fontSize: 11,
                    fontWeight: 500,
                  }}>
                  {reservation?.user?.phone}
                </Text>
              </View>
              {room.reservationMembers.map((voyageur, idx) => (
                <View
                  key={voyageur.id}
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 35,
                    justifyContent: "flex-end",
                    borderTop: "1px solid #D9D9D9",
                    paddingTop: 10,
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
                        color: "#AFADAD",
                        fontSize: 11,
                      }}>
                      الاعاشة
                    </Text>
                    <Text
                      style={{
                        color: "#373434",
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                      {voyageur.foodIclusions ? "نعم" : "لا"}
                    </Text>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 5,
                    }}>
                    <Text
                      style={{
                        color: "#AFADAD",
                        fontSize: 11,
                      }}>
                      رقم جواز السفر
                    </Text>
                    <Text
                      style={{
                        color: "#373434",
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                      {voyageur.passportNumber}
                    </Text>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 5,
                    }}>
                    <Text
                      style={{
                        color: "#AFADAD",
                        fontSize: 11,
                      }}>
                      تاريخ الميلاد
                    </Text>
                    <Text
                      style={{
                        color: "#373434",
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                      {format(voyageur?.dob || new Date(), "dd/MM/yyyy")}
                    </Text>
                  </View>
                  <View
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-end",
                      gap: 5,
                    }}>
                    <Text
                      style={{
                        color: "#AFADAD",
                        fontSize: 11,
                      }}>
                      الاسم
                    </Text>
                    <Text
                      style={{
                        color: "#373434",
                        fontSize: 11,
                        fontWeight: 500,
                      }}>
                      {voyageur.foodIclusions && (
                        <svg
                          width="14"
                          height="18"
                          viewBox="0 0 14 18"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M0.349271 1.57566C0.364278 1.39323 0.44903 1.2236 0.585901 1.10206C0.722772 0.980515 0.901228 0.916408 1.08416 0.923071C1.26708 0.929735 1.4404 1.00665 1.56807 1.13784C1.69573 1.26902 1.76792 1.44436 1.76961 1.6274V5.26031C1.76961 5.3943 1.82284 5.52282 1.9176 5.61757C2.01235 5.71232 2.14086 5.76555 2.27486 5.76555C2.40886 5.76555 2.53737 5.71232 2.63212 5.61757C2.72687 5.52282 2.7801 5.3943 2.7801 5.26031V1.52231C2.7801 1.36151 2.84398 1.2073 2.95768 1.09359C3.07138 0.979893 3.22559 0.916016 3.38639 0.916016C3.54719 0.916016 3.7014 0.979893 3.81511 1.09359C3.92881 1.2073 3.99269 1.36151 3.99269 1.52231V5.26031C3.99269 5.3943 4.04592 5.52282 4.14067 5.61757C4.23542 5.71232 4.36393 5.76555 4.49793 5.76555C4.63193 5.76555 4.76044 5.71232 4.85519 5.61757C4.94994 5.52282 5.00317 5.3943 5.00317 5.26031V1.6274C5.00487 1.44436 5.07705 1.26902 5.20472 1.13784C5.33239 1.00665 5.5057 0.929735 5.68863 0.923071C5.87156 0.916408 6.05001 0.980515 6.18689 1.10206C6.32376 1.2236 6.40851 1.39323 6.42352 1.57566C6.45828 2.0704 6.61995 4.44868 6.61995 5.76636C6.61995 6.85768 6.07833 7.8229 5.25216 8.40737C5.07755 8.53105 5.03551 8.66201 5.03955 8.7283C5.13898 10.2465 5.40737 14.4016 5.40737 15.0604C5.40737 15.5964 5.19445 16.1105 4.81544 16.4895C4.43643 16.8685 3.92239 17.0814 3.38639 17.0814C2.8504 17.0814 2.33635 16.8685 1.95735 16.4895C1.57834 16.1105 1.36542 15.5964 1.36542 15.0604C1.36542 14.4008 1.6338 10.2465 1.73324 8.7283C1.73728 8.66201 1.69524 8.53105 1.52063 8.40737C1.09793 8.10875 0.75308 7.71302 0.515067 7.25346C0.277054 6.79389 0.152829 6.2839 0.152832 5.76636C0.152832 4.44868 0.31451 2.0704 0.349271 1.57566ZM7.83254 5.56426C7.83254 4.33147 8.32226 3.14917 9.19398 2.27745C10.0657 1.40574 11.248 0.916016 12.4808 0.916016C12.6416 0.916016 12.7958 0.979893 12.9095 1.09359C13.0232 1.2073 13.0871 1.36151 13.0871 1.52231V8.39363C13.0871 8.65069 13.1728 9.92553 13.269 11.3378L13.273 11.4049C13.3781 12.9473 13.4913 14.6247 13.4913 15.0604C13.4913 15.5964 13.2783 16.1105 12.8993 16.4895C12.5203 16.8685 12.0063 17.0814 11.4703 17.0814C10.9343 17.0814 10.4203 16.8685 10.0413 16.4895C9.66224 16.1105 9.44932 15.5964 9.44932 15.0604C9.44932 14.6449 9.55279 12.9497 9.65304 11.3952C9.70316 10.6102 9.75408 9.84954 9.79208 9.28528L9.81067 8.99992H9.24722C9.06144 8.99992 8.87748 8.96333 8.70585 8.89223C8.53421 8.82114 8.37826 8.71693 8.24689 8.58557C8.11553 8.4542 8.01132 8.29825 7.94023 8.12661C7.86913 7.95497 7.83254 7.77101 7.83254 7.58524V5.56426Z"
                            fill="#D45847"
                          />
                        </svg>
                      )}
                      {voyageur.name}
                    </Text>
                  </View>
                </View>
              ))}
            </View>
          </View>
        </View>
        <Text
          style={{
            color: "#00000094",
            fontSize: 10,
            textAlign: "center",
          }}>
          {reservation?.ref}
        </Text>
        <Image src={"/logo.png"} style={styles.brandFooter} />
      </Page>
    </Document>
  );
};
