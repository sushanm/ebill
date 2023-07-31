import React from 'react'
import { useState, useEffect } from 'react';
import LocalStorageServices from '../services/localStorage.services';

function LowStock() {

    const [lowStockQantity, SetLowStockQantity] = useState(1);
    const [products, SetProducts] = useState([]);

    const getAllProducts = async () => {
        let productData = LocalStorageServices.getAllProducts();
        productData = productData.filter(item => item.totalQuantity <= Number(lowStockQantity));

        productData.sort(function (a, b) {
            return Number(a.totalQuantity) - Number(b.totalQuantity)
        })

        productData.forEach(item => {
            let tempValue = 0
            item.batch.forEach(batch => {
                tempValue = tempValue + Number(batch.price) * Number(batch.quantity);
            })
            item.value=tempValue;
        })

        SetProducts(productData);
    }
    useEffect(() => {
        getAllProducts();
    }, [])

    useEffect(() => {
        getAllProducts();
    }, [lowStockQantity])

    return (
        <div className="row">
            <div className="row">
                <div className="col-2">
                    Low stock Quantity
                </div>
                <div className="col-2">
                    <input type={'number'} value={lowStockQantity} onChange={(e) => SetLowStockQantity(e.target.value)} />
                </div>
            </div>
            <div className="row">
                <div className="row row-h-low-stock">
                    <div className="col-1">No.</div>
                    <div className="col-4">Name</div>
                    <div className="col-1">Quantity</div>
                    <div className="col-2">Price Value</div>
                </div>

                {
                    products.map((item, i) => {
                        return (
                            <div className="row row-h-low-stock-col" key={i}>
                                <div className="col-1">{i + 1}</div>
                                <div className="col-4">{item.name}</div>
                                <div className="col-1">{item.totalQuantity}</div>
                                <div className="col-1" style={{ backgroundColor: item.value >= 500 ? '#fc6666' : '#fff' }}>{item.value}</div>
                            </div>
                        )
                    })
                }

            </div>
        </div>
    )
}

export default LowStock