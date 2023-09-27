

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

const spCollectionRef = collection(db, "sp");

class SwarnaPrshanaDataService {

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

    addSwarnaPrashanDate = async (newDate) => {
        const docSnap = await this.getAllDates();
        if (docSnap.data()) {
            let existingData = docSnap.data();
            console.log(existingData)
            let newDateObj = {
                date: newDate,
                id: Number(existingData.length) + 1
            }
            if (existingData) {
                existingData.push(newDateObj)
            } else {
                existingData = newDateObj;
            }
            await this.updateDate(existingData).then((res) => {
                console.log(res)
                //add to local
            })
        }
    };

    updateDate = (updatedSpDates) => {
        const productDoc = doc(db, "sp", "dates");
        return updateDoc(productDoc, updatedSpDates);
    };

    getAllDates = () => {
        const transactionDoc = doc(db, "sp", 'dates');
        return getDoc(transactionDoc);
    };

}

export default new SwarnaPrshanaDataService();