import React from 'react'
import StockDataService from "../services/stock.services"
import { useEffect } from 'react';
import { useState } from 'react';
import AddBatch from './AddBatch';

function AddStock() {

    const [products, setProducts] = useState([]);
    const [selectedProductId, SetSelectedProductId] = useState('I5kYzxXXtQj7Oj7YB1HS');
    const getAllProducts = async () => {
        const data = await StockDataService.getAllProducts();
        console.log(data.docs);
        setProducts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    }
    useEffect(() => {

        getAllProducts();
    }, [])


    const addNewProduct = async () => {
        let date = new Date();
        const batch = [
            { quantity: 1, expiryDate: date, price: 150 }
        ]

        const name = "Haridra Khandam 100gm"
        const usage = "used to treat asthama";

        try {

            const newBook = {
                name,
                batch,
                usage
            };
            await StockDataService.addNewProduct(newBook);
            console.log(newBook);
            getAllProducts();

        } catch (error) {
            console.log(error.message);
        }
    }

    const searchProducts = (val) => {
        let searchValue = val.target.value;
        console.log(val.target.value)
        if (searchValue.length > 0) {
            setProducts(products.filter(product => product.name.toLowerCase().includes(searchValue.toLowerCase()) || product.usage.toLowerCase().includes(searchValue.toLowerCase())))
        }
        else {
            getAllProducts();
        }
    }

    const addNewBatch = async (id) => {
        console.log(id)
        SetSelectedProductId(id)
        const docSnap = await StockDataService.getProduct(id);
        console.log("the record is :", docSnap.data());
        let currentData = docSnap.data();

        // currentData.batch.push({ quantity: 2, expiryDate: date, price: 20 })
        // await StockDataService.updateProduct(id,currentData);
    }

    return (
        <div>

            <div class="row">
                <div class="col-4">
                    <button onClick={addNewProduct} >Add New</button>
                    <input type={'text'} onChange={searchProducts} ></input>
                    {
                        products.map((doc, index) => {
                            return (
                                <div key={doc.id}>
                                    {doc.name}
                                    <button className="btn btn-primary" onClick={() => addNewBatch(doc.id)}>Add Batch</button>
                                </div>
                            )
                        })
                    }
                </div>
                <div class="col-8">
                    <AddBatch productId={selectedProductId} />
                </div>
            </div>




        </div>
    )
}

export default AddStock
