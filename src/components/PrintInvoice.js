import { useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import swal from 'sweetalert';


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

    const [showPrint, SetShowPrint] = useState(true);
    const [customerName, SetCustomrName]=useState('');
    const handlePrint = () => {
        if(customerName.length>0){
           
            SetShowPrint(false)
            setTimeout(function () {
                window.print()
            }, 200)
        }else{
            swal("Provide customer name for the invoice");
        }

    }


    return (

        <div className="row-border invoice-row-start-p">
            <div className="row unset-p-m border-b">
                <div className="col-10 col-fix col-fix-left invoice-t-p">
                    <strong>KOTIAN AYURVEDA - Invoice</strong>
                </div>
            </div>
            <div className="row unset-p-m border-b invoice-co">
                <div className="col col-fix col-fix-left address-fix">
                    <span>
                        <strong>Kotian Ayurveda</strong> E-61/C, Ground Floor, 18th Cross Aravinda Nagara, Mysore 570023. Ph- 9008047017.  Email: help@drkotian.com. www.drkotian.com <strong> GSTIN: 29CXJPK8261M1ZN</strong>
                    </span>
                </div>
            </div>
            <div className="row border-b unset-p-m">
                <div className="col border-r col-fix col-fix-left">Date</div>
                <div className="col col-fix">
                    {
                        location.state &&
                        sales.date
                    }
                </div>
            </div>
            <div className="row unset-p-m border-b">
                <div className="col border-r col-fix col-fix-left">Invoice No</div>
                <div className="col col-fix">{sales.invoiceNo}</div>
            </div>
            <div className="row unset-p-m border-b">
                <div className="col border-r col-fix col-fix-left"> Customer Name</div>
                <div className="col col-fix"><input className="remove-b-p " value={customerName} onChange={(e)=>SetCustomrName(e.target.value)} type="text" name="" id="" /></div>
            </div>
            <span className='print-h col-fix col-fix-left'>Item Details</span>
            <div className="row unset-p-m print-h border-t border-b">
                <div className="col-5 border-r col-fix col-fix-left">
                    Name
                </div>
                <div className="col-2 border-r col-fix">
                    Price
                </div>
                <div className="col-1 border-r col-fix">
                    No
                </div>
                <div className="col-1 border-r col-fix">Tax %</div>
                <div className="col-1 border-r col-fix">
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
                        <div className="row unset-p-m border-b font-fix" key={index}>
                            <div className="col-5 border-r col-fix col-fix-left">
                                {doc.name}
                            </div>
                            <div className="col-2 border-r col-fix">
                                {round(doc.priceperunit)}
                            </div>
                            <div className="col-1 border-r col-fix">
                                {doc.quantity}
                            </div>
                            <div className="col-1 border-r">
                                {doc.gst}
                            </div>
                            <div className="col-1 border-r col-fix">
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
                <div className="col col-fix-left">ICST</div>
                <div className="col">0</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col col-fix-left">CGST</div>
                <div className="col">{round(sales.gst / 2)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col col-fix-left">SGST</div>
                <div className="col">{round(sales.gst / 2)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
                <div className="col col-fix-left">GST</div>
                <div className="col">{round(sales.gst)}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">
            </div>

            <div className="row unset-p-m invoice-item-h border-b">

                <div className="col col-fix-left">Total</div>
                <div className="col col-fix-left">{location.state && location.state.totalPrice}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">

                <div className="col col-fix-left">Discount</div>
                <div className="col col-fix-left">{location.state && location.state.discount}</div>
            </div>
            <div className="row unset-p-m invoice-item-h border-b">

                <div className="col col-fix-left">Payable Amount</div>
                <div className="col col-fix-left">{location.state && Number(location.state.totalPrice) - Number(location.state.discount)}</div>
            </div>
            <div className="row unset-p-m  border-b">
                <div className="col-12">
                    <p className=' note-fix'>
                        Thank you for your business! All sales are final. Items once sold will not be taken back or exchanged. All Disputes subject to Mysore Jurisdiction only
                    </p>
                </div>
            </div>
            {
                showPrint &&
                <div className="row ">
                    <div className="col ">
                        <button onClick={handlePrint}>PRINT</button>
                    </div>
                </div>
            }

        </div>


    )
}

export default PrintInvoice
