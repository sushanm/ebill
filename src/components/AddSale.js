import React from 'react'
import { useEffect, useState } from 'react';
import TransactionDataService from "../services/transaction.services"
import StockDataService from "../services/stock.services"
import LocalStorageServices from '../services/localStorage.services';

function AddSale({ sales, callbackSalesUpdate, callbackaftersales }) {

    const [saledata, SetSaleData] = useState();
    const [isDisabled, SetDisabled] = useState(true);
    const [isDataUpdated, SetIsDataUpdated] = useState(false);
    const [totalPrice, SetTotalPrice] = useState(0);
    const [updatedTotalPrice, SetUpdatedTotalPrice] = useState(0);
    const [discount, SetDiscount] = useState(0);

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
            salesData.forEach((item) => {
                totalPrice = totalPrice + item.price * item.quantity;
            })
            SetTotalPrice(totalPrice);
            SetUpdatedTotalPrice(totalPrice);
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

    const addTransation = async () => {

        try {
            if (saledata.length > 0) {
                const cloneSaleData = [...saledata];
                const newTransaction = {
                    items: cloneSaleData,
                    saleDate: getDate(),
                    totalPrice: Number(totalPrice),
                    discount: Number(discount)
                };
                await TransactionDataService.addNewTransation(newTransaction);
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
            }
        } catch (error) {
            console.log(error.message);
        }
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
                        <button onClick={() => addTransation()} disabled={isDisabled} className='btn btn-primary'> Add Sale </button>
                    }

                </div>
            </div>
        </div>
    )
}

export default AddSale
