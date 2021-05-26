import "./styles/header.css";
import { BiTimeFive } from "react-icons/bi";
import { useEffect, useState } from "react";

const Header = ({ word, socket, clock, host, user }) => {
  const [sec, setSec] = useState(60);

  const tick = () => {
    if (sec > 0) setSec(sec - 1);
    else if (sec === 0 && host === user) {
      let info = { type: "TimeOut" };
      socket.send(JSON.stringify(info));
    }
  };

  useEffect(() => {
    if (sec >= 0 && clock === true) {
      const timerId = setInterval(() => tick(), 1000);
      return () => clearInterval(timerId);
    }
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
