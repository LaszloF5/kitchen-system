import React, { useEffect, useState, useRef } from "react";

export default function Freezer({
  items,
  setItems,
  fetchItems,
  addItem,
  deleteItem,
  updateItem,
  moveToSL,
  regex,
  renderToken,
  setTransferState,
  transferFromSL,
  setTransferFromSL,
  token,
}) {
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
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("You need to be logged in to perform this action.");
        return setItems([]);
      }
      const data = await fetchItems("freezer_items");
      if (data) {
        // Ellenőrizzük, hogy a data érvényes-e
        setItems(data);
      }
    };
    getDatas();
    setTransferFromSL(false);
  }, [renderToken, setItems, transferFromSL, token]);

  ////////// FUNCTIONS //////////

  const toggleTransferForm = (index) => {
    setTempIndex(index);
    setIsVisibleTransferForm(!isVisibleTransferForm);
    setIsVisibleUpdateF(false);
    setIsVisibleF(false);
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
      setTransferState(true);
      setTempIndex(null);
      setTempQty("");
      setIsVisibleTransferForm(false);
    } else {
      alert("Please enter a quantity.");
    }
  };

  const toggleVisibilityAddFr = () => {
    setIsVisibleF(!isVisibleF);
    setIsVisibleUpdateF(false);
    setIsVisibleTransferForm(false);
  };

  const toggleVisibilityUpdateF = (index, id) => {
    setIsVisibleUpdateF(!isVisibleUpdateF);
    setUpdateId(id);
    setIsVisibleTransferForm(false);
    setIsVisibleF(false);
  };

  // Add item to the database

  const handleAddFreezer = async () => {
    try {
      await addItem("freezer_items", newItem, newQuantity, setItems);
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
    setIsVisibleF(false);
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
        <label htmlFor="setQuantityFreezer">Set the quantity:</label>
        <input
          type="text"
          name="setQuantityFreezer"
          id="setQuantityFreezer"
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
        <label htmlFor="updateQuantityFreezer"> New quantity: </label>
        <input
          type="text"
          name="updateQuantityFreezer"
          id="updateQuantityFreezer"
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
          <label className="form-label" htmlFor="newItemNameFreezer">
            New item name:
          </label>
          <input
            type="text"
            name="newItemNameFreezer"
            id="newItemNameFreezer"
            placeholder="ex. froozen fish"
            value={newItem}
            ref={addFreezerFormRef}
            onChange={(e) => {
              setNewItem(e.target.value);
            }}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="newItemQuantityFreezer">
            New item quantity:
          </label>
          <input
            type="text"
            name="newItemQuantityFreezer"
            id="newItemQuantityFreezer"
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
