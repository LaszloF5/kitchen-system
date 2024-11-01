import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function Chamber({
  itemsChamber,
  setItemsChamber,
  moveToSL,
  regex,
  regexQtyBreakdown,
}) {

  // Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [tempQty, setTempQty] = useState("");
  const [tempIndex, setTempIndex] = useState(null);
  const setQtyChamberFormRef = useRef(null);
  const updateChamberFormRef = useRef(null);
  const addChamberFormRef = useRef(null);
  const [updateIdChamber, setUpdateIdChamber] = useState(null);

  // Visible transfer form
  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const toggleVisibleTransferForm = (index) => {
    setIsVisibleTransferForm(!isVisibleTransferForm);
    setTempIndex(index);
  };

  const SLText = isVisibleTransferForm ? "Close modification" : "Add to SL";

  // Visible Add form
  const [isVisible, setIsVisible] = useState(false);
  const isText = isVisible ? "Close add form" : "Add item";

  // Visible Update form

  const [isVisibleQuantity, setIsVisibleQuantity] = useState(false);
  const qunatityText = isVisibleQuantity ? "Close modification" : "Update item";

  // Functions

  // to the shopping list

  const handleTransferItem = () => {
    if (tempQty !== "") {
      const transferItem = {
        ...itemsChamber[tempIndex],
        quantity: tempQty,
        date:
          new Date().toISOString().split('T')[0],
      };
      moveToSL(transferItem.name, transferItem.quantity, transferItem.date, 'chamber_items', 'shoppingList_items')
      setTempQty("");
      setTempIndex(null);
      setIsVisibleTransferForm(false);
    } else {
      alert("Please enter a valid quantity.");
    }
  };

  useEffect(() => {
    if (isVisibleTransferForm) {
      setQtyChamberFormRef.current.focus();
    }

    if (isVisibleQuantity) {
      updateChamberFormRef.current.focus();
    }

    if (isVisible) {
      addChamberFormRef.current.focus();
    }
  }, [isVisibleTransferForm, isVisibleQuantity, isVisible]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const toggleAddForm = () => {
    setIsVisible(!isVisible);
  };

  const toggleUpdateForm = (index, id) => {
    setIsVisibleQuantity(!isVisibleQuantity);
    setUpdateIdChamber(id);
  };

  // Item modifier functions

  // Datas from the database

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:5500/chamber_items");
        setItemsChamber(response.data.items);
      } catch (error) {
        console.error("Error fetching items: ", error);
      }
    };
    fetchItems();
  }, [itemsChamber]);

  const handleAddChamber = async () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const vaildQty = Number(...newQuantity.match(regexQtyBreakdown));
      const unit = newQuantity.replace(Number.parseFloat(newQuantity), '');
      const newChamberItem = {
        name: newItem.trim(),
        quantity: `${vaildQty} ${unit}`,
        date_added: new Date().toISOString().split("T")[0],
      };
      try {
        await axios.post("http://localhost:5500/chamber_items", newChamberItem);
        const response = await axios.get("http://localhost:5500/chamber_items");
        setItemsChamber(response.data.items);
        setNewItem("");
        setNewQuantity("");
        setIsVisible(false);
      } catch {
        alert("An error occurred while saving the data.");
      }
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = async (index) => {
    const itemToDelete = itemsChamber[index];
    try {
      await axios.delete(
        `http://localhost:5500/chamber_items/${itemToDelete.id}`
      );
      const response = await axios.get("http://localhost:5500/chamber_items");
      setItemsChamber(response.data.items);
      setIsVisibleQuantity(false);
      setModifyQuantity("");
      setIsVisibleTransferForm(false);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    }
  };

  const handleUpdate = async () => {
    console.log(updateIdChamber);
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    }
    try {
     await axios.put(`http://localhost:5500/chamber_items/${updateIdChamber}`, {
        quantity: modifyQuantity.trim(),
      });
      const response = await axios.get("http://localhost:5500/chamber_items");
      setItemsChamber(response.data.items);
      setModifyQuantity("");
      setIsVisibleQuantity(false);
      setUpdateIdChamber(null);
    } 
    
    catch (error) {
      console.error("Error updating quantity:", error);
      alert("Error updating quantity. Please try again.");
    }
  };

  return (
    <>
      <h2>Chamber items</h2>
      <ul className="fridge-ul main-item-style">
        {itemsChamber.length === 0 ? (
          <p>Your chamber is empty.</p>
        ) : (
          itemsChamber.map((item, index) => (
            <li
              className={`fridge-li-element ${
                regex.test(item.quantity) ? "alert-color" : "default-color"
              }`}
              key={index}
            >
              {item.name} - {item.quantity}
              <p className="date">{item.date_added}</p>
              <div className="btns-container">
                <button
                  className="btn btn-others"
                  onClick={() => toggleVisibleTransferForm(index)}
                >
                  {SLText}
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(index)}
                >
                  Delete item
                </button>
                <button
                  className="btn btn-update"
                  onClick={() => toggleUpdateForm(index, item.id)}
                >
                  {qunatityText}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      <button className="btn btn-others centerBtn" onClick={toggleAddForm}>
        {isText}
      </button>
      <form
        action="#"
        method="GET"
        onSubmit={handleSubmit}
        className={`quantity-update-form main-item-style ${
          isVisibleTransferForm ? "visibleTransferForm" : "hiddenTransferForm"
        }`}
      >
        <label htmlFor="setQty">Set the quantity</label>
        <input
          type="text"
          name="setQuantity"
          id="setQty"
          value={tempQty}
          placeholder="ex. 1 kg"
          ref={setQtyChamberFormRef}
          onChange={(e) => setTempQty(e.target.value)}
        />
        <input
          type="submit"
          value="Set"
          className="btn btn-others"
          onClick={handleTransferItem}
        />
      </form>
      <form
        action="#"
        method="GET"
        className={`quantity-update-form main-item-style fridge-form-update-quantity ${
          isVisibleQuantity ? "fridge-form-update-quantity" : "hiddenUpdateForm"
        }`}
        onSubmit={handleSubmit}
      >
        <label htmlFor="updateChamberItemQuantity">New quantity:</label>
        <input
          type="text"
          name="updateChamberItemQuantity"
          id="updateChamberItemQuantity"
          placeholder="ex. 1kg"
          value={modifyQuantity}
          ref={updateChamberFormRef}
          onChange={(e) => setModifyQuantity(e.target.value)}
        />
        <input
          type="submit"
          value="Update quantity"
          className="btn btn-others"
          onClick={handleUpdate}
        />
      </form>
      <form
        action="#"
        method="GET"
        onSubmit={handleSubmit}
        className={`main-item-style fridge-form-update ${
          isVisible ? "visible" : "hidden"
        }`}
      >
        <div className="input-container">
          <label className="form-label" htmlFor="newChamberItem">
            New item:
          </label>
          <input
            type="text"
            name="newChamberItem"
            id="newChamberItem"
            placeholder="ex. rice"
            value={newItem}
            ref={addChamberFormRef}
            onChange={(e) => setNewItem(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="newChamberQuantity">
            New quantity:
          </label>
          <input
            type="text"
            name="newChamberQuantity"
            id="newChamberQuantity"
            placeholder="ex. 1kg"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
        </div>
        <input
          type="submit"
          value="Update"
          onClick={handleAddChamber}
          className="btn btn-others centerBtn"
        />
      </form>
    </>
  );
}
