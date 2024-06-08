

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

class AuditService {
    getActiveAuditId = () => {
        const transactionDoc = doc(db, "audit", 'activeAuditId');
        return getDoc(transactionDoc);
    };

    getAuditInformation = () => {
        const transactionDoc = doc(db, "audit", 'currentAudit');
        return getDoc(transactionDoc);
    }

    conductAudit = async (auditInformation) => {
        // let auditInformation = {};
        // await this.getAuditInformation().then(res => {
        //     auditInformation = res.data();
        //     if (auditInformation.products.find(o => o.id === product.id)) {
        //         auditInformation.products.forEach((element, index) => {
        //             if (element.id === product.id) {
        //                 if (auditInformation.products[index].batch.find(item => item.batchId === product.batch[0].batchId)) {
        //                     let indexOfBatch = auditInformation.products[index].batch.findIndex(item => item.batchId === product.batch[0].batchId);
        //                     auditInformation.products[index].batch[indexOfBatch].actualStock = product.batch[0].actualStock;
        //                     auditInformation.products[index].batch[indexOfBatch].isAuditPassed = product.batch[0].isAuditPassed;
        //                     auditInformation.products[index].batch[indexOfBatch].systomStock = product.batch[0].systomStock
        //                 } else {
        //                     auditInformation.products[index].batch.push(product.batch[0]);
        //                 }
        //             }
        //         });
        //     } else {
        //         auditInformation.products.push(product)
        //     }
        // })
         const productDoc = doc(db, "audit", "currentAudit");
        return updateDoc(productDoc, auditInformation);
    }

    startAudit = (products) => {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        today = mm + '/' + dd + '/' + yyyy;

        let startFreshAudit = {
            startDate: today,
            products: products
        }
        const productDoc = doc(db, "audit", "currentAudit");
        return updateDoc(productDoc, startFreshAudit);
    }

}

export default new AuditService();