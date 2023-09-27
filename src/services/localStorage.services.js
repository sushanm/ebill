import StockDataService from '../services/stock.services'

class LocalStorageService {


    getDate = () => {
        const today = new Date();
        const yyyy = today.getFullYear();
        let mm = today.getMonth() + 1;
        let dd = today.getDate();
        if (dd < 10) dd = '0' + dd;
        if (mm < 10) mm = '0' + mm;
        const formattedToday = dd + '-' + mm + '-' + yyyy;
        return formattedToday;
    }

    getAllProductsFromBD = async () => {
        const data = await StockDataService.getAllProducts();
        return data.docs.map((doc) => ({ ...doc.data(), id: doc.id }))
    }

    addNewProduct(id, name, usage, totalQuantity, batch, gst,giveDiscount) {
        let dataToAdd = {
            id: id,
            name: name,
            usage: usage,
            gst: gst,
            giveDiscount:giveDiscount,
            totalQuantity: totalQuantity,
            batch: batch
        }
        let dataFromLocal = JSON.parse(localStorage.getItem('drkotianproductdata'));
        dataFromLocal.push(dataToAdd);
        localStorage.setItem("drkotianproductdata", JSON.stringify(dataFromLocal));
    }

    updateProductName(id, name, usage, gst,giveDiscount) {
        let dataFromLocal = JSON.parse(localStorage.getItem('drkotianproductdata'));
        for (var i = 0; i < dataFromLocal.length; i++) {
            if (id === dataFromLocal[i].id) {
                dataFromLocal[i].name = name;
                dataFromLocal[i].usage = usage;
                dataFromLocal[i].gst = gst;
                dataFromLocal[i].giveDiscount = giveDiscount;
                break;
            }
        }
        localStorage.setItem("drkotianproductdata", JSON.stringify(dataFromLocal));
    }

    addOrEditProduct(id, data) {
        let dataFromLocal = JSON.parse(localStorage.getItem('drkotianproductdata'));
        for (var i = 0; i < dataFromLocal.length; i++) {
            if (id === dataFromLocal[i].id) {
                dataFromLocal[i].totalQuantity = data.totalQuantity;
                dataFromLocal[i].batch = data.batch;
                break;
            }
        }
        localStorage.setItem("drkotianproductdata", JSON.stringify(dataFromLocal));
    }

    async addTaxInformation(id, value) {
        const docSnap = await StockDataService.getProduct(id);
        if (docSnap.data()) {
            let productData = docSnap.data();
            productData.gst = Number(value);
            await StockDataService.updateProduct(id, productData).then(() => {
                let dataFromLocal = JSON.parse(localStorage.getItem('drkotianproductdata'));
                for (var i = 0; i < dataFromLocal.length; i++) {
                    if (id === dataFromLocal[i].id) {
                        dataFromLocal[i].gst = Number(value);
                        break;
                    }
                }
                localStorage.setItem("drkotianproductdata", JSON.stringify(dataFromLocal));
            })
        }
    }

    getAllProducts = () => {
        try {
            let refreshDate = localStorage.getItem('drkotianproductRefreshDate')
            if (refreshDate !== this.getDate()) {
                this.getAllProductsFromBD().then(data => {
                    localStorage.setItem('drkotianproductdata', JSON.stringify(data));
                    localStorage.setItem('drkotianproductRefreshDate', this.getDate());
                    return data;
                }).catch(err => {
                    console.log(err)
                });
            }
            else {
                return JSON.parse(localStorage.getItem('drkotianproductdata'));
            }
        } catch (error) {
            console.log(error)
        }
    }

    forceRefresh = () => {
        try {
            this.getAllProductsFromBD().then(data => {
                localStorage.setItem('drkotianproductdata', JSON.stringify(data));
                localStorage.setItem('drkotianproductRefreshDate', this.getDate());
            }).catch(err => {
                console.log(err)
            });
        } catch (error) {
            console.log(error)
        }
    }

    removeProduct(id) {
        let dataFromLocal = JSON.parse(localStorage.getItem('drkotianproductdata'));
        let temp = dataFromLocal.filter(item => item.id !== id);
        localStorage.setItem("drkotianproductdata", JSON.stringify(temp));
    }
}

export default new LocalStorageService();