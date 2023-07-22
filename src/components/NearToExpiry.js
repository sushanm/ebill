import React from 'react'
import { useState } from 'react';
import StockDataService from "../services/stock.services"
import { useEffect } from 'react';

function NearToExpiry() {
    const [products, setProducts] = useState([]);

    const getAllProducts = async () => {
        const data = await StockDataService.getAllProducts();
        let tempProd = new Array();;
        let allProducts = data.docs.map((doc) => ({ ...doc.data(), id: doc.id }));
        allProducts.forEach(item => {
            item.batch.forEach(batch => {
                if (isNearToExpiry(batch.expiryDate)) {
                    item.batch.expiry = true;
                    tempProd.push(item);
                    return;
                }
            })
        })
        setProducts(tempProd)
        // setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    useEffect(() => {
        getAllProducts();
    }, [])

    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    function isNearToExpiry(date) {
        const monthYear = date.split('-');
        const batchYear = Number(monthYear[0]);
        const batchMonth = Number(monthYear[1]);
        const yearDiff = Number(batchYear) - Number(currentYear);
        const monthDiff = Number(batchMonth) - Number(currentMonth);
        if (yearDiff <= 1) {
            if (Number(monthDiff) < 7) {
                return true;
            }
        }
    }

    const searchProducts = (val) => {
        let searchValue = val.target.value;
        if (searchValue.length > 0) {
            setProducts(products.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()) || product.usage.toLowerCase().includes(searchValue.toLowerCase())))
        }
        else {
            getAllProducts();
        }
    }
    return (
        <div>
            <div className="row">
                <div className="col-1 batch-custom-col-h">
                    No.
                </div>
                <div className="col-4 batch-custom-col-h">
                    Name
                </div>
                <div className="col-7">
                    <div className="row">
                        <div className="col batch-custom-col-h">Price</div>
                        <div className="col batch-custom-col-h"> Quantity</div>
                        <div className="col batch-custom-col-h">Expiry Date</div>

                    </div>
                </div>
            </div>
            {
                products.map((doc, index) => {
                    return (
                        <div className='row product-name-row' key={doc.id} >
                            <div className="col-1">
                                {index + 1}
                            </div>
                            <div className="col-4">
                                {doc.name}
                            </div>
                            <div className="col-7">
                                {

                                    doc.batch.map((b, i) => {
                                        return (
                                            <div className='row product-name-row' key={i} style={{ backgroundColor: b.expiry === true ? '#bdbdbd' : 'white' }}  >
                                                <div className="col">
                                                    {b.price}
                                                </div>
                                                <div className="col">  {b.quantity}</div>
                                                <div className="col">  {b.expiryDate}</div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                })
            }
        </div>
    )
}

export default NearToExpiry
