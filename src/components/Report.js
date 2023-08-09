import React from 'react'
import { useState } from 'react';
import StockDataService from "../services/stock.services"
import LocalStorageServices from '../services/localStorage.services';
import TransactionsDataService from "../services/transactions.services"
import { useEffect } from 'react';

function Report() {

  const [products, setProducts] = useState([]);
  const [duplicateProducts, setDuplicateProducts] = useState([]);
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

    let temp = allProducts;
    temp.forEach((ele1, index1) => {
      temp.forEach((ele2, index2) => {
        if (ele1.name === ele2.name) {
          if (index1 !== index2) {
            ele1.duplicate = true;
          }
        }
      });
    });

    setDuplicateProducts(temp)

  }

  const getAllTransactions = async () => {
    await TransactionsDataService.getAllTransactions().then((data) => {
      SetTransactionByMonth(data)
    })
  }

  useEffect(() => {
    getAllProducts();
    getAllTransactions();
  }, [])

  const removeHandler = async (id) => {
    await StockDataService.deleteProduct(id);
    LocalStorageServices.removeProduct(id);
    setTimeout(() => {
      getAllProducts();
    }, "1000");
  }
  return (
    <div className="div">
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
            <h4 className='report-title'>Duplicate Products Added</h4>
            <div className="row row-h">
              <div className="col-6">Name</div>
              <div className="col-5">
                <div className="row">Batch Details</div>
                <div className="row">
                  <div className="col-4">
                    Price
                  </div>
                  <div className="col-4">
                    Quantity
                  </div>
                  <div className="col-4">
                    Expiry
                  </div>
                </div>
              </div>
              <div className="col-1">Action</div>
            </div>


            {
              duplicateProducts.map((doc, index) => {
                return (
                  doc.duplicate &&
                  <div className='row product-name-row' key={doc.id} >
                    <div className="col-6" >
                      {doc.name}
                    </div>
                    <div className="col-5">
                      {
                        doc.batch.map((b, i) => {
                          return (
                            <div className='row product-name-row' key={i} style={{ backgroundColor: b.expiry === true ? b.colorCode : 'white' }}  >
                              <div className="col-4">
                                {b.price}
                              </div>
                              <div className="col-4">  {b.quantity}</div>
                              <div className="col-4">  {b.expiryDate}</div>
                            </div>
                          )
                        })
                      }
                    </div>
                    <div className="col-1">
                      <button onClick={() => removeHandler(doc.id)}>Remove</button>
                    </div>
                  </div>
                )
              })
            }
          </div>
        </div>
      </div>
      <div className="row">
        
      </div>
    </div>
  )
}

export default Report