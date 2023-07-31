import React from 'react'
import StockDataService from "../services/stock.services"
import LocalStorageServices from '../services/localStorage.services';
import { useEffect, useState } from 'react';
import AddSale from './AddSale';

function AddBatch({ productId, newProduct, callBackMethod, saleMode, productName, callbackaftersalesFromBatch, usedFor }) {
    const [batch, SetBatch] = useState([]);
    const [editBatchRow, SetEditBatchRow] = useState();

    const [name, SetName] = useState();
    const [usage, SetUsage] = useState();
    const [expiryDate, SetExpiryDate] = useState();
    const [price, SetPrice] = useState();
    const [quantity, SetQuantity] = useState();
    const [sales, SetSales] = useState([])
    const [disableAdd, SetDisbaleAdd] = useState(false);
    const [productNameEdit, SetProductNameEdit] = useState(false);
    const [editMode, SetEditMode] = useState(false);


    const getProduct = async (id) => {
        try {
            const docSnap = await StockDataService.getProduct(id);
            if (docSnap.data()) {
                SetBatch(docSnap.data().batch);
            }
        } catch (error) {
            console.log(error.message);
        }

    }
    useEffect(() => {
        SetProductNameEdit(false)
        getProduct(productId)
    }, [productId])

    const callbackaftersales = (val) => {
        setTimeout(() => {
            getProduct(productId)
            callbackaftersalesFromBatch(val);
        }, "1000");
    }

    const addNewProduct = async () => {

        SetDisbaleAdd(true);
        setTimeout(() => {
            SetDisbaleAdd(false);
        }, "4000");

        let batch = [{
            id: 1,
            expiryDate: expiryDate,
            price: price,
            quantity: quantity
        }]
        let totalQuantity = quantity;
        try {

            const newProduct = {
                name,
                batch,
                usage,
                totalQuantity
            };
            await StockDataService.addNewProduct(newProduct).then(res => {
                LocalStorageServices.addNewProduct(res.id, name, usage, totalQuantity, batch);
                callBackMethod(res.id, name, usage);
            });
        } catch (error) {
            console.log(error.message);
        }
        resetFields();
    }

    const AddOrEditBatch = async (isedit, id) => {
        SetDisbaleAdd(true);
        setTimeout(() => {
            SetDisbaleAdd(false);
        }, "4000");

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
        LocalStorageServices.addOrEditProduct(productId, currentData);
        callbackaftersalesFromBatch(true)
        getProduct(productId);
        SetEditBatchRow(-1);
        resetFields();
    }

    const editBatch = async (index, row) => {
        SetEditMode(true);
        SetEditBatchRow(index)
        SetExpiryDate(row.expiryDate);
        SetPrice(row.price)
        SetQuantity(row.quantity)
        getProduct(productId);
    }
    const resetFields = () => {
       // window.location.reload();
        SetExpiryDate("");
        SetPrice("")
        SetQuantity("")
        SetName("");
        SetUsage("");
        SetEditMode(false);
    }

    const addToSale = (batch) => {
        let saleData = {
            id: productId,
            name: productName,
            price: batch.price,
            quantity: 1,
            batchId: batch.id
        }
        SetSales([...sales, saleData])

    }
    const callbackSalesUpdate = (salesData) => {

        SetSales(salesData)
    }

    const [productNameForEdit, SetProductNameForEdit] = useState(productName);
    const [productUsageForEdit, SetProductUsageForEdit] = useState(usedFor);
    const editProductName = () => {
        SetProductNameEdit(true)
        SetProductNameForEdit(productName)
        SetProductUsageForEdit(usedFor)
    }
    const saveProductName = async () => {
        const docSnap = await StockDataService.getProduct(productId);
        let currentData = docSnap.data();
        currentData.name = productNameForEdit;
        currentData.usage = productUsageForEdit;
        await StockDataService.updateProduct(productId, currentData);
        LocalStorageServices.updateProductName(productId, productNameForEdit, productUsageForEdit);
        callBackMethod(productId, productNameForEdit, productUsageForEdit);
        SetProductNameEdit(false)
        SetProductNameForEdit('');
        SetProductUsageForEdit('')
    }

    return (
        <div>
            {
                newProduct &&
                <div className="row">
                    <div className="col">
                        <div className="row">
                            Product Name
                        </div>
                        <div className="row">
                            <input type={'text'} placeholder="Product Name" value={name} onChange={(evt) => SetName(evt.target.value)}></input>
                        </div>
                    </div>
                    <div className="col">
                        <div className="row">
                            Product Used For
                        </div>
                        <div className="row">
                            <input type={'text'} placeholder="Product Usage" value={usage} onChange={(evt) => SetUsage(evt.target.value)}></input>
                        </div>
                    </div>
                    <div className="row">
                        <div className="col batch-custom-col-h">Price</div>
                        <div className="col batch-custom-col-h"> Quantity</div>
                        <div className="col batch-custom-col-h">Expiry Date</div>
                        <div className="col batch-custom-col-h"> Action </div>
                    </div>

                    <div className="row">
                        <div className="col batch-custom-col"><input type={'number'} placeholder="Price" value={price} onChange={(evt) => SetPrice(evt.target.value)}></input></div>
                        <div className="col batch-custom-col"> <input type={'number'} placeholder="Quantity" value={quantity} onChange={(evt) => SetQuantity(evt.target.value)}></input></div>
                        <div className="col batch-custom-col"><input type={'month'} placeholder="Expiry Date" value={expiryDate}  onChange={(evt) => SetExpiryDate(evt.target.value)}></input></div>
                        <div className="col batch-custom-col"> <button className='btn btn-primary' onClick={() => addNewProduct()} >Add</button></div>
                    </div>


                </div>
            }
            {
                !newProduct &&
                <>
                    <div className="row">
                        <div className="col batch-custom-col-h">Price</div>
                        <div className="col batch-custom-col-h"> Quantity</div>
                        <div className="col batch-custom-col-h">Expiry Date</div>
                        <div className="col batch-custom-col-h"> Action </div>
                    </div>
                    {
                        !editMode &&
                        <div className="row">
                            <div className="col batch-custom-col"><input type={'number'} placeholder="Price" value={price}   onChange={(evt) => SetPrice(evt.target.value)}></input></div>
                            <div className="col batch-custom-col"> <input type={'number'} placeholder="Quantity" value={quantity} onChange={(evt) => SetQuantity(evt.target.value)}></input></div>
                            <div className="col batch-custom-col"><input type={'month'} placeholder="Expiry Date" value={expiryDate} onChange={(evt) => SetExpiryDate(evt.target.value)}></input></div>
                            <div className="col batch-custom-col"> <button onClick={() => AddOrEditBatch(false, -1)} disabled={disableAdd} >Add</button></div>
                        </div>
                    }

                    {
                        batch.map((item, index) => {
                            return (
                                <div key={index} className="row batch-custom-row">
                                    {
                                        editBatchRow === index ? <>
                                            <div className="col batch-custom-col"><input type={'number'} value={price} placeholder="Price" onChange={(evt) => SetPrice(evt.target.value)}></input></div>
                                            <div className="col batch-custom-col"> <input type={'number'} value={quantity} placeholder="Quantity" onChange={(evt) => SetQuantity(evt.target.value)}></input></div>
                                            <div className="col batch-custom-col"><input type={'month'} placeholder="Expiry Date" value={expiryDate} onChange={(evt) => SetExpiryDate(evt.target.value)}></input></div>

                                            <div className="col batch-custom-col"> <button onClick={() => AddOrEditBatch(true, item.id)} >Save</button></div>
                                        </> : <>
                                            <div className="col batch-custom-col">
                                                {item.price}
                                            </div>
                                            <div className="col batch-custom-col">{item.quantity}</div>
                                            <div className="col batch-custom-col">{item.expiryDate}</div>
                                            <div className="col batch-custom-col">
                                                <div className="row">
                                                    <div className="col">
                                                        <button onClick={() => editBatch(index, item)} >Edit</button>
                                                    </div>
                                                    <div className="col">
                                                        <button onClick={() => addToSale(item)} >Add To Sale</button>
                                                    </div>
                                                </div>
                                            </div>

                                        </>
                                    }

                                </div>
                            )
                        })
                    }
                </>
            }
            <div className="row">
                {
                    !productNameEdit && !newProduct &&
                    <div className="row">
                        <div className="col-2 batch-custom-col-h">Usage</div>
                        <div className="col-6 ">{usedFor}
                        {
                            usedFor &&
                            <img onClick={editProductName} className='edit-img' alt='edit' src='../../assets/edit.png' />
                        }
                        </div>
                    </div>
                }
                {
                    productNameEdit &&
                    <div className="row">
                        <div className="col-5 ">
                            <input type="text" style={{ 'width': '100%' }} value={productNameForEdit} onChange={(e) => SetProductNameForEdit(e.target.value)} />
                        </div>
                        <div className="col-5 ">
                            <input type="text" value={productUsageForEdit} style={{ 'width': '100%' }} onChange={(e) => SetProductUsageForEdit(e.target.value)} />
                        </div>
                        <div className="col-2 ">
                            <button onClick={saveProductName}>Save</button>
                        </div>
                    </div>
                }
            </div>
            <AddSale sales={sales} callbackSalesUpdate={callbackSalesUpdate} callbackaftersales={callbackaftersales} />
        </div>
    )
}

export default AddBatch
