import React from 'react';
import { Link } from 'react-router-dom';
import { apiFetch } from '../utils/api';
import "./forms.css"
import TextField from '@material-ui/core/TextField';
import Button from '@material-ui/core/Button';

export default class Registerform extends React.Component {
       state = {
        email :  "",
        password : "",
        emailError : "",
        passwordError : "",
        toggle : false
      };
    

    validate = () => {
        let emailError = "";
        let passwordError = "";

        if (!this.state.email.includes("@")) {
            emailError = "Invalid Email";
        }

        if(!this.state.password){
          passwordError  = "Field Empty!!";
        }
    
        if (emailError || passwordError) {
            this.setState({ emailError, passwordError, toggle: true });
          return false;
        }

        this.setState({ emailError: "", passwordError: "", toggle: false });
    
        return true;
    };

    recieve = async() => {
      const email = this.state.email;
      const password = this.state.password;
      const user = { email , password };
      const isValid = this.validate();
      if(isValid){
        apiFetch('/login', {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(user)
        }).then( res => res.json())
        .then(data=>{
          localStorage.setItem('access_token', data.access_token);
          localStorage.setItem('email', data.email)
    
          if (localStorage.getItem("access_token") !== null && localStorage.getItem("access_token")!=="undefined") {
            window.location.replace("/main")
          }else{
              alert(data.error)
          }
        }).catch(err => { alert('Cannot connect to server. Make sure backend is running.'); });
      }
      else{
      }
    };

    render(){
        return (
              <div className="auth-page">
                <div className="auth-card">
                  <div className="auth-brand">
                    <span className="auth-brand-icon">🍽️</span>
                    <h1 className="auth-title">Welcome Back</h1>
                    <p className="auth-subtitle">Sign in to manage your restaurant</p>
                  </div>
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
                        <Link to="/register" className="auth-link">New User? Click here to Register</Link>
                        <Button
                            className="auth-submit-btn"
                            variant="contained"
                            onClick={this.recieve}
                        >Sign In
                        </Button>
                      </div>
                   </div>
      );
  }
}