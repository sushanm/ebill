import React, { useState } from 'react'
import swarnaprashanaServices from '../services/swarnaprashana.services';

function SwarnaPrashana() {

    const [existingSwarnaPrashanaDates, SetExistingSwarnaPrashanDates] = useState([]);
    const[newSPDate, SetNewSPDate]=useState('');

    const addNewSPDate =async ()=>{
        await swarnaprashanaServices.addSwarnaPrashanDate(newSPDate).then((data) => {});
    }
    return (
        <>
            <div className="row"></div>
            <div className="row">
                <h5>Swarna Prashan Dates</h5>
                <div className="row">
                    <div className="col-4">Set Swarna Prashan date</div>
                    <div className="col-4">
                        <input type={'date'} value={newSPDate} onChange={(e)=>SetNewSPDate(e.target.value)} ></input>
                    </div>
                    <div className="col-2">
                        <button onClick={addNewSPDate}>Submit</button>
                    </div>
                </div>
                <div className="row">
                    <div className="col-2">SL. No</div>
                    <div className="col-4">Dates</div>
                </div>
                {
                    existingSwarnaPrashanaDates &&
                    existingSwarnaPrashanaDates.map((b, i) => {
                        return (
                            <div className="row" key={i}>
                                <div className="col-2">{i + 1}</div>
                                <div className="col-4">{b.date}</div>
                            </div>
                        )
                    })
                }
            </div>
        </>
    )
}

export default SwarnaPrashana