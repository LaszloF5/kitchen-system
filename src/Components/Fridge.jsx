import React, { useState } from "react";
import "./Fridge.css";

export default function Fridge({ items, setItems }) {
  //Input mezők value értékei a seT-ek
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  ////////////////////////////////////
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleUpdate, setIsVisibleUpdate] = useState(false);
  const [updateIndex, setUpdateIndex] = useState(null);
  // Add btn text modification
  const isText = isVisible ? "Close add form" : "Add item";
  const updateText = isVisibleUpdate ? "Close modification" : "Update item";

  const toggleVisibilityAdd = () => {
    setIsVisible(!isVisible);
  };

  const toggleVisibilityUpdate = (index) => {
    setIsVisibleUpdate(!isVisibleUpdate);
    setUpdateIndex(index);
  };

  const handleAdd = () => {
    if (newItem.length < 1 || newQuantity.length < 1) {
      return alert("The name and quantity fields mustn't be empty.");
    }
    setItems([...items, { name: newItem, quantity: newQuantity }]);
    setNewItem("");
    setNewQuantity("");
    setIsVisible(false); // Maybe deletem idk jet.
  };

  const handleDelete = (index) => {
    const NewElements = items.filter((_, i) => {
      return i !== index;
    });
    setItems(NewElements);
  };

  const handleUpdate = (index) => {
    const updatedList = [...items];
    updatedList[index].quantity = modifyQuantity;
    setItems(updatedList);
    setModifyQuantity("");
    setIsVisibleUpdate(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };
  // Add item toggle btn to display the add form element.

  return (
    <>
      <h3>Fridge items</h3>
      <ul className="fridge-ul main-item-style">
        {items.map((item, index) => (
          <li className="fridge-li-element" key={index}>
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
        ))}
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
          onClick={() => handleUpdate(updateIndex)}
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
            id="newItemNameIdFridge"
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
          onClick={handleAdd}
        />
      </form>
    </>
  );
}
