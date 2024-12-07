import React from "react";
import { useState, useEffect } from "react";
import LocalStorageServices from "../services/localStorage.services";
import PurchaseOrderDataService from "../services/purchaseorder.services";
import StockDataService from "../services/stock.services";
import DropdownButton from "./addToCart";

function LowStock() {
  const [lowStockQantity, SetLowStockQantity] = useState(1);
  const [products, SetProducts] = useState([]);
  const [productsCopy, SetProductsCopy] = useState([]);
  const [poItems, SetPOItems] = useState([]);
  const [adminOrUser, SetadminOrUser] = useState("");

  function getAllPO() {
    const data = PurchaseOrderDataService.getAllPurchaseOrder();
    if (!data) {
      setTimeout(function () {
        getAllPO();
      }, 1000);
    } else {
      SetPOItems(data);
      updateProducts();
    }
  }

  const getAllProducts = async () => {
    let productData = LocalStorageServices.getAllProducts();
    if (productData) {
      productData = productData.filter(
        (item) => item.totalQuantity <= Number(lowStockQantity)
      );

      productData.sort(function (a, b) {
        return Number(a.totalQuantity) - Number(b.totalQuantity);
      });

      productData.forEach((item) => {
        let tempValue = 0;
        item.batch.forEach((batch) => {
          tempValue = tempValue + Number(batch.price) * Number(batch.quantity);
        });
        item.value = tempValue;
      });

      SetProducts(productData);
      SetProductsCopy(productData);
      updateProducts();
    } else {
      setTimeout(function () {
        getAllProducts();
      }, 2000);
    }
  };

  useEffect(() => {
    getAllProducts();
    getAllPO();
  }, []);
  useEffect(() => {
    updateProducts();
  }, [products]);

  const updateProducts = () => {
    if (products.length > 0 && poItems.length > 0) {
      let tempProducts = [...products];
      tempProducts.forEach((product) => {
        const itemFromPo = poItems.filter((item) => item.name === product.name);
        if (itemFromPo.length > 0) {
          product.addedToPO = true;
        } else {
          product.addedToPO = false;
        }
      });
      SetProductsCopy(tempProducts);
    }
  };

  const addNewPO = async (newPo) => {
    const newPoQauntity = "Order Accordingly";
    let newPotoAdd = {
      name: newPo,
      quantity: newPoQauntity,
    };
    await PurchaseOrderDataService.addNewPurchaseOrder(newPotoAdd).then(
      (res) => {
        let temp = {
          name: newPo,
          quantity: newPoQauntity,
          id: res.id,
        };
        PurchaseOrderDataService.addNewPurchaseOrderLocalStorage(temp);
        getAllProducts();
        getAllPO();
      }
    );
  };

  //Remove
  const removeProduct = async (data) => {
    await StockDataService.deleteProduct(data.id).then((res) => {
      getAllProducts();
      getAllPO();
    });
  };

  useEffect(() => {
    getAllProducts();
  }, [lowStockQantity]);

  useEffect(() => {
    let dataFromLocal = JSON.parse(
      localStorage.getItem("getDrKotianConnection")
    );
    const arryData = dataFromLocal.split(";");
    SetadminOrUser(arryData[8]);
  }, []);

  return (
    <div className="row">
      <div className="row">
        <div className="col-2">Low stock Quantity</div>
        <div className="col-2">
          <input
            type={"number"}
            value={lowStockQantity}
            onChange={(e) => SetLowStockQantity(e.target.value)}
          />
        </div>
      </div>
      <div className="row">
        <div className="row row-h-low-stock">
          <div className="col-1">No.</div>
          <div className="col-4">Name</div>
          <div className="col-1">Quantity</div>
          <div className="col-1">Price Value</div>
          <div className="col-2">Action</div>
          <div className="col-2">Remove</div>
        </div>

        {productsCopy.map((item, i) => {
          return (
            <div className="row row-h-low-stock-col" key={i}>
              <div className="col-1">{i + 1}</div>
              <div className="col-4">{item.name}</div>
              <div className="col-1">{item.totalQuantity}</div>
              <div
                className="col-1"
                style={{
                  backgroundColor: item.value >= 500 ? "#fc6666" : "#fff",
                }}
              >
                {item.value}
              </div>
              {item.addedToPO && (
                <div className="col-2">
                  <span>Item Added to PO</span>
                </div>
              )}
              {!item.addedToPO && (
                <div className="col-2">
                  <DropdownButton newPo={item.name} />
                  {/* <button onClick={() => addNewPO(item.name)}>
                    Add to Purchase Order
                  </button> */}
                </div>
              )}
              <div className="col-2">
                {item.totalQuantity == 0 && adminOrUser === "admin" && (
                  <button
                    onClick={() => removeProduct(item)}
                    style={{ backgroundColor: "red", color: "white" }}
                  >
                    Remove Product
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default LowStock;
