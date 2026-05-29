import React from 'react';
import {Link} from 'react-router-dom';
import { apiFetch } from '../utils/api';
import Navbar from './Navbar';
import "./forms.css";
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';


export default class Registerform extends React.Component {
       state = {
        firstname : "",
        lastname : "",
        email :  "",
        password : "",
        firstnameError : "",
        lastnameError : "",
        emailError : "",
        passwordError : "",
        toggle : false
      };
    

    validate = () => {
        let firstnameError = "";
        let lastnameError = "";
        let emailError = "";
        let passwordError = "";
    
        if (!this.state.firstname) {
          firstnameError = "Field Empty!!";
        }
 
        if (!this.state.lastname) {
            lastnameError = "Field Empty!!";
        }

        if (!this.state.email.includes("@")) {
            emailError = "Invalid Email";
        }

        if(!this.state.password){
          passwordError  = "Field Empty!!";
        }
    
        if (emailError || firstnameError || lastnameError || passwordError) {
            this.setState({ emailError, firstnameError, lastnameError, passwordError, toggle: true });
          return false;
        }

        this.setState({ toggle: false, emailError: "", firstnameError: "", lastnameError: "", passwordError: "" });
    
        return true;
    };

    recieve = async() => {
      const firstname = this.state.firstname;
      const lastname = this.state.lastname;
      const email = this.state.email;
      const password = this.state.password;
      const user = {firstname , lastname , email , password};
      const isValid = this.validate();
      if(isValid){
        apiFetch('/register', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(user)
        }).then( res => res.json())
        .then(data=>{
          localStorage.setItem('access_token', data.access_token);
          
          localStorage.setItem('email', data.email);
    
          if (localStorage.getItem("access_token") !== null && localStorage.getItem("access_token")!=="undefined") {
            window.location.replace("/login")
          }
          else{
              alert(data.error)
          }
        }).catch(err => { alert('Cannot connect to server. Make sure backend is running.'); });
  
      }
      else{
      }
    };


    render(){
        return ( 
          <div>
          <Navbar />
              <div className="auth-page" style={{minHeight: 'calc(100vh - 64px)'}}>
               <div className="auth-card">
                  <div className="auth-brand">
                    <span className="auth-brand-icon">🍽️</span>
                    <h1 className="auth-title">Create Account</h1>
                    <p className="auth-subtitle">Set up your restaurant admin account</p>
                  </div>
                   <div>
                        <TextField
                            placeholder="Enter Your First Name"
                            label="First Name"
                            value={this.state.firstname}
                            onChange={event => this.setState({ firstname: event.target.value })}
                            error={this.state.toggle}
                            helperText={this.state.firstnameError}
                            variant="outlined"
                            fullWidth
                            margin="normal"
                        />
                        
                        <br />
                        <TextField
                            placeholder="Enter Your Last Name"
                            label="Last Name"
                            value={this.state.lastname}
                            onChange={event => this.setState({ lastname: event.target.value })}
                            error={this.state.toggle}
                            helperText={this.state.lastnameError}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <br />
                        <TextField
                            placeholder="Enter Your Email"
                            label="Email"
                            value={this.state.email}
                            onChange={event => this.setState({ email: event.target.value })}
                            error={this.state.toggle}
                            helperText={this.state.emailError}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <br />
                        <TextField
                            type="password"
                            placeholder="Enter Your Password"
                            label="Password"
                            value={this.state.password}
                            onChange={event => this.setState({ password: event.target.value })}
                            error={this.state.toggle}
                            helperText={this.state.passwordError}
                            variant="outlined"
                            margin="normal"
                            fullWidth
                        />
                        <br />
                        <Link to="/login" className="auth-link">Already a member? Sign In</Link>
                        <Button
                            className="auth-submit-btn"
                            variant="contained"
                            onClick={this.recieve}
                        >Create Account
                        </Button>
                      </div>
                   </div>
              </div>
        </div>
      );
  }
}