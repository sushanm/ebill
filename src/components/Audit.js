import React from 'react'
import { useState, useEffect } from 'react';
import LocalStorageServices from '../services/localStorage.services';
import AuditService from '../services/audit.services';


function Audit() {

    const [adminOrUser, SetadminOrUser] = useState("");


    useEffect(() => {
        let dataFromLocal = JSON.parse(localStorage.getItem('getDrKotianConnection'));
        const arryData = dataFromLocal.split(';');
        SetadminOrUser(arryData[8])
        getAllProducts()
    }, [])

    const [products, SetProducts] = useState([]);
    const getAllProducts = async () => {
        let productData = LocalStorageServices.getAllProducts();
        if (productData) {
            await AuditService.getAuditInformation().then(res => {
                let currentAuditedInfo = res.data();
                if (currentAuditedInfo) {
                    currentAuditedInfo.products.forEach(auditProduct => {
                        if (!auditProduct.isAuditPassed) {
                            let productFromLocalDB = productData.find(item => item.id === auditProduct.id);
                            auditProduct.batch.forEach(auditBatch => {
                                let batchFromLocalDB = productFromLocalDB.batch.find(item => item.id == auditBatch.id);
                                if (batchFromLocalDB) {
                                    if (batchFromLocalDB.quantity != auditBatch.quantity) {
                                        auditBatch.quantity = batchFromLocalDB.quantity;
                                    }
                                } else {
                                    auditBatch.quantity = 0;
                                }
                            });
                        }
                    });
                    SetProducts(currentAuditedInfo.products);
                }
            })

        }
    }

    const startAudit = async () => {

        let productData = LocalStorageServices.getAllProducts();
        if (productData) {
            let auditInformation = new Array();

            productData.forEach(product => {
                let isValidProductForAudit = true;
                let productInfo = {
                    id: product.id,
                    name: product.name,
                    batch: [],
                    isAuditPassed: false
                }
                if (product.batch) {
                    if (product.batch.length === 0) {
                        isValidProductForAudit = false;
                    }
                }
                product.batch.forEach(batch => {
                    let tempBatch = {
                        id: batch.id,
                        quantity: Number(batch.quantity),
                        expiryDate: batch.expiryDate,
                        isAuditPassed: false
                    }
                    productInfo.batch.push(tempBatch)
                });
                if (isValidProductForAudit) {
                    auditInformation.push(productInfo)
                }
            });

            await AuditService.startAudit(auditInformation).then((res) => {
                console.log(res)
            })
        }


    }

    const updateProduct = (product, batch, value) => {
        let productsCloned = JSON.parse(JSON.stringify(products));
        let productIndexFromDB = productsCloned.findIndex(item => item.id === product.id);
        let productBatchIndexFromDB = productsCloned[productIndexFromDB].batch.findIndex(item => item.id === batch.id);
        productsCloned[productIndexFromDB].batch[productBatchIndexFromDB].actualStock = Number(value)
        productsCloned[productIndexFromDB].batch[productBatchIndexFromDB].isAuditPassed = batch.quantity === value ? true : false;
        SetProducts(productsCloned)
    }

    const conductAuditHandleBtn = async () => {
        let auditInformation = {
            products: new Array()
        };
        let productsCloned = JSON.parse(JSON.stringify(products));
        productsCloned.forEach(product => {
            let productisAuditPassed = true;

            product.batch.forEach(batch => {
                if (batch.actualStock === batch.quantity) {
                    batch.isAuditPassed = true;
                }

                if (!batch.isAuditPassed) {
                    productisAuditPassed = false;
                    return
                }
            });
            product.isAuditPassed = productisAuditPassed
            auditInformation.products.push(product)
        });
        SetProducts(auditInformation.products)
        await AuditService.conductAudit(auditInformation).then((res) => {
        })
    }

    return (
        <>
            <div className="row border-b">
                <div className="col-1">
                    <strong>SL. No</strong>
                </div>
                <div className="col-3">
                    <strong>Item Name</strong>
                </div>
                <div className="col-2">
                    <strong>
                        Expiry Date
                    </strong>
                </div>
                <div className="col-2">
                    <strong>
                        Stock In System
                    </strong>
                </div>
                <div className="col-2">
                    <strong>
                        Actual Stock
                    </strong>
                </div>
            </div>

            {
                products.filter((product => product.isAuditPassed === false)).map((item, indexp) => {
                    return (
                        <div className="row border-b" key={item.id}>
                        <div className="col-1">
                            {indexp + 1}
                        </div>
                            <div className="col-3">
                                {item.name}
                            </div>
                            <div className="col-8">
                                {
                                    item.batch.map((batchItem, indexb) => {
                                        return (
                                            <div className="row border-b" key={indexb}>
                                                <div className="col-3">
                                                    {batchItem.
                                                        expiryDate
                                                    }
                                                </div>
                                                <div className="col-3">
                                                    {batchItem.
                                                        quantity
                                                    }
                                                </div>
                                                <div className="col-3">
                                                    <input type={'number'}
                                                        onChange={(e) => {
                                                            updateProduct(item, batchItem, e.target.value)
                                                        }}
                                                        value={batchItem.actualStock}
                                                    ></input>
                                                    <button onClick={() => { conductAuditHandleBtn() }}>Save</button>
                                                </div>
                                            </div>
                                        )
                                    })
                                }
                            </div>
                        </div>
                    )
                })
            }

            {
                adminOrUser === 'admin' &&
                <>
                    <div className="row">
                        <div className="col-2">
                            <button className='btn btn-primary' onClick={() => startAudit()}>Start Audit</button>
                        </div>
                    </div>
                </>
            }

        </>
    )
}

export default Audit

