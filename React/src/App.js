import Board from "./components/Board";
import Footer from "./components/Footer";
import Lobby from "./components/Lobby";
import { BrowserRouter, Route, Switch } from "react-router-dom";

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Switch>
          <Route exact path="/" component={Lobby} />
          <Route path="/game" component={Board} />
        </Switch>
        <Footer />
      </div>
    </BrowserRouter>
  );
}

export default App;
