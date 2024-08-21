import React, { useEffect, useState } from "react";

export default function Freezer({
  items,
  setItems,
  dataFromSL,
  cleanFreezerData,
}) {
  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;
  // Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  //////////////////////////////////////////////////
  const [isVisibleF, setIsVisibleF] = useState(false);
  const isText = isVisibleF ? "Close add form" : "Add item";
  ////////////////////////////////////////////////////////
  const [updateIndex, setUpdateIndex] = useState(null);
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [isVisibleUpdateF, setIsVisibleUpdateF] = useState(false);
  const updateText = isVisibleUpdateF ? "Close modification" : "Update item";

  // Data from shopping list

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
      cleanFreezerData();
    }
  }, [dataFromSL]);

  ////////// FUNCTIONS //////////

  const toggleVisibilityAddFr = () => {
    setIsVisibleF(!isVisibleF);
  };

  const toggleVisibilityUpdateF = (index) => {
    setIsVisibleUpdateF(!isVisibleUpdateF);
    setUpdateIndex(index);
  };

  const handleAddFreezer = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      setItems([
        ...items,
        { name: newItem.trim(), quantity: newQuantity.trim() },
      ]);
      setNewItem("");
      setNewQuantity("");
      setIsVisibleF(false);
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };
  const handleDeleteF = (index) => {
    const newList = items.filter((_, i) => {
      return i !== index;
    });
    setItems(newList);
    setIsVisibleUpdateF(false);
    setModifyQuantity("");
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    } else {
      const updatedList = [...items];
      updatedList[updateIndex].quantity = modifyQuantity.trim();
      setItems(updatedList);
      setIsVisibleUpdateF(false);
      setUpdateIndex(null);
      setModifyQuantity("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <h3>Freezer items</h3>
      <ul className="fridge-ul main-item-style">
        {items.length === 0 ? (
          <p>Your freezer is empty.</p>
        ) : (
          items.map((item, index) => {
            return (
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
                    onClick={() => handleDeleteF(index)}
                  >
                    Delete item
                  </button>
                  <button
                    className="btn btn-update"
                    onClick={() => toggleVisibilityUpdateF(index)}
                  >
                    {updateText}
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
      <button className="btn btn-others" onClick={toggleVisibilityAddFr}>
        {isText}
      </button>
      <form
        className={`quantity-update-form main-item-style fridge-form-update-quantity ${
          isVisibleUpdateF ? "fridge-form-update-quantity" : "hiddenUpdateForm"
        }`}
        method="GET"
        action="#"
        onSubmit={handleSubmit}
      >
        <label htmlFor="updateQuantityIdF"> New quantity: </label>
        <input
          type="text"
          name="updateQuantity"
          id="updateQuantityIdF"
          placeholder="ex. 1 kg"
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
        className={`main-item-style fridge-form-update ${
          isVisibleF ? "visible" : "hidden"
        }`}
        method="GET"
        action="#"
        onSubmit={handleSubmit}
      >
        <div className="input-container">
          <label className="form-label" htmlFor="newItemNameIdF">
            New item name:
          </label>
          <input
            type="text"
            name="newItemName"
            id="newItemNameIdF"
            placeholder="ex. froozen fish"
            value={newItem}
            onChange={(e) => {
              setNewItem(e.target.value);
            }}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="newItemQuantityIdF">
            New item quantity:
          </label>
          <input
            type="text"
            name="newItemQuantity"
            id="newItemQuantityIdF"
            placeholder="ex. 1 package"
            value={newQuantity}
            onChange={(e) => {
              setNewQuantity(e.target.value);
            }}
          />
        </div>
        <input
          className="btn btn-others centerBtn"
          type="submit"
          value="Update"
          onClick={handleAddFreezer}
        />
      </form>
    </>
  );
}
