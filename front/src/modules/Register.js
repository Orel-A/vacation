import React, { Component } from "react";
import {
  Modal,
  ModalHeader,
  ModalBody,
  Col,
  Button,
  Form,
  FormGroup,
  Label,
  Input,
  FormFeedback
} from "reactstrap";

class Register extends Component {
  state = {
    user_name: { invalid: false, value: "" },
    password: { value: "" },
    first_name: { value: "" },
    last_name: { value: "" }
  };

  requestRegistration = ev => {
    ev.preventDefault();

    fetch("/register", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        user_name: this.state.user_name.value,
        password: this.state.password.value,
        first_name: this.state.first_name.value,
        last_name: this.state.last_name.value
      }),
      credentials: "include"
    })
      .then(res => res.text())
      .then(res => {
        if (res === "Username already exists") {
          let newState = Object.assign({}, this.state);
          newState.user_name.invalid = true;
          this.setState(newState);
          return;
        }

        let user = JSON.parse(res);
        this.props.changeState({ page: "Logged", user });
      });
  };

  handleChange = ev => {
    let newState = Object.assign({}, this.state);
    newState[ev.target.name].value = ev.target.value;
    if (newState[ev.target.name].hasOwnProperty("invalid"))
      newState[ev.target.name].invalid = false;
    this.setState(newState);
  };

  render() {
    return (
      <Modal isOpen={true} fade={false}>
        <ModalHeader>Registration</ModalHeader>
        <ModalBody>
          <Form onSubmit={this.requestRegistration}>
            <FormGroup row>
              <Label sm={3}>First Name</Label>
              <Col sm={9}>
                <Input
                  type="text"
                  name="first_name"
                  value={this.state.first_name.value}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label sm={3}>Last Name</Label>
              <Col sm={9}>
                <Input
                  type="text"
                  name="last_name"
                  value={this.state.last_name.value}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label sm={3}>Username</Label>
              <Col sm={9}>
                <Input
                  type="text"
                  name="user_name"
                  invalid={this.state.user_name.invalid}
                  value={this.state.user_name.value}
                  onChange={this.handleChange}
                  required
                />
                <FormFeedback>Username already exist</FormFeedback>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label sm={3}>Password</Label>
              <Col sm={9}>
                <Input
                  type="password"
                  name="password"
                  value={this.state.password.value}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>
            <FormGroup check row>
              <Col sm={{ size: 9, offset: 3 }} style={{ paddingLeft: 0 }}>
                <Button>Register</Button>
              </Col>
            </FormGroup>
          </Form>
        </ModalBody>
      </Modal>
    );
  }
}

export default Register;
