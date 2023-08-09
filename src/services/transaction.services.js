

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Firestore,
    query, where
} from "firebase/firestore";
import { db } from "../firebase";

const transactionCollectionRef = collection(db, "transaction");

class TransactionDataService {
    addNewTransation = (newTransaction) => {
        return addDoc(transactionCollectionRef, newTransaction);
    };
}

export default new TransactionDataService();