

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Firestore
} from "firebase/firestore";
import { db } from "../firebase";

const transactionCollectionRef = collection(db, "transaction");

class TransactionDataService {
    addNewTransation = (newTransaction) => {
        return addDoc(transactionCollectionRef, newTransaction);
    };
}

export default new TransactionDataService();