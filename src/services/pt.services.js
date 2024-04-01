

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

class PTDataService {


    // getAllPatients = () => {
    //     const transactionDoc = doc(db, "pt", 'pt');
    //     return getDoc(transactionDoc);
    // };

    getAllPatients = () => {
        let data = localStorage.getItem('drkotianPstdata')
        let localData = [];
        if (data === 'undefined') {
            localData = [];
        } else {
            localData = JSON.parse(data)
        }
        localData.sort((a,b)=>{return(a.status-b.status)});
        return localData;
    };

    getAllPatientsForce = async () => {
        const transactionDoc = doc(db, "pt", 'pt');
        await getDoc(transactionDoc).then((res) => {
            localStorage.setItem('drkotianPstdata', JSON.stringify(res.data().pst));
        })
    }

    addNewPst = async (existing, newPst) => {
        let data = this.getAllPatients();
        let existingData = {}
        if (data) {
            existingData.pst = data
            if (existing) {
                existingData.pst.forEach(item => {
                    if (item.id === newPst.id) {
                        Object.keys(item).forEach(function (key) {
                            item[key] = newPst[key];
                        })
                    }
                });
            } else {
                existingData.pst.push(newPst)
            }

        } else {
            existingData.pst = [newPst];
        }

        console.log(existingData)

        await this.updatePst(existingData).then((res) => {
            this.addOrUpdatePstLocalData(!existing, newPst)
            return res;
        })
    };

    addOrUpdatePstLocalData = (add, data) => {
        if (add) {
            //Add New to local
            let localData = JSON.parse(localStorage.getItem('drkotianPstdata'));
            if (localData) {
                localData.push(data)
            } else {
                localData = [data]
            }
            localStorage.setItem('drkotianPstdata', JSON.stringify(localData));
        } else {
            let localData = JSON.parse(localStorage.getItem('drkotianPstdata'));
            localData.forEach(item => {
                if (item.id === data.id) {
                    Object.keys(item).forEach(function (key) {
                        item[key] = data[key];
                    })
                }
            });

            localStorage.setItem('drkotianPstdata', JSON.stringify(localData));
        }
    }

    updatePst = (updatedPst) => {
        const productDoc = doc(db, "pt", "pt");
        return updateDoc(productDoc, updatedPst);
    };


    getAllTherapy = () => {
        let data = localStorage.getItem('drkotianTherapydata')
        let localData = [];
        if (data === 'undefined') {
            localData = [];
        } else {
            localData = JSON.parse(data)
        }
        return localData;
    };

    getAllTherapyForce = async () => {
        const transactionDoc = doc(db, "pt", 'therapy');
        await getDoc(transactionDoc).then((res) => {
            localStorage.setItem('drkotianTherapydata', JSON.stringify(res.data().therapy));
        })
    }

    addNewTherapy = async (newTherapy) => {
        let data = this.getAllTherapy();
        let existingData = {}
        if (data) {
            existingData.therapy = data
            newTherapy.id = Math.random().toString(36).slice(2);
            existingData.therapy.push(newTherapy)

        } else {
            newTherapy.id = Math.random().toString(36).slice(2);
            existingData.therapy = [newTherapy];
        }
        console.log(existingData)
        await this.updateTherapy(existingData).then((res) => {
            this.addOrUpdateTherapyLocalData(true, newTherapy)
            return res;
        })
    };

    updateTherapy = (updatedTherapy) => {
        const productDoc = doc(db, "pt", "therapy");
        return updateDoc(productDoc, updatedTherapy);
    };

    addOrUpdateTherapyLocalData = (add, data) => {
        if (add) {
            //Add New to local
            let localData = JSON.parse(localStorage.getItem('drkotianTherapydata'));
            if (localData) {
                localData.push(data)
            } else {
                localData = [data]
            }
            localStorage.setItem('drkotianTherapydata', JSON.stringify(localData));
        } else {

        }
    }
}

export default new PTDataService();