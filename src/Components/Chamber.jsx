import React, { useState } from "react";

export default function Chamber({ items, setItems }) {
  // Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");

  // Visible Add form
  const [isVisible, setIsVisible] = useState(false);
  const isText = isVisible ? "Close add form" : "Add item";

  // Visible Update form

  const [isVisibleQuantity, setIsVisibleQuantity] = useState(false);
  const qunatityText = isVisibleQuantity ? "Close modification" : "Update item";

  const [updateIndex, setUpdateIndex] = useState(null);

  // Functions

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const toggleAddForm = () => {
    setIsVisible(!isVisible);
  };

  const toggleUpdateForm = (index) => {
    setIsVisibleQuantity(!isVisibleQuantity);
    setUpdateIndex(index);
  };

  // Item modifier functions

  const handleAdd = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const updatedItems = [
        ...items,
        { name: newItem.trim(), quantity: newQuantity.trim() },
      ];
      setItems(updatedItems);
      setNewItem("");
      setNewQuantity("");
      setIsVisible(false);
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = (index) => {
    const newList = items.filter((_, i) => i !== index);
    setItems(newList);
    setIsVisibleQuantity(false);
    setModifyQuantity("");
    setUpdateIndex(null);
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
    } else {
      const updatedItems = [...items];
      updatedItems[updateIndex].quantity = modifyQuantity.trim();
      setItems(updatedItems);
      setModifyQuantity("");
      setIsVisibleQuantity(false);
      setUpdateIndex(null);
    }
  };

  return (
    <>
      <h3>Chamber items</h3>
      <ul className="fridge-ul main-item-style">
        {items.length === 0 ? (
          <p>Your chamber is empty.</p>
        ) : (
          items.map((item, index) => (
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
                  onClick={() => toggleUpdateForm(index)}
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
          onClick={handleAdd}
          className="btn btn-others centerBtn"
        />
      </form>
    </>
  );
}
