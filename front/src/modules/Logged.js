import React, { Component } from "react";
import {
  Container,
  Row,
  Navbar,
  NavbarBrand,
  Nav,
  NavItem,
  NavLink
} from "reactstrap";
import VacationCard from "./VacationCard";
import VacationInput from "./VacationInput";
import { HorizontalBar } from "react-chartjs-2";
import io from "socket.io-client";

class Logged extends Component {
  state = { vacations: [], popupModal: null, page: "Home", stats: null };

  componentWillMount() {
    fetch("/vacations", { credentials: "include" })
      .then(res => res.json())
      .then(data =>
        this.setState({ vacations: data.sort((a, b) => a.follows < b.follows) })
      );
  }

  componentDidMount() {
    if (!this.props.user.is_admin) {
      this.socket = io();
      this.socket.on("vacationUpdate", data => this.editVacation(data));
    }
  }

  removeVacation = vacation_id => {
    let newArr = this.state.vacations.filter(
      vacation => vacation.vacation_id !== vacation_id
    );
    this.setState({ vacations: newArr });
  };

  changeFollow = (vacation_id, follows) => {
    let newArr = this.state.vacations.slice();
    for (let i = 0; i < newArr.length; i++) {
      if (newArr[i].vacation_id === vacation_id) {
        newArr[i].follows = follows;
        break;
      }
    }
    this.setState({ vacations: newArr.sort((a, b) => a.follows < b.follows) });
  };

  editVacation = vacation => {
    let newArr = this.state.vacations.slice();
    for (let i = 0; i < newArr.length; i++) {
      if (newArr[i].vacation_id === vacation.vacation_id) {
        Object.assign(newArr[i], vacation);
        break;
      }
    }
    this.setState({ vacations: newArr });
  };

  requestAddVacation = vacation => {
    return new Promise((resolve, reject) => {
      fetch("/vacations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(vacation),
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          let newArr = this.state.vacations.slice();
          newArr.push(data);
          this.setState({ vacations: newArr });
          resolve();
        })
        .catch(err => reject(err));
    });
  };

  requestStats = () => {
    fetch("/vacationsStats", { credentials: "include" })
      .then(res => res.json())
      .then(stats => {
        stats.sort((a, b) => b.followers - a.followers);
        let labels = [];
        let data = [];
        stats.forEach(e => {
          labels.push(e.destination);
          data.push(e.followers);
        });
        let barObj = {
          labels,
          datasets: [
            {
              label: "Followers",
              data,
              fill: false,
              backgroundColor: [
                "rgba(255, 99, 132, 0.2)",
                "rgba(255, 159, 64, 0.2)",
                "rgba(255, 205, 86, 0.2)",
                "rgba(75, 192, 192, 0.2)",
                "rgba(54, 162, 235, 0.2)",
                "rgba(153, 102, 255, 0.2)",
                "rgba(201, 203, 207, 0.2)"
              ],
              borderColor: [
                "rgb(255, 99, 132)",
                "rgb(255, 159, 64)",
                "rgb(255, 205, 86)",
                "rgb(75, 192, 192)",
                "rgb(54, 162, 235)",
                "rgb(153, 102, 255)",
                "rgb(201, 203, 207)"
              ],
              borderWidth: 1
            }
          ]
        };
        this.setState({ stats: barObj, page: "Stats" });
      });
  };

  makePopupAppear = modal => {
    this.setState({ popupModal: modal });
  };

  render() {
    let adminOptions = null;
    if (this.props.user.is_admin) {
      adminOptions = (
        <>
          <NavItem>
            <NavLink href="#" onClick={() => this.setState({ page: "Home" })}>
              Home
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink href="#" onClick={() => this.requestStats()}>
              View Statistics
            </NavLink>
          </NavItem>
          <NavItem>
            <NavLink
              href="#"
              onClick={() =>
                this.makePopupAppear(
                  <VacationInput requestAdd={this.requestAddVacation} />
                )
              }
            >
              Add Vacation
            </NavLink>
          </NavItem>
        </>
      );
    }

    let content = null;

    if (this.state.page === "Home") {
      content = (
        <Row>
          {this.state.vacations.map(vacation => (
            <VacationCard
              editVacation={this.editVacation}
              makePopupAppear={this.makePopupAppear}
              removeVacation={this.removeVacation}
              changeFollow={this.changeFollow}
              {...vacation}
              admin={this.props.user.is_admin}
              key={vacation.vacation_id}
            />
          ))}
        </Row>
      );
    } else if (this.state.page === "Stats" && this.state.stats !== null) {
      content = (
        <HorizontalBar
          data={this.state.stats}
          options={{ scales: { xAxes: [{ ticks: { beginAtZero: true } }] } }}
        />
      );
    }
    return (
      <Container>
        <Navbar color="faded" light expand="md">
          <NavbarBrand>Observe Vacations</NavbarBrand>
          <Nav className="ml-auto" navbar>
            <span className="navbar-text">Hi {this.props.user.user_name}</span>
            {adminOptions}
            <NavItem>
              <NavLink href="#" onClick={this.props.logOut}>Log Out</NavLink>
            </NavItem>
          </Nav>
        </Navbar>
        {content}
        {this.state.popupModal}
      </Container>
    );
  }
}

export default Logged;
