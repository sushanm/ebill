import React from 'react'
import StockDataService from "../services/stock.services"
import { useEffect, useState } from 'react';

function AddBatch({ productId }) {
    const [batch, SetBatch] = useState([]);
    const [editBatchRow, SetEditBatchRow] = useState();

    const [expiryDate, SetExpiryDate] = useState();
    const [price, SetPrice] = useState();
    const [quantity, SetQuantity] = useState();

    const getProduct = async (id) => {
        const docSnap = await StockDataService.getProduct(id);
        console.log(docSnap.data().batch)
        SetBatch(docSnap.data().batch);
    }
    useEffect(() => {
        getProduct(productId)
    }, [productId])


    const addNewBatchOrProduct1 = () => {
        //  addNewBatchq(productId);
    }

    const addNewBatchOrProduct = async (isedit, id) => {
        const docSnap = await StockDataService.getProduct(productId);
        let currentData = docSnap.data();
        if (isedit) {
            const index = currentData.batch.findIndex(t => t.id === id);
            currentData.batch[index].quantity = quantity;
            currentData.batch[index].expiryDate = expiryDate;
            currentData.batch[index].price = price;
        }
        else {
            let newId = Math.max(...currentData.batch.map(o => o.id)) + 1
            currentData.batch.push({ id: newId, quantity: quantity, expiryDate: expiryDate, price: price })
        }
        let totalQuantity = Number(currentData.batch.map(item => item.quantity).reduce((prev, next) => Number(prev) + Number(next)));
        currentData.totalQuantity = totalQuantity;


        await StockDataService.updateProduct(productId, currentData);
        getProduct(productId);
        SetEditBatchRow(-1);
        resetFields();
    }

    const editBatch = async (index, row) => {
        SetEditBatchRow(index)
        SetExpiryDate(row.expiryDate);
        SetPrice(row.price)
        SetQuantity(row.quantity)
        getProduct(productId);
    }
    const resetFields = () => {
        SetExpiryDate();
        SetPrice()
        SetQuantity()
    }

    return (
        <div>
            <div className="row">
                <div className="col batch-custom-col-h">Price</div>
                <div className="col batch-custom-col-h"> Quantity</div>
                <div className="col batch-custom-col-h">Expiry Date</div>
                <div className="col batch-custom-col-h"> Action </div>
            </div>
            <div className="row">
                <div className="col batch-custom-col"><input type={'number'} placeholder="Price" onChange={(evt) => SetPrice(evt.target.value)}></input></div>
                <div className="col batch-custom-col"> <input type={'number'} placeholder="Quantity" onChange={(evt) => SetQuantity(evt.target.value)}></input></div>
                <div className="col batch-custom-col"><input type={'date'} placeholder="Expiry Date" onChange={(evt) => SetExpiryDate(evt.target.value)}></input></div>
                <div className="col batch-custom-col"> <button onClick={() => addNewBatchOrProduct(false, -1)} >Add</button></div>
            </div>


            {
                batch.map((item, index) => {
                    return (
                        <div key={index} className="row batch-custom-row">
                            {
                                editBatchRow === index ? <>
                                    <div className="col batch-custom-col"><input type={'number'} value={price} placeholder="Price" onChange={(evt) => SetPrice(evt.target.value)}></input></div>
                                    <div className="col batch-custom-col"> <input type={'number'} value={quantity} placeholder="Quantity" onChange={(evt) => SetQuantity(evt.target.value)}></input></div>
                                    <div className="col batch-custom-col"><input type={'date'} placeholder="Expiry Date" value={expiryDate} onChange={(evt) => SetExpiryDate(evt.target.value)}></input></div>

                                    <div className="col batch-custom-col"> <button onClick={() => addNewBatchOrProduct(true, item.id)} >Save</button></div>
                                </> : <>
                                    <div className="col batch-custom-col">
                                        {item.price}
                                    </div>
                                    <div className="col batch-custom-col">{item.quantity}</div>
                                    <div className="col batch-custom-col">{item.expiryDate}</div>
                                    <div className="col batch-custom-col"> <button onClick={() => editBatch(index, item)} >Edit</button></div>
                                </>
                            }

                        </div>
                    )
                })
            }





        </div>
    )
}

export default AddBatch
