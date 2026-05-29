import React from 'react';
import Card from './Card';
import Cart from './Cart';
import './customer.css';
import {isLoggedInCustomer} from './auth';
import { getStoredTableNumber } from '../utils/tableUtils';
import { apiFetch } from '../utils/api';


export default class Customermenu extends React.Component {
    constructor(props){
      super(props)
      this.state = {
        data1: [],
        food: [],
        grandtotal: 0,
      };
      this.additem = this.additem.bind(this);
      this.handleRemove = this.handleRemove.bind(this);
      this.handleAdd = this.handleAdd.bind(this);
      this.handleConfirm = this.handleConfirm.bind(this);
    }

    calculateGrandTotal = (items) => {
      return items.reduce((sum, item) => sum + (Number(item.price) * Number(item.quantity)), 0);
    }
    
    componentDidMount(){
      apiFetch("/menu").then( res => res.json()).then(data =>{
          this.setState({data1: data.food_items})
      })
    }

    additem  = (x,i) => {
      this.setState(prevState => {
        const existingIndex = prevState.food.findIndex(row => row.name === x.name);
        let updatedFood = [...prevState.food];

        if (existingIndex >= 0) {
          updatedFood[existingIndex] = {
            ...updatedFood[existingIndex],
            quantity: updatedFood[existingIndex].quantity + 1
          };
        } else {
          updatedFood.push({ name: x.name, price: Number(x.amount), quantity: 1 });
        }

        return {
          food: updatedFood,
          grandtotal: this.calculateGrandTotal(updatedFood)
        };
      });
      alert("Item added to cart");
   } 

   handleRemove = (key,i) => {
    this.setState(prevState => {
      if (!prevState.food[i]) {
        return null;
      }

      let updatedFood = [...prevState.food];
      const targetItem = updatedFood[i];
      const nextQuantity = targetItem.quantity - 1;

      if (nextQuantity <= 0) {
        updatedFood = updatedFood.filter((row, j) => j !== i);
      } else {
        updatedFood[i] = {
          ...targetItem,
          quantity: nextQuantity
        };
      }

      return {
        food: updatedFood,
        grandtotal: this.calculateGrandTotal(updatedFood)
      };
    });
   };
  
   handleAdd = (key, i) => {
    this.setState(prevState => {
      if (!prevState.food[i]) {
        return null;
      }

      const updatedFood = [...prevState.food];
      updatedFood[i] = {
        ...updatedFood[i],
        quantity: updatedFood[i].quantity + 1
      };

      return {
        food: updatedFood,
        grandtotal: this.calculateGrandTotal(updatedFood)
      };
    });
   };

   handleConfirm = () => {
     if(isLoggedInCustomer()){
      if (!this.state.food.length) {
        alert("Please add at least one item to cart");
        return;
      }
      const sessid = sessionStorage.getItem("customer_access_token");
      const food = this.state.food;
      const grandtotal = this.calculateGrandTotal(this.state.food);
      const customerorder = {'sessionid':sessid,food,grandtotal}
      apiFetch('/order', {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(customerorder)
      }).then(async (res) => {
        if(res.ok){
          alert("Order Confirmed");
          window.location.replace("/pay")
          return;
        }
        const data = await res.json().catch(() => ({}));
        alert(data.error || "Could not place order. Please try again.");
      }).catch(() => {
        alert("Network error while placing order.");
      })
     }
     else{
     }
   };

      render(){
        const tableNo = getStoredTableNumber();
        return (
            <div className="bg2">
            <div style={{backgroundColor: "black", height: 70, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 12px"}}>
                {tableNo ? (
                  <span className="menu-table-badge">Table {tableNo}</span>
                ) : (
                  <span className="menu-table-badge" />
                )}
                <Cart
                  food={this.state.food}
                  handleAdd={this.handleAdd}
                  handleRemove={this.handleRemove}
                  grandtotal={this.state.grandtotal}
                  handleConfirm={this.handleConfirm}
                />
            </div>
            <Card 
            data={this.state.data1}
            additem={this.additem}
            />
            </div>
        )
     }   
}