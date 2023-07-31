

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

const poCollectionRef = collection(db, "po");

class PurchaseOrderDataService {
    addNewPurchaseOrder = (newPO) => {
        return addDoc(poCollectionRef, newPO);
    };

    getAllPurchaseOrder= () => {
        return getDocs(poCollectionRef);
    };


    deletePO = (id) => {
        const poDoc = doc(db, "po", id);
        return deleteDoc(poDoc);
    };
}

export default new PurchaseOrderDataService();