import React, { Component } from 'react';
import QrReader from 'react-qr-reader';
import {
  getTableFromSearch,
  getStoredTableNumber,
  parseTableNumber,
  setStoredTableNumber,
} from '../utils/tableUtils';
import './customer.css';

/**
 * Step 1 for customers: choose table via manual entry or QR scan.
 * Table is stored in sessionStorage, then user continues to customer details.
 */
export default class TableSelect extends Component {
  constructor(props) {
    super(props);
    this.state = {
      step: 'choose',
      delay: 500,
      tableNumber: '',
      scanResult: '',
      cameraError: '',
      errorMessage: '',
      isSubmitting: false,
      lastScannedValue: '',
    };

    this.tableInputRef = React.createRef();
  }

  componentDidMount() {
    const fromQuery = getTableFromSearch(
      this.props.location && this.props.location.search
    );
    const fromStorage = getStoredTableNumber();
    const initialTable = fromQuery || fromStorage || '';

    if (initialTable) {
      this.setState({ tableNumber: initialTable });
    }
  }

  goToCustomerDetails(tableValue) {
    const parsedTable = parseTableNumber(tableValue);

    if (!parsedTable) {
      this.setState({
        errorMessage: 'Please enter a valid table number (example: 5).',
        isSubmitting: false,
      });
      return;
    }

    this.setState({ isSubmitting: true, errorMessage: '' });
    setStoredTableNumber(parsedTable);
    window.location.replace('/customer');
  }

  handleChooseManual = () => {
    this.setState({ step: 'manual', errorMessage: '', cameraError: '' }, () => {
      if (this.tableInputRef.current) {
        try {
          this.tableInputRef.current.focus();
        } catch (e) {}
      }
    });
  };

  handleChooseScan = () => {
    this.setState({ step: 'scan', errorMessage: '', cameraError: '' });
  };

  handleBack = () => {
    this.setState({
      step: 'choose',
      errorMessage: '',
      cameraError: '',
      isSubmitting: false,
    });
  };

  handleScan = (data) => {
    if (!data || this.state.isSubmitting) {
      return;
    }
    if (data === this.state.lastScannedValue) {
      return;
    }

    const parsedTable = parseTableNumber(data);
    this.setState({
      lastScannedValue: data,
      scanResult: data,
      tableNumber: parsedTable || this.state.tableNumber,
    });

    if (parsedTable) {
      this.goToCustomerDetails(parsedTable);
    } else {
      this.setState({
        errorMessage: 'Could not read table from QR. Try Enter Table Number instead.',
        step: 'manual',
      });
    }
  };

  handleScanError = (err) => {
    console.error(err);
    this.setState({
      cameraError: 'Camera not available. Please use Enter Table Number.',
      step: 'manual',
    });
  };

  handleManualSubmit = () => {
    this.goToCustomerDetails(this.state.tableNumber);
  };

  handleManualKeyDown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleManualSubmit();
    }
  };

  renderChooseStep() {
    return (
      <div className="table-choice-grid">
        <button
          type="button"
          className="table-choice-btn"
          onClick={this.handleChooseManual}
          disabled={this.state.isSubmitting}
        >
          <span className="table-choice-icon">#</span>
          <span className="table-choice-label">Enter Table Number</span>
          <span className="table-choice-hint">Type your table number</span>
        </button>
        <button
          type="button"
          className="table-choice-btn table-choice-btn-scan"
          onClick={this.handleChooseScan}
          disabled={this.state.isSubmitting}
        >
          <span className="table-choice-icon">QR</span>
          <span className="table-choice-label">Scan QR Code</span>
          <span className="table-choice-hint">Use your phone camera</span>
        </button>
      </div>
    );
  }

  renderManualStep() {
    const { tableNumber, isSubmitting } = this.state;
    return (
      <div className="table-manual-panel">
        <label htmlFor="table-number-input" className="table-label">
          Enter your table number
        </label>
        <input
          id="table-number-input"
          ref={this.tableInputRef}
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          placeholder="e.g. 12"
          value={tableNumber}
          onChange={(event) =>
            this.setState({
              tableNumber: event.target.value.replace(/\D/g, ''),
              errorMessage: '',
            })
          }
          onKeyDown={this.handleManualKeyDown}
          className="table-input"
          disabled={isSubmitting}
          autoFocus
        />
        <button
          type="button"
          onClick={this.handleManualSubmit}
          className="table-continue-btn"
          disabled={isSubmitting || !tableNumber}
        >
          {isSubmitting ? 'Please wait...' : 'Continue'}
        </button>
      </div>
    );
  }

  renderScanStep() {
    const previewStyle = {
      height: 300,
      width: '100%',
      maxWidth: 560,
      margin: 'auto',
      borderRadius: 12,
      overflow: 'hidden',
    };

    return (
      <div className="table-scan-panel">
        <QrReader
          delay={this.state.delay}
          style={previewStyle}
          onError={this.handleScanError}
          onScan={this.handleScan}
        />
        {this.state.scanResult ? (
          <p className="table-hint">Scanned: {this.state.scanResult}</p>
        ) : (
          <p className="table-hint">Point your camera at the QR code on your table.</p>
        )}
        {this.state.cameraError ? (
          <p className="table-error">{this.state.cameraError}</p>
        ) : null}
      </div>
    );
  }

  render() {
    const { step } = this.state;
    const storedTable = getStoredTableNumber();

    return (
      <div className="bg table-page">
        <div className="table-card">
          <p className="table-step-badge">Step 1 of 2</p>
          <h1 className="table-title">Select Your Table</h1>
          <p className="table-subtitle">
            Choose how you want to set your table before ordering.
          </p>

          {storedTable && step === 'choose' ? (
            <p className="table-prefill-note">
              Previously selected: Table {storedTable}. Pick an option below to change or continue.
            </p>
          ) : null}

          {step === 'choose' ? this.renderChooseStep() : null}
          {step === 'manual' ? this.renderManualStep() : null}
          {step === 'scan' ? this.renderScanStep() : null}

          {this.state.errorMessage ? (
            <p className="table-error">{this.state.errorMessage}</p>
          ) : null}

          {step !== 'choose' ? (
            <button
              type="button"
              className="table-link-btn"
              onClick={this.handleBack}
              disabled={this.state.isSubmitting}
            >
              Back to options
            </button>
          ) : null}

          {step === 'choose' && storedTable ? (
            <button
              type="button"
              className="table-continue-btn"
              style={{ marginTop: 16 }}
              onClick={() => this.goToCustomerDetails(storedTable)}
            >
              Continue with Table {storedTable}
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}
