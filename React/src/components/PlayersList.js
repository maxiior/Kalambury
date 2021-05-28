import "./styles/playerslist.css";
import { getNumberIterator } from "./Iterator";

const playerIterator = getNumberIterator();

const PlayersList = ({ players, lastWinner, winner }) => {
  return (
    <div className="main2">
      <div className="players">Gracze:</div>

      {players
        .sort(({ points: current }, { points: previous }) => previous - current)
        .map((p) => (
          <div
            key={playerIterator.next()}
            className={`single ${
              winner !== ""
                ? winner === p.nick && "winner"
                : lastWinner.name === p.nick && "winner"
            }`}
          >
            <div>{p.nick}</div>
            <div>{p.points} pkt.</div>
          </div>
        ))}

      {players.length === 0 && <div className="empty">Brak</div>}
    </div>
  );
};

export default PlayersList;
