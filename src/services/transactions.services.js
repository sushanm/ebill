

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    Firestore,
    query, where
} from "firebase/firestore";
import { db } from "../firebase";

const transactionsCollectionRef = collection(db, "transactions");

class TransactionsDataService {

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

    addNewTransation = async (newTransaction) => {
        let id = getYearAndMonth();
        const docSnap = await this.getTransactionById(id);
        if (docSnap.data()) {
            let existingData = docSnap.data();
            existingData.transactions.push(newTransaction)
            existingData.totalAmount = Number(existingData.totalAmount) + (Number(newTransaction.totalPrice) - Number(newTransaction.discount))
            await this.updateTransactions(id, existingData).then((res) => {
                this.addNewTransactionToLocal(id, newTransaction)
            })
        } else {
            this.createNewTransaction(id).then(() => {
                this.addNewTransation(newTransaction);
            })
        }
    };

    addNewTransactionToLocal = (id, newTransaction) => {
        let localData = JSON.parse(localStorage.getItem('drkotianTransdata'));
        const indexToChange = localData.findIndex(item => item.id === id);
        localData[indexToChange].totalAmount = localData[indexToChange].totalAmount + (Number(newTransaction.totalPrice) - Number(newTransaction.discount))
        localData[indexToChange].transactions.push(newTransaction)
        localStorage.setItem('drkotianTransdata', JSON.stringify(localData));
    }

    createNewTransaction = async (yearMonth) => {
        return await setDoc(doc(db, "transactions", yearMonth), {
            id: yearMonth,
            totalAmount: 0,
            transactions: []
        });
    }

    updateTransactions = (id, updatedTransaction) => {
        const productDoc = doc(db, "transactions", id);
        return updateDoc(productDoc, updatedTransaction);
    };

    // handleMigrate = async () => {
    //     const data = await this.getAllTransactions();
    //     let transactions = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    //     if (transactions) {
    //         transactions.forEach(async (transaction, i) => {
    //             let saleDate = transaction.saleDate.split('-');
    //             const id = saleDate[2] + '-' + saleDate[1];
    //             setTimeout(() => {
    //                 this.addNewTransation(transaction, id)
    //             }, i * 2000);
    //         });
    //     }
    // }

    getAllTransactions = async () => {
        try {
            let refreshDate = localStorage.getItem('drkotianTransRefreshDate')
            if (refreshDate !== this.getDate()) {
                await this.getAllTransactionsFromDB().then((data) => {
                    let tempData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
                    localStorage.setItem('drkotianTransdata', JSON.stringify(tempData));
                    localStorage.setItem('drkotianTransRefreshDate', this.getDate());
                    return tempData;
                })
            }
            else {
                return JSON.parse(localStorage.getItem('drkotianTransdata'));
            }
        } catch (error) {
            console.log(error)
        }

    };

    getAllTransactionsFromDB = () => {
        return getDocs(transactionsCollectionRef);
    };

    getTransactionById = (id) => {
        const transactionDoc = doc(db, "transactions", id);
        return getDoc(transactionDoc);
    };

    editTransactionRemove = async (id, trans, itemDetails) => {
        const docSnap = await this.getTransactionById(id);
        if (docSnap.data()) {
            let existingData = docSnap.data();
            let findIndexOfTrans = existingData.transactions.findIndex(item => item.id == trans.id);
            existingData.transactions[findIndexOfTrans].totalPrice = Number(existingData.transactions[findIndexOfTrans].totalPrice) - Number(itemDetails.price)
            existingData.totalAmount = Number(existingData.totalAmount) - Number(itemDetails.price)
            if (existingData.transactions[findIndexOfTrans].items.length == 1) {
                existingData.transactions = existingData.transactions.filter(i => i.id != trans.id);
            } else {
                existingData.transactions[findIndexOfTrans].items = existingData.transactions[findIndexOfTrans].items.filter(item => item.id != itemDetails.id);
            }

            await this.updateTransactions(id, existingData).then((res) => {
                this.updateTransactionToLocal(existingData)
            })
        }
    }

    addCustomerName = async(id, customerName, transID)=>{
        const docSnap = await this.getTransactionById(id);
        if (docSnap.data()) {
            let existingData = docSnap.data();
            let findIndexOfTrans = existingData.transactions.findIndex(item => item.id == transID);
            existingData.transactions[findIndexOfTrans].customerName = customerName;
            
            await this.updateTransactions(id, existingData).then((res) => {
                this.updateTransactionToLocal(existingData)
            })
        }
    }

    updateTransactionToLocal = (data) => {
        localStorage.setItem('drkotianTransdata', JSON.stringify(data));
    }

    forceRefresh = () => {
        try {
            this.getAllTransactionsFromDB().then(data => {
                let tempData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
                localStorage.setItem('drkotianTransdata', JSON.stringify(tempData));
                localStorage.setItem('drkotianTransRefreshDate', this.getDate());
            }).catch(err => {
                console.log(err)
            });
        } catch (error) {
            console.log(error)
        }
    }
}


function getYearAndMonth() {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = yyyy + '-' + mm;
    return formattedToday;
}

export default new TransactionsDataService();