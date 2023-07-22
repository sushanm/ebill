import React, { useState, useEffect } from "react";
import { db } from "../firebase";
import "../App.css";

function RetrieveData() {
  const [contacts, setContacts] = useState([]);
  const [search, setSearch] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await db.collection("contacts").orderBy("createdDate").get();
      setContacts(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    };

    fetchData();
  }, []);

  useEffect(() => {
    setFilteredContacts(
      contacts.filter(
        (user) =>
          user.name.toLowerCase().includes(search.toLowerCase()) ||
          user.city.toLowerCase().includes(search.toLowerCase())
      )
    );
  }, [search, contacts]);
  return (
    <>
      <div className="App">
        <h1>Contact Details</h1>
        <input
          type="text"
          placeholder="Search"
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>
      <div>
        {filteredContacts.map((contact) => [
          <ol>
            <b>Consumer Details :</b> {<br />}
            {contact.name},{<br />}
            {contact.email},{<br />}
            {contact.city},{<br />}
            {contact.contact},{<br />}
          </ol>,
        ])}
      </div>
    </>
  );
}
export default RetrieveData;