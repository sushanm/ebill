import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import './App.css';
import AddStock from "./components/AddStock";
import { auth } from './firebase';
import { useState, useEffect } from 'react';
import NearToExpiry from "./components/NearToExpiry";
import LowStock from "./components/LowStock";
import Report from "./components/Report";
import LocalStorageServices from "./services/localStorage.services";
import purchaseorderServices from "./services/purchaseorder.services";
import PurchaseOrder from "./components/PurchaseOrder";
import transactionsServices from "./services/transactions.services";
import SwarnaPrashana from "./components/SwarnaPrashana";
import Patient from "./components/Patient";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import Form from 'react-bootstrap/Form';

function App(changeTab) {


  const [diplay, SetDisplay] = useState(1);
  const [showLoading, SetShowLoading] = useState(false);
  const [showModel, SetShowModel] = useState(false);
  const [configText, SetConfigText] = useState('');
  const login = async () => {

    let dataFromLocal = JSON.parse(localStorage.getItem('getDrKotianConnection'));
    const arryData = dataFromLocal.split(';');
    const userName = arryData[6];
    const password = arryData[7];

    try {
      const user = await signInWithEmailAndPassword(
        auth,
        userName,
        password
      );
    } catch (error) {
      console.log(error.message);
    }
  }

  useEffect(() => {
    let dataFromLocal = JSON.parse(localStorage.getItem('getDrKotianConnection'));
    if (!dataFromLocal) {
      console.log(dataFromLocal)
      SetShowModel(true)
    } else {
      SetShowModel(false)
    }
  })


  useEffect(() => {
    login();
    LocalStorageServices.forceRefresh();
    purchaseorderServices.forceRefresh();
    transactionsServices.forceRefresh();
  }, [])

  useEffect(() => {
    SetDisplay(0)
  }, [changeTab])

  const refresh = () => {
    SetShowLoading(true)
    LocalStorageServices.forceRefresh();
    purchaseorderServices.forceRefresh();
    transactionsServices.forceRefresh();
    setTimeout(() => {
      window.location.reload();
      SetShowLoading(false)
    }, "2000");
  }

  const handleClose = () => {
    SetShowModel(false)
  }

  const saveConfig = () => {
    SetShowModel(false)
    localStorage.setItem("getDrKotianConnection", JSON.stringify(configText));
  }


  return (
    <div className="App">

      <Modal show={showModel} onHide={handleClose} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Set Configuration</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3" controlId="exampleForm.ControlTextarea1">
              <Form.Label>Enter Configuration</Form.Label>
              <Form.Control as="textarea" rows={3} onChange={(e) => SetConfigText(e.target.value.trim())} />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={saveConfig} >
            Save Config
          </Button>
        </Modal.Footer>
      </Modal>

      <div className="container-fluid text-center">
        <div className="row">
          <div className="col">
            {/* <button onClick={login} >Login</button> */}
            <button type="button" className="btn btn-secondary m-4" onClick={() => SetDisplay(0)} style={{ backgroundColor: diplay === 0 ? '#0d6efd' : '#565e64' }}>Stock & Sale</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={() => SetDisplay(1)} style={{ backgroundColor: diplay === 1 ? '#0d6efd' : '#565e64' }}>Near To Expiry</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={() => SetDisplay(2)} style={{ backgroundColor: diplay === 2 ? '#0d6efd' : '#565e64' }}>Low Stock</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={() => SetDisplay(3)} style={{ backgroundColor: diplay === 3 ? '#0d6efd' : '#565e64' }}>Report</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={() => SetDisplay(4)} style={{ backgroundColor: diplay === 4 ? '#0d6efd' : '#565e64' }}>Purchase Order</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={() => SetDisplay(5)} style={{ backgroundColor: diplay === 5 ? '#0d6efd' : '#565e64' }}>Swarna Prashana</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={() => SetDisplay(6)} style={{ backgroundColor: diplay === 6 ? '#0d6efd' : '#565e64' }}>Patient</button>
            <button className="btn btn-secondary force-refresh" onClick={refresh} >Refresh</button>
          </div>
        </div>

        {
          showLoading &&
          <div className="row row-loader">
            <div className="loader"></div>
          </div>
        }
        {!showLoading &&
          <div className="div">


            {
              diplay === 0 &&
              <div className="row">
                <div className="col">
                  <AddStock saleMode={false} />
                </div>
              </div>
            }
            {
              diplay === 1 &&
              <div className="row">
                <div className="col">
                  <NearToExpiry />
                </div>
              </div>
            }
            {
              diplay === 2 &&
              <div className="row">
                <div className="col">
                  <h4>These are low stock</h4>
                  <LowStock />
                </div>
              </div>
            }
            {
              diplay === 3 &&
              <div className="row">
                <div className="col">
                  <h4>These Reports</h4>
                  <Report />
                </div>
              </div>
            }
            {
              diplay === 4 &&
              <div className="row">
                <div className="col">
                  <h4>Purchase Order</h4>
                  <PurchaseOrder />
                </div>
              </div>
            }
            {
              diplay === 5 &&
              <div className="row">
                <div className="col">
                  <h4>Swarna Prashana</h4>
                  <SwarnaPrashana />
                </div>
              </div>
            }
            {
              diplay === 6 &&
              <div className="row">
                <div className="col">
                  <h4>Patient Records</h4>
                  <Patient />
                </div>
              </div>
            }
          </div>
        }
      </div>
    </div>
  );
}

export default App;
