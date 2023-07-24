import React from 'react'
import StockDataService from "../services/stock.services"
import { useEffect } from 'react';
import { useState } from 'react';
import AddBatch from './AddBatch';

function AddStock({ saleMode }) {

    const [products, setProducts] = useState([]);
    const [productsForSearch, setProductsForSearch] = useState([]);
    const [isNewProduct, SetIsNewProduct] = useState(false);
    const [selectedProductId, SetSelectedProductId] = useState('');
    const [selectedProductName, SetSelectedProductName] = useState('');
    const [selectedProductUsedFor, SetSelectedProductUsedFor]=useState('');
    const getAllProducts = async () => {
        const data = await StockDataService.getAllProducts();
        setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
        setProductsForSearch(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })))
    }
    useEffect(() => {
        getAllProducts();
    }, [])


    const searchProducts = (val) => {
        let searchValue = val.target.value;
        if (searchValue.length > 0) {
            setProductsForSearch(products.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()) || product.usage.toLowerCase().includes(searchValue.toLowerCase())))
        }
        else {
            getAllProducts();
        }
    }



    const addNewBatch = async (id, name, usage) => {
        SetIsNewProduct(false)
        SetSelectedProductId(id)
        SetSelectedProductUsedFor(usage);
        SetSelectedProductName(name)
    }
    const newProductAdded = (id, name,usage) => {
        getAllProducts();
        SetIsNewProduct(false)
        SetSelectedProductName(name)
        SetSelectedProductUsedFor(usage);
        SetSelectedProductId(id)
    }
const callbackaftersalesFromBatch=(val)=>{
    if(val){
        setTimeout(() => {
            getAllProducts();
          }, "1000");
        
    }
}
    return (
        <div>
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
                        </div>
                    }
                    {
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
        </div>
    )
}

export default AddStock
