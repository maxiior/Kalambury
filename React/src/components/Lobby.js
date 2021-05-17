import { React, useState } from "react";

import "./styles/lobby.css";


export default function Lobby({ setIsLogged, setGameData }) {
  
  const [userdata, setUserdata] = useState({ username: "", room: "" });

  const handleSubmit = (e) => {
    e.preventDefault();
    setUserdata({
      username: userdata.username.trim(),
      room: userdata.room.trim(),
    });
    if (userdata.room.length === 0 || userdata.username.length === 0) {
      alert("Pola nazwy użytkownika i pokoju nie mogą być puste");
    } else {
      setGameData({"username": userdata.username, "room": userdata.room});
      setIsLogged(true);
    }
  };

  const handleChange = (e) => {
    setUserdata({ ...userdata, [e.target.name]: e.target.value });
  };

  return (
    <div className="lobby">
      <div className="lobby-container">
        <div className="lobby-page">
          <header>Dołącz do gry w Kalambury</header>
          <form onSubmit={handleSubmit}>
            <input
              name="username"
              onChange={handleChange}
              className="text-field"
              placeholder="Nazwa użytkownika"
              type="text"
              size="80"
            />
            <input
              name="room"
              onChange={handleChange}
              className="text-field"
              type="text"
              placeholder="Pokój"
              size="80"
            />
            <button id="join-button" type="submit" className="join-button">
              Dołącz
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
