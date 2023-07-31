

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

    getAllTransactions = () => {
        return getDocs(transactionCollectionRef);
    };

    getTransactionByYear = async (year) => {
        const citiesRef = collection(db, "transaction");
        const q = query(citiesRef, where("year", "==", true));
        const querySnapshot = await getDocs(q);
        querySnapshot.forEach((doc) => {
            console.log(doc.id, " => ", doc.data());
        });
    }
}

export default new TransactionDataService();