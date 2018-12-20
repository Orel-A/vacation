import React, { Component } from "react";
import Login from "./modules/Login";
import Register from "./modules/Register";
import Loading from "./modules/Loading";
import Logged from "./modules/Logged";

class App extends Component {
  state = { page: "", user: {} };

  changeState = data => {
    this.setState(data);
  };

  logOut = () => {
    fetch("/logOut", { credentials: "include" })
    .then(res => res.text())
    .then(() => this.setState({ page: "Login", user: {} }))
  };

  componentDidMount() {
    if (!this.state.page) {
      fetch("/checkIfLogged", { credentials: "include" })
        .then(res => res.json())
        .then(user => this.setState({ page: "Logged", user }))
        .catch(() => this.setState({ page: "Login" }));
    }
  }

  render() {
    switch (this.state.page) {
      case "Login":
        return <Login changeState={this.changeState} />;
      case "Register":
        return <Register changeState={this.changeState} />;
      case "Logged":
        return <Logged user={this.state.user} logOut={this.logOut} />;
      default:
        return <Loading />;
    }
  }
}

export default App;