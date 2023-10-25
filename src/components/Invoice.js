import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
function Invoice() {

    const location = useLocation();
    const [sales, SetSales] = useState({ date: '', invoiceNo: '', items: [], gst: 0 });
    useEffect(() => {
        if (location.state) {
            let saleDate = location.state.saleDate.split('-')
            const invoice = saleDate[2] + saleDate[1] + saleDate[0] + location.state.lineItem;
            let totalGst = 0
            location.state.items.forEach(element => {
                totalGst = totalGst + Number(element.gstValue);
            });
            let data = {
                date: location.state.saleDate, invoiceNo: invoice, items: location.state.items, gst: totalGst
            }

            SetSales(data)
        }

    }, [location.state])

    function round(value) {
        return Number(Math.round((value + Number.EPSILON) * 100) / 100);
    }

    return (

        <div className="row-border invoice-row-start">
            <div className="row unset-p-m border-b">
                <div className="col-10  invoice-t">KOTIAN AYURVEDA - Invoice</div>
                <div className="col-2">
                    <img className='logo-img' alt='edit' src='/ebill/assets/logo.png' />
                </div>
            </div>

            <div className="row unset-p-m border-b invoice-co">
                <div className="col-7 border-r">
                    <span>
                        <strong>Kotian Ayurveda</strong>
                        <p>E-61/C, Ground Floor, 18th Cross Aravinda Nagara, Mysore 570023. Ph- 9008047017.  Email: help@drkotian.com. www.drkotian.com</p>
                        <strong> GSTIN: 29CXJPK8261M1ZN</strong>
                    </span>
                </div>
                <div className="col-5 unset-p-m">
                    <div className="row border-b unset-p-m">
                        <div className="col border-r">Date</div>
                        <div className="col">
                            {
                                location.state &&
                                sales.date
                            }
                        </div>
                    </div>
                    <div className="row unset-p-m border-b">
                        <div className="col border-r">Invoice No</div>
                        <div className="col">{sales.invoiceNo}</div>
                    </div>
                </div>
            </div>
            <div className="row unset-p-m border-b">
                <div className="col border-r ">
                    <div className="row border-b">
                        Customer Name
                    </div>
                    <div className="row unset-p-m">
                        <input className="remove-b" type="text" name="" id="" />
                    </div>
                </div>
                <div className="col ">
                    <div className="row border-b">
                        Doctor
                    </div>
                    <div className="row unset-p-m">
                        Dr. Pooja J Kotian, BAMS, MD (Reg: 36186)
                    </div>
                </div>
            </div>
            <h4 className='h4-invoice'>Item Details</h4>
            <div className="row unset-p-m invoice-items-h border-t">
                <div className="col-1 border-r">
                    Sl. No.
                </div>
                <div className="col-5 border-r">
                    Item Name
                </div>
                <div className="col-1 border-r">
                    Price Per Unit
                </div>
                <div className="col-1 border-r">
                    No's.
                </div>
                <div className="col-1 border-r">Tax %</div>
                <div className="col-1 border-r">
                    Tax
                </div>
                <div className="col-2">
                    Total
                </div>
            </div>
            {
                location.state &&
                sales.items.map((doc, index) => {
                    return (
                        <div className="row unset-p-m border-t border-b" key={index}>
                            <div className="col-1 border-r">
                                {index + 1}
                            </div>
                            <div className="col-5 border-r">
                                {doc.name}
                            </div>
                            <div className="col-1 border-r">
                                {round(doc.priceperunit)}
                            </div>
                            <div className="col-1 border-r">
                                {doc.quantity}
                            </div>
                            <div className="col-1 border-r">
                                {doc.gst}
                            </div>
                            <div className="col-1 border-r">
                                {round(doc.gstValue)}
                            </div>
                            <div className="col-2">
                                {Number(doc.price) * Number(doc.quantity)}
                            </div>
                        </div>
                    )
                })
            }
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col-7"></div>
                <div className="col-3">ICST</div>
                <div className="col-2">0</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col-7"></div>
                <div className="col-3">CGST</div>
                <div className="col-2">{round(sales.gst / 2)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col-7"></div>
                <div className="col-3">SGST</div>
                <div className="col-2">{round(sales.gst / 2)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col-7"></div>
                <div className="col-3">GST</div>
                <div className="col-2">{round(sales.gst)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col-7"></div>
                <div className="col-3">Total</div>
                <div className="col-2">{location.state && location.state.totalPrice}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col-7"></div>
                <div className="col-3">Discount</div>
                <div className="col">{location.state && location.state.discount}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col-7"></div>
                <div className="col-3">Payable Amount</div>
                <div className="col">{location.state && Number(location.state.totalPrice) - Number(location.state.discount)}</div>
            </div>
            <div className="row unset-p-m  border-b">
                <div className="col-12">
                    <p>
                        Thank you for your business!
                    </p>
                    <p>
                        All sales are final. Items once sold will not be taken back or exchanged. All Disputes subject to Mysore Jurisdiction only
                    </p>
                </div>
            </div>
        </div>


    )
}

export default Invoice
