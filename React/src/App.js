import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { useState } from "react";

import Board from "./components/Board";
import Footer from "./components/Footer";
import Lobby from "./components/Lobby";

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [gameData, setGameData] = useState({
    username: "",
    room: "",
  });
  const [host, setHost] = useState("");
  const [start, setStart] = useState(false);
  const [catchword, setCatchword] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [clock, setClock] = useState(false);
  const [isDrawer, setIsDrawer] = useState(false);
  const [infopanel, setInfopanel] = useState(true);

  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route
            exact
            path="/"
            component={() => (
              <Lobby setIsLogged={setIsLogged} setGameData={setGameData} />
            )}
          >
            {isLogged && <Redirect to="/game" />}
          </Route>
          <Route
            path="/game"
            component={() => (
              <Board
                gameData={gameData}
                start={start}
                setStart={setStart}
                catchword={catchword}
                setCatchword={setCatchword}
                clock={clock}
                setClock={setClock}
                setGameData={setGameData}
                setHost={setHost}
                host={host}
                isDrawer={isDrawer}
                setIsDrawer={setIsDrawer}
                placeholder={placeholder}
                setPlaceholder={setPlaceholder}
                infopanel={infopanel}
                setInfopanel={setInfopanel}
              />
            )}
          />
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
