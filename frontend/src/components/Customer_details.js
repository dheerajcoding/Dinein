import React from 'react';
import './forms.css';
import { apiFetch } from '../utils/api';
import TextField from '@material-ui/core/TextField';
import './customer.css';
import {
  getTableFromSearch,
  getStoredTableNumber,
  setStoredTableNumber,
  saveCustomerTable,
} from '../utils/tableUtils';

export default class Customerform extends React.Component {
  state = {
    name: '',
    email: '',
    mobileno: '',
    guests: '',
    nameError: '',
    emailError: '',
    mobileError: '',
    guestsError: '',
    tableError: '',
    toggle: false,
    isSubmitting: false,
  };

  componentDidMount() {
    const fromQuery = getTableFromSearch(
      this.props.location && this.props.location.search
    );
    if (fromQuery) {
      setStoredTableNumber(fromQuery);
    }
    if (!getStoredTableNumber()) {
      const search = (this.props.location && this.props.location.search) || '';
      window.location.replace(`/table${search}`);
    }
  }

  validate = () => {
    let nameError = '';
    let emailError = '';
    let mobileError = '';
    let guestsError = '';
    const mobileValue = String(this.state.mobileno).trim();
    const guestsValue = String(this.state.guests).trim();

    if (!this.state.name.trim()) {
      nameError = 'Please enter your name';
    }

    if (!mobileValue) {
      mobileError = 'Please enter your mobile number';
    } else if (!/^[0-9]{10}$/.test(mobileValue)) {
      mobileError = 'Enter a valid 10-digit mobile number';
    }

    if (!this.state.email.includes('@') || this.state.email.includes(' ')) {
      emailError = 'Enter a valid email address';
    }

    if (!guestsValue) {
      guestsError = 'Please enter number of guests';
    }

    if (emailError || nameError || mobileError || guestsError) {
      this.setState({
        emailError,
        nameError,
        mobileError,
        guestsError,
        toggle: true,
      });
      return false;
    }

    return true;
  };

  recieve = () => {
    if (this.state.isSubmitting) {
      return;
    }

    const tableNumber = getStoredTableNumber();
    if (!tableNumber) {
      window.location.replace('/table');
      return;
    }

    const isValid = this.validate();
    if (!isValid) {
      return;
    }

    const user = {
      name: this.state.name.trim(),
      email: this.state.email.trim(),
      mobile: String(this.state.mobileno).trim(),
      guests: String(this.state.guests).trim(),
    };

    this.setState({ isSubmitting: true, tableError: '' });

    apiFetch('/customer_details', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(user),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          alert(data.error);
          this.setState({ isSubmitting: false });
          return;
        }

        sessionStorage.setItem('customer_access_token', data.customer_access_token);
        sessionStorage.setItem('customer_email', data.email);

        if (!data.customer_access_token) {
          alert('Unable to start session. Please try again.');
          this.setState({ isSubmitting: false });
          return;
        }

        saveCustomerTable(data.customer_access_token, tableNumber)
          .then(() => {
            window.location.replace('/place_order');
          })
          .catch((error) => {
            this.setState({
              tableError: error.message,
              isSubmitting: false,
            });
          });
      })
      .catch(() => {
        alert('Network error. Please check backend server and try again.');
        this.setState({ isSubmitting: false });
      });
  };

  changeTable = () => {
    window.location.replace('/table');
  };

  render() {
    const tableNumber = getStoredTableNumber();

    return (
      <div className="bg">
        <div className="cuss">
          <p className="table-step-badge">Step 2 of 2</p>
          <h1 style={{ textAlign: 'center' }}>Your Details</h1>
          <p style={{ textAlign: 'center', marginTop: 0 }}>
            Almost there — tell us who is ordering.
          </p>

          <div className="table-selected-banner">
            <span>
              Table <strong>{tableNumber || '—'}</strong>
            </span>
            <button type="button" className="table-change-link" onClick={this.changeTable}>
              Change table
            </button>
          </div>

          <TextField
            placeholder="Enter Your Name"
            label="Name"
            value={this.state.name}
            onChange={(event) => this.setState({ name: event.target.value })}
            error={this.state.toggle && !!this.state.nameError}
            helperText={this.state.nameError}
            variant="outlined"
            fullWidth
            margin="normal"
          />
          <TextField
            placeholder="Enter Your Email"
            label="Email"
            value={this.state.email}
            onChange={(event) => this.setState({ email: event.target.value })}
            error={this.state.toggle && !!this.state.emailError}
            helperText={this.state.emailError}
            variant="outlined"
            margin="normal"
            fullWidth
          />
          <TextField
            placeholder="Enter Your Mobile Number"
            label="Mobile"
            value={this.state.mobileno}
            onChange={(event) => this.setState({ mobileno: event.target.value })}
            error={this.state.toggle && !!this.state.mobileError}
            helperText={this.state.mobileError}
            variant="outlined"
            margin="normal"
            fullWidth
            type="tel"
            inputProps={{ maxLength: 10 }}
          />
          <TextField
            placeholder="Number of Guests"
            label="Guests"
            value={this.state.guests}
            onChange={(event) => this.setState({ guests: event.target.value })}
            error={this.state.toggle && !!this.state.guestsError}
            helperText={this.state.guestsError}
            variant="outlined"
            margin="normal"
            fullWidth
            type="number"
          />

          {this.state.tableError ? (
            <p className="table-error" style={{ textAlign: 'center' }}>
              {this.state.tableError}
            </p>
          ) : null}

          <button
            style={{
              display: 'block',
              width: '100%',
              padding: '15px 32px',
              fontSize: '16px',
              backgroundColor: 'purple',
              color: 'white',
              cursor: this.state.isSubmitting ? 'wait' : 'pointer',
              opacity: this.state.isSubmitting ? 0.8 : 1,
            }}
            onClick={this.recieve}
            disabled={this.state.isSubmitting}
          >
            {this.state.isSubmitting ? 'Please wait...' : 'Continue to Menu'}
          </button>
        </div>
      </div>
    );
  }
}
