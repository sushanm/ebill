import React from 'react'
import { useState, useEffect } from 'react';
import StockDataService from "../services/stock.services"

function LowStock() {

    const [lowStockQantity, SetLowStockQantity] = useState(1);
    const [products, SetProducts] = useState([]);

    const getAllProducts = async () => {
        const data = await StockDataService.getAllProducts();
        let productData = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        productData = productData.filter(item => item.totalQuantity <= lowStockQantity);
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
                </div>

                {
                    products.map((item, i) => {
                        return (
                            <div className="row row-h-low-stock-col" key={i}>
                                <div className="col-1">{i + 1}</div>
                                <div className="col-4">{item.name}</div>
                                <div className="col-1">{item.totalQuantity}</div>
                            </div>
                        )
                    })
                }

            </div>
        </div>
    )
}

export default LowStock