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
  const [transactioByDate, SetTransactionByDate] = useState([]);
  const [transactioByDateTotalPrice, SetTransactionByDateTotalPrice] = useState();
  const [transactionFilterDate, SetTransactionFilterDate] = useState((new Date()).toISOString().substring(0, 10));

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

  useEffect(() => {
    setTimeout(() => {
      transactionsByDate((new Date()).toISOString().substring(0, 10))
    }, "100");
  }, [transactioByMonth])

  const filterByDate = (val) => {
    SetTransactionFilterDate(val)
    transactionsByDate(val)
  }

  const transactionsByDate = (date) => {
    if (transactioByMonth) {
      let yearMonth = date.split('-')[0] + "-" + date.split('-')[1]
      const dateFormat = date.split('-')[2] + "-" + date.split('-')[1] + "-" + date.split('-')[0]
      let tempData = transactioByMonth.filter(item => item.id === yearMonth)[0]
      if (tempData) {
        tempData = tempData.transactions.filter(ele => ele.saleDate === dateFormat);
        let tempTotalPrice = 0;
        tempData.forEach(element => {
          tempTotalPrice = Number(tempTotalPrice) + (Number(element.totalPrice) - Number(element.discount))
        });
        SetTransactionByDateTotalPrice(tempTotalPrice);
        SetTransactionByDate(tempData)
      }
    }
  }

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
        <div className="col col-report row-border">
          <div className="row row-report ">
            <div className="col"><h4 className='report-title'>Transactions</h4></div>
            <div className="col"><input type={'date'} value={transactionFilterDate} onChange={(e) => filterByDate(e.target.value)}></input></div>
          </div>
          <div className="row row-h">
            <div className="col-1">
              SL No.
            </div>
            <div className="col-9">
              <div className="row">
                <div className="col-6">
                  Name
                </div>
                <div className="col-3">
                  Price
                </div>
                <div className="col-3">
                  Quantity
                </div>
              </div>
            </div>

            <div className="col-2">
              Total Price
            </div>
          </div>
          {
            transactioByDate.map((doc, index) => {
              return (
                <div className='row product-name-row' key={doc.id} >
                  <div className="col-1" >
                    {index + 1}
                  </div>
                  <div className="col-9">
                    {
                      doc.items.map((b, i) => {
                        return (
                          <div className="row">
                            <div className="col-6">
                              {b.name}
                            </div>
                            <div className="col-3">
                              {b.price}
                            </div>
                            <div className="col-3">
                              {b.quantity}
                            </div>
                          </div>
                        )
                      })
                    }
                  </div>
                  <div className="col-2">
                    {Number(doc.totalPrice) - Number(doc.discount)}
                  </div>
                </div>
              )
            })
          }
          <div className="row row-h">
            <div className="col-1">

            </div>
            <div className="col-9">
              <div className="row">
                <div className="col-6">

                </div>
                <div className="col-3">

                </div>
                <div className="col-3">
                  Total
                </div>
              </div>
            </div>

            <div className="col-2">
              {transactioByDateTotalPrice}
            </div>
          </div>

        </div>
        <div className="col col-report">
          <div className="row row-report">
            <h4 className='report-title'>Transaction By Month</h4>
            <div className="row row-h">
              <div className="col-2">SL. No</div>
              <div className="col">YYY-MM</div>
              <div className="col">Total Value</div>
            </div>
            {
              transactioByMonth.map((b, i) => {
                return (
                  <div className="row">
                    <div className="col-2">{i + 1}</div>
                    <div className="col">{b.id}</div>
                    <div className="col">{b.totalAmount}</div>
                  </div>
                )
              })
            }

          </div>
        </div>
      </div>
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

    </div>
  )
}

export default Report