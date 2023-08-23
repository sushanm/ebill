import React from 'react'
import { useState } from 'react';
import StockDataService from "../services/stock.services"
import LocalStorageServices from '../services/localStorage.services';
import TransactionsDataService from "../services/transactions.services"
import { useEffect } from 'react';
import Invoice from './Invoice';
import { useNavigate } from 'react-router-dom';

function Report() {

  const [products, setProducts] = useState([]);
  const [productsWithoutGST, setProductsWithoutGST] = useState([]);
  const [duplicateProducts, setDuplicateProducts] = useState([]);
  const [totalNumberOfProducts, SetTotalNumberOfProducts] = useState();
  const [totalQuantity, SetTotalQuantity] = useState();
  const [totalPrice, SetTotalPrice] = useState();
  const [transactioByMonth, SetTransactionByMonth] = useState([]);
  const [transactioByDate, SetTransactionByDate] = useState([]);
  const [transactionsByItems, SetTransactionsByItems] = useState([]);
  const [transactioByDateTotalPrice, SetTransactionByDateTotalPrice] = useState();
  const [transactionFilterDate, SetTransactionFilterDate] = useState((new Date()).toISOString().substring(0, 10));
  const [transactionsByItemsDisplay, SetTransactionsByItemsDisplay] = useState([]);
  const [byMonth, SetByMonth] = useState(3)
  const [byQuantity, SetByQantity] = useState(3)

  const getAllProducts = async () => {
    let allProducts = LocalStorageServices.getAllProducts();
    if (allProducts) {
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
      console.log(allProducts.filter(item=>item.gst==null));
      setProductsWithoutGST(allProducts.filter(item=>item.gst==null));
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
    } else {
      setTimeout(function () {
        getAllProducts();
      }, 2000)
    }
  }

  const getAllTransactions = async () => {
    await TransactionsDataService.getAllTransactions().then((data) => {
      SetTransactionByMonth(data)
      let allData = [];
      if (data) {
        data.forEach(element => {
          if (element.transactions) {
            element.transactions.forEach(trans => {
              let saleDate = trans.saleDate;
              let monthDiff = monthDifference(saleDate)
              trans.items.forEach(items => {
                let newObj = {
                  ...items,
                  saleDate: saleDate,
                  monthDiff: monthDiff
                }
                allData.push(newObj)
              });
            });
          }
        });
      }
      SetTransactionsByItems(allData);
    })
  }

  const filterItemsByMonthAndQuantity = (month, quantity) => {
    let itemArrayByMonth = [];
    if (transactionsByItems) {
      let itemsByGroup = groupBy(transactionsByItems, 'id');
      var result = Object.keys(itemsByGroup).map((key) => [key, itemsByGroup[key]]);
      result.forEach(element => {
        element[1].forEach(items => {
          if (items.monthDiff >= month) {
            itemArrayByMonth.push(items);
          }
        });
      });
    }

    let groupByItem = groupBy(itemArrayByMonth, 'id');
    var result2 = Object.keys(groupByItem).map((key) => [key, groupByItem[key]]);
    console.log(result2)
    let itemsByMonthAndQantity = [];
    result2.forEach(element => {
      let totalQunatity = 0
      element[1].forEach(items => {
        totalQunatity = totalQunatity + Number(items.quantity);
        if (totalQunatity >= quantity) {
          items.totalQunatity = totalQunatity;
          if (itemsByMonthAndQantity.filter(val => val.id === items.id).length === 0) {
            itemsByMonthAndQantity.push(items);
          }
          else {
            let index = itemsByMonthAndQantity.findIndex(i => i.id === items.id)
            itemsByMonthAndQantity[index].totalQunatity = totalQunatity;
          }
        }
      });
    });
    SetTransactionsByItemsDisplay(itemsByMonthAndQantity)
  }

  var groupBy = function (xs, key) {
    return xs.reduce(function (rv, x) {
      (rv[x[key]] = rv[x[key]] || []).push(x);
      return rv;
    }, {});
  };


  let today = new Date();
  let currentYear = today.getFullYear();
  let currentMonth = today.getMonth();

  function monthDifference(date) {
    const monthYear = date.split('-');
    const batchYear = Number(monthYear[2]);
    const batchMonth = Number(monthYear[1]);
    const yearDiff = Number(currentYear) - Number(batchYear);
    let monthDiff = Number(currentMonth) - Number(batchMonth);

    if (yearDiff === 0) {
      monthDiff = Number(currentMonth) + 1 - Number(batchMonth);
      return monthDiff;
    }
    else if (yearDiff === 1) {
      let tempMonth = 12 - currentMonth;
      monthDiff = tempMonth + batchMonth
      return monthDiff;
    }
  }

  useEffect(() => {
    getAllProducts();
    getAllTransactions();
  }, [])

  useEffect(() => {
    setTimeout(() => {
      transactionsByDate((new Date()).toISOString().substring(0, 10))
    }, "1000");
  }, [transactioByMonth])

  const filterByDate = (val) => {
    SetTransactionFilterDate(val)
    transactionsByDate(val)
  }

  const transactionsByDate = (date) => {
    console.log(transactioByMonth)
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

  const history = useNavigate();
  const generateInvoice = (details, index) => {
    details.lineItem = index + 1
    history('/invoice', { state: details });
  }

  const seGst = (value, id) => {
    console.log(value, id)
    LocalStorageServices.addTaxInformation(id,value);
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
            transactioByDate &&
            transactioByDate.map((doc, index) => {
              return (
                <div className='row product-name-row' key={doc.id} onClick={() => generateInvoice(doc, index)} >
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
              transactioByMonth &&
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
              duplicateProducts &&
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
        <div className="col col-report row-border">
          <div className="row row-report">
            <div className="row ">
              <div className="col-4"><h4 className='report-title'>Transactions</h4></div>
              <div className="col">
                <strong>Months</strong>
                <select className='report-ddl' onChange={(e) => { SetByMonth(e.target.value); filterItemsByMonthAndQuantity(e.target.value, byQuantity) }}>
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3" selected>3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                  <option value="12">12</option>
                </select>
              </div>
              <div className="col">
                <strong>Quantity</strong>
                <select className='report-ddl' onChange={(e) => { SetByQantity(e.target.value); filterItemsByMonthAndQuantity(byMonth, e.target.value) }}>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3" selected>3</option>
                  <option value="4">4</option>
                  <option value="5">5</option>
                  <option value="6">6</option>
                  <option value="7">7</option>
                  <option value="8">8</option>
                  <option value="9">9</option>
                  <option value="10">10</option>
                  <option value="11">11</option>
                </select>
              </div>
            </div>
            <div className="row row-h">
              <div className="col-2">
                SL No.
              </div>
              <div className="col-8">
                Name
              </div>
              <div className="col-2">
                Total Qantity
              </div>
            </div>

            {
              transactionsByItemsDisplay &&
              transactionsByItemsDisplay.map((b, i) => {
                return (
                  <div className="row">
                    <div className="col-2">
                      {i + 1}
                    </div>
                    <div className="col-8">
                      {b.name}
                    </div>
                    <div className="col-2">
                      {b.totalQunatity}
                    </div>
                  </div>
                )
              })
            }

          </div>
        </div>
        <div className="col col-report row-border">
          <div className="col col-report row-border">
            <div className="row row-report">
              <div className="row ">
                <div className="col-4"><h4 className='report-title'>Tax updation</h4></div>
              </div>
              <div className="row row-h">
                <div className="col-2">
                  SL No.
                </div>
                <div className="col-8">
                  Name
                </div>
                <div className="col-2">
                  Tax %
                </div>
              </div>

              {
                productsWithoutGST &&
                productsWithoutGST.map((b, i) => {
                  return (
                    <div className="row border-b">
                      <div className="col-2">
                        {i + 1}
                      </div>
                      <div className="col-8">
                        {b.name}
                      </div>
                      <div className="col-2">
                        <select className='report-ddl' value={b.gst} onChange={(e) => { seGst(e.target.value, b.id) }}>
                          <option value="-1" selected>--Select--</option>
                          <option value="0">0</option>
                          <option value="5">5</option>
                          <option value="12">12</option>
                          <option value="18">18</option>
                        </select>
                      </div>
                    </div>
                  )
                })
              }

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Report