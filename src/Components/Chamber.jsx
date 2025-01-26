import React, { useEffect, useState, useRef, useContext } from "react";
import ChamberContext from "../Contexts/ChamberContext";

export default function Chamber({
  items,
  setItems,
  fetchItems,
  addItem,
  deleteItem,
  updateItem,
  moveToSL,
  regex,
  userId,
}) {
  // useContext

  const { chamberState } = useContext(ChamberContext);

  // Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [tempQty, setTempQty] = useState("");
  const [tempIndex, setTempIndex] = useState(null);
  const setQtyChamberFormRef = useRef(null);
  const updateChamberFormRef = useRef(null);
  const addChamberFormRef = useRef(null);
  const [updateId, setUpdateId] = useState(null);

  // Visible transfer form
  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const toggleVisibleTransferForm = (index) => {
    setTempIndex(index);
    setIsVisibleTransferForm(!isVisibleTransferForm);
    setIsVisibleQuantity(false);
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
        ...items[tempIndex],
        quantity: tempQty,
        date: new Date().toISOString().split("T")[0],
      };
      moveToSL(
        transferItem.name,
        transferItem.quantity,
        transferItem.date,
        "chamber_items",
        "shoppingList_items"
      );
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
    setUpdateId(id);
    setIsVisibleQuantity(!isVisibleQuantity);
    setIsVisibleTransferForm(false);
  };

  // Datas from the database

  useEffect(() => {
    const getDatas = async () => {
      const data = await fetchItems("chamber_items");
      setItems(data);
    };
    getDatas();
  }, [fetchItems, userId, setItems, chamberState]);

  const handleAddChamber = async () => {
    try {
      await addItem("chamber_items", newItem, newQuantity, setItems, userId);
      setNewItem("");
      setNewQuantity("");
      setIsVisible(false);
    } catch {
      alert("An error occurred while saving the data.");
    }
  };

  const handleDelete = async (index) => {
    const itemToDelete = items[index];
    await deleteItem("chamber_items", itemToDelete, setItems);
    setIsVisibleQuantity(false);
    setModifyQuantity("");
    setIsVisibleTransferForm(false);
  };

  const handleUpdate = async () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    }
    await updateItem("chamber_items", modifyQuantity, updateId, setItems);
    setModifyQuantity("");
    setIsVisibleQuantity(false);
    setUpdateId(null);
  };

  return (
    <>
      <h2>Chamber items</h2>
      <ul className="fridge-ul main-item-style">
        {items.length === 0 ? (
          <p>Your chamber is empty.</p>
        ) : (
          items.map((item, index) => (
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
        <label htmlFor="setQty">Set quantity</label>
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
        <button
          type="submit"
          onClick={handleAddChamber}
          className="btn btn-others centerBtn"
        >Add</button>
      </form>
    </>
  );
}
