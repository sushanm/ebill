import React from 'react'
import { useEffect, useState } from 'react';
import TransactionDataService from "../services/transaction.services"
import StockDataService from "../services/stock.services"

function AddSale({ sales, callbackSalesUpdate, callbackaftersales }) {

    const [saledata, SetSaleData] = useState();
    const [isDataUpdated, SetIsDataUpdated] = useState(false);
    useEffect(() => {
        SetSaleData(sales);
    }, [sales])

    useEffect(() => {
        if (isDataUpdated) {
            callbackSalesUpdate(saledata)
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
    }

    const addTransation = async () => {

        try {
            if (saledata.length > 0) {
                const cloneSaleData = [...saledata];
                const newTransaction = {
                    items: cloneSaleData,
                    saleDate: new Date()
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
        <div>
            <div className="row">
                <div className="col">Product Name</div>
                <div className="col">Unit Price</div>
                <div className="col">Quantity</div>
                <div className="col">Total Price</div>
                <div className="col">Action</div>
            </div>
            {
                saledata &&
                saledata.map((item, i) => {
                    return (
                        <div className='row product-name-row' key={i} >
                            <div className="col">{item.name}</div>
                            <div className="col">{item.price}</div>
                            <div className="col">
                                <input type={'number'} onChange={(val) => changeQuantity(val.target.value, i)} value={item.quantity}></input>
                            </div>
                            <div className="col">{item.price * item.quantity}</div>
                            <div className="col">
                                <button onClick={() => removeItem(item.id)}>X</button>
                            </div>
                        </div>
                    )
                })
            }
            <div className="row">
                <div className="col-3">
                    {
                        saledata &&
                        <button onClick={() => addTransation()} className='btn btn-primary'> Add Sale </button>
                    }

                </div>
            </div>
        </div>
    )
}

export default AddSale
