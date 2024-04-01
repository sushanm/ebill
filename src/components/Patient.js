import React from 'react'
import { useState, useEffect, useRef } from 'react';
import PTDataService from "../services/pt.services"
import TransactionsDataService from "../services/transactions.services"
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';
import { Accordion } from 'react-bootstrap/Accordion';

function Patient() {
  //Status number - 2 : Draft, 1: Active, 3: closed   
  const [addNewPtName, SetAddNewPtName] = useState("")
  const [addNewPtNo, SetAddNewPtNo] = useState("")
  const [addNotes, SetNotes] = useState("")
  const [newThrapy, SetNewTherapy] = useState({ fullPackage: false });
  const [listOFTherapy, SetListOfTherapy] = useState([]);
  const [listOFTherapyClone, SetListOfTherapyClone] = useState([]);
  const [listPst, SetListPst] = useState([]);
  const [numberDaysOfTreatment, SetNumberDaysOfTreatment] = useState();
  const [totalActualCost, SetTotalActualCost] = useState();
  const [totalAgreedCost, SetTotalAgreedCost] = useState();
  const [remianingCost, SetRemianingCost] = useState();
  const [transactionFilterDate, SetTransactionFilterDate] = useState((new Date()).toISOString().substring(0, 10));
  const [selectedPstId, SetSelectedPstId] = useState("")
  const [calculateTotal, SetCalculateTotal] = useState(false);
  const [salesTrans, SetSalesTrans] = useState({ date: (new Date()).toISOString().substring(0, 10) });

  const [selectedSalesTrans, SetSelectedSalesTrans] = useState([]);
  const wrapperRef = useRef(null);
  const [show, setShow] = useState(false);

  const handleClose = () => {
    setShow(false)
    SetCalculateTotal(true);
    calulateTotal();

  };



  const [showConfirm, setShowConfirm] = useState(false);

  const handleCloseConfirm = () => {
    setShowConfirm(false)
  };

  const handleShowConfirm = () => setShowConfirm(true);

  const [showBill, setShowBill] = useState(false);

  const handleCloseBill = () => {
    setShowBill(false)
  };

  const handleShowBill = () => setShowBill(true);

  const handleModelOpen = () => {
    setShow(true);
    let temp = listOFTherapy;
    temp.forEach(item => {
      let data = listOFTherapyClone.filter(cloneItem => cloneItem.id === item.id)
      if (data.length > 0) {
        item.selected = true;
      } else {
        item.selected = false;
      }
    });
    SetNewTherapy(temp)
  }


  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      // Unbind the event listener on clean up
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [wrapperRef]);

  function handleClickOutside(event) {
    if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
      //resetAll();
    }
  }

  const searchPst = (val) => {
    try {
      let searchValue = val.trim().toLowerCase();
      if (searchValue.length > 0) {
        SetListPst(listPst.filter(pst => pst.name.toLowerCase().includes(searchValue) || pst.mobile.toLowerCase().includes(searchValue)))
      }
      else {
        refreshPstData();
      }
    } catch (error) { }
  }

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === 'Escape') {
        resetAll();
      }
    };
    window.addEventListener('keydown', handleEsc);

    return () => {
      window.removeEventListener('keydown', handleEsc);
    };
  }, []);

  useEffect(() => {
    getAllTherapyData();
    getPstData();
  }, [])

  const getPstData = () => {
    PTDataService.getAllPatientsForce();
    SetListPst(PTDataService.getAllPatients())
  }

  const getAllTherapyData = () => {
    PTDataService.getAllTherapyForce();
    SetListOfTherapy(PTDataService.getAllTherapy().map(obj => ({ ...obj, selected: false, numberOfUnits: 0 })));
  }


  const saveTherapy = async () => {
    await PTDataService.addNewTherapy(newThrapy).then((data) => {
      SetNewTherapy({ name: "", price: "" })
      SetListOfTherapy(PTDataService.getAllTherapy().map(obj => ({ ...obj, selected: false, numberOfUnits: 0 })));
    });
  }


  const calulateTotal = () => {
    console.log("calculte" + calculateTotal)
    if (calculateTotal) {
      let totalCost = 0
      listOFTherapyClone.forEach(item => {
        totalCost = totalCost + item.price * item.numberOfUnits
      });
      SetTotalActualCost(totalCost);
      SetTotalAgreedCost(totalCost)
    }
  }

  useEffect(() => {
    calulateTotal();
  }, [listOFTherapyClone])

  const selectedTherapy = (id, sel) => {

    SetCalculateTotal(true);

    let tempData = listOFTherapyClone;
    if (sel) {
      let exist = listOFTherapy.filter(item => item.id == id)[0];
      let existInClone = listOFTherapyClone.filter(item => item.id == id);



      if (existInClone.length == 0) {
        exist.selected = true;
        if (exist.fullPackage) {
          exist.numberOfUnits = 1;
        } else {
          exist.numberOfUnits = numberDaysOfTreatment;
        }
        tempData.push(exist)
      }


    }
    else {
      tempData = listOFTherapyClone.filter(item => item.id != id);
    }

    SetListOfTherapyClone(tempData);
    calulateTotal();
  }

  const updateNumberDaysOfTreatment = (number) => {
    SetCalculateTotal(true);
    SetNumberDaysOfTreatment(number)
    SetListOfTherapyClone(
      listOFTherapyClone.map(item =>
        item.selected === true && !item.fullPackage
          ? { ...item, numberOfUnits: number }
          : item
      ))

  }

  const updateTherapyNumberOfDates = (id, number) => {
    SetCalculateTotal(true);
    SetListOfTherapyClone(
      listOFTherapyClone.map(item =>
        item.id === id
          ? { ...item, numberOfUnits: number }
          : item
      ))

  }

  const updateTherapyEachPrice = (id, number) => {
    SetCalculateTotal(true);
    SetListOfTherapyClone(
      listOFTherapyClone.map(item =>
        item.id === id
          ? { ...item, price: number }
          : item
      ))

  }

  const saveTherapyForPst = async () => {
    let pstTherapy = {};
    let isExisting = false;
    if (selectedPstId.length > 0) {
      isExisting = true;
      pstTherapy.id = selectedPstId;
      pstTherapy.transaction = selectedSalesTrans;
      let collectedCash = 0;
      selectedSalesTrans.forEach(trans => {
        collectedCash = Number(collectedCash) + Number(trans.amount);
      });
      pstTherapy.remainingCost = Number(totalAgreedCost) - Number(collectedCash);
      pstTherapy.status = Number(1);
    }
    else {
      isExisting = false;
      pstTherapy.id = Math.random().toString(36).slice(2);
      pstTherapy.transaction = [];
      pstTherapy.remainingCost = Number(totalAgreedCost);
      pstTherapy.status = Number(2);
    }
    pstTherapy.createdDate = new Date().toISOString().slice(0, 10);
    pstTherapy.name = addNewPtName;
    pstTherapy.mobile = addNewPtNo;
    pstTherapy.startDate = transactionFilterDate;
    pstTherapy.therapy = listOFTherapyClone.filter(item => item.selected === true)
    pstTherapy.actualCost = Number(totalActualCost);
    pstTherapy.agreedCost = Number(totalAgreedCost);
    pstTherapy.overallNumberOfDays = Number(numberDaysOfTreatment);
    pstTherapy.notes = addNotes;

    console.log(pstTherapy)
    await PTDataService.addNewPst(isExisting, pstTherapy).then((data) => {
      resetAll();
      refreshPstData();
      handleCloseConfirm();
    });
  }

  const refreshPstData = () => {
    SetListPst(PTDataService.getAllPatients())
  }

  const resetAll = () => {
    SetAddNewPtName("");
    SetAddNewPtNo("");
    SetNotes("");
    SetNumberDaysOfTreatment("");
    SetTotalActualCost(0)
    SetTotalAgreedCost(0)
    getAllTherapyData();
    SetListOfTherapyClone([])
    SetSelectedPstId("");
    SetRemianingCost(0)
    SetSelectedSalesTrans([])
  }

  const selectPst = (id) => {
    SetSelectedPstId(id)
    let pst = listPst.filter(item => item.id === id);
    console.log(pst)
    if (pst.length > 0) {
      SetAddNewPtName(pst[0].name);
      SetAddNewPtNo(pst[0].mobile);
      SetNotes(pst[0].notes);
      SetNumberDaysOfTreatment(pst[0].overallNumberOfDays);
      SetTransactionFilterDate(pst[0].startDate)
      SetTotalActualCost(pst[0].actualCost)
      SetTotalAgreedCost(pst[0].agreedCost)
      SetRemianingCost(pst[0].remainingCost)
      SetCalculateTotal(false);
      SetListOfTherapyClone(pst[0].therapy)
      SetSelectedSalesTrans(pst[0].transaction)
    }
  }

  const getDate = () => {
    const today = new Date();
    const yyyy = today.getFullYear();
    let mm = today.getMonth() + 1;
    let dd = today.getDate();
    if (dd < 10) dd = '0' + dd;
    if (mm < 10) mm = '0' + mm;
    const formattedToday = dd + '-' + mm + '-' + yyyy;
    return formattedToday;
  }

  function guid() {
    return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
    );
}

  const handleBillTransaction = async () => {

    let tempData = listPst.filter(item => item.id === selectedPstId)[0];
    if (tempData.transaction) {
      tempData.status = Number(1)
      tempData.transaction.push(salesTrans)
    } else {
      tempData.status = Number(1)
      tempData.transaction = [salesTrans]
    }
    if (tempData.remainingCost) {
      tempData.remainingCost = Number(tempData.remainingCost) - Number(salesTrans.amount);
    } else {
      tempData.remainingCost = Number(tempData.agreedCost) - Number(salesTrans.amount)
    }
    if (tempData.remainingCost == 0) {
      tempData.status = Number(3)
    }

    console.log(tempData)
    await PTDataService.addNewPst(true, tempData).then(async (data) => {

      const newTransaction = {
        id: guid(),
        items: [{
          discounted: false,
          giveDiscount: false,
          gst:0,
          gstValue:0,
          id:guid(),
          name: tempData.name + " Therapy Charges",
          price: salesTrans.amount,
          priceperunit: salesTrans.amount,
          batchId:1,
          quantity:1
        }],
        saleDate: getDate(),
        totalPrice: Number(salesTrans.amount),
        discount: Number(0),
        customerName: tempData.name,
        mobile: tempData.mobile
      };
  
        await TransactionsDataService.addNewTransation(newTransaction);
        
      resetAll();
      refreshPstData();
      handleCloseBill();
      SetSalesTrans({ amount: "", date: (new Date()).toISOString().substring(0, 10) })

    });


  }

  return (
    <>
      <div className="row">
        <div className="col">
          <input type={'text'} onChange={(e) => searchPst(e.target.value)} placeholder="Search"></input>
        </div>
      </div>
      <div className="row" ref={wrapperRef}>
        <div className="col-2 border-r" >
          {
            listPst &&
            listPst.map((item, i) => {
              return (
                <div key={i} className={`row border-b border-t border-l border-r  ${item.status == 1 ? 'pst-therapy-active' : ''}`} >
                  <div className="col" onClick={() => selectPst(item.id)}>
                    {item.name}
                  </div>
                </div>
              )
            })
          }
        </div>
        <div className="col-10">
          <>
            <div className="row">
              <div className="col-4">
                <label className='label-pst'>
                  Name<input type={'text'} value={addNewPtName} onChange={(e) => SetAddNewPtName(e.target.value)} placeholder="Name"></input>
                </label>
              </div>
              <div className="col-4">
                <label className='label-pst'>
                  Number of Units<input type={'text'} value={numberDaysOfTreatment} onChange={(e) => updateNumberDaysOfTreatment(e.target.value)} placeholder="Number of Units"></input>
                </label>
              </div>
              <div className="col-4">
                <label className='label-pst'>
                  Medicine / Note<input type={'text'} value={addNotes} className="pst-input" onChange={(e) => SetNotes(e.target.value)} placeholder="Notes"></input>
                </label>

              </div>


            </div>
            <div className="row">
              <div className="col">
                {
                  addNewPtName &&
                  <a onClick={handleModelOpen} className={'pst-select-therapy'}>Add Or Update Treatments</a>
                }
              </div>
            </div>
            {
              listOFTherapyClone &&
              listOFTherapyClone.map((item, i) => {
                return (
                  <>
                    <div className="row border-b  border-l border-r border-l border-t" key={i} >
                      <div className="col border-r">{item.name}</div>
                      <div className="col">
                        {item.price}
                        {/* <input type={'number'} value={item.price} onChange={(e) => updateTherapyEachPrice(item.id, e.target.value)} ></input> */}
                      </div>
                      <div className="col">
                        {
                          item.fullPackage && <>1</>
                        }
                        {
                          !item.fullPackage && <input type={'number'} value={item.numberOfUnits} onChange={(e) => updateTherapyNumberOfDates(item.id, e.target.value)} placeholder="Number of Days"></input>
                        }

                      </div>
                      <div className="col">
                        {item.numberOfUnits * item.price}
                      </div>
                    </div>
                  </>
                )
              })
            }
            <div className="row pst-p-t">
              <div className="col">
                <label>Total Cost : </label> <strong>{totalActualCost}</strong>
              </div>
              <div className="col">
                <label>Agreed Cost : </label> <input type={'number'} value={totalAgreedCost} onChange={(e) => SetTotalAgreedCost(e.target.value)} placeholder="Agreed Cost"></input>
              </div>

              {
                remianingCost >= 0 &&
                <>
                  <div className="col">
                    <label>Remaining Bill  : </label> {remianingCost}
                  </div>
                </>
              }

              <div className="col">
                <Button variant="primary" className='pst-btn-p' onClick={handleShowConfirm}>
                  Save
                </Button>
                <Button variant="secondary" className='pst-btn-p' onClick={resetAll}>
                  Clear
                </Button>
                {
                  selectedPstId && <Button variant="primary" onClick={handleShowBill}>
                    Add Bill
                  </Button>
                }
              </div>
            </div>
            <div className="row">
              <Modal show={show} onHide={handleClose} centered size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>Preview the sale</Modal.Title>
                </Modal.Header>
                <Modal.Body className='model-body-pst'>
                  {
                    listOFTherapy &&
                    listOFTherapy.map((item, i) => {
                      return (
                        <div className="row border-b  border-l border-r" key={i} >
                          <div className="col-1 border-r">
                            <input type="checkbox"
                              defaultChecked={item.selected}
                              onChange={(e) => selectedTherapy(item.id, e.target.checked)}
                            />
                          </div>
                          <div className="col border-r">{item.name}</div>
                          <div className="col">{item.price}</div>
                        </div>
                      )
                    })
                  }
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="secondary" onClick={handleClose}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>

            <div className="row">
              <Modal show={showConfirm} onHide={handleCloseConfirm} centered size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>Preview the sale</Modal.Title>
                </Modal.Header>
                <Modal.Body className='model-body-pst'>
                  <div className="row border-b  border-l border-r border-l border-t" >
                    <div className="col border-r">
                      <strong>Name</strong>
                    </div>
                    <div className="col border-r">
                      <strong>Price</strong>
                    </div>
                    <div className="col border-r">
                      <strong>No. Units</strong>
                    </div>
                    <div className="col">
                      <strong>Total</strong>
                    </div>
                  </div>
                  {
                    listOFTherapyClone &&
                    listOFTherapyClone.map((item, i) => {
                      return (
                        <>
                          <div className="row border-b  border-l border-r border-l border-t" key={i} >
                            <div className="col border-r">{item.name}</div>
                            <div className="col border-r">
                              {item.price}
                            </div>
                            <div className="col border-r">
                              {
                                item.fullPackage && <>1</>
                              }
                              {
                                !item.fullPackage && <>{item.numberOfUnits}</>
                              }

                            </div>
                            <div className="col">
                              {item.numberOfUnits * item.price}
                            </div>
                          </div>
                        </>
                      )
                    })
                  }

                  <div className="row border-b  border-l border-r border-l border-t" >
                    <div className="col ">

                    </div>
                    <div className="col ">

                    </div>
                    <div className="col border-r">
                      <strong>Total Price</strong>
                    </div>
                    <div className="col">
                      <strong>{totalActualCost}</strong>
                    </div>
                  </div>

                  <div className="row border-b  border-l border-r border-l border-t" >
                    <div className="col">

                    </div>
                    <div className="col ">

                    </div>
                    <div className="col border-r">
                      <strong>Agreed Price</strong>
                    </div>
                    <div className="col">
                      <strong>{totalAgreedCost}</strong>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col">
                      <label className='label-pst'>
                        Mobile<input type={'text'} value={addNewPtNo} onChange={(e) => SetAddNewPtNo(e.target.value)} placeholder="Mobile"></input>
                      </label>
                    </div>
                    <div className="col">
                      <label className='label-pst'>
                        Tentative Start Date
                        <input type={'date'} value={transactionFilterDate} onChange={(e) => SetTransactionFilterDate(e.target.value)} ></input>
                      </label>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary" onClick={saveTherapyForPst}>
                    Confirm and Save
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>

            <div className="row">
              <Modal show={showBill} onHide={handleCloseBill} centered size="lg">
                <Modal.Header closeButton>
                  <Modal.Title>Preview the sale</Modal.Title>
                </Modal.Header>
                <Modal.Body className='model-body-pst'>

                  <div className="row">
                    <div className="col">
                      <label className='label-pst'>
                        Actual Cost :
                        {totalActualCost}
                      </label>
                    </div>
                    <div className="col">
                      <label className='label-pst'>
                        Agreed Cost : {totalAgreedCost}
                      </label>
                    </div>
                    {remianingCost >= 0 &&
                      <div className="col">
                        <label className='label-pst'>
                          Remaining Cost : {remianingCost}
                        </label>
                      </div>
                    }
                  </div>

                  <div className="row border-b  border-t"  >
                    <div className="col">
                      <strong>Date</strong>
                    </div>
                    <div className="col">
                      <strong>Amount</strong>
                    </div>
                  </div>
                  {
                    selectedSalesTrans &&
                    selectedSalesTrans.map((item, i) => {
                      return (
                        <>
                          <div className="row border-b " key={i} >
                            <div className="col">{item.date}</div>
                            <div className="col">{item.amount}</div>
                          </div>
                        </>
                      )
                    })
                  }

                  <div className="row">
                    <div className="col">
                      <label className='label-pst'>
                        Sale Date
                        <input type={'date'} value={salesTrans.date} onChange={(e) => SetSalesTrans({ ...salesTrans, date: e.target.value })} ></input>
                      </label>
                    </div>
                    <div className="col">
                      <label className='label-pst'>
                        Amount : <input type={'text'} value={salesTrans.amount} onChange={(e) => SetSalesTrans({ ...salesTrans, amount: e.target.value })} placeholder="Amount"></input>
                      </label>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer>
                  <Button variant="primary" onClick={handleBillTransaction}>
                    Save Sales
                  </Button>
                  <Button variant="secondary" onClick={handleCloseBill}>
                    Close
                  </Button>
                </Modal.Footer>
              </Modal>
            </div>
          </>
        </div>
      </div>
      <div className="row border-t">
        <strong>Therapy Details with Price per session</strong>
        <div className="col">
          Therapy Name
          <input type={'text'} value={newThrapy.name} onChange={(e) => SetNewTherapy({ ...newThrapy, name: e.target.value })} placeholder="Name"></input>
        </div>
        <div className="col">
          Therapy Price Per Session
          <input type={'text'} value={newThrapy.price} onChange={(e) => SetNewTherapy({ ...newThrapy, price: e.target.value })} placeholder="Price"></input>
        </div>
        <div className="col">
          <label>
            Full Package ?
            <input type="checkbox"
              defaultChecked={false}
              onChange={(e) => SetNewTherapy({ ...newThrapy, fullPackage: e.target.checked })}
            />
          </label>
        </div>
        <div className="col">
          <button className="btn btn-secondary m-btn" onClick={saveTherapy} >Save</button>
        </div>
      </div>
      <div className="row border-b border-t border-l border-r" >
        <div className="col-1 border-r"><strong>SL No</strong> </div>
        <div className="col border-r"><strong>Name</strong> </div>
        <div className="col"><strong> Price Per Session</strong></div>
        <div className="col"><strong> Full Package</strong></div>
      </div>
      {
        listOFTherapy &&
        listOFTherapy.map((item, i) => {
          return (
            <div className="row border-b  border-l border-r" key={i}>
              <div className="col-1 border-r">{i + 1}</div>
              <div className="col border-r">{item.name}</div>
              <div className="col">{item.price}</div>
              <div className="col">

                {
                  item.fullPackage && <>Yes</>
                }
                {
                  !item.fullPackage && <>No</>
                }
              </div>
            </div>
          )
        })
      }
    </>
  )
}

export default Patient

