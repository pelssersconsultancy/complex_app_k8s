import logo from "./logo.svg";
import "./App.css";

import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import OtherPage from "./OtherPage";
import Fib from "./Fib";

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Fib Calculator v2</h1>
          <p>
            This app uses Redis to store calculated fibonacci numbers and
            Postgres to store a record for each calculated fibonacci index
          </p>
          <Link to="/" style={{ color: "white" }}>
            Home
          </Link>
          <Link to="/otherpage" style={{ color: "white" }}>
            Other Page
          </Link>
        </header>
        <div className="App-content">
          <Route exact path="/" component={Fib} />
          <Route path="/otherpage" component={OtherPage} />
        </div>
      </div>
    </Router>
  );
}

export default App;
