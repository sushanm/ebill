

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


    getDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        const formattedToday = dd + '-' + mm + '-' + yyyy;
        return formattedToday;
    }

    addNewPurchaseOrder = (newPO) => {
        return addDoc(poCollectionRef, newPO);
    };

    addNewPurchaseOrderLocalStorage = (newPO) => {
        let localData = JSON.parse(localStorage.getItem('drkotianPOdata'));
        localData.push(newPO)
        localStorage.setItem('drkotianPOdata', JSON.stringify(localData));
    };

    getAllPOFromDB = () => {
        return getDocs(poCollectionRef);
    }

    getAllProductsFromBD = async () => {
        const data = await this.getAllPOFromDB();
        return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    }

    getAllPurchaseOrder = () => {
        try {
            let refreshDate = localStorage.getItem('drkotianPORefreshDate')
            if (refreshDate !== this.getDate()) {
                this.getAllProductsFromBD().then(data => {
                    localStorage.setItem('drkotianPOdata', JSON.stringify(data));
                    localStorage.setItem('drkotianPORefreshDate', this.getDate());
                    return data;
                }).catch(err => {
                    console.log(err)
                });
            }
            else {
                return JSON.parse(localStorage.getItem('drkotianPOdata'));
            }
        } catch (error) {
            console.log(error)
        }
    }


    deletePO = (id) => {
        const poDoc = doc(db, "po", id);
        return deleteDoc(poDoc);
    };

    deletePOLocalStorage = (id) => {
        let localData = JSON.parse(localStorage.getItem('drkotianPOdata'));
        let tempData = localData.filter(item => item.id !== id);
        localStorage.setItem('drkotianPOdata', JSON.stringify(tempData));
    };
}

export default new PurchaseOrderDataService();