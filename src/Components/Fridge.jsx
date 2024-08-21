import React, { useEffect, useState } from "react";
import "./Fridge.css";

export default function Fridge({
  items,
  setItems,
  dataFromSL,
  cleanFridgeData,
}) {
  // addToFridge egy objektum, minek van egy name és qty attribútuma.

  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;
  //Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  ////////////
  const [updateIndex, setUpdateIndex] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleUpdate, setIsVisibleUpdate] = useState(false);
  // Add btn text modification
  const isText = isVisible ? "Close add form" : "Add item";
  const updateText = isVisibleUpdate ? "Close modification" : "Update item";

  // Datas from shopping list

  useEffect(() => {
    if (dataFromSL.length > 0) {
      const exsistingItem = items.find(
        (item) => item.name === dataFromSL[0].name
      );
      if (exsistingItem) {
        const unit = exsistingItem.quantity
          .replace(Number.parseFloat(exsistingItem.quantity), "")
          .trim();
        const firstNum = Number.parseFloat(exsistingItem.quantity);
        const secondNum = Number.parseFloat(dataFromSL[0].quantity);
        const sumQty = firstNum + secondNum;
        exsistingItem.quantity = sumQty + " " + unit;
        setItems([...items]);
      } else {
        setItems([...items, ...dataFromSL]);
      }
      cleanFridgeData();
    }
  }, [dataFromSL]);

  const toggleVisibilityAdd = () => {
    setIsVisible(!isVisible);
  };

  const toggleVisibilityUpdate = (index) => {
    setIsVisibleUpdate(!isVisibleUpdate);
    setUpdateIndex(index);
  };

  const handleAddFridge = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      setItems([
        ...items,
        { name: newItem.trim(), quantity: newQuantity.trim() },
      ]);
      setNewItem("");
      setNewQuantity("");
      setIsVisible(false); // Maybe deletem idk jet.
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = (index) => {
    const newElements = items.filter((_, i) => i !== index);
    setItems(newElements);
    setIsVisibleUpdate(false);
    setModifyQuantity("");
    setUpdateIndex(null);
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
    } else {
      const updatedList = [...items];
      updatedList[updateIndex].quantity = modifyQuantity.trim();
      setItems(updatedList);
      setModifyQuantity("");
      setIsVisibleUpdate(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  // Add item toggle btn to display the add form element.

  return (
    <>
      <h3>Fridge items</h3>
      <ul className="fridge-ul main-item-style">
        {items.length === 0 ? (
          <p>Your fridge is empty.</p>
        ) : (
          items.map((item, index) => (
            <li
              className={`fridge-li-element ${
                regex.test(item.quantity) ? "alert-color" : "default-color"
              }`}
              key={index}
            >
              {item.name} - {item.quantity}
              <div className="btns-container">
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(index)}
                >
                  Delete item
                </button>
                <button
                  className="btn btn-update"
                  onClick={() => toggleVisibilityUpdate(index)}
                >
                  {updateText}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      <button className="btn btn-others" onClick={toggleVisibilityAdd}>
        {isText}
      </button>
      <form
        method="GET"
        action="#"
        className={`quantity-update-form main-item-style fridge-form-update-quantity ${
          isVisibleUpdate ? "visibleUpdateForm" : "hiddenUpdateForm"
        }`}
        onSubmit={handleSubmit}
      >
        <label>
          New quantity:
          <input
            type="text"
            name="newItemQuantity"
            placeholder="ex. 1 kg"
            value={modifyQuantity}
            onChange={(e) => {
              setModifyQuantity(e.target.value);
            }}
          />
        </label>
        <input
          className="btn btn-others"
          type="submit"
          value="Update quantity"
          onClick={handleUpdate}
        />
      </form>
      <form
        method="GET"
        action="#"
        className={`main-item-style fridge-form-update ${
          isVisible ? "visible" : "hidden"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="input-container">
          <label className="form-label" htmlFor="newItemNameIdFidge">
            New item name:
          </label>
          <input
            type="text"
            name="newItemName"
            value={newItem}
            placeholder="ex. banana"
            id="newItemNameIdFidge"
            onChange={(e) => {
              setNewItem(e.target.value);
            }}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="newItemQuantityIdF">
            New item quantity:{" "}
          </label>
          <input
            type="text"
            name="newItemQuantityF"
            placeholder="ex. 1 kg"
            value={newQuantity}
            id="newItemQuantityIdF"
            onChange={(e) => {
              setNewQuantity(e.target.value);
            }}
          />
        </div>
        <input
          className="btn btn-others centerBtn"
          type="submit"
          value="Update"
          onClick={handleAddFridge}
        />
      </form>
    </>
  );
}
