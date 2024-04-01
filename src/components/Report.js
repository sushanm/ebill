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
  const [productsCopy, SetproductsCopy] = useState([]);
  const [duplicateProducts, setDuplicateProducts] = useState([]);
  const [totalNumberOfProducts, SetTotalNumberOfProducts] = useState();
  const [totalQuantity, SetTotalQuantity] = useState();
  const [totalPrice, SetTotalPrice] = useState();
  const [transactioByMonth, SetTransactionByMonth] = useState([]);
  const [transactionByMonthForGST, SetTransactionByMonthForGST] = useState([]);
  const [transactioByDate, SetTransactionByDate] = useState([]);
  const [transactionsByItems, SetTransactionsByItems] = useState([]);
  const [transactioByDateTotalPrice, SetTransactionByDateTotalPrice] = useState();
  const [transactionFilterDate, SetTransactionFilterDate] = useState((new Date()).toISOString().substring(0, 10));
  const [transactionsByItemsDisplay, SetTransactionsByItemsDisplay] = useState([]);
  const [byMonth, SetByMonth] = useState(3)
  const [byQuantity, SetByQantity] = useState(3)
  const [searchByPstName, SetSearchByPstName] = useState();
  const [searchByPstMobile, SetSearchByPstMobile] = useState();

  const [adminOrUser, SetadminOrUser] = useState("");

  const getAllProducts = async (force) => {
    let allProducts = LocalStorageServices.getAllProducts();
    if (allProducts || force) {
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

      SetproductsCopy(allProducts);
      setProductsWithoutGST(allProducts.filter(item => item.gst == null || item.gst == -1));
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
      if (data) {
        let tempData = [...data];
        console.log(tempData);
        tempData.forEach(monthTrans => {
          let gst5 = 0;
          let gst12 = 0;
          let gst18 = 0;
          let gst5Value = 0;
          let gst12Value = 0;
          let gst18Value = 0;
          monthTrans.transactions.forEach(trans => {
            trans.items.forEach(item => {
              if (item.gst == 5) {
                gst5 = Number(gst5) + Number(item.gstValue);
                gst5Value = Number(gst5Value) + Number(item.price);
              }
              if (item.gst == 12) {
                gst12 = Number(gst12) + Number(item.gstValue);
                gst12Value = Number(gst12Value) + Number(item.price);
              }
              if (item.gst == 18) {
                gst18 = Number(gst18) + Number(item.gstValue);
                gst18Value = Number(gst18Value) + Number(item.price);
              }
            });
          });
          monthTrans.gst5 = gst5;
          monthTrans.gst12 = gst12;
          monthTrans.gst18 = gst18;

          monthTrans.gst5Value = gst5Value;
          monthTrans.gst12Value = gst12Value;
          monthTrans.gst18Value = gst18Value;
        });
        SetTransactionByMonth(data)
        localStorage.setItem('drkotianTransactionDataByMonth', JSON.stringify(data));
        SetTransactionByMonthForGST(data)
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
      }
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

  const [seachProduct, SetSearchProduct] = useState('');

  useEffect(() => {
    const clone = [...transactionsByItems];
    if (seachProduct) {
      var term = seachProduct.trim().toLowerCase();
      var search = new RegExp(term, 'i');
      SetTransactionsByItemsDisplay(clone.filter(item => search.test(item.name.toLowerCase())))
    }
  }, [seachProduct])

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

  const [reload, SetReload] = useState(false);
  useEffect(() => {
    getAllProducts();
    getAllTransactions();
    let dataFromLocal = JSON.parse(localStorage.getItem('getDrKotianConnection'));
    const arryData = dataFromLocal.split(';');
    SetadminOrUser(arryData[8])
  }, [])

  useEffect(() => {
    getAllProducts();
    getAllTransactions();
  }, [reload])

  useEffect(() => {
    if (transactionByMonthForGST.length > 0) {

    }
  }, [transactionByMonthForGST])

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

  const history = useNavigate();
  const generateInvoice = (details, index) => {
    details.lineItem = index + 1
    history('/invoice', { state: details });
  }

  const generateInvoicePrint = (details, index) => {
    details.lineItem = index + 1
    console.log(details)
    history('/printinvoice', { state: details });
  }

  const seGst = (value, id) => {
    LocalStorageServices.addTaxInformation(id, value);
    let tempGstData = [...productsWithoutGST];
    const index = tempGstData.findIndex(item => item.id === id)
    tempGstData[index].gst = value;
    setProductsWithoutGST(tempGstData);

    let tempGstData1 = [...productsCopy];
    const index1 = tempGstData1.findIndex(item => item.id === id)
    tempGstData1[index1].gst = value;
    SetproductsCopy(tempGstData1);
  }

  const [ShowAllTax, SetShowAllTax] = useState(false);
  const ShowAllTaxInfo = (value) => {
    SetShowAllTax(!ShowAllTax)
    if (!ShowAllTax) {
      setProductsWithoutGST(productsCopy)
    } else {
      setProductsWithoutGST(productsCopy.filter(item => item.gst == null || item.gst == -1));
    }

  }

  const editSales = (transaction, index) => {
    let temp = [...transactioByDate];
    temp[index].editMode = true;
    SetTransactionByDate(temp)
  }
  const [showLoading, SetShoLoading] = useState(false);
  const deleteTransaction = (trans, item, index) => {
    SetShoLoading(true)
    let temp = [...transactioByDate];
    temp[index].editMode = false;
    let saleDateArray = trans.saleDate.split('-');
    let id = saleDateArray[2] + "-" + saleDateArray[1];
    TransactionsDataService.editTransactionRemove(id, trans, item)
    SetTransactionByDate(temp)

    setTimeout(() => {
      SetShoLoading(false)
    }, "5000");
  }

  function round(value) {
    return Number(Math.round((value + Number.EPSILON) * 100) / 100);
  }

  const [transactionByPst, SetTransactionByPst] = useState([]);
  function SearchByPstName(event) {
    event.preventDefault();
    SetSearchByPstName(event.target.value);
    let tempData = [];
    transactioByMonth.forEach(month => {
      month.transactions.forEach(trans => {
        if (trans.customerName) {
          if (trans.customerName.toLowerCase().includes(event.target.value.toLowerCase())) {
            tempData.push(trans)
          }
        }
      });
    });
    SetTransactionByPst(tempData)
  }

  function SearchByPstMobile(event) {
    event.preventDefault();
    SetSearchByPstMobile(event.target.value);
    let tempData = [];
    transactioByMonth.forEach(month => {
      month.transactions.forEach(trans => {
        if (trans.mobile) {
          if (trans.mobile.toLowerCase().includes(event.target.value.toLowerCase())) {
            tempData.push(trans)
          }
        }
      });
    });
    SetTransactionByPst(tempData)
  }

  return (
    <div>
      {
        showLoading &&
        <div className="row row-loader">
          <div className="loader"></div>
        </div>
      }

      <div className="div">

        <div className="row">
          <div className="col col-report row-border">
            <div className="row row-report ">
              <div className="col"><h4 className='report-title'>Transactions</h4></div>
              <div className="col">
              Search By Name : 
                <input type="text" value={searchByPstName} onChange={(e) => SearchByPstName(e)}></input>
              </div>
              <div className="col">
              Search By Mobile : 
                <input type="text" value={searchByPstMobile} onChange={(e) => SearchByPstMobile(e)}></input>
              </div>
            </div>
            <div className="row row-h">
              <div className="col-1">
                SL No.
              </div>
              <div className="col-8">
                <div className="row">
                  <div className="col-6">
                    Name
                  </div>
                  <div className="col-3">
                    Price
                  </div>
                  <div className="col-2">
                    Quantity
                  </div>
                </div>
              </div>

              <div className="col-2">
                Total Price
              </div>
              <div className="col-1">
                Date
              </div>
            </div>
            {
              transactionByPst &&
              transactionByPst.map((doc, index) => {
                return (
                  <div className='row product-name-row' key={doc.id}  >
                    <div className="col-1" >
                      {index + 1}
                    </div>
                    <div className="col-8">
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
                              <div className="col-2">
                                {b.quantity}
                              </div>
                              {
                                doc.editMode &&
                                <div className="col-1">
                                  <button onClick={() => deleteTransaction(doc, b, index)}>X</button>
                                </div>
                              }
                            </div>
                          )
                        })
                      }
                    </div>
                    <div className="col-2">
                      {Number(doc.totalPrice) - Number(doc.discount)} / {Number(doc.discount)}
                      <div className="row">
                        {doc.customerName}
                      </div>
                      <div className="row">
                        {doc.mobile}
                      </div>
                    </div>

                    <div className="col-1">
                      {doc.saleDate}
                    </div>
                  </div>
                )
              })
            }        
          </div>

        </div>

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
              <div className="col-8">
                <div className="row">
                  <div className="col-6">
                    Name
                  </div>
                  <div className="col-3">
                    Price
                  </div>
                  <div className="col-2">
                    Quantity
                  </div>
                </div>
              </div>

              <div className="col-2">
                Total Price
              </div>
              <div className="col-1">
                Action
              </div>
            </div>
            {
              transactioByDate &&
              transactioByDate.map((doc, index) => {
                return (
                  <div className='row product-name-row' key={doc.id}  >
                    <div className="col-1" >
                      {index + 1}
                    </div>
                    <div className="col-8">
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
                              <div className="col-2">
                                {b.quantity}
                              </div>
                              {
                                doc.editMode &&
                                <div className="col-1">
                                  <button onClick={() => deleteTransaction(doc, b, index)}>X</button>
                                </div>
                              }
                            </div>
                          )
                        })
                      }
                    </div>
                    <div className="col-2">
                      {Number(doc.totalPrice) - Number(doc.discount)} / {Number(doc.discount)}
                      <div className="row">
                        {doc.customerName}
                      </div>
                      <div className="row">
                        {doc.mobile}
                      </div>
                    </div>

                    <div className="col-1">
                      <div className="row">
                        <div className="col unset-p-m">
                          <img onClick={() => generateInvoice(doc, index)} className='print-icon' alt='edit' src='/ebill/assets/digital.png' />
                        </div>
                        <div className="col unset-p-m">
                          <img onClick={() => generateInvoicePrint(doc, index)} className='print-icon' alt='edit' src='/ebill/assets/print.png' />
                        </div>
                        <div className="col unset-p-m">
                          <img onClick={() => editSales(doc, index)} className='print-icon' alt='edit' src='/ebill/assets/edit.png' />
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })
            }
            <div className="row row-h">
              <div className="col-1">

              </div>
              <div className="col-8">
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
              <div className="col-1">

              </div>
            </div>

          </div>

