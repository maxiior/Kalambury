import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { useState } from "react";

import Board from "./components/Board";
import Footer from "./components/Footer";
import Lobby from "./components/Lobby";


function App() {
  const [isLogged, setIsLogged] = useState(false);
  const [gameData, setGameData] = useState({"username": "", "room": ""});

  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route exact path="/" component={() => <Lobby 
                                                    setIsLogged={setIsLogged} 
                                                    setGameData={setGameData} 
                                                  />}>
            {isLogged && <Redirect to="/game" />}
          </Route>
          <Route path="/game" component={() => <Board gameData={gameData} />} />
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
