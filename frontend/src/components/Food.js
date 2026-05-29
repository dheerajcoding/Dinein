import React, { Component } from "react";
import Table from "./Table";
import { apiFetch } from '../utils/api';


class Food extends Component {
  state = {
    id: 1,
    name: "",
    description: "",
    amount: 0,
    data: [],
    editIdx: -1,
  };

  componentDidMount(){
    apiFetch("/menu").then( res => res.json()).then(data =>{
         this.setState({data : data.food_items})
    })
  }

  handleRemove = i => {
    let deletedata = this.state.data.filter((row, j) => j === i)
    apiFetch('/menu_delete', {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(deletedata)
    })
    this.setState(state => ({
      data: state.data.filter((row, j) => j !== i)
    }));
  };

  onSubmit = () => {
    let name = this.state.name;
    let id = this.state.id;
    let description = this.state.description;
    let amount = this.state.amount;
    let submission = { id , name, description, amount };
    this.setState({
      data: [...this.state.data, submission]
    })
    this.setState({
      id: 1,
      name: "",
      description: "",
      amount: 0,
    })
  };

  render() {
    return (
      <div>
        <Table
         handleRemove={this.handleRemove}
         data={this.state.data}
         header={[
          {
            name: "Id",
            prop: "id"
          },
          {
            name: "Name",
            prop: "name"
          },
          {
            name: "Description",
            prop: "description"
          },
          {
            name: "Amount",
            prop: "amount"
          }
        ]}
        />
      </div>
    );
  }
}

export default Food;