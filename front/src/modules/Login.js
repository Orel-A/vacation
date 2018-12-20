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
  ModalFooter,
  FormFeedback
} from "reactstrap";

class Login extends Component {
  state = {
    user_name: { invalid: false, value: "" },
    password: { invalid: false, value: "" }
  };

  requestLogin = ev => {
    ev.preventDefault();
    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json; charset=utf-8"
      },
      body: JSON.stringify({
        user_name: this.state.user_name.value,
        password: this.state.password.value
      }),
      credentials: "include"
    })
      .then(res => res.text())
      .then(res => {
        if (res === "Username doesn't exist") {
          let newState = Object.assign({}, this.state);
          newState.user_name.invalid = true;
          newState.password.invalid = false;
          this.setState(newState);
          return;
        } else if (res === "Password incorrect") {
          let newState = Object.assign({}, this.state);
          newState.user_name.invalid = false;
          newState.password.invalid = true;
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
        <ModalHeader>Login</ModalHeader>
        <ModalBody>
          <Form onSubmit={this.requestLogin}>
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
                <FormFeedback>Username doesn't exist</FormFeedback>
              </Col>
            </FormGroup>
            <FormGroup row>
              <Label sm={3}>Password</Label>
              <Col sm={9}>
                <Input
                  type="password"
                  name="password"
                  invalid={this.state.password.invalid}
                  value={this.state.password.value}
                  onChange={this.handleChange}
                  required
                />
                <FormFeedback>Password is incorrect</FormFeedback>
              </Col>
            </FormGroup>
            <FormGroup check row>
              <Col sm={{ size: 9, offset: 3 }} style={{ paddingLeft: 0 }}>
                <Button>Login</Button>
              </Col>
            </FormGroup>
          </Form>
        </ModalBody>
        <ModalFooter>
          <Button
            color="link"
            onClick={() => this.props.changeState({ page: "Register" })}
          >
            Don't have an account? Register!
          </Button>
        </ModalFooter>
      </Modal>
    );
  }
}

export default Login;
