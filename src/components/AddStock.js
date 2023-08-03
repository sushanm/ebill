import React from 'react'
import StockDataService from "../services/stock.services"
import LocalStorageService from "../services/localStorage.services"
import { useEffect } from 'react';
import { useState } from 'react';
import AddBatch from './AddBatch';

function AddStock({ saleMode }) {

    const [showLoading, SetShowLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [isNewProduct, SetIsNewProduct] = useState(false);
    const [selectedProductId, SetSelectedProductId] = useState('');
    const [selectedProductName, SetSelectedProductName] = useState('');
    const [selectedProductUsedFor, SetSelectedProductUsedFor] = useState('');
    const [totalFiltedCount, SetTotalFiltedCount] = useState(0);


    function getAllProducts() {
        const data = LocalStorageService.getAllProducts();
        if (!data) {
            setTimeout(function () {
                getAllProducts();
            }, 1000)
        }
        else {
            setProducts(data);
            setProductsForSearch(data)
            SetTotalFiltedCount(data.length)
            SetShowLoading(false);
        }
    }

    useEffect(() => {
        getAllProducts();
    }, [])

    useEffect(() => {
        SetTotalFiltedCount(productsForSearch.length)
    }, [productsForSearch])


    const searchProducts = (val) => {
        try {
            let searchValue = val.target.value.trim();
            if (searchValue.length > 0) {
                setProductsForSearch(products.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()) || product.usage.toLowerCase().includes(searchValue.toLowerCase())))
            }
            else {
                getAllProducts();
            }
        } catch (error) { }
    }


    const addNewBatch = async (id, name, usage) => {
        SetIsNewProduct(false)
        SetSelectedProductId(id)
        SetSelectedProductUsedFor(usage);
        SetSelectedProductName(name)
    }
    const newProductAdded = (id, name, usage) => {
        getAllProducts();
        SetIsNewProduct(false)
        SetSelectedProductName(name)
        SetSelectedProductUsedFor(usage);
        SetSelectedProductId(id)
    }
    const callbackaftersalesFromBatch = (val) => {
        if (val) {
            setTimeout(() => {
                getAllProducts();
            }, "1000");

        }
    }
    return (
        <div>
            {
                showLoading &&
                <div className="row row-loader">
                    <div className="loader"></div>
                </div>
            }
            {
                !showLoading &&
                <div className="row">
                    <div className="col-3 col-3-scroll">
                        <div className="row">
                            <div className="col">
                                <div className="row">
                                    Search Product
                                </div>
                                <div className="row">
                                    <input type={'text'} onChange={searchProducts} ></input>
                                </div>
                            </div>
                        </div>
                        {
                            !saleMode &&
                            <div className="row">
                                <div className="col-6">
                                    <button className='btn btn-primary' onClick={() => SetIsNewProduct(true)} >Add New Product</button>
                                </div>
                                <div className="col-3"></div>
                                <div className="col-3 count"><p>
                                {totalFiltedCount}
                                </p>
                                </div>
                            </div>
                        }
                        {
                            productsForSearch &&
                            productsForSearch.map((doc, index) => {
                                return (
                                    <div className='row product-name-row' style={{ backgroundColor: selectedProductId === doc.id ? '#bdbdbd' : 'white' }} key={doc.id} onClick={() => addNewBatch(doc.id, doc.name, doc.usage)}>
                                        <div className="col-9">
                                            {doc.name}
                                        </div>

                                        <div className="col-2">
                                            {doc.totalQuantity}
                                        </div>
                                        <div className="col-1">
                                            <button className="product-btn" onClick={() => addNewBatch(doc.id, doc.name, doc.usage)}>&#x226B;</button>
                                        </div>
                                    </div>
                                )
                            })
                        }
                    </div>
                    <div className="col-8">
                        <AddBatch productId={selectedProductId} newProduct={isNewProduct} callBackMethod={newProductAdded}
                            usedFor={selectedProductUsedFor}
                            saleMode={saleMode} productName={selectedProductName} callbackaftersalesFromBatch={callbackaftersalesFromBatch} />
                    </div>
                </div>
            }

        </div>
    )
}

export default AddStock
