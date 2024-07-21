import React from 'react'
import Form from 'react-bootstrap/Form';
import { useState, useEffect } from 'react';
import Accordion from 'react-bootstrap/Accordion';
import ExpenseDataService from "../services/expense.services"


function Manage() {

    const [expenseMonthlyData, SetExpenseMonthlyData] = useState([]);
    useEffect(() => {
        if (expenseMonthlyData.length == 0) {

            getAllTransactions();
        }
    }, [])

    const getAllTransactions = async () => {
        await ExpenseDataService.getAllTransactions().then((data) => {
            SetExpenseMonthlyData(data)
        });
    }

    const expenseByMonth = (id) => {
        let monthlySalesData = JSON.parse(localStorage.getItem('drkotianTransactionDataByMonth'))
        let filterData = monthlySalesData.filter(item => item.id === id);
        if (filterData) {
            if (filterData.length > 0) {
                return (monthlySalesData.filter(item => item.id === id)[0].totalAmount)
            }
        }
    }

    const GstValuesSalesForMonth = (id) => {
        let monthlySalesData = JSON.parse(localStorage.getItem('drkotianTransactionDataByMonth'))
        let filterData = monthlySalesData.filter(item => item.id === id);
        if (filterData) {
            console.log(filterData)
            if (filterData.length > 0) {
                let sum = Number(filterData[0].gst5Value ? filterData[0].gst5Value : 0)
                    + Number(filterData[0].gst12Value ? filterData[0].gst12Value : 0)
                    + Number(filterData[0].gst18Value ? filterData[0].gst18Value : 0)
                 return (sum)
            }
        }
    }

    const profitCalculator = (sales, expense) => {
        return (Number(sales) - Number(expense))
    }

    const reset = () => {
        SetTransactionAmount(0);
        SetTransactionFor("");
    }

    const [transactionFilterDate, SetTransactionFilterDate] = useState((new Date()).toISOString().substring(0, 10));

    const [transactionAmount, SetTransactionAmount] = useState();
    const [transactionFor, SetTransactionFor] = useState("");

    const handleSubmit = async () => {
        let newTransaction = {
            amount: transactionAmount,
            for: transactionFor,
            date: transactionFilterDate
        }
        await ExpenseDataService.addNewTransation(newTransaction);
        setTimeout(function () {
            reset();
        }, 1000)
    }

    function round2(value, precision) {
        var multiplier = Math.pow(10, precision || 0);
        return Math.round(value * multiplier) / multiplier;
      }
    return (
        <>
            <div className="row">
                <div className="col">
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Expense Amount</Form.Label>
                        <Form.Control type="number" value={transactionAmount} onChange={(e) => SetTransactionAmount(e.target.value)} placeholder="Expense Amount" />
                    </Form.Group>
                </div>
                <div className="col">
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Expense For</Form.Label>
                        <Form.Control type="text" value={transactionFor} onChange={(e) => SetTransactionFor(e.target.value)} placeholder="Expense For" />
                    </Form.Group>
                </div>
                <div className="col">
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Expense Date</Form.Label>
                        <Form.Control type="date" value={transactionFilterDate} onChange={(e) => SetTransactionFilterDate(e.target.value)} placeholder="Expense Date" />
                    </Form.Group>
                </div>
                <div className="col">
                    <Form.Group className="mb-3" controlId="formBasicEmail">
                        <Form.Label>Expense Date</Form.Label>
                        <Form.Control className='btn-sub' type="button" value={"SUBMIT"} onClick={handleSubmit} />
                    </Form.Group>
                </div>
            </div>
            <div className="row">
                <Accordion>

                    {
                        expenseMonthlyData &&
                        expenseMonthlyData.reverse().map((doc, index) => {
                            return (
                                <Accordion.Item eventKey={index} key={index}>
                                    <Accordion.Header>
                                        <div className="row manager-row">
                                            <div className="col-1">{doc.id}</div>
                                            <div className="col-3">Total Sales :  <strong>{round2(expenseByMonth(doc.id))}</strong> </div>
                                            <div className="col-3">Total Medicene Sales :  <strong>{round2(GstValuesSalesForMonth(doc.id))}</strong> </div>
                                            <div className="col-3">Total Expense :  <strong>{round2(doc.totalAmount)}</strong> </div>
                                            <div className="col-2" style={{ color: profitCalculator(round2(expenseByMonth(doc.id), doc.totalAmount)) < 0 ? '#FC5532' : '#000' }}>Profit :  <strong>{profitCalculator(round2(expenseByMonth(doc.id)), doc.totalAmount)}</strong> </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body>

                                        {
                                            doc.transactions &&
                                            doc.transactions.reverse().map((trans, index1) => {
                                                return (
                                                    <div className="row border-b" key={index1}>
                                                        <div className="col border-r">
                                                            {trans.for}
                                                        </div>
                                                        <div className="col border-r">
                                                            {trans.date}
                                                        </div>
                                                        <div className="col">
                                                            {trans.amount}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        }

                                    </Accordion.Body>
                                </Accordion.Item>
                            )
                        })
                    }
                </Accordion>
            </div>
        </>
    )
}

export default Manage
