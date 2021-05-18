import "./styles/header.css";
import { BiTimeFive } from "react-icons/bi";
import { useEffect, useState } from "react";

const Header = ({ word, socketRef, clock }) => {
  const [sec, setSec] = useState(60);

  const tick = () => {
    if (sec > 0) setSec(sec - 1);
    else {
      //wysyłamy info do serwera, że koniec czasu
      let info = {};
      socketRef.current.send(JSON.stringify(info));
    }
  };

  useEffect(() => {
    if (sec > 0 && clock === true) {
      const timerId = setInterval(() => tick(), 1000);
      return () => clearInterval(timerId);
    }
    console.log(clock);
  });

  return (
    <div className="header">
      <div className="time">
        <div className="time-i">
          <BiTimeFive />
        </div>
        <div>{sec} sekund</div>
      </div>
      <div>{word.includes("_") ? "_ ".repeat(word.length) : word}</div>
    </div>
  );
};

export default Header;
