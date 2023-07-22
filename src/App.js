import {
  signInWithEmailAndPassword,
  onAuthStateChanged,
  signOut,
} from "firebase/auth";
import './App.css';
import AddStock from "./components/AddStock";
import { auth } from './firebase';

function App() {

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

      <div class="container text-center">
        <div className="row">
          <div className="col">
            <button type="button" className="btn btn-primary m-4">Add Stock</button>
            <button type="button" className="btn btn-secondary  m-4">Add Sales</button>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <button onClick={login} >Login</button>
          </div>
        </div>
        <div class="row">
          <div class="col">
            <AddStock />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
