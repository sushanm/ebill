import React from 'react'
import { useEffect, useState } from 'react';
import TransactionDataService from "../services/transaction.services"
import StockDataService from "../services/stock.services"

function AddSale({ sales, callbackSalesUpdate, callbackaftersales }) {

    const [saledata, SetSaleData] = useState();
    const [isDisabled, SetDisabled] = useState(true);
    const [isDataUpdated, SetIsDataUpdated] = useState(false);
    const [totalPrice, SetTotalPrice] = useState(0);
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
        console.log(Number(totalPrice) - Number(value))
        SetDiscount(Number(totalPrice) - Number(value))
       // SetTotalPrice(value)
    }

    const updateTotalPrice = (salesData) => {
        try {
            SetIsDataUpdated(true);
            let totalPrice = 0
            salesData.forEach((item) => {
                totalPrice = totalPrice + item.price * item.quantity;
            })
            SetTotalPrice(totalPrice);
        } catch (error) { }
    }

    const addTransation = async () => {

        try {
            if (saledata.length > 0) {
                const cloneSaleData = [...saledata];
                const newTransaction = {
                    items: cloneSaleData,
                    saleDate: new Date(),
                    totalPrice: totalPrice,
                    discount: discount
                };
                await TransactionDataService.addNewTransation(newTransaction);
                cloneSaleData.forEach(async item => {
                    AddOrEditBatch(item.id, item.quantity, item.batchId);
                });
                SetSaleData([]);
                callbackSalesUpdate([]);
                callbackaftersales(true);
            }
        } catch (error) {
            console.log(error.message);
        }
    }

    const AddOrEditBatch = async (productId, quantity, batchId) => {
        const docSnap = await StockDataService.getProduct(productId);
        let currentData = docSnap.data();
        const index = currentData.batch.findIndex(t => t.id === batchId);
        let qunatityToUpdate = currentData.batch[index].quantity - quantity;
        if (qunatityToUpdate <= 0) {
            currentData.batch = currentData.batch.filter((item) => item.id !== batchId)
        } else {
            currentData.batch[index].quantity = qunatityToUpdate;
        }
        if (currentData.batch.length > 0) {
            let totalQuantity = Number(currentData.batch.map(item => item.quantity).reduce((prev, next) => Number(prev) + Number(next)));
            currentData.totalQuantity = totalQuantity;
        }
        else {
            currentData.totalQuantity = 0;
        }

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
                            <input type={'number'}  onChange={(e) => changeTotalPrice(e.target.value)}></input>
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
