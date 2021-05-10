import "./styles/header.css";
import { BiTimeFive } from "react-icons/bi";

const Header = ({ seconds, word }) => {
  return (
    <div className="header">
      <div className="time">
        <div className="time-i">
          <BiTimeFive />
        </div>
        <div>{seconds} sekund</div>
      </div>
      <div>
        {word.letters.map((l, i) => (word.show[i] === 0 ? "_ " : l + " "))}
      </div>
    </div>
  );
};

export default Header;