{
  adminOrUser === 'admin' && <>
  <div className="col col-report">
            <div className="row row-report">
              <h4 className='report-title'>Transaction By Month</h4>
              <div className="row row-h">
                <div className="col">SL. No</div>
                <div className="col">YYY-MM</div>
                <div className="col">Total Value</div>
                <div className="col">Trans No's</div>
                <div className="col">GST 5%</div>
                <div className="col">GST 12%</div>
                <div className="col">GST 18%</div>
              </div>
              {
                transactioByMonth &&
                transactioByMonth.reverse().map((b, i) => {
                  return (
                    <div className="row border-b">
                      <div className="col">{i + 1}</div>
                      <div className="col">{b.id}</div>
                      <div className="col">{b.totalAmount}</div>
                      <div className="col">{b.transactions.length}</div>
                      <div className="col">
                        <div className="row border-b">
                          {round(b.gst5)}
                        </div>
                        <div className="row">
                          {round(b.gst5Value)}
                        </div>
                      </div>
                      <div className="col">
                        <div className="row border-b">
                          {round(b.gst12)}
                        </div>
                        <div className="row">
                          {round(b.gst12Value)}
                        </div>
                      </div>
                      <div className="col">
                        <div className="row border-b">
                          {round(b.gst18)}
                        </div>
                        <div className="row">
                          {round(b.gst18Value)}
                        </div>
                      </div>
                    </div>
                  )
                })
              }

            </div>
          </div>
  </>
}


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
                <div className="col">
                  <input type={'text'} value={seachProduct} onChange={e => SetSearchProduct(e.target.value)} placeholder="Search By Name" />
                </div>
              </div>
              <div className="row row-h">
                <div className="col-2">
                  SL No.
                </div>
                <div className="col-6">
                  Name
                </div>
                <div className="col-2">
                  Sale Date
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
                      <div className="col-6">
                        {b.name}
                      </div>
                      <div className="col-2">
                        {b.saleDate}
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
                  <div className="col-4">
                    Show All
                    <input type="checkbox" id="showAll" name="showAll" value={ShowAllTax} onClick={(e) => ShowAllTaxInfo(e.target.value)} />
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
                            <option value="-1" selected={b.gst === -1 || b.gst == null}>--Select--</option>
                            <option value="0" selected={b.gst === 0}>0</option>
                            <option value="5" selected={b.gst === 5}>5</option>
                            <option value="12" selected={b.gst === 12}>12</option>
                            <option value="18" selected={b.gst === 18}>18</option>
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
    </div>
  )
}

export default Report