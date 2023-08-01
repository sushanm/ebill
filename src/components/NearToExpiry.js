import React from 'react'
import { useState } from 'react';
import LocalStorageServices from '../services/localStorage.services';
import { useEffect } from 'react';

function NearToExpiry() {
    const [products, setProducts] = useState([]);

    const getAllProducts = async () => {
        let tempProd = new Array();;
        let allProducts = LocalStorageServices.getAllProducts();
        allProducts.forEach(item => {
            let previousBatchExpired = false;
            item.batch.forEach(batch => {
                // if (isNearToExpiry(batch.expiryDate)) {
                //     batch.expiry = true;
                //     if (!previousBatchExpired) {
                //         tempProd.push(item);
                //     }
                //     previousBatchExpired = true
                //     return;
                // }

                if (isNearToExpiry(batch.expiryDate) <= 3) {
                    batch.expiry = true;
                    batch.colorCode = '#FF3E00';
                    if (!previousBatchExpired) {
                        tempProd.push(item);
                    }
                    previousBatchExpired = true
                    return;
                }
                if (isNearToExpiry(batch.expiryDate) > 3 && isNearToExpiry(batch.expiryDate) <= 6) {
                    batch.expiry = true;
                    batch.colorCode = '#F5B19B';
                    if (!previousBatchExpired) {
                        tempProd.push(item);
                    }
                    previousBatchExpired = true
                    return;
                }
            })
        })
        setProducts(tempProd)
    }
    useEffect(() => {
        getAllProducts();
    }, [])

    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth();

    function isNearToExpiry(date) {
        let monthDiffToShare = 11;
        const monthYear = date.split('-');
        const batchYear = Number(monthYear[0]);
        const batchMonth = Number(monthYear[1]);
        const yearDiff = Number(batchYear) - Number(currentYear);
        let monthDiff = Number(batchMonth) - Number(currentMonth);

        if (yearDiff === 0) {
            monthDiff = Number(batchMonth) - Number(currentMonth);
            if (Number(monthDiff) < 7) {
                monthDiffToShare = Number(monthDiff)
                return monthDiffToShare;
            }
        }
        else if (yearDiff === 1) {
            let tempMonth = 11 - currentMonth;
            monthDiff = tempMonth + batchMonth
            if (Number(monthDiff) < 7) {
                monthDiffToShare = Number(monthDiff)
                return monthDiffToShare;
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
                            <div className="col-4" >
                                {doc.name}
                            </div>
                            <div className="col-7">
                                {

                                    doc.batch.map((b, i) => {
                                        return (
                                            <div className='row product-name-row' key={i} style={{ backgroundColor: b.expiry === true ? b.colorCode : 'white' }}  >
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
