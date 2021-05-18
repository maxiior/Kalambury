import "./styles/playerslist.css";

const PlayersList = ({ players }) => {
  return (
    <div className="main2">
      <div className="players">Gracze:</div>

      {players
        .sort(({ points: current }, { points: previous }) => previous - current)
        .map((p) => (
          <div key={p.id} className="single">
            <div>{p.nick}</div>
            <div>{p.points} pkt.</div>
          </div>
        ))}

      {players.length === 0 && <div className="empty">Brak</div>}
    </div>
  );
};

export default PlayersList;
