import React from "react";
import "./styles/infopanel.css";

const InfoPanel = ({ start, setDrawing, drawing, catchword }) => {
  return (
    <div className={`info-background ${!drawing && "info-background-off"}`}>
      <div className="info-container">
        <div className="info-header">TWOJE HASŁO:</div>
        <div className="info-password">{catchword}</div>
        <div className="info-button-space">
          <button
            className="info-draw"
            onClick={() => {
              setDrawing(!drawing);
            }}
          >
            Rysuj
          </button>
        </div>
      </div>
    </div>
  );
};

export default InfoPanel;
