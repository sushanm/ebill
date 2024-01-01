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
                        expenseMonthlyData.map((doc, index) => {
                            return (
                                <Accordion.Item eventKey={index} key={index}>
                                    <Accordion.Header>
                                        <div className="row manager-row">
                                            <div className="col-4">{doc.id}</div>
                                            <div className="col-4">Total Sales -  <strong>{expenseByMonth(doc.id)}</strong> </div>
                                            <div className="col-4">Total Expense -  <strong>{doc.totalAmount}</strong> </div>
                                        </div>
                                    </Accordion.Header>
                                    <Accordion.Body>

                                        {
                                            doc.transactions &&
                                            doc.transactions.map((trans, index1) => {
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
