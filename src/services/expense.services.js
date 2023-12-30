

import {
    collection,
    getDocs,
    getDoc,
    addDoc,
    updateDoc,
    deleteDoc,
    doc,
    Firestore,
    query, where, setDoc
} from "firebase/firestore";
import { db } from "../firebase";

const expenseCollectionRef = collection(db, "expense");

class ExpenseDataService {


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
    getTransactionById = (id) => {
        const transactionDoc = doc(db, "expense", id);
        return getDoc(transactionDoc);
    };

    updateTransactions = (id, updatedTransaction) => {
        const productDoc = doc(db, "expense", id);
        return updateDoc(productDoc, updatedTransaction);
    };


    getAllTransactionsFromDB = () => {
        return getDocs(expenseCollectionRef);
    };

    getAllTransactions = async () => {
        try {
            let refreshDate = localStorage.getItem('drkotianExpenseRefreshDate')

            if (refreshDate !== this.getDate()) {
                await this.getAllTransactionsFromDB().then((data) => {
                    let tempData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
                    localStorage.setItem('drkotianExpensedata', JSON.stringify(tempData));
                    localStorage.setItem('drkotianExpenseRefreshDate', this.getDate());
                    return tempData;
                })
            }
            else {
                return JSON.parse(localStorage.getItem('drkotianExpensedata'));
            }
        } catch (error) {
            console.log(error)
        }

    };

    createNewTransaction = async (yearMonth) => {
        return await setDoc(doc(db, "expense", yearMonth), {
            id: yearMonth,
            totalAmount: 0,
            transactions: []
        });
    }

    addNewTransation = async (newTransaction) => {
        let id = getYearAndMonth(newTransaction.date);
        const docSnap = await this.getTransactionById(id);
        if (docSnap.data()) {
            let existingData = docSnap.data();
            existingData.transactions.push(newTransaction)
            existingData.totalAmount = Number(existingData.totalAmount) + Number(newTransaction.amount)
            await this.updateTransactions(id, existingData).then((res) => {
              //  this.addNewTransactionToLocal(id, newTransaction)
            })
        } else {
            this.createNewTransaction(id).then(() => {
                this.addNewTransation(newTransaction);
            })
        }
    };


}

function getYearAndMonth(date) {
    const today = new Date(date);
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = yyyy + '-' + mm;
    return formattedToday;
}

export default new ExpenseDataService();