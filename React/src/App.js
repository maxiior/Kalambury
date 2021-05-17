import Board from "./components/Board";
import Footer from "./components/Footer";
import Lobby from "./components/Lobby";
import { BrowserRouter, Route, Switch, Redirect } from "react-router-dom";
import { useState } from "react";

function App() {
  const [logged, setLogged] = useState(false);

  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route exact path="/" component={() => <Lobby onLogin={setLogged} />}>
            {logged && <Redirect to="/game" />}
          </Route>
          <Route path="/game" component={Board} />
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
