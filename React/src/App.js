import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { useState } from "react";

import Board from "./components/Board";
import Footer from "./components/Footer";
import Lobby from "./components/Lobby";
import InfoPanel from "./components/InfoPanel";

function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [gameData, setGameData] = useState({ username: "", room: "" });
  const [start, setStart] = useState(false);
  const [drawing, setDrawing] = useState(false);
  const [catchword, setCatchword] = useState("");
  const [clock, setClock] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <InfoPanel
          start={start}
          setDrawing={setDrawing}
          drawing={drawing}
          setStart={setStart}
          catchword={catchword}
        />
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
                drawing={drawing}
                setDrawing={setDrawing}
                catchword={catchword}
                setCatchword={setCatchword}
                clock={clock}
                setClock={setClock}
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
