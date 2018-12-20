import React, { Component } from "react";
import FontAwesome from "react-fontawesome";
import { Card, CardImg, CardTitle, CardText, CardBody, Col } from "reactstrap";
import VacationInput from "./VacationInput";

class VacationCard extends Component {
  requestChangeFollow = () => {
    fetch("/vacationFollow", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        vacation_id: this.props.vacation_id,
        follow: !this.props.follows
      }),
      credentials: "include"
    })
      .then(res => res.text())
      .then(res => {
        if (res === "success")
          this.props.changeFollow(this.props.vacation_id, !this.props.follows);
      });
  };

  requestDelete = () => {
    fetch("/vacations", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        vacation_id: this.props.vacation_id
      }),
      credentials: "include"
    })
      .then(res => res.text())
      .then(res => {
        if (res === "success")
          this.props.removeVacation(this.props.vacation_id);
      });
  };

  requestEdit = vacation => {
    return new Promise((resolve, reject) => {
      fetch("/vacations", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json; charset=utf-8"
        },
        body: JSON.stringify(vacation),
        credentials: "include"
      })
        .then(res => res.json())
        .then(data => {
          this.props.editVacation(data);
          resolve();
        })
        .catch(err => reject(err));
    });
  };

  sendModal = () => {
    this.props.makePopupAppear(
      <VacationInput
        requestEdit={this.requestEdit}
        image={this.props.image}
        vacation_id={this.props.vacation_id}
        destination={this.props.destination}
        description={this.props.description}
        price={this.props.price}
        start_date={this.props.start_date}
        end_date={this.props.end_date}
      />
    );
  };

  render() {
    return (
      <Col md="4">
        <Card className="mb-3" style={{ display: "block" }}>
          <CardImg
            top
            width="100%"
            src={this.props.image}
            alt="vacation photo"
          />
          <div
            className="pull-right text-center mr-1"
            style={{ cursor: "pointer" }}
          >
            {this.props.admin ? (
              <>
                <FontAwesome
                  name="remove"
                  size="lg"
                  onClick={this.requestDelete}
                />
                <br />
                <FontAwesome name="pencil" size="lg" onClick={this.sendModal} />
              </>
            ) : (
              <FontAwesome
                name={this.props.follows ? "heart" : "heart-o"}
                size="lg"
                onClick={this.requestChangeFollow}
              />
            )}
          </div>
          <CardBody>
            <CardTitle>{this.props.destination}</CardTitle>
            <CardText>{this.props.description}</CardText>
            <CardText>Price: {this.props.price}$</CardText>
            <CardText>
              Dates: {new Date(this.props.start_date).toLocaleDateString()}-
              {new Date(this.props.end_date).toLocaleDateString()}
            </CardText>
          </CardBody>
        </Card>
      </Col>
    );
  }
}

export default VacationCard;
