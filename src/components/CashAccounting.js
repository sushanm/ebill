import React, { useState, useEffect, useCallback } from 'react'
import { doc, onSnapshot, updateDoc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase";
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

function CashAccount() {

    const [showModel, SetShowModel] = useState(false)
    const [onlinePayment, SetonlinePayment] = useState(0);
    const [cashAdjustment, SetCashAdjustment] = useState(0);
    const [totalSales, SetTotalSales] = useState(0);

    const notify = () => toast.success('Closing Balance Saved Successfully !', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        }); 

    const [dailCashDenomination, SetDailCashDenomination] = useState([
        {
            id: 0,
            value: 200,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 1,
            value: 100,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 2,
            value: 50,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 3,
            value: 20,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 4,
            value: 10,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 5,
            value: 5,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 6,
            value: 2,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 7,
            value: 1,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
        {
            id: 8,
            value: 500,
            openingCount: 0,
            opeiningTotal: 0,
            closingCount: 0,
            ClosingTotal: 0
        },
    ])
    useEffect(() => {
        try {
            let id = getYearAndMonth();
            let transactionDataByLocal = JSON.parse(localStorage.getItem('drkotianTransactionDataByMonth'));
            if (transactionDataByLocal) {
                let tempData = transactionDataByLocal.filter(item => item.id == getYearAndMonth())[0];
                if (tempData) {
                    tempData = tempData.transactions.filter(ele => ele.saleDate == getTodaysDate());

                    let tempTotalPrice = 0;
                    tempData.forEach(element => {
                        tempTotalPrice = Number(tempTotalPrice) + (Number(element.totalPrice) - Number(element.discount))
                    });
                    SetTotalSales(tempTotalPrice)
                }
            }

            const unsub = onSnapshot(doc(db, "cash", id), (doc) => {
                let data = doc.data();
                if (!data) {

                    SetShowModel(true)

                } else {
                    let todayDate = getTodayDate();
                    if (data.dates.filter(item => item.date == todayDate).length > 0) {
                        let dailyData = data.dates.filter(item => item.date == todayDate)[0];
                        if (dailyData.value.cashPurchase) {
                            SetCashAdjustment(Number(dailyData.value.cashPurchase));
                        }
                        if (dailyData.value.onlinePayment) {
                            SetonlinePayment(Number(dailyData.value.onlinePayment));
                        }
                        let tempdailCashDenomination = Object.assign({}, dailCashDenomination);
                        tempdailCashDenomination = dailyData.value.denomination;
                        SetDailCashDenomination(tempdailCashDenomination)
                    } else {
                        SetShowModel(true)
                    }
                }
            });
        } catch (e) { }
    }, [])

    const [dailyTotal, SetDailyTotal] = useState(0);
    const [dailyTotalClosing, SetDailyTotalClosing] = useState(0);

    const [cashMatched, SetCahsMatched] = useState(false);

    useEffect(() => {
        let before = Number(dailyTotal) + Number(totalSales) - Number(cashAdjustment)
        let after = Number(dailyTotalClosing) + Number(onlinePayment)
        console.log(before)
        console.log(after)
        if (Number(before) == Number(after)) {
            SetCahsMatched(true)
        }
        else {
            SetCahsMatched(false)
        }
    }, [dailyTotal, totalSales, cashAdjustment, dailyTotalClosing, onlinePayment])

    useEffect(() => {
        SetDailyTotal(dailCashDenomination.reduce((n, { opeiningTotal }) => n + opeiningTotal, 0))
        SetDailyTotalClosing(dailCashDenomination.reduce((n, { ClosingTotal }) => n + ClosingTotal, 0))
    }, [dailCashDenomination])

    const updateCash = (id, updatedCashData) => {
        const productDoc = doc(db, "cash", id);
        return updateDoc(productDoc, updatedCashData);
    };

    const updateDailySetData = (index, count) => {
        SetDailCashDenomination(
            dailCashDenomination.map(item =>
                item.id === index
                    ? { ...item, openingCount: Number(count), opeiningTotal: Number(count) * Number(item.value) }
                    : item
            ))
    }

    const updateDailyClosingSetData = (index, count) => {
        SetDailCashDenomination(
            dailCashDenomination.map(item =>
                item.id === index
                    ? { ...item, closingCount: Number(count), ClosingTotal: Number(count) * Number(item.value) }
                    : item
            ))
    }

    const getTodaysDate = () => {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
        var yyyy = today.getFullYear();
        return (dd + '-' + mm + '-' + yyyy);
    }



    const handleClose = () => SetShowModel(false);

    const updateOepningBalance = () => {

        let cashObj = {
            openingBalance: dailyTotal,
            denomination: dailCashDenomination,
            closingBalance: 0,
            isClosedMatched: false
        }

        updateCashReport(cashObj)
        handleClose()
    }

    const updateClosingBalance = () => {

        let cashObj = {
            openingBalance: dailyTotal,
            denomination: dailCashDenomination,
            closingBalance: dailyTotalClosing,
            sales: totalSales,
            onlinePayment: onlinePayment,
            cashPurchase: cashAdjustment,
            isClosedMatched: true
        }

        updateCashReport(cashObj)
        notify()
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
    function getTodayDate() {
        var today = new Date();
        var dd = String(today.getDate()).padStart(2, '0');
        return (dd);
    }

    const updateCashReport = async (dataToUpdate) => {
        let id = getYearAndMonth();
        let dates = {
            date: getTodayDate(),
            value: dataToUpdate
        }
        const docSnap = await getCashDataByyearAndMonth(id);
        if (docSnap.data()) {
            let tempData = docSnap.data();

            let todaysData = tempData.dates.filter(item => item.date == getTodayDate())[0];
            if (todaysData) {
                tempData.dates.filter(item => item.date == getTodayDate())[0].value = dataToUpdate;
                updateCash(id, tempData)
            } else {
                tempData.dates.push(dates)
                updateCash(id, tempData)
            }
        }
        else {
            addNewMonthValue(id, dates)
        }
    };

    const addNewMonthValue = async (yearMonth, value) => {
        return await setDoc(doc(db, "cash", yearMonth), {
            id: yearMonth,
            dates: [value]
        });
    }
    const getCashDataByyearAndMonth = (yearAndMonth) => {
        const transactionDoc = doc(db, "cash", yearAndMonth);
        return getDoc(transactionDoc);
    };

    return (
        <>
            <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                type="success"
            />
            <>
                <div className="row">
                    <div className="col-7 border-r border-t border-l">
                        <div className="row row-h">
                            <div className="col border-r">
                                Denomination
                            </div>
                            <div className="col">
                                Opening Count
                            </div>
                            <div className="col">
                                Closing Count
                            </div>
                        </div>
                        {
                            dailCashDenomination.map((item, i) => {
                                return (
                                    <div className="row border-b" key={i}>
                                        <div className="col">
                                            <strong>
                                                {
                                                    item.value
                                                }
                                            </strong>
                                        </div>
                                        <div className="col">
                                            {
                                                item.openingCount
                                            }
                                        </div>
                                        <div className="col">
                                            <input type="text" value={item.closingCount} onChange={(e) => updateDailyClosingSetData(i, e.target.value)} />
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="col-5">
                        <div className="row">
                            <div className="col">
                                <strong>Date</strong>
                            </div>
                            <div className="col">{getTodaysDate()}</div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <strong>Opening cash</strong>
                            </div>
                            <div className="col">
                                {dailyTotal} /-
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <strong>Sales Today</strong>
                            </div>
                            <div className="col">
                                {totalSales} /-
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <strong>Closing Cash</strong>
                            </div>
                            <div className="col">
                                {dailyTotalClosing} /-
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <strong>Online Payment</strong>
                            </div>
                            <div className="col">
                                <input type="text" value={onlinePayment} onChange={(e) => SetonlinePayment(e.target.value)} />
                            </div>
                        </div>
                        <div className="row">
                            <div className="col">
                                <strong>Cash Purchase</strong>
                            </div>
                            <div className="col">
                                <input type="text" value={cashAdjustment} onChange={(e) => SetCashAdjustment(e.target.value)} />
                            </div>
                        </div>

                        <div className="row mt-5" >
                            {
                                cashMatched === true &&
                                <Button variant="primary" tabIndex={'3'} onClick={() => updateClosingBalance()}>
                                    Save Closing Balance
                                </Button>
                            }
                        </div>
                    </div>
                </div>
            </>

            <Modal show={showModel} centered size="lg">
                <Modal.Header >
                    <Modal.Title>Opening Balance</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <>
                        <div className="row">
                            <div className="col-7 border-r border-t border-l">
                                <div className="row row-h">
                                    <div className="col-6 border-r">
                                        Denomination
                                    </div>
                                    <div className="col-6">
                                        Count
                                    </div>
                                </div>
                                {
                                    dailCashDenomination.map((item, i) => {
                                        return (
                                            <div className="row border-b" key={i}>
                                                <div className="col-6">
                                                    <strong>
                                                        {
                                                            item.value
                                                        }
                                                    </strong>
                                                </div>
                                                <div className="col-6">
                                                    <input type="text" onChange={(e) => updateDailySetData(i, e.target.value)} />
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                            <div className="col-5">
                                <div className="row">
                                    <div className="col">Date</div>
                                    <div className="col">{getTodaysDate()}</div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        <strong>Oepning Balance</strong>
                                    </div>
                                    <div className="col">
                                        {dailyTotal} /-
                                    </div>
                                </div>
                                <div className="row mt-5" >
                                    {
                                        dailyTotal > 0 &&
                                        <Button variant="primary" tabIndex={'3'} onClick={() => updateOepningBalance()}>
                                            Save & Close
                                        </Button>
                                    }
                                </div>
                            </div>
                        </div>
                    </>
                </Modal.Body>
            </Modal>
        </>
    );
}

export default CashAccount