import React from 'react'
import { useState, useEffect } from 'react';

function Patient() {
const[addNewPt, SetAddNewPt]=useState(false);
const[addNewPtName, SetAddNewPtName]=useState("")
const[addNewPtNo, SetAddNewPtNo]=useState("")
  return (
    <div className="row">
      <div className="row">
        <div className="col-2 border-r">
          <button className="btn btn-secondary m-btn" onClick={()=>SetAddNewPt(true)}>Add New Patient</button>
        </div>
        { 
          addNewPt &&
          <div className="col-8">
            <div className="row">
              <div className="col-5">
                <input type={'text'} value={addNewPtName} onChange={(e)=>SetAddNewPtName(e.target.value)} placeholder="Name"></input>
              </div>
              <div className="col-5">
              <input type={'text'} value={addNewPtNo} onChange={(e)=>SetAddNewPtNo(e.target.value)} placeholder="Mobile"></input>
              </div>
              <div className="col-2">
              <button className="btn btn-secondary m-btn" >Save</button>
              </div>
            </div>
          </div>
        }
       
      </div>
      <div className="col-4 border-r">

      </div>
      <div className="col-8"></div>
    </div>
  )
}

export default Patient
