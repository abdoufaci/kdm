import { TravelWithHotels } from "@/types/types";
import { OpenDialogButton } from "@/components/open-dialog-button";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Clock4, PlaneLanding, PlaneTakeoff, UsersRound } from "lucide-react";

interface Props {
  travel: TravelWithHotels;
}

function TraveDetails({ travel }: Props) {
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold">{travel?.name}</h1>
      <div className="grid grid-cols-1 lg:!grid-cols-[65%_35%] gap-5">
        <div className="space-y-8">
          <div className="flex items-center gap-7 flex-wrap">
            <div className="flex items-center gap-5">
              <PlaneTakeoff className="h-5 w-5 text-brand fill-brand" />
              <h3 className="text-[#646768]">
                {format(travel.departDate, "dd/MM/yyyy")}
              </h3>
            </div>
            <div className="flex items-center gap-5">
              <PlaneLanding className="h-5 w-5 text-brand fill-brand" />
              <h3 className="text-[#646768]">
                {format(travel.arriveDate, "dd/MM/yyyy")}
              </h3>
            </div>
            <div className="flex items-center gap-5">
              <svg
                width="21"
                height="21"
                viewBox="0 0 21 21"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M10.5 21C4.70114 21 0 16.2989 0 10.5C0 4.70114 4.70114 0 10.5 0C16.2989 0 21 4.70114 21 10.5C21 16.2989 16.2989 21 10.5 21ZM11.4545 4.29545H9.54545V10.8952L13.3636 14.7134L14.7134 13.3636L11.4545 10.1048V4.29545Z"
                  fill="#D45847"
                  fillOpacity="0.98"
                />
              </svg>

              <h3 className="text-[#646768]">{travel.duration} nuits</h3>
            </div>
            <div className="flex items-center gap-5">
              <svg
                width="26"
                height="13"
                viewBox="0 0 26 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 6.09421C14.4829 6.09421 15.7583 4.77007 15.7583 3.04571C15.7583 1.34225 14.476 0.0803223 13 0.0803223C11.524 0.0803223 10.2412 1.37011 10.2412 3.05964C10.2412 4.77007 11.5171 6.09421 13 6.09421ZM5.06211 6.25254C6.34493 6.25254 7.46246 5.09414 7.46246 3.59775C7.46246 2.11482 6.33796 1.01818 5.06211 1.01818C3.77929 1.01818 2.64829 2.14221 2.65525 3.61121C2.65525 5.09414 3.77232 6.253 5.06211 6.253M20.9379 6.253C22.2277 6.253 23.3447 5.09461 23.3447 3.61168C23.3447 2.14268 22.2207 1.01864 20.9379 1.01864C19.662 1.01864 18.5375 2.11529 18.5375 3.59775C18.5375 5.09461 19.6551 6.253 20.9379 6.253ZM1.21364 12.4805H6.45543C5.73811 11.4391 6.61375 9.34236 8.09668 8.19743C7.33061 7.68718 6.34493 7.30786 5.05561 7.30786C1.94443 7.30786 0 9.60421 0 11.5147C0 12.1355 0.344964 12.4805 1.21364 12.4805ZM24.7864 12.4805C25.662 12.4805 26 12.1355 26 11.5147C26 9.60421 24.0551 7.30786 20.9449 7.30786C19.6551 7.30786 18.6689 7.68718 17.9038 8.19743C19.3862 9.34236 20.2624 11.4391 19.545 12.4805H24.7864ZM8.66171 12.4805H17.3309C18.4136 12.4805 18.7999 12.1699 18.7999 11.563C18.7999 9.78389 16.5722 7.32875 12.993 7.32875C9.42082 7.32875 7.19318 9.78389 7.19318 11.563C7.19318 12.1699 7.579 12.4805 8.66171 12.4805Z"
                  fill="#D55B4B"
                />
              </svg>

              <h3 className="text-[#646768]">
                {travel.availabelSpots} restant
              </h3>
            </div>
            <div className="flex items-center gap-5">
              <svg
                width="26"
                height="13"
                viewBox="0 0 26 13"
                fill="none"
                xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M13 6.09421C14.4829 6.09421 15.7583 4.77007 15.7583 3.04571C15.7583 1.34225 14.476 0.0803223 13 0.0803223C11.524 0.0803223 10.2412 1.37011 10.2412 3.05964C10.2412 4.77007 11.5171 6.09421 13 6.09421ZM5.06211 6.25254C6.34493 6.25254 7.46246 5.09414 7.46246 3.59775C7.46246 2.11482 6.33796 1.01818 5.06211 1.01818C3.77929 1.01818 2.64829 2.14221 2.65525 3.61121C2.65525 5.09414 3.77232 6.253 5.06211 6.253M20.9379 6.253C22.2277 6.253 23.3447 5.09461 23.3447 3.61168C23.3447 2.14268 22.2207 1.01864 20.9379 1.01864C19.662 1.01864 18.5375 2.11529 18.5375 3.59775C18.5375 5.09461 19.6551 6.253 20.9379 6.253ZM1.21364 12.4805H6.45543C5.73811 11.4391 6.61375 9.34236 8.09668 8.19743C7.33061 7.68718 6.34493 7.30786 5.05561 7.30786C1.94443 7.30786 0 9.60421 0 11.5147C0 12.1355 0.344964 12.4805 1.21364 12.4805ZM24.7864 12.4805C25.662 12.4805 26 12.1355 26 11.5147C26 9.60421 24.0551 7.30786 20.9449 7.30786C19.6551 7.30786 18.6689 7.68718 17.9038 8.19743C19.3862 9.34236 20.2624 11.4391 19.545 12.4805H24.7864ZM8.66171 12.4805H17.3309C18.4136 12.4805 18.7999 12.1699 18.7999 11.563C18.7999 9.78389 16.5722 7.32875 12.993 7.32875C9.42082 7.32875 7.19318 9.78389 7.19318 11.563C7.19318 12.1699 7.579 12.4805 8.66171 12.4805Z"
                  fill="#D55B4B"
                />
              </svg>

              <h3 className="text-[#646768]">15 reserve</h3>
            </div>
          </div>
          <p className="text-[#585757] w-full max-w-2xl">
            {travel.description}
          </p>
          <OpenDialogButton
            type="manageReservation"
            title="Reserve"
            data={{ travel, hotels: travel.hotels }}
          />
        </div>
        <div>
          <div className="grid grid-cols-2">
            <div className="border border-[#00000059] flex items-center justify-center p-3 rounded-tl-sm">
              <h1 className="text-[#00000094] text-sm">Chamber</h1>
            </div>
            <div className="border border-[#00000059] flex items-center justify-center p-3 rounded-tr-sm">
              <h1 className="text-[#00000094] text-sm">Prix</h1>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="border border-b-[#D9D9D96B] border-[#00000059] flex items-center justify-center p-3 ">
              <h1 className="text-[#00000094] text-sm text-left">
                2 - double{" "}
              </h1>
            </div>
            <div className="border border-b-[#D9D9D96B] border-[#00000059] flex items-center justify-center p-3">
              <h1 className="text-[#00000094] text-sm">{travel.double} DA</h1>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="border border-b-[#D9D9D96B] border-[#00000059] flex items-center justify-center p-3 ">
              <h1 className="text-[#00000094] text-sm text-left">3 - Trible</h1>
            </div>
            <div className="border border-b-[#D9D9D96B] border-[#00000059] flex items-center justify-center p-3">
              <h1 className="text-[#00000094] text-sm">{travel.triple} DA</h1>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="border border-b-[#D9D9D96B] border-[#00000059] flex items-center justify-center p-3 ">
              <h1 className="text-[#00000094] text-sm text-left">
                4 - quadruple
              </h1>
            </div>
            <div className="border border-b-[#D9D9D96B] border-[#00000059] flex items-center justify-center p-3">
              <h1 className="text-[#00000094] text-sm">
                {travel.quadruple} DA
              </h1>
            </div>
          </div>
          <div className="grid grid-cols-2">
            <div className="border border-[#00000059] flex items-center justify-center p-3 rounded-bl-sm">
              <h1 className="text-[#00000094] text-sm">5 - quintuple</h1>
            </div>
            <div className="border border-[#00000059] flex items-center justify-center p-3 rounded-br-sm">
              <h1 className="text-[#00000094] text-sm">
                {travel.quintuple} DA
              </h1>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TraveDetails;
