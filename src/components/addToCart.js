import React, { useState, useRef, useEffect } from "react";
import PurchaseOrderDataService from "../services/purchaseorder.services";

const DropdownButton = ({ newPo }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null); // Reference to the dropdown container

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Handle option click and close the dropdown
  const handleOptionClick = async (option) => {
    let newPotoAdd = {
      name: newPo,
      quantity: option,
    };

    await PurchaseOrderDataService.addNewPurchaseOrder(newPotoAdd).then(
      (res) => {
        let temp = {
          name: newPo,
          quantity: option,
          id: res.id,
        };
        PurchaseOrderDataService.addNewPurchaseOrderLocalStorage(temp);
      }
    );

    setIsOpen(false); // Close the dropdown after selecting an option
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false); // Close the dropdown if click is outside
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  return (
    <div style={styles.container} ref={dropdownRef}>
      <button onClick={toggleDropdown} style={styles.button}>
        +
      </button>
      {isOpen && (
        <div style={styles.dropdown}>
          <div style={styles.option} onClick={() => handleOptionClick("2")}>
            2
          </div>
          <div
            style={styles.option}
            onClick={() => handleOptionClick("Scheme")}
          >
            Scheme
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    position: "relative",
    display: "inline-block",
  },
  button: {
    backgroundColor: "#007bff",
    color: "white",
    border: "none",
    borderRadius: "50%",
    width: "40px",
    height: "40px",
    fontSize: "24px",
    cursor: "pointer",
  },
  dropdown: {
    position: "absolute",
    top: "50px",
    right: "0",
    backgroundColor: "rgb(107 93 93)",
    boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
    borderRadius: "4px",
    overflow: "hidden",
    zIndex: 100,
    color: "white",
  },
  option: {
    padding: "10px 20px",
    cursor: "pointer",
    borderBottom: "1px solid #f0f0f0",
  },
  optionLast: {
    borderBottom: "none",
  },
};

export default DropdownButton;
