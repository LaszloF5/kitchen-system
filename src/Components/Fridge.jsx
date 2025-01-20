import React, {useEffect, useState, useRef, useContext } from "react";
import FridgeContext from "../Contexts/FridgeContext";
import "./Fridge.css";

export default function Fridge({
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

  const {fridgeState} = useContext(FridgeContext);

  //Input values

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [tempQty, setTempQty] = useState("");

  ////////////

  const [isVisible, setIsVisible] = useState(false);
  const [isVisibleUpdate, setIsVisibleUpdate] = useState(false);
  const [tempIndex, setTempIndex] = useState(null);
  const setQtyFridgeFormRef = useRef(null);
  const updateFridgeFormRef = useRef(null);
  const addFridgeFormRef = useRef(null);
  const [updateId, setUpdateId] = useState(null);

  // Add btn text modification

  const isText = isVisible ? "Close add form" : "Add item";
  const updateText = isVisibleUpdate ? "Close modification" : "Update item";

  // visible transfer form

  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const toggleVisibleTransferForm = (index) => {
    setTempIndex(index);
    setIsVisibleTransferForm(!isVisibleTransferForm);
  };

  const SLText = isVisibleTransferForm ? "Close modification" : "Add to SL";
  // to the shopping list
  // Solution: Shallow copy --> Csak az első szintet másolja érték szerint (a többit referencia szerint), viszont nincs több szint, ezért elég. Így nem fogja módosítani az eredeti items tömböt, és a benne lévő objektumokat.

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
        "fridge_items",
        "shoppingList_items"
      );
      setTempQty("");
      setIsVisibleTransferForm(false);
      setTempIndex(null);
    } else {
      alert("Please enter a quantity.");
    }
  };

  useEffect(() => {
    if (isVisibleTransferForm) {
      setQtyFridgeFormRef.current.focus();
    }

    if (isVisibleUpdate) {
      updateFridgeFormRef.current.focus();
    }
    if (isVisible) {
      addFridgeFormRef.current.focus();
    }
  }, [isVisibleTransferForm, isVisibleUpdate, isVisible]);

  const toggleVisibilityAdd = () => {
    setIsVisible(!isVisible);
  };

  const toggleVisibilityUpdate = (index, id) => {
    setUpdateId(id);
    setIsVisibleUpdate(!isVisibleUpdate);
  };


  // Datas from the database

  useEffect(() => {
      const getDatas = async () => {
        const data = await fetchItems("fridge_items");
        setItems(data);
      };
      getDatas();
  }, [fetchItems, userId, setItems, fridgeState]);

  // functions

  const handleAddFridge = async () => {
    try {
      await addItem("fridge_items", newItem, newQuantity, setItems, userId);
      setNewItem("");
      setNewQuantity("");
      setIsVisible(false);
    } catch (error) {
      console.error("Error adding item:", error);
      alert("An error occurred while adding the item.");
    }
  };

  const handleDelete = async (index) => {
    const itemToDelete = items[index];
    await deleteItem("fridge_items", itemToDelete, setItems);
    setIsVisibleUpdate(false);
    setModifyQuantity("");
    setIsVisibleTransferForm(false);
  };

  const handleUpdate = async () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    }
    await updateItem("fridge_items", modifyQuantity, updateId, setItems);
    setModifyQuantity("");
    setIsVisibleUpdate(false);
    setUpdateId(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  return (
    <div>
      <h2>Fridge items</h2>
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
                  onClick={() => toggleVisibilityUpdate(index, item.id)}
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
        action="#"
        method="GET"
        onSubmit={handleSubmit}
        className={`quantity-update-form main-item-style ${
          isVisibleTransferForm ? "visibleTransferForm" : "hiddenTransferForm"
        }`}
      >
        <label htmlFor="setQty">Set the quantity:</label>
        <input
          type="text"
          name="setQuantity"
          id="setQty"
          value={tempQty}
          placeholder="ex. 1 kg"
          ref={setQtyFridgeFormRef}
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
        method="GET"
        action="#"
        className={`quantity-update-form main-item-style fridge-form-update-quantity ${
          isVisibleUpdate ? "visibleUpdateForm" : "hiddenUpdateForm"
        }`}
        onSubmit={(e) => {
          e.preventDefault();
          handleUpdate(updateId);
        }}
      >
        <label>
          New quantity:
          <input
            type="text"
            name="newItemQuantity"
            placeholder="ex. 1 kg"
            value={modifyQuantity}
            ref={updateFridgeFormRef}
            onChange={(e) => {
              setModifyQuantity(e.target.value);
            }}
          />
        </label>
        <input
          className="btn btn-others"
          type="submit"
          value="Update quantity"
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
            ref={addFridgeFormRef}
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
    </div>
  );
}
