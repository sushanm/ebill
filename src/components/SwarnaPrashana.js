import React, { useState, useEffect, useCallback } from "react";
import swarnaprashanaServices from "../services/swarnaprashana.services";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../firebase";
function SwarnaPrashana() {
  const [existingKids, SetExistingKids] = useState([]);
  const [newSPDate, SetNewSPDate] = useState("");
  const [newKidName, SetNewKidName] = useState("");
  const [newKidAge, SetNewKidAge] = useState("");
  const [newKidWeight, SetNewKidWeight] = useState("");
  const [filterDate, SetFilterDate] = useState(
    new Date().toISOString().substring(0, 10)
  );
  const [disableNewKid, SetDisableNewKid] = useState(false);
  const [addnewKid, SetAddNewKid] = useState(true);
  const [spFeature, SetSpFeature] = useState();

  const [searchChild, SetSearchChild] = useState("");
  const [selectedKid, SetSelectedKid] = useState({});

  const getAllData = async () => {
    SetFilterDate(new Date().toISOString().substring(0, 10));

    const docData = await swarnaprashanaServices.spManageGetAll();
    if (docData.data()) {
      SetExistingKids(docData.data().kids);
      SetSpFeature(docData.data());
    }
  };

  useEffect(() => {
    getAllData();
  }, []);

  const addNewSPDate = async () => {
    let tempData = {
      date: newSPDate,
    };
    await swarnaprashanaServices.spManageAdd(tempData, "date").then((data) => {
      let cloneData = JSON.parse(JSON.stringify(spFeature));
    });
  };

  const resetNewKid = () => {
    SetSelectedKid({});
    SetNewKidName("");
    SetNewKidAge("");
    SetNewKidWeight("");
    setTimeout(() => {
      SetDisableNewKid(false);
    }, "1000");
  };

  const addNewKid = async () => {
    if (newKidName && newKidAge && newKidWeight) {
      SetDisableNewKid(true);
      let tempData = {
        id: "",
        name: newKidName,
        age: newKidAge,
        weight: newKidWeight,
      };
      await swarnaprashanaServices.spManageAdd(tempData, "sp").then((data) => {
        resetNewKid();
      });
    }
  };

  const clear = () => {
    resetNewKid();
    SetAddNewKid(true);
  };

  const updateKid = async () => {
    SetDisableNewKid(true);

    let tempData = {
      id: selectedKid.id,
      name: newKidName,
      age: newKidAge,
      weight: newKidWeight,
    };
    if (selectedKid) {
      tempData.id = selectedKid.id;
    }
    await swarnaprashanaServices.spManageAdd(tempData, "sp").then((data) => {
      SetDisableNewKid(false);
    });
  };

  const [dataChanged, SetDataChanged] = useState([]);

  useEffect(() => {
    try {
      const unsub = onSnapshot(doc(db, "sp", "swarnaPrashana"), (doc) => {
        let data = doc.data();
        if (data.kids) {
          SetSpFeature(data);
          SetExistingKids(data.kids);
          SetDataChanged((prev) => [...prev, []]);
        }
      });
      return () => {
        unsub();
      };
    } catch (e) {}
  }, []);

  // const validateData = (data) => {
  //     console.log(selectedKid)
  //     SetDataChanged([true])
  // }

  // useEffect(() => {
  //     const unsuscribe = onSnapshot(doc(db, "sp", "swarnaPrashana"), (querySnapshot) => {
  //         SetDataChanged((prev) => [...prev, []])
  //     });
  //     return () => {
  //         unsuscribe();
  //     }
  // }, [])

  useEffect(() => {
    //updated sp dates based on selected kid.
    if (spFeature && selectedKid) {
      SetSelectedKid(
        spFeature.kids.filter((item) => item.id === selectedKid.id)[0]
      );
    }
  }, [dataChanged]);

  const searchKids = (value) => {
    SetSearchChild(value);
    if (value) {
      let cloneKids = [...spFeature.kids];
      var term = value.trim().toLowerCase();
      var search = new RegExp(term, "i");
      SetExistingKids(
        cloneKids.filter((item) => search.test(item.name.toLowerCase()))
      );
    } else {
      SetExistingKids(spFeature.kids);
    }
  };

  const selectKid = (item) => {
    SetSelectedKid(item);
    SetNewKidName(item.name);
    SetNewKidAge(item.age);
    SetNewKidWeight(item.weight);
    SetDisableNewKid(false);
    SetAddNewKid(false);
  };
  var monthNames = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  function dateFormat(d) {
    var t = new Date(d);
    return t.getDate() + "-" + monthNames[t.getMonth()] + "-" + t.getFullYear();
  }

  const updateSp = async (data) => {
    let tempData = {
      id: selectedKid.id,
      date: data.date,
    };
    await swarnaprashanaServices.spManageAdd(tempData, "sp").then((data) => {});
  };

  const displayKidsData = (date) => {
    let kidNames = new Array();
    spFeature.kids.forEach((kid) => {
      kid.spDates.forEach((spDate) => {
        if (spDate.date == date && spDate.status == "done") {
          kidNames.push(kid.name);
        }
      });
    });

    if (kidNames.length == 0) {
      return <></>;
    }
    return (
      <>
        {kidNames.map((b, i) => {
          return (
            <span
              style={{
                paddingRight: "20px",
                color: i % 2 === 0 ? "red" : "blue", // Red for even, blue for odd
              }}
              key={i}
            >
              {b}
            </span>
          );
        })}
      </>
    );
  };

  return (
    <>
      <div className="row">
        <div className="col-4 border-r">
          <div className="row">
            <Form.Group className="mb-3" controlId="formBasicEmail">
              <Form.Label>Search Child</Form.Label>
              <Form.Control
                value={searchChild}
                onChange={(e) => searchKids(e.target.value)}
                type="text"
                placeholder="Search By Child"
              />
            </Form.Group>
          </div>
          <div className="row row-h">
            <div className="col-1">No.</div>
            <div className="col-11">Name</div>
          </div>
          {existingKids &&
            existingKids.map((b, i) => {
              return (
                <>
                  {selectedKid && (
                    <div
                      className="row border-b kids-row"
                      onClick={() => selectKid(b)}
                      key={i}
                      style={{
                        backgroundColor:
                          b.id === selectedKid.id ? "#def1d5" : "white",
                      }}
                    >
                      <div className="col-1">{i + 1}</div>
                      <div className="col-11">
                        {b.name} - {b.age} Years - {b.weight} Kg
                      </div>
                    </div>
                  )}
                  {!selectedKid && (
                    <div
                      className="row border-b kids-row"
                      onClick={() => selectKid(b)}
                      key={i}
                    >
                      <div className="col-1">{i + 1}</div>
                      <div className="col-11">
                        {b.name} - {b.age} Years - {b.weight} Kg
                      </div>
                    </div>
                  )}
                </>
              );
            })}
        </div>
        <div className="col-8">
          <div className="row">
            <div className="col-3">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Child Name</Form.Label>
                <Form.Control
                  value={newKidName}
                  onChange={(e) => {
                    SetNewKidName(e.target.value);
                  }}
                  type="text"
                  placeholder="Enter Child Name"
                />
              </Form.Group>
            </div>
            <div className="col-2">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Child Age</Form.Label>
                <Form.Control
                  value={newKidAge}
                  type="number"
                  onChange={(e) => SetNewKidAge(e.target.value)}
                  placeholder="Enter Child Age"
                />
              </Form.Group>
            </div>
            <div className="col-2">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Form.Label>Child Weight</Form.Label>
                <Form.Control
                  value={newKidWeight}
                  type="number"
                  onChange={(e) => SetNewKidWeight(e.target.value)}
                  placeholder="Enter Child Weight"
                />
              </Form.Group>
            </div>
            <div className="col-2">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                {addnewKid && (
                  <Button
                    disabled={disableNewKid}
                    variant="primary"
                    className="btn-submit btn-new"
                    type="submit"
                    onClick={addNewKid}
                  >
                    Add New
                  </Button>
                )}
                {!addnewKid && (
                  <Button
                    disabled={disableNewKid}
                    variant="warning"
                    className="btn-submit"
                    type="submit"
                    onClick={updateKid}
                  >
                    Update
                  </Button>
                )}
              </Form.Group>
            </div>
            <div className="col-1">
              <Form.Group className="mb-3" controlId="formBasicEmail">
                <Button
                  variant="secondary"
                  className="btn-submit"
                  type="submit"
                  onClick={clear}
                >
                  Clear
                </Button>
              </Form.Group>
            </div>
          </div>
          <div className="row">
            <div className="col">
              <h5>
                {selectedKid && (
                  <>
                    Name : <strong>{selectedKid.name}</strong> -{" "}
                    <strong>{selectedKid.age}</strong> Years -{" "}
                    <strong>{selectedKid.weight} Kg</strong>
                  </>
                )}
              </h5>
            </div>
          </div>
          <div className="row">
            {selectedKid &&
              selectedKid.spDates &&
              selectedKid.spDates.map((b, i) => {
                return (
                  <>
                    {b.status === "wip" && (
                      <>
                        <div className="col-2 sp-tile sp-tile-wip" key={i}>
                          <div className="row border-b">
                            {dateFormat(b.date)}
                          </div>
                          <div className="row sp-tile-wip-add-row">
                            <img
                              className="sp-tile-done-img"
                              onClick={() => updateSp(b)}
                              alt="edit"
                              src="/ebill/assets/add.gif"
                            />
                          </div>
                        </div>
                      </>
                    )}
                    {b.status === "done" && (
                      <>
                        <div className="col-2 sp-tile sp-tile-done" key={i}>
                          <div className="row border-b">
                            {dateFormat(b.date)}
                          </div>
                          <div className="row">
                            <img
                              className="sp-tile-done-img"
                              alt="edit"
                              src="/ebill/assets/right.png"
                            />
                          </div>
                        </div>
                      </>
                    )}
                  </>
                );
              })}
          </div>
        </div>
      </div>

      <div className="row border-t sp-set-date">
        <div className="row">
          <div className="col-2">Set Swarna Prashan date</div>
          <div className="col-2">
            <input
              type={"date"}
              value={newSPDate}
              onChange={(e) => SetNewSPDate(e.target.value)}
            ></input>
          </div>
          <div className="col-2">
            <button onClick={addNewSPDate}>Submit</button>
          </div>
        </div>
        <div className="row border-b row-h">
          <div className="col-1">SL. No</div>
          <div className="col-2">Dates</div>
          <div className="col-2">Kids Count</div>
          <div className="col-7">Kids Name</div>
        </div>
        {spFeature &&
          spFeature.spDates &&
          spFeature.spDates.map((b, i) => {
            return (
              <div className="row border-b" key={i}>
                <div className="col-1">{i + 1}</div>
                <div className="col-2">{b.date}</div>
                <div className="col-2">{b.numberOfSp}</div>
                <div
                  className="col-7"
                  style={{ display: "flex", flexWrap: "wrap" }}
                >
                  {displayKidsData(b.date)}
                </div>
              </div>
            );
          })}
      </div>
    </>
  );
}

export default SwarnaPrashana;
