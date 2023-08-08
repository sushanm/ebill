import React from 'react'
import { useState, useEffect } from 'react';
import PurchaseOrderDataService from '../services/purchaseorder.services'

function PurchaseOrder() {
    const [newPo, SetNewPo] = useState("");
    const [newPoQauntity, SetNewPoQauntity] = useState("");
    const [poItems, SetPOItems] = useState([]);


    useEffect(() => {
        getAllPO();
    }, [])


    function getAllPO() {
        const data = PurchaseOrderDataService.getAllPurchaseOrder();
        if (!data) {
            setTimeout(function () {
                getAllPO();
            }, 1000)
        }
        else {
            SetPOItems(data)
        }
    }

    const addNewPO = async () => {
        let newPotoAdd = {
            name: newPo,
            quantity: newPoQauntity
        }
        await PurchaseOrderDataService.addNewPurchaseOrder(newPotoAdd).then(res => {
            let temp = {
                name: newPo,
                quantity: newPoQauntity,
                id: res.id
            }
            SetPOItems([...poItems, temp])
            PurchaseOrderDataService.addNewPurchaseOrderLocalStorage(temp)
            SetNewPo("");
            SetNewPoQauntity("")
        })
    }

    const itemReceived = async (id) => {
        await PurchaseOrderDataService.deletePO(id).then(res => {
            SetPOItems(poItems.filter(item=>item.id!==id));
            PurchaseOrderDataService.deletePOLocalStorage(id)
        })
    }

    return (
        <div className="row">
            <div className="row po-input-row">
                <div className="col-6">
                    <input type={'text'} className='po-input' placeholder='Item Name' value={newPo} onChange={(e) => SetNewPo(e.target.value)} />
                </div>
                <div className="col-2">
                    <input type={'text'} className='po-input' placeholder='Quantity' value={newPoQauntity} onChange={(e) => SetNewPoQauntity(e.target.value)} />
                </div>
                <div className="col-2">
                    <button onClick={addNewPO}>ADD</button>
                </div>
            </div>
            <div className="row">
                <div className="row row-h">
                    <div className="col-1">
                        SL. NO
                    </div>
                    <div className="col-5">
                        Item Name
                    </div>
                    <div className="col-2">
                        Quantity
                    </div>
                    <div className="col-2">
                        Action
                    </div>
                </div>

                {
                    poItems &&
                    poItems.map((doc, index) => {
                        return (
                            <div className="row row-po" key={index}>
                                <div className="col-1">
                                    {index + 1}
                                </div>
                                <div className="col-5">
                                    {doc.name}
                                </div>
                                <div className="col-2">
                                    {doc.quantity}
                                </div>
                                <div className="col-2">
                                    <button onClick={()=>itemReceived(doc.id)}>Item Received</button>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}

export default PurchaseOrder