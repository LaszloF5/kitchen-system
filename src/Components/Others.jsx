import React, { useEffect, useState } from "react";

export default function Others({
  itemsOthers,
  setItemsOthers,
  dataFromSL,
  cleanOthersData,
  addToShoppingList,
}) {
  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;

  const [newItem, setNewItem] = useState([]);
  const [newQuantity, setNewQuantity] = useState([]);

  // Add form visibility conts

  const [isVisibleO, setIsVisibleO] = useState(false);
  const isText = isVisibleO ? "Close add form" : "Add item";

  // Set quantity visibility and render conts

  const [isVisibleQtyO, setIsVisibleQtyO] = useState(false);
  const QtyText = isVisibleQtyO ? "Close modification" : "Update item";
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [updateIndex, setUpdateIndex] = useState(null);

  // Toggle transfer form

  const [tempIndex, setTempIndex] = useState(null);
  const [tempQty, setTempQty] = useState("");
  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const toggleVisibleTransferForm = (index) => {
    setTempIndex(index);
    setIsVisibleTransferForm(!isVisibleTransferForm);
  };

  const SLText = isVisibleTransferForm ? 'Close modification' : 'Add to the SL';

  const [prevItemsOthers, setPrevItemsOthers] = useState([]);

  // Functions

  // to the shopping list

  const handleTransferItem = () => {
    if (tempQty !== "") {
      const transferItem = { ...itemsOthers[tempIndex], quantity: tempQty };
      addToShoppingList(transferItem);
      setTempQty("");
      setTempIndex(null);
      setIsVisibleTransferForm(false);
    } else {
      alert("Please enter a quantity.");
    }
  };
  

  useEffect(() => {
    if (dataFromSL.length > 0) {
      const exsistingItemIndex = itemsOthers.findIndex(
        (item) => item.name === dataFromSL[0].name
      );
      if (exsistingItemIndex !== -1) {
        const exsistingItem = { ...itemsOthers[exsistingItemIndex] };
        const unit = exsistingItem.quantity
          .replace(Number.parseFloat(exsistingItem.quantity), "")
          .trim();
        const firstNum = Number.parseFloat(exsistingItem.quantity);
        const secondNum = Number.parseFloat(dataFromSL[0].quantity);
        const sumQty = firstNum + secondNum;
        exsistingItem.quantity = sumQty + " " + unit;
  
        const updatedItems = [...itemsOthers];
        updatedItems[exsistingItemIndex] = exsistingItem;
        setItemsOthers(updatedItems);
      } else {
        setItemsOthers([...itemsOthers, ...dataFromSL]);
      }
      cleanOthersData();
    }
  }, [dataFromSL]);
  

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const toggleAddElement = () => {
    setIsVisibleO(!isVisibleO);
  };

  const toggleModifyQty = (index) => {
    setIsVisibleQtyO(!isVisibleQtyO);
    setUpdateIndex(index);
  };

  // Item modifier functions

  const handleAddOthers = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const newList = [
        ...itemsOthers,
        { name: newItem.trim(), quantity: newQuantity.trim(), date: new Date().getFullYear() + '.' + ' ' + (new Date().getMonth() + 1) + '.' + ' ' + new Date().getDate() + '.' },
      ];
      setItemsOthers(newList);
      setNewItem("");
      setNewQuantity("");
      setIsVisibleO(false);
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = (index) => {
    const newList = itemsOthers.filter((_, i) => i !== index);
    setItemsOthers(newList);
    setIsVisibleQtyO(false);
    setUpdateIndex(null);
    setModifyQuantity("");
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
    } else {
      const updatedList = [...itemsOthers];
      updatedList[updateIndex].quantity = modifyQuantity.trim();
      setItemsOthers(updatedList);
      setIsVisibleQtyO(false);
      setModifyQuantity("");
      setUpdateIndex(null);
    }
  };

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('itemsOthers')) || [];
    setItemsOthers(savedItems);
  }, []);
  

  useEffect(() => {
    let hasChangedOthers = false;
  
    if (JSON.stringify(prevItemsOthers) !== JSON.stringify(itemsOthers)) {
      const updatedOthers = itemsOthers.map((item, index) => {
        if (
        item.quantity !== prevItemsOthers[index]?.quantity
        ) {
          hasChangedOthers = true;
          return { ...item };
        }
        return item;
      });
      if (hasChangedOthers || itemsOthers.length !== prevItemsOthers.length) {
        localStorage.setItem("itemsOthers", JSON.stringify(updatedOthers));
        setPrevItemsOthers(updatedOthers);
      }
    }
  }, [itemsOthers]);
  

  return (
    <>
      <h2>Other kitchen items</h2>
      <ul className="fridge-ul main-item-style">
        {itemsOthers.length === 0 ? (
          <p>This container is empty.</p>
        ) : (
          itemsOthers.map((item, index) => {
            return (
              <li
                className={`fridge-li-element ${
                  regex.test(item.quantity) ? "alert-color" : "default-color"
                }`}
                key={index}
              >
                {item.name} - {item.quantity}
                <p className="date">{item.date}</p>
                <div className="buttons-container">
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
                    onClick={() => toggleModifyQty(index)}
                  >
                    {QtyText}
                  </button>
                </div>
              </li>
            );
          })
        )}
      </ul>
      <button className="btn btn-others" onClick={toggleAddElement}>
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
          isVisibleQtyO ? "visibleUpdateForm" : "hiddenUpdateForm"
        }`}
        onSubmit={handleSubmit}
      >
        <label>
          New quantity:
          <input
            type="text"
            name="othersItemNewQty"
            value={modifyQuantity}
            onChange={(e) => setModifyQuantity(e.target.value)}
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
        action="#"
        method="GET"
        className={`main-item-style fridge-form-update ${
          isVisibleO ? "visible" : "hidden"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="input-container">
          <label className="form-label" htmlFor="othersNameId">
            New item:
          </label>
          <input
            type="text"
            name="othersName"
            id="othersNameId"
            placeholder="ex. chips"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="othersQuantityId">
            New quantity:
          </label>
          <input
            type="text"
            name="othersQuantity"
            id="othersQuantityId"
            placeholder="ex. 1pcs"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
        </div>
        <input
          type="submit"
          value="Update"
          className="btn btn-others centerBtn"
          onClick={handleAddOthers}
        />
      </form>
    </>
  );
}
