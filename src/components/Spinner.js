import React from "react";
import { Audio } from "react-loader-spinner";

const Spinner = ({ spinnerText }) => {
  return (
    <div
      style={{
        padding: "3rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
      }}
    >
      <h1>{spinnerText}</h1>
      <Audio
        height="80"
        width="80"
        radius="9"
        color="purple"
        ariaLabel="loading"
      />
    </div>
  );
};

export default Spinner;
