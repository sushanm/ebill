import React from 'react'
import { useEffect, useState } from 'react';
import TransactionDataService from "../services/transaction.services"
import TransactionsDataService from "../services/transactions.services"
import StockDataService from "../services/stock.services"
import LocalStorageServices from '../services/localStorage.services';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function AddSale({ sales, callbackSalesUpdate, callbackaftersales }) {

    const [saledata, SetSaleData] = useState();
    const [isDisabled, SetDisabled] = useState(true);
    const [isDataUpdated, SetIsDataUpdated] = useState(false);
    const [totalPrice, SetTotalPrice] = useState(0);
    const [updatedTotalPrice, SetUpdatedTotalPrice] = useState(0);
    const [discount, SetDiscount] = useState(0);

    const [defaultDiscount, SetDefaultDiscount] = useState(0);

    useEffect(() => {
        SetSaleData(sales);
        updateTotalPrice(sales)
    }, [sales])

    useEffect(() => {
        try {
            if (saledata.length === 0) {
                SetDisabled(true)
            }
            else {
                SetDisabled(false)
            }
        } catch (error) {
            SetDisabled(true)
        }

    }, [saledata])

    useEffect(() => {
        if (isDataUpdated) {
            callbackSalesUpdate(saledata)
            updateTotalPrice(saledata)
            SetIsDataUpdated(false);
        }
    }, [callbackSalesUpdate, isDataUpdated, saledata])

    const removeItem = (id) => {
        let cloneSaleData = [...saledata];
        SetSaleData(cloneSaleData.filter((item) => item.id !== id))
        SetIsDataUpdated(true);
    }

    const changeQuantity = (value, index) => {
        const cloneSaleData = [...saledata];
        cloneSaleData[index].quantity = value;
        SetSaleData(cloneSaleData)
        updateTotalPrice(cloneSaleData)
        SetIsDataUpdated(true);
    }

    const changeTotalPrice = (value) => {
        SetDiscount(Number(totalPrice) - Number(value))
        SetUpdatedTotalPrice(value)
    }

    const updateTotalPrice = (salesData) => {
        try {
            SetIsDataUpdated(true);
            let totalPrice = 0
            let totalDiscount = 0;

            salesData.forEach((item) => {
                if (item.giveDiscount) {
                    let disc = item.price * item.quantity * 5 / 100;
                    totalDiscount = totalDiscount + disc;
                } else {
                    item.giveDiscount = false
                }
                totalPrice = totalPrice + item.price * item.quantity;
            })
            SetDefaultDiscount(Number(totalDiscount))
            SetTotalPrice(totalPrice);
            SetDiscount(Number(totalDiscount))
            SetUpdatedTotalPrice(Number(totalPrice) - Number(totalDiscount))
        } catch (error) { }
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

    function round(value) {
        return Number(Math.round((value + Number.EPSILON) * 100) / 100);
    }

    function guid() {
        return ([1e7] + -1e3 + -4e3 + -8e3 + -1e11).replace(/[018]/g, c =>
            (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }

    const [isDisabledSaveSales, SetisDisabledSaveSales] = useState(false);

    const addTransation = async () => {
        // try {
        SetisDisabledSaveSales(true);
        if (saledata.length > 0) {
            const cloneSaleData = [...saledata];
            if (discount == 0) {
                cloneSaleData.forEach(item => {
                    let tax = Number(item.price) - (Number(item.price) * (100 / (100 + Number(item.gst))))
                    item.priceperunit = round(Number(item.price) - Number(tax));
                    item.gstValue = round(tax * Number(item.quantity));
                    item.discounted = false
                });
            } else if (discount == defaultDiscount) {

                cloneSaleData.forEach(item => {
                    if (item.giveDiscount) {
                        item.price = Number(item.price) - (Number(item.price) * 5 / 100)
                        item.discounted = true;
                    }
                    let tax = Number(item.price) - (Number(item.price) * (100 / (100 + Number(item.gst))))
                    item.priceperunit = round(Number(item.price) - Number(tax));
                    item.gstValue = round(tax * Number(item.quantity));
                    if (!item.discounted) {
                        item.discounted = false
                    }
                });
            }
            else {
                if (Number(discount) === Number(totalPrice)) {
                    cloneSaleData.forEach(item => {
                        item.priceperunit = 0;
                        item.gstValue = 0;
                        item.gst = 0;
                        item.price = 0;
                        item.discounted = true
                    });
                }
                else {
                    let discountedItemID = "";
                    let sortedCloneSaleData = cloneSaleData.sort((a, b) => Number(b.gst) - Number(a.gst))
                    if (sortedCloneSaleData.length > 0) {

                        for (let i = 0; i < sortedCloneSaleData.length; i++) {
                            if (Number(sortedCloneSaleData[i].price) >= discount) {
                                discountedItemID = sortedCloneSaleData[i].id;
                                break;
                            }
                        }
                    }

                    cloneSaleData.forEach(item => {
                        if (item.giveDiscount) {
                            item.price = Number(item.price) - (Number(item.price) * 5 / 100)
                            item.discounted = true;
                        }
                    });

                    let index = cloneSaleData.findIndex(item => item.id === discountedItemID);

                    const discDiff = Number(discount) - Number(defaultDiscount);

                    cloneSaleData[index].price = Number(cloneSaleData[index].price) - (Number(discDiff) / cloneSaleData[index].quantity)
                    cloneSaleData[index].discounted = true;

                    cloneSaleData.forEach(item => {
                        let tax = Number(item.price) - (Number(item.price) * (100 / (100 + Number(item.gst))))
                        item.priceperunit = round(Number(item.price) - Number(tax));
                        item.gstValue = round(tax * Number(item.quantity));
                        if (!item.discounted) {
                            item.discounted = false
                        }
                    });
                }
            }


            const newTransaction = {
                id: guid(),
                items: cloneSaleData,
                saleDate: getDate(),
                totalPrice: Number(totalPrice),
                discount: Number(discount),
            };

            await TransactionsDataService.addNewTransation(newTransaction);
            let tempArray = new Array();

            cloneSaleData.forEach(item => {
                const index = tempArray.findIndex(t => t.id === item.id);
                if (index >= 0) {
                    tempArray[index].batch.push({
                        batchId: item.batchId,
                        quantity: item.quantity
                    })
                } else {
                    tempArray.push({
                        id: item.id,
                        batch: [{
                            batchId: item.batchId,
                            quantity: item.quantity
                        }]
                    })
                }
            });
            tempArray.forEach(item => {
                AddOrEditBatch(item.id, item.batch);
            })
            SetSaleData([]);
            callbackSalesUpdate([]);
            callbackaftersales(true);
            SetUpdatedTotalPrice(0);
            SetDiscount(0);
            handleClose();
        }
        setTimeout(() => {
            SetisDisabledSaveSales(false);
        }, "1000");
        // } catch (error) {
        //     setTimeout(() => {
        //         SetisDisabledSaveSales(false);
        //     }, "1000");
        //     console.log(error);
        // }
    }

    const AddOrEditBatch = async (productId, batch) => {

        const docSnap = await StockDataService.getProduct(productId);
        let currentData = docSnap.data();
        batch.forEach(item => {
            const index = currentData.batch.findIndex(t => t.id === item.batchId);
            let qunatityToUpdate = Number(currentData.batch[index].quantity) - item.quantity;
            if (qunatityToUpdate <= 0) {
                currentData.batch = currentData.batch.filter((val) => val.id !== item.batchId)
            } else {
                currentData.batch[index].quantity = qunatityToUpdate;
            }
        })

        if (currentData.batch.length > 0) {
            let totalQuantity = Number(currentData.batch.map(item => item.quantity).reduce((prev, next) => Number(prev) + Number(next)));
            currentData.totalQuantity = totalQuantity;
        }
        else {
            currentData.totalQuantity = 0;
        }
        LocalStorageServices.addOrEditProduct(productId, currentData);
        await StockDataService.updateProduct(productId, currentData);

    }
    const [show, setShow] = useState(false);

    const handleClose = () => setShow(false);
    const handleShow = () => setShow(true);

    return (
        <div className='sale-row'>
            <div className="row sale-row-h">
                <div className="col-5">Product Name</div>
                <div className="col-2">Unit Price</div>
                <div className="col-2">Quantity</div>
                <div className="col-2">Total Price</div>
                <div className="col-1">Action</div>
            </div>
            {
                saledata &&
                saledata.map((item, i) => {
                    return (
                        <div className='row product-name-row-sale' key={i} >
                            <div className="col-5">{item.name}</div>
                            <div className="col-2">{item.price}</div>
                            <div className="col-2">
                                <input type={'number'} className='quantity-sale' onChange={(val) => changeQuantity(val.target.value, i)} value={item.quantity}></input>
                            </div>
                            <div className="col-2">{item.price * item.quantity}</div>
                            <div className="col-1">
                                <button onClick={() => removeItem(item.id)}>X</button>
                            </div>
                        </div>
                    )
                })
            }
            <div className="row">
                <div className="col-5"></div>
                <div className="col-5">
                    <div className="row">
                        <div className="col">
                            Total Price
                        </div>
                        <div className="col">
                            {totalPrice}
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            Discount
                        </div>
                        <div className="col">
                            <strong>{discount}</strong>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col">
                            Billed Price
                        </div>
                        <div className="col">
                            <input type={'number'} value={updatedTotalPrice} onChange={(e) => changeTotalPrice(e.target.value)}></input>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row">
                <div className="col-9"></div>
                <div className="col-3 btn-right">
                    {
                        saledata &&
                        <button disabled={isDisabled} onClick={handleShow} className='btn btn-primary'> Add Sale </button>
                    }
                    {/* <button onClick={handleMigrate}>Migrate</button> */}
                </div>
            </div><div className="row">
                <Modal show={show} onHide={handleClose} centered size="lg">
                    <Modal.Header closeButton>
                        <Modal.Title>Preview the sale</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <div className="row sale-row-h">
                            <div className="col-5">Product Name</div>
                            <div className="col-2">Unit Price</div>
                            <div className="col-2">Quantity</div>
                            <div className="col-2">Total Price</div>
                        </div>
                        {
                            saledata &&
                            saledata.map((item, i) => {
                                return (
                                    <div className='row product-name-row-sale' key={i} >
                                        <div className="col-5">{item.name}</div>
                                        <div className="col-2">{item.price}</div>
                                        <div className="col-2">
                                            {item.quantity}
                                        </div>
                                        <div className="col-2">{item.price * item.quantity}</div>
                                    </div>
                                )
                            })
                        }

                        <div className="row">
                            <div className="col-6"></div>
                            <div className="col-5">
                                <div className="row">
                                    <div className="col">
                                        Total Price
                                    </div>
                                    <div className="col">
                                        {totalPrice}
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        Discount
                                    </div>
                                    <div className="col">
                                        <strong>{discount}</strong>
                                    </div>
                                </div>
                                <div className="row">
                                    <div className="col">
                                        Billed Price
                                    </div>
                                    <div className="col">
                                        {updatedTotalPrice}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleClose}>
                            Close
                        </Button>
                        <Button variant="primary" disabled={isDisabledSaveSales} onClick={() => addTransation()}>
                            Save Sales
                        </Button>
                    </Modal.Footer>
                </Modal>
            </div>
        </div>
    )
}

export default AddSale
