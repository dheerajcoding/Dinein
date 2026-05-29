import React, { Component } from 'react';
import QrReader from 'react-qr-reader';
import {
  getTableFromSearch,
  getStoredTableNumber,
  parseTableNumber,
  saveCustomerTable,
} from '../utils/tableUtils';
import { getCustomerSessionToken } from './auth';
import './customer.css';

export default class QRscanner extends Component {
  constructor(props) {
    super(props);
    this.state = {
      delay: 500,
      mode: 'scan',
      tableNumber: '',
      scanResult: '',
      cameraError: '',
      statusMessage: '',
      errorMessage: '',
      isSubmitting: false,
      lastScannedValue: '',
    };

    this.tableInputRef = React.createRef();
    this.handleScan = this.handleScan.bind(this);
    this.handleManualSubmit = this.handleManualSubmit.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleManualKeyDown = this.handleManualKeyDown.bind(this);
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

  setMode(mode) {
    this.setState({ mode, errorMessage: '', statusMessage: '' });
  }

  continueWithTable(tableValue) {
    if (this.state.isSubmitting) {
      return;
    }

    const sessionToken = getCustomerSessionToken();
    const parsedTable = parseTableNumber(tableValue);

    if (!parsedTable) {
      this.setState({
        errorMessage: 'Enter a valid table number (example: 5).',
        isSubmitting: false,
      });
      return;
    }

    this.setState({
      isSubmitting: true,
      errorMessage: '',
      statusMessage: `Saving table ${parsedTable}...`,
      tableNumber: parsedTable,
    });

    saveCustomerTable(sessionToken, parsedTable)
      .then((tableno) => {
        this.setState({
          statusMessage: `Table ${tableno} confirmed. Opening menu...`,
          isSubmitting: false,
        });
        window.location.replace('/place_order');
      })
      .catch((error) => {
        this.setState({
          errorMessage: error.message || 'Unable to save table number.',
          statusMessage: '',
          isSubmitting: false,
        });
      });
  }

  handleScan(data) {
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
      errorMessage: parsedTable ? '' : 'Could not read table number from QR. Enter it manually.',
    });

    if (parsedTable) {
      this.continueWithTable(parsedTable);
    } else {
      this.setMode('manual');
    }
  }

  handleError(err) {
    console.error(err);
    this.setState({
      cameraError:
        'Camera is not available. Switch to "Enter Table Number" and type your table.',
      mode: 'manual',
    });
    if (this.tableInputRef.current) {
      try {
        this.tableInputRef.current.focus();
      } catch (e) {}
    }
  }

  handleManualSubmit() {
    this.continueWithTable(this.state.tableNumber);
  }

  handleManualKeyDown(event) {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.handleManualSubmit();
    }
  }

  render() {
    const previewStyle = {
      height: 320,
      width: '100%',
      maxWidth: 560,
      margin: 'auto',
      borderRadius: 12,
      overflow: 'hidden',
    };

    const { mode, isSubmitting, tableNumber, scanResult, cameraError } = this.state;

    return (
      <div className="bg table-page">
        <div className="table-card">
          <h1 className="table-title">Select Your Table</h1>
          <p className="table-subtitle">
            Scan the QR on your table, or type the table number manually.
          </p>

          <div className="table-mode-tabs">
            <button
              type="button"
              className={mode === 'scan' ? 'table-tab active' : 'table-tab'}
              onClick={() => this.setMode('scan')}
              disabled={isSubmitting}
            >
              Scan QR
            </button>
            <button
              type="button"
              className={mode === 'manual' ? 'table-tab active' : 'table-tab'}
              onClick={() => this.setMode('manual')}
              disabled={isSubmitting}
            >
              Enter Table Number
            </button>
          </div>

          {mode === 'scan' ? (
            <div className="table-scan-panel">
              <QrReader
                delay={this.state.delay}
                style={previewStyle}
                onError={this.handleError}
                onScan={this.handleScan}
              />
              {scanResult ? (
                <p className="table-hint">Scanned: {scanResult}</p>
              ) : (
                <p className="table-hint">Point your camera at the table QR code.</p>
              )}
              {cameraError ? <p className="table-error">{cameraError}</p> : null}
            </div>
          ) : (
            <div className="table-manual-panel">
              <label htmlFor="table-number-input" className="table-label">
                Table number
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
              />
              <button
                type="button"
                onClick={this.handleManualSubmit}
                className="table-continue-btn"
                disabled={isSubmitting || !tableNumber}
              >
                {isSubmitting ? 'Please wait...' : 'Continue to Menu'}
              </button>
            </div>
          )}

          {this.state.statusMessage ? (
            <p className="table-status">{this.state.statusMessage}</p>
          ) : null}
          {this.state.errorMessage ? (
            <p className="table-error">{this.state.errorMessage}</p>
          ) : null}

          {mode === 'scan' ? (
            <button
              type="button"
              className="table-link-btn"
              onClick={() => this.setMode('manual')}
              disabled={isSubmitting}
            >
              Prefer to type table number instead?
            </button>
          ) : null}
        </div>
      </div>
    );
  }
}
