import "./styles/header.css";
import { BiTimeFive } from "react-icons/bi";
import { useEffect, useState } from "react";

const Header = ({ word, socketRef }) => {
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
    if (sec > 0) {
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
      <div>
        {word.letters.map((l, i) => (word.show[i] === 0 ? "_ " : l + " "))}
      </div>
    </div>
  );
};

export default Header;
