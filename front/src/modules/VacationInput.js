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
  Input
} from "reactstrap";

class VacationInput extends Component {
  constructor(props) {
    super(props);
    this.state = this.initState(props);
  }

  initState(props) {
    return {
      image: props.image || "",
      destination: props.destination || "",
      description: props.description || "",
      price: props.price || "",
      start_date: props.start_date || "",
      end_date: props.end_date || "",
      modal: true
    };
  }

  submit = ev => {
    ev.preventDefault();
    let dataObj = {
      image: this.state.image,
      destination: this.state.destination,
      description: this.state.description,
      price: this.state.price,
      start_date: this.state.start_date,
      end_date: this.state.end_date,
    };

    if (this.props.vacation_id) dataObj.vacation_id = this.props.vacation_id;

    (this.props.requestEdit ? this.props.requestEdit : this.props.requestAdd)(dataObj).then(() => this.toggle());
  };

  handleChange = ev => {
    let newState = Object.assign({}, this.state);
    newState[ev.target.name] = ev.target.value;
    this.setState(newState);
  };

  componentWillReceiveProps(nextProps) {
    this.setState(this.initState(nextProps));
  }

  toggle = () => {
    this.setState({
      modal: !this.state.modal
    });
  };

  render() {
    let actWord = this.props.requestEdit ? "Edit" : "Add";
    return (
      <Modal isOpen={this.state.modal} toggle={this.toggle}>
        <ModalHeader toggle={this.toggle}>{actWord} Vacation</ModalHeader>
        <ModalBody>
          <Form onSubmit={this.submit}>
            <FormGroup row>
              <Label sm={3}>Destination</Label>
              <Col sm={9}>
                <Input
                  type="text"
                  name="destination"
                  value={this.state.destination}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm={3}>Image</Label>
              <Col sm={9}>
                <Input
                  type="text"
                  name="image"
                  value={this.state.image}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm={3}>Description</Label>
              <Col sm={9}>
                <Input
                  type="text"
                  name="description"
                  value={this.state.description}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm={3}>Price</Label>
              <Col sm={9}>
                <Input
                  type="number"
                  min="0"
                  step="0.01"
                  name="price"
                  value={this.state.price}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm={3}>Start Date</Label>
              <Col sm={9}>
                <Input
                  type="date"
                  name="start_date"
                  value={this.state.start_date}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>

            <FormGroup row>
              <Label sm={3}>End Date</Label>
              <Col sm={9}>
                <Input
                  type="date"
                  name="end_date"
                  value={this.state.end_date}
                  onChange={this.handleChange}
                  required
                />
              </Col>
            </FormGroup>

            <FormGroup check row>
              <Col sm={{ size: 9, offset: 3 }} style={{ paddingLeft: 0 }}>
                <Button>{actWord}</Button>
              </Col>
            </FormGroup>
          </Form>
        </ModalBody>
      </Modal>
    );
  }
}

export default VacationInput;
