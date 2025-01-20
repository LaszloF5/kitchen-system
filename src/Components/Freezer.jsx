import React, { useEffect, useState, useRef, useContext } from "react";
import FreezerContext from "../Contexts/FreezerContext";

export default function Freezer({
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

  const { freezerState } = useContext(FreezerContext);

  // Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [tempQty, setTempQty] = useState("");

  const [isVisibleF, setIsVisibleF] = useState(false);
  const [isVisibleUpdateF, setIsVisibleUpdateF] = useState(false);
  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const isText = isVisibleF ? "Close add form" : "Add item";
  const updateText = isVisibleUpdateF ? "Close modification" : "Update item";
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [tempIndex, setTempIndex] = useState(null);
  const setQtyFreezerFormRef = useRef(null);
  const updateFreezerFormRef = useRef(null);
  const addFreezerFormRef = useRef(null);
  const [updateId, setUpdateId] = useState(null);

  useEffect(() => {
    if (isVisibleTransferForm) {
      setQtyFreezerFormRef.current.focus();
    }

    if (isVisibleUpdateF) {
      updateFreezerFormRef.current.focus();
    }

    if (isVisibleF) {
      addFreezerFormRef.current.focus();
    }
  }, [isVisibleTransferForm, isVisibleUpdateF, isVisibleF]);

  // Data fetching from the database

  useEffect(() => {
      const getDatas = async () => {
        const data = await fetchItems("freezer_items");
        setItems(data);
      };
      getDatas();
  }, [fetchItems, userId, setItems, freezerState]);

  ////////// FUNCTIONS //////////

  const toggleTransferForm = (index) => {
    setTempIndex(index);
    setIsVisibleTransferForm(!isVisibleTransferForm);
  };

  const SLText = isVisibleTransferForm ? "Close modification" : "Add to SL";

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
        "freezer_items",
        "shoppingList_items"
      );
      setTempIndex(null);
      setTempQty("");
      setIsVisibleTransferForm(false);
    } else {
      alert("Please enter a quantity.");
    }
  };

  const toggleVisibilityAddFr = () => {
    setIsVisibleF(!isVisibleF);
  };

  const toggleVisibilityUpdateF = (index, id) => {
    setIsVisibleUpdateF(!isVisibleUpdateF);
    setUpdateId(id);
  };

  // Add item to the database

  const handleAddFreezer = async () => {
    try {
      await addItem("freezer_items", newItem, newQuantity, setItems, userId);
      setNewItem("");
      setNewQuantity("");
      setIsVisibleF(false);
    } catch (error) {
      console.error("Error adding item to freezer:", error);
      alert("An error occurred while adding the item.");
    }
  };

  const handleDeleteF = async (index) => {
    const itemToDelete = items[index];
    await deleteItem("freezer_items", itemToDelete, setItems);
    setIsVisibleUpdateF(false);
    setModifyQuantity("");
    setIsVisibleTransferForm(false);
  };

  const handleUpdate = async () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    }
    await updateItem("freezer_items", modifyQuantity, updateId, setItems);
    setIsVisibleUpdateF(false);
    setUpdateId(null);
    setModifyQuantity("");
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <>
      <h2>Freezer items</h2>
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
                <p className="date">{item.date_added}</p>
                <div className="btns-container">
                  <button
                    className="btn btn-others"
                    onClick={() => toggleTransferForm(index)}
                  >
                    {SLText}
                  </button>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDeleteF(index)}
                  >
                    Delete item
                  </button>
                  <button
                    className="btn btn-update"
                    onClick={() => toggleVisibilityUpdateF(index, item.id)}
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
        action="#"
        method="GET"
        className={`quantity-update-form main-item-style ${
          isVisibleTransferForm ? "visibleTransferForm" : "hiddenTransferForm"
        }`}
        onSubmit={handleSubmit}
      >
        <label htmlFor="setQty">Set the quantity:</label>
        <input
          type="text"
          name="setQuantity"
          id="setQty"
          value={tempQty}
          placeholder="ex. 1 kg"
          ref={setQtyFreezerFormRef}
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
        className={`quantity-update-form main-item-style fridge-form-update-quantity ${
          isVisibleUpdateF ? "fridge-form-update-quantity" : "hiddenUpdateForm"
        }`}
        method="GET"
        action="#"
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate(updateId);
        }}
      >
        <label htmlFor="updateQuantityIdF"> New quantity: </label>
        <input
          type="text"
          name="updateQuantity"
          id="updateQuantityIdF"
          placeholder="ex. 1 kg"
          value={modifyQuantity}
          ref={updateFreezerFormRef}
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
            ref={addFreezerFormRef}
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
