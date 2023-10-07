

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
            if (existingData.dates) {
                let newDateObj = {
                    date: newDate,
                    id: Math.random().toString(36).slice(2)
                }
                if (existingData.dates.findIndex(item => item.date === newDate) < 0) {
                    existingData.dates.push(newDateObj)
                }
            } else {
                let newDateObj = {
                    date: newDate,
                    id: Math.random().toString(36).slice(2)
                }
                existingData.dates = [newDateObj];
            }
            await this.updateDate(existingData).then((res) => {
                // console.log(res)
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

    getAllKids = () => {
        const transactionDoc = doc(db, "sp", 'kids');
        return getDoc(transactionDoc);
    };

    updateKids = (updatedSpDates) => {
        const productDoc = doc(db, "sp", "kids");
        return updateDoc(productDoc, updatedSpDates);
    };

    addNewKids = async (kidName, age) => {
        const docSnap = await this.getAllKids();
        if (docSnap.data()) {
            let existingData = docSnap.data();
            if (existingData.kids) {
                let newDateObj = {
                    name: kidName,
                    age: age,
                    id: Math.random().toString(36).slice(2)
                }
                if (existingData.kids.findIndex(item => item.name === kidName) < 0) {
                    existingData.kids.push(newDateObj)
                }
            } else {
                let newDateObj = {
                    date: kidName,
                    age: age,
                    id: Math.random().toString(36).slice(2)
                }
                existingData.kids = [newDateObj];
            }
            await this.updateKids(existingData).then((res) => {
                //  console.log(res)
                //add to local
            })
        }
    };

    spManageGetAll = () => {
        const transactionDoc = doc(db, "sp", 'swarnaPrashana');
        return getDoc(transactionDoc);
    }

    spManageUpdate = async (updatedSp) => {

        const productDoc = doc(db, "sp", "swarnaPrashana");
        const upadted = await updateDoc(productDoc, updatedSp)
    };

    spManageAdd = async (updatedObj, type) => {
     
        const docSnap = await this.spManageGetAll();
        let existingData = docSnap.data();

        if (type === 'date') {
            if (existingData) {
                if (existingData.spDates) {
                    const index = existingData.spDates.findIndex(item => item.date === updatedObj.date)
                    if (index === -1) {
                        existingData.spDates.unshift({
                            date: updatedObj.date,
                            id: Math.random().toString(36).slice(2),
                            status: 'wip'
                        })
                    }
                } else {
                    existingData.spDates = [{
                        date: updatedObj.date,
                        id: Math.random().toString(36).slice(2),
                        status: 'wip'
                    }]
                }
                if (existingData.kids) {
                    existingData.kids.forEach(kid => {
                        if (kid.spDates) {
                            const index = kid.spDates.findIndex(item => item.date === updatedObj.date)
                            if (index === -1) {
                                kid.spDates.unshift({
                                    date: updatedObj.date,
                                    status: "wip"
                                })
                            }
                        }
                        else {
                            kid.spDates = [{
                                date: updatedObj.date,
                                status: "wip"
                            }]
                        }
                    });
                }

            }

            await this.spManageUpdate(existingData).then((res) => {
                return res;
                // console.log(res)
                //add to local
            })
        }
        if (type === 'sp') {
            if (existingData) {
                if (existingData.kids) {
                    if (!updatedObj.id) {
                        //New kid record
                        let kidData = {
                            name: updatedObj.name,
                            id: Math.random().toString(36).slice(2),
                            spDates: existingData.spDates,
                            age: updatedObj.age,
                            weight: updatedObj.weight
                        }
                        existingData.kids.unshift(kidData);
                    } else {

                        //Existing kid update sp dates

                        let kidData = existingData.kids.filter(item => item.id === updatedObj.id)[0];

                        if (kidData) {
                            if (updatedObj.age) {
                                if (kidData.age !== updatedObj.age) {
                                    existingData.kids.filter(item => item.id === updatedObj.id)[0].age = updatedObj.age;
                                }
                               
                            }
                            if(updatedObj.weight){
                                if (kidData.weight !== updatedObj.weight) {
                                    existingData.kids.filter(item => item.id === updatedObj.id)[0].weight = updatedObj.weight;
                                }
                            }
                            if(updatedObj.name){
                                if (kidData.name !== updatedObj.name) {
                                    existingData.kids.filter(item => item.id === updatedObj.id)[0].name = updatedObj.name;
                                }
                            }
                        }

                        if (kidData) {
                            if (kidData.spDates && updatedObj.date) {
                                let tempKidSp = existingData.kids.filter(item => item.id === updatedObj.id)[0].spDates.filter(item => item.date === updatedObj.date)
                                if (tempKidSp) {
                                    existingData.kids.filter(item => item.id === updatedObj.id)[0].spDates.filter(item => item.date === updatedObj.date)[0].status = 'done'
                                } else {
                                    existingData.kids.filter(item => item.id === updatedObj.id)[0].spDates.unshift({
                                        date: updatedObj.date,
                                        status: "done"
                                    })
                                }
                            }
                        }
                    }
                } else {
                    //No records at all add new Kid, one time used
                    let kidData = {
                        name: updatedObj.name,
                        age: updatedObj.age,
                        weight: updatedObj.weight,
                        id: Math.random().toString(36).slice(2),
                        spDates: existingData.spDates ? existingData.spDates : []
                    }
                    existingData.kids = [kidData];
                }
            }
            let numberOfSp = 0;
            if (existingData.kids) {
                existingData.kids.forEach(kid => {
                    if (kid.spDates) {
                        kid.spDates.forEach(d => {
                            if (d.date === updatedObj.date && d.status === 'done') {
                                numberOfSp = numberOfSp + 1;
                            }
                        });
                    }
                });
            }
            if (existingData.spDates) {
                if (existingData.spDates.filter(item => item.date === updatedObj.date)[0]) {
                    existingData.spDates.filter(item => item.date === updatedObj.date)[0].numberOfSp = numberOfSp
                }
            }
            
            await this.spManageUpdate(existingData).then((res) => {
                return res;
                // console.log(res)
                //add to local
            })

        }

    };

}

export default new SwarnaPrshanaDataService();