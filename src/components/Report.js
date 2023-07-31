import React from 'react'
import { useState } from 'react';
import LocalStorageServices from '../services/localStorage.services';
import TransactionDataService from "../services/transaction.services"
import { useEffect } from 'react';

function Report() {

  const [products, setProducts] = useState([]);
  const [totalNumberOfProducts, SetTotalNumberOfProducts] = useState();
  const [totalQuantity, SetTotalQuantity] = useState();
  const [totalPrice, SetTotalPrice] = useState();
  const date = new Date();
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
  const [transactioByMonth, SetTransactionByMonth] = useState([]);

  const getAllProducts = async () => {
    let allProducts = LocalStorageServices.getAllProducts();
    let tempQantity = 0;
    let tempValue = 0;
    SetTotalNumberOfProducts(allProducts.length)
    allProducts.forEach(item => {
      item.batch.forEach(batch => {
        tempValue = tempValue + Number(batch.price) * Number(batch.quantity);
      })
      tempQantity = tempQantity + Number(item.totalQuantity);
    })
    SetTotalPrice(tempValue);
    setProducts(allProducts);
    SetTotalQuantity(tempQantity);
  }

  const getAllTransactions = async () => {

    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1; // Months start at 0!
    let dd = today.getDate();

    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;

    const formattedToday = dd + '-' + mm + '-' + yyyy;

   
    const data = await TransactionDataService.getTransactionByYear(yyyy).then((res)=>{
      console.log(res)
    });
   // let allTransactions = data.docs.map((doc) => ({ ...doc.data() }));
    console.log(data)
  }

  useEffect(() => {
    getAllProducts();
    getAllTransactions();
  }, [])

  return (
    <div className="row">
      <div className="col col-report">
        <div className="row row-report">
          <h4 className='report-title'>Total Products and value</h4>
          <div className="row row-h">
            <div className="col">Total Products</div>
            <div className="col">Total Quantity</div>
            <div className="col">Total Value</div>
          </div>
          <div className="row">
            <div className="col">{totalNumberOfProducts}</div>
            <div className="col">{totalQuantity}</div>
            <div className="col">{totalPrice}</div>
          </div>
        </div>
      </div>
      <div className="col">
        <div className="row row-report">
          <h4 className='report-title'>Transaction By Month - {date.getFullYear()}</h4>
          <div className="row row-h">
            <div className="col">Total Products</div>
            <div className="col">Total Quantity</div>
            <div className="col">Total Value</div>
          </div>
          <div className="row">
            <div className="col"></div>
            <div className="col"></div>
            <div className="col"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Report