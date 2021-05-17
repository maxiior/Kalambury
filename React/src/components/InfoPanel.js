import React from "react";
import "./styles/infopanel.css";

const InfoPanel = ({ start, setDrawing, drawing, setStart }) => {
  return (
    <div className={`info-background ${!start && "info-background-off"}`}>
      <div className="info-container">
        <div className="info-header">TWOJE HASŁO:</div>
        <div className="info-password">Limonka</div>
        <div className="info-button-space">
          <button
            className="info-draw"
            onClick={() => {
              setDrawing(!drawing);
              setStart(!start);
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
