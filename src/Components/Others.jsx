import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

export default function Others({
  itemsOthers,
  setItemsOthers,
  addToShoppingList,
  regex,
  regexQtyBreakdown,
}) {

  const [newItem, setNewItem] = useState([]);
  const [newQuantity, setNewQuantity] = useState([]);

  // Add form visibility conts

  const [isVisibleO, setIsVisibleO] = useState(false);
  const isText = isVisibleO ? "Close add form" : "Add item";

  // Set quantity visibility and render conts

  const [isVisibleQtyO, setIsVisibleQtyO] = useState(false);
  const QtyText = isVisibleQtyO ? "Close modification" : "Update item";
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const SLText = isVisibleTransferForm ? "Close modification" : "Add to the SL";
  const setQtyOthersFormRef = useRef(null);
  const updateOthersFormRef = useRef(null);
  const addOthersFormRef = useRef(null);
  const [updateIdOthers, setUpdateIdOthers] = useState(null);

  // Toggle transfer form

  const [tempIndex, setTempIndex] = useState(null);
  const [tempQty, setTempQty] = useState("");
  const toggleVisibleTransferForm = (index) => {
    setTempIndex(index);
    setIsVisibleTransferForm(!isVisibleTransferForm);
  };

  // Functions

  // to the shopping list

  const handleTransferItem = () => {
    if (tempQty !== "") {
      const transferItem = {
        ...itemsOthers[tempIndex],
        quantity: tempQty,
        date:
          new Date().getFullYear() +
          "." +
          " " +
          (new Date().getMonth() + 1) +
          "." +
          " " +
          new Date().getDate() +
          ".",
      };
      addToShoppingList(transferItem);
      setTempQty("");
      setTempIndex(null);
      setIsVisibleTransferForm(false);
    } else {
      alert("Please enter a quantity.");
    }
  };

  useEffect(() => {
    if (isVisibleTransferForm) {
      setQtyOthersFormRef.current.focus();
    }

    if (isVisibleQtyO) {
      updateOthersFormRef.current.focus();
    }

    if (isVisibleO) {
      addOthersFormRef.current.focus();
    }
  }, [isVisibleTransferForm, isVisibleQtyO, isVisibleO]);

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const toggleAddElement = () => {
    setIsVisibleO(!isVisibleO);
  };

  const toggleModifyQty = (index, id) => {
    setIsVisibleQtyO(!isVisibleQtyO);
    setUpdateIdOthers(id);
    console.log(id)
  };

  // Item modifier functions

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:5500/others_items");
        setItemsOthers(response.data.items);
      } catch (error) {
        console.error(error);
      }
    };
    fetchItems();
  }, [itemsOthers]);

  const handleAddOthers = async () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const validQty = Number(...newQuantity.match(regexQtyBreakdown));
      const unit = newQuantity.replace(Number.parseFloat(newQuantity), '');
      const newOthersItem = {
        name: newItem.trim(),
        quantity: `${validQty} ${unit}`,
        date_added: new Date().toISOString().split("T")[0],
      };
      try {
        await axios.post("http://localhost:5500/others_items", newOthersItem);
        const response = await axios.get("http://localhost:5500/others_items");
        setItemsOthers(response.data.items);
        setNewItem("");
        setNewQuantity("");
        setIsVisibleO(false);
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = async (index) => {
    const itemToDelete = itemsOthers[index];
    try {
      await axios.delete(
        `http://localhost:5500/others_items/${itemToDelete.id}`
      );
      const response = await axios.get("http://localhost:5500/others_items");
      setItemsOthers(response.data.items);
      setIsVisibleQtyO(false);
      setModifyQuantity("");
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    }
  };

  const handleUpdate = async () => {
    console.log("id ami kell:", updateIdOthers);
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    } else {
      await axios.put(`http://localhost:5500/others_items/${updateIdOthers}`, {
        quantity: modifyQuantity.trim(),
      });
      const response = await axios.get("http://localhost:5500/others_items");
      setItemsOthers(response.data.items);
      setIsVisibleQtyO(false);
      setModifyQuantity("");
      setUpdateIdOthers(null);
    }
  };

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
                <p className="date">{item.date_added}</p>
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
                    onClick={() => toggleModifyQty(index, item.id)}
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
          placeholder="ex. 1 kg"
          ref={setQtyOthersFormRef}
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
            placeholder="ex. 1 kg"
            ref={updateOthersFormRef}
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
            ref={addOthersFormRef}
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
