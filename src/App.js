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

function App() {

  const [diplay, SetDisplay] = useState(1);
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

      <div class="container-fluid text-center">
        <div className="row">
          <div className="col">
            <button type="button" className="btn btn-primary m-4"  onClick={()=>SetDisplay(0)}>Add Stock</button>
            <button type="button" className="btn btn-secondary  m-4"  onClick={()=>SetDisplay(1)}>Add Sales</button>
            <button type="button" className="btn btn-secondary  m-4" onClick={()=>SetDisplay(2)}>Near To Expiry</button>
          </div>
        </div>
        {/* <div class="row">
          <div class="col">
            <button onClick={login} >Login</button>
          </div>
        </div> */}
        {
          diplay === 0 &&
          <div class="row">
            <div class="col">
              <AddStock saleMode={false}/>
            </div>
          </div>
        }
        {
          diplay === 1 &&
          <div class="row">
            <div class="col">
              <AddStock saleMode={true}/>
            </div>
          </div>
        }
        {
          diplay === 2 &&
          <div class="row">
            <div class="col">
            <h4>These are near to exipry products</h4>
             <NearToExpiry />
            </div>
          </div>
        }

      </div>
    </div>
  );
}

export default App;
