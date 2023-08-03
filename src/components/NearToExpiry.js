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
                let expDate=isNearToExpiry(batch.expiryDate);
                if (expDate <= 3) {
                    batch.expiry = true;
                    batch.colorCode = '#FF3E00';
                    item.monthToExpiry=expDate;
                    if (!previousBatchExpired) {
                        tempProd.push(item);
                    }
                    previousBatchExpired = true
                    return;
                }
                if (expDate > 3 && expDate <= 6) {
                    batch.expiry = true;
                    batch.colorCode = '#F5B19B';
                    item.monthToExpiry=expDate;
                    if (!previousBatchExpired) {
                        tempProd.push(item);
                    }
                    previousBatchExpired = true
                    return;
                }
            })
        })
        setProducts(sortByKey(tempProd,'monthToExpiry'))
    }
    function sortByKey(array, key) {
        return array.sort(function(a, b) {
            var x = a[key]; var y = b[key];
            return ((x < y) ? -1 : ((x > y) ? 1 : 0));
        });
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
                        <div className="col batch-custom-col-h">Months Remaining</div>
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
                                            b.expiry &&
                                            <div className='row product-name-row' key={i} style={{ backgroundColor: b.expiry === true ? b.colorCode : 'white' }}  >
                                                <div className="col">
                                                    {b.price}
                                                </div>
                                                <div className="col">  {b.quantity}</div>
                                                <div className="col">  {b.expiryDate}</div>
                                                <div className="col">{doc.monthToExpiry - 1}</div>
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
