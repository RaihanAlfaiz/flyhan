import React, { type FC } from "react";
import FormAirplane from "../components/form-airplane";

// interface createAirplanePageProps {}

const createAirplanePage: FC = () => {
  return (
    <div>
      <div className="flex flex-row items-center justify-between">
        <h1 className="my-5 text-2xl font-bold">Add Airplanes</h1>
      </div>

      <FormAirplane />
    </div>
  );
};

export default createAirplanePage;
