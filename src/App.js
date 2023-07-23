import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import './App.css';
import AddStock from "./components/AddStock";
import { auth } from './firebase';
import { useState } from 'react';
import NearToExpiry from "./components/NearToExpiry";
import LowStock from "./components/LowStock";

function App() {

  const [diplay, SetDisplay] = useState(0);
  const login = async () => {
    const userName = 'kotianayurveda@gmail.com';
    const password = 'drK@t1an';

    try {
      const user = await signInWithEmailAndPassword(
        auth,
        userName,
        password
      );
      console.log(user);
    } catch (error) {
      console.log(error.message);
    }
  }

  return (
    <div className="App">

      <div className="container-fluid text-center">
        <div className="row">
          <div className="col">
            <button type="button" className="btn btn-primary m-4"  onClick={()=>SetDisplay(0)}>Stock & Sale</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={()=>SetDisplay(1)}>Near To Expiry</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={()=>SetDisplay(2)}>Low Stock</button>
          </div>
        </div>
        {/* <div className="row">
          <div className="col">
            <button onClick={login} >Login</button>
          </div>
        </div> */}
        {
          diplay === 0 &&
          <div className="row">
            <div className="col">
              <AddStock saleMode={false}/>
            </div>
          </div>
        }
        {
          diplay === 1 &&
          <div className="row">
            <div className="col">
            <h4>These are near to exipry products</h4>
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
      </div>
    </div>
  );
}

export default App;
