

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

const transactionCollectionRef = collection(db, "pt");

class TransactionDataService {
    addNewTransation = (newTransaction) => {
        return addDoc(transactionCollectionRef, newTransaction);
    };

    getAllPatients = () => {
        const transactionDoc = doc(db, "pt", 'pt');
        return getDoc(transactionDoc);
    };
}

export default new TransactionDataService();