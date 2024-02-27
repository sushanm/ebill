import React from 'react'
import StockDataService from "../services/stock.services"
import LocalStorageService from "../services/localStorage.services"
import { useEffect } from 'react';
import { useState } from 'react';
import AddBatch from './AddBatch';

function AddStock({ saleMode }) {

    const [searchText, SetSearchText] = useState('');
    const [showLoading, SetShowLoading] = useState(true);
    const [products, setProducts] = useState([]);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [isNewProduct, SetIsNewProduct] = useState(false);
    const [selectedProductId, SetSelectedProductId] = useState('');
    const [selectedProductName, SetSelectedProductName] = useState('');
    const [selectedProductGST, SetSelectedProductGST] = useState('');
    const [selectedProductUsedFor, SetSelectedProductUsedFor] = useState('');
    const [selectedGiveDiscount, SetGiveDiscount] = useState('');
    const [totalFiltedCount, SetTotalFiltedCount] = useState(0);


    function getAllProducts() {
        const data = LocalStorageService.getAllProducts();
        if (!data) {
            setTimeout(function () {
                getAllProducts();
            }, 1000)
        }
        else {
            data.sort(function (a, b) {
                var textA = a.name.toUpperCase();
                var textB = b.name.toUpperCase();
                return (textA < textB) ? -1 : (textA > textB) ? 1 : 0;
            });

            data.forEach(product => {
                product.batch.forEach(item => {
                    let monthdiffValue = isNearToExpiry(item.expiryDate)
                    if(monthdiffValue){
                        if(monthdiffValue < 7 ){
                            item.nearToExpiry=true;
                            product.nearToExpiry=true;
                        }
                    }
                });
            });

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

    let today = new Date();
    let currentYear = today.getFullYear();
    let currentMonth = today.getMonth() + 1;

    function isNearToExpiry(date) {
        let monthYear = date.split('-');
        let batchYear = Number(monthYear[0]);
        let batchMonth = Number(monthYear[1]);

        const yearDiff = Number(currentYear) - Number(batchYear);
        let monthDiff = Number(batchMonth) - Number(currentMonth);
        if (yearDiff === 0) {
            let monthDiffToShare = 11;
            monthDiff = Number(batchMonth) - Number(currentMonth);
            if (Number(monthDiff) < 7) {
                monthDiffToShare = Number(monthDiff)

                return monthDiffToShare;
            }
        }
        else if (yearDiff === 1) {
            let tempCurrMonth = currentMonth + 13;
            let temp1 = Number(batchMonth) - Number(tempCurrMonth)
            return temp1;
        }
        else if (yearDiff === -1) {
            let tempCurrMonth =  currentMonth - 13;
            let temp1 = Number(batchMonth) - Number(tempCurrMonth)
            return temp1;
        }
    }

    const searchProducts = (val) => {
        SetSearchText(val.target.value)
        try {
            let searchValue = val.target.value.trim().toLowerCase();
            if (searchValue.length > 0) {
                if (searchValue.startsWith("p")) {
                    let searchArray = searchValue.split('p');
                    if (searchArray.length > 1) {
                        if (isNumeric(searchArray[1])) {
                            setProductsForSearch(products.filter(product => product.name.toLowerCase().endsWith("p" + searchArray[1])))
                        } else {
                            setProductsForSearch(products.filter(product => product.name.toLowerCase().includes(searchValue) || product.usage.toLowerCase().includes(searchValue)))
                        }
                    }
                } else {
                    setProductsForSearch(products.filter(product => product.name.toLowerCase().includes(searchValue) || product.usage.toLowerCase().includes(searchValue)))
                }
            }
            else {
                getAllProducts();
            }
        } catch (error) { }
    }

    function isNumeric(num) {
        return !isNaN(num)
    }

    const addNewBatch = async (id, name, usage, gst, giveDiscount) => {
        SetIsNewProduct(false)
        SetSelectedProductId(id)
        SetSelectedProductUsedFor(usage);
        SetGiveDiscount(giveDiscount)
        SetSelectedProductName(name)
        SetSelectedProductGST(gst)
    }
    const newProductAdded = (id, name, usage, gst, giveDiscount) => {
        getAllProducts();
        SetIsNewProduct(false)
        SetSelectedProductName(name)
        SetSelectedProductUsedFor(usage);
        SetGiveDiscount(giveDiscount)
        SetSelectedProductId(id)
        SetSelectedProductGST(gst)
    }
    const callbackaftersalesFromBatch = (val) => {
        if (val) {
            setTimeout(() => {
                getAllProducts();
            }, "1000");

        }
    }
    const onSearchFocus = () => {
        SetSearchText('')
        getAllProducts();
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
                <div className="row stock-row">
                    <div className="col-3 ">
                        <div className="row">
                            <div className="col">
                                <div className="row">
                                    Search Product
                                </div>
                                <div className="row">
                                    <input type={'text'} value={searchText} className="order-1" tabIndex={'1'} onFocus={onSearchFocus} onChange={searchProducts} ></input>
                                </div>
                            </div>
                        </div>
                        {
                            !saleMode &&
                            <div className="row">
                                <div className="col-9">
                                    <button className='btn btn-primary' onClick={() => SetIsNewProduct(true)} >Add New Product</button>
                                </div>

                                <div className="col-3 count"><p>
                                    {totalFiltedCount}
                                </p>
                                </div>
                            </div>
                        }
                        <div className="row col-3-scroll">
                            {
                                productsForSearch &&
                                productsForSearch.map((doc, index) => {
                                    return (
                                        <div className={`row product-name-row ${doc.totalQuantity == 0 ? 'product-name-row-zero' : ''} ${doc.nearToExpiry== true ? 'blink' : ''}`} style={{ backgroundColor: selectedProductId === doc.id ? '#bdbdbd' : 'white' }} key={doc.id} onClick={() => addNewBatch(doc.id, doc.name, doc.usage, doc.gst, doc.giveDiscount)}>
                                            <div className="col-10">
                                                {doc.name}
                                            </div>

                                            <div className="col-2">
                                                {doc.totalQuantity}
                                            </div>
                                        </div>
                                    )
                                })
                            }
                        </div>

                    </div>
                    <div className="col-8">
                        <AddBatch productId={selectedProductId} newProduct={isNewProduct} callBackMethod={newProductAdded}
                            usedFor={selectedProductUsedFor}
                            saleMode={saleMode} productName={selectedProductName} callbackaftersalesFromBatch={callbackaftersalesFromBatch} gst={selectedProductGST} giveDiscountEdit={selectedGiveDiscount} />
                    </div>
                </div>
            }
        </div>
    )
}

export default AddStock
