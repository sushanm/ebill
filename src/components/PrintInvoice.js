import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
function PrintInvoice() {

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

        <div className="row-border invoice-row-start-p">
            <div className="row unset-p-m border-b">
                <div className="col-10 col-fix invoice-t-p">
                    <strong>KOTIAN AYURVEDA - Invoice</strong>
                </div>
            </div>
            <div className="row unset-p-m border-b invoice-co">
            <div className="col col-fix">
            <strong>Kotian Ayurveda</strong>
                <p>E-61/C, Ground Floor, 18th Cross Aravinda Nagara, Mysore 570023. Ph- 9008047017.  Email: help@drkotian.com. www.drkotian.com</p>
                <strong> GSTIN: 29CXJPK8261M1ZN</strong>
            </div>
            </div>
            <div className="row border-b unset-p-m">
                <div className="col border-r col-fix">Date</div>
                <div className="col col-fix">
                    {
                        location.state &&
                        sales.date
                    }
                </div>
            </div>
            <div className="row unset-p-m border-b">
                <div className="col border-r col-fix">Invoice No</div>
                <div className="col col-fix">{sales.invoiceNo}</div>
            </div>
            <div className="row unset-p-m border-b">
                <div className="row unset-p-m border-b">
                    <div className="col col-fix">
                        Customer Name
                    </div>
                </div>
                <div className="row unset-p-m unset-p-m">
                    <div className="col col-fix">
                        <input className="remove-b" type="text" name="" id="" />
                    </div>
                </div>
            </div>
            <span className='print-h col-fix'>Item Details</span>
            <div className="row unset-p-m print-h border-t">
                <div className="col-4 border-r col-fix">
                    Name
                </div>
                <div className="col-2 border-r col-fix">
                   Prince
                </div>
                <div className="col-2 border-r col-fix">
                    No
                </div>
                <div className="col-2 border-r col-fix">
                    Tax
                </div>
                <div className="col-2 col-fix">
                    Total
                </div>
            </div>
            {
                location.state &&
                sales.items.map((doc, index) => {
                    return (
                        <div className="row unset-p-m border-t border-b" key={index}>
                            <div className="col-4 border-r col-fix">
                                {doc.name}
                            </div>
                            <div className="col-2 border-r col-fix">
                                {round(doc.priceperunit)}
                            </div>
                            <div className="col-2 border-r col-fix">
                                {doc.quantity}
                            </div>
                            <div className="col-2 border-r col-fix">
                                {round(doc.gstValue)}
                            </div>
                            <div className="col-2 col-fix">
                                {Number(doc.price) * Number(doc.quantity)}
                            </div>
                        </div>
                    )
                })
            }
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col">ICST</div>
                <div className="col">0</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col">CGST</div>
                <div className="col">{round(sales.gst / 2)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col">SGST</div>
                <div className="col">{round(sales.gst / 2)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col">GST</div>
                <div className="col">{round(sales.gst)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
            </div>
            <div className="row unset-p-m invoice-item-h border-b">

                <div className="col">Total</div>
                <div className="col">{location.state && location.state.totalPrice}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">

                <div className="col">Discount</div>
                <div className="col">{location.state && location.state.discount}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">

                <div className="col">Payable Amount</div>
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

export default PrintInvoice
