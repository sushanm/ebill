

import {
  collection,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase";

const stockCollectionRef = collection(db, "stock");

class StockDataService {
  addNewProduct = (newBook) => {
    return addDoc(stockCollectionRef, newBook);
  };

  updateProduct = (id, updatedProduct) => {
    const productDoc = doc(db, "stock", id);
    return updateDoc(productDoc, updatedProduct);
  };

  deleteBook = (id) => {
    const bookDoc = doc(db, "stock", id);
    return deleteDoc(bookDoc);
  };

  getAllProducts = () => {
    return getDocs(stockCollectionRef);
  };

  getProduct = (id) => {
    const productDoc = doc(db, "stock", id);
    return getDoc(productDoc);
  };
}

export default new StockDataService();