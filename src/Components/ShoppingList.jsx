import React, { useEffect, useState, useRef } from "react";
import { getWeek } from "date-fns";
import axios from "axios";
import "./ShoppingList.css";

export default function ShoppingList({
  items,
  setItems,
  fetchItems,
  addItem,
  deleteItem,
  updateItem,
  renderToken,
  transferState,
  setTransferState,
  setTransferFromSL,
  token,
}) {
  // Input values

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [newIndex, setNewIndex] = useState(null);
  // const [isVisibleAmount, setIsvisibleAmount] = useState(false);
  const [isVisibleS, setIsVisibleS] = useState(false);
  const [isVisibleQty, setIsVisibleQty] = useState(false);
  const [isVisibleMoveTo, setIsVisibleMoveTo] = useState(false);
  const [updateId, setUpdateId] = useState(null);

  const updateSLFormRef = useRef(null);
  const addSLFormRef = useRef(null);
  const expenditureFormRef = useRef(null);

  useEffect(() => {
    if (isVisibleQty) {
      updateSLFormRef.current.focus();
    }

    if (isVisibleS) {
      addSLFormRef.current.focus();
    }
  }, [isVisibleQty, isVisibleS]);

  // Visible Add form

  const isTextS = isVisibleS ? "Close add form" : "Add item";
  const handleVisibleAdd = () => {
    setIsVisibleS(!isVisibleS);
    setIsVisibleQty(false);
    setIsVisibleMoveTo(false);
  };

  // Visible new qty form

  const isTextQty = isVisibleQty ? "Close modification" : "Update item";
  const handleVisibleQty = (index, id) => {
    setIsVisibleQty(!isVisibleQty);
    setUpdateId(id);
    setIsVisibleMoveTo(false);
    setIsVisibleS(false);
  };

  // Visible move to form

  const toggleVisibleMoveTo = (index) => {
    setIsVisibleMoveTo(!isVisibleMoveTo);
    setNewIndex(index);
    setIsVisibleQty(false);
    setIsVisibleS(false);
  };

  const [prevExpenditure, setPrevExpenditure] = useState([]);

  // Functions

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const getDatas = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("You need to be logged in to perform this action.");
        return setItems([]);
      }
      const data = await fetchItems("shoppingList_items");
      if (data) {
        // Ellenőrizzük, hogy a data érvényes-e
        setItems(data);
      }
    };
    getDatas();
    setTransferState(false);
  }, [renderToken, setItems, transferState, token]);

  const handleAdd = async () => {
    try {
      await addItem("shoppingList_items", newItem, newQuantity, setItems);
      setNewItem("");
      setNewQuantity("");
      setIsVisibleS(false);
    } catch (error) {
      console.error(error);
      alert("An error occurred while adding the item.");
    }
  };

  const handleDelete = async (index) => {
    const itemToDelete = items[index];
    await deleteItem("shoppingList_items", itemToDelete, setItems);
    setIsVisibleQty(false);
    setModifyQuantity("");
    setIsVisibleMoveTo(false);
    setIsVisibleS(false);
  };

  const handleUpdate = async () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    }
    await updateItem("shoppingList_items", modifyQuantity, updateId, setItems);
    setIsVisibleQty(false);
    setUpdateId(null);
    setModifyQuantity("");
  };

  // Elemek mozgatása komponensek között //

  const moveItem = async (itemName, sourceTable, targetTable) => {
    const validTables = [
      "fridge_items",
      "freezer_items",
      "chamber_items",
      "others_items",
      "shoppingList_items",
    ];

    const trimmedSourceTable = sourceTable.trim();
    const trimmedTargetTable = targetTable.trim();

    if (
      !validTables.includes(trimmedSourceTable) ||
      !validTables.includes(trimmedTargetTable)
    ) {
      console.log("Invalid table name.");
      return;
    }

    try {
      const response = await axios.post("http://localhost:5500/move_item", {
        itemName,
        sourceTable: trimmedSourceTable,
        targetTable: trimmedTargetTable,
      });

      if (response.status === 200) {
        const newList = await axios.get(
          "http://localhost:5500/shoppingList_items"
        );
        setItems(newList.data.items);
        setIsVisibleMoveTo(false);
        setNewIndex(null);
        setTransferFromSL(true);
        alert("Elem sikeresen áthelyezve.");
      }
    } catch (error) {
      console.error("Error during moving item:", error);
      if (error.response) {
        console.log("Server response:", error.response.data);
        alert("Hiba a mozgatáskor: " + error.response.data.error);
      } else {
        alert("Hiba a mozgatáskor: " + error.message);
      }
    }
  };

  //Fridge component//

  const handleTransfer1 = (index) => {
    const itemToTransfer = items[index];
    moveItem(itemToTransfer.name, "shoppingList_items", "fridge_items");
  };

  //Freezer component//

  const handleTransfer2 = (index) => {
    const itemToTransfer = items[index];
    moveItem(itemToTransfer.name, "shoppingList_items", "freezer_items");
  };

  //Chamber component//

  const handleTransfer3 = (index) => {
    const itemToTransfer = items[index];
    moveItem(itemToTransfer.name, "shoppingList_items", "chamber_items");
  };

  //Others component//

  const handleTransfer4 = (index) => {
    const itemToTransfer = items[index];
    moveItem(itemToTransfer.name, "shoppingList_items", "others_items");
  };

  return (
    <>
      <h2>Shopping list</h2>
      {/* <button onClick={deleteNums}>Delete nums</button> */}
      <ul className="fridge-ul main-item-style unique-style">
        {items.length === 0 ? (
          <p>Your shopping list is empty.</p>
        ) : (
          items.map((item, index) => (
            <li className="fridge-li-element" key={index}>
              {item.name} - {item.quantity}
              <p className="date">{item.date_added}</p>
              <div className="btns-container">
                <button
                  className="btn btn-move-to"
                  onClick={() => toggleVisibleMoveTo(index)}
                >
                  Move to...
                </button>
                <button
                  className="btn btn-delete"
                  onClick={() => handleDelete(index)}
                >
                  Delete item
                </button>
                <button
                  className="btn btn-update"
                  onClick={() => handleVisibleQty(index, item.id)}
                >
                  {isTextQty}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      <button className="btn btn-others center" onClick={handleVisibleAdd}>
        {isTextS}
      </button>
      <form
        action="#"
        method="GET"
        className={`quantity-update-form main-item-style ${
          isVisibleMoveTo ? "visibleMoveTo" : "hiddenMoveTo"
        }`}
        onSubmit={handleSubmit}
      >
        <button
          className="btn btn-others"
          onClick={() => handleTransfer1(newIndex)}
        >
          The fridge
        </button>
        <button
          className="btn btn-others"
          onClick={() => handleTransfer2(newIndex)}
        >
          The freezer
        </button>
        <button
          className="btn btn-others"
          onClick={() => handleTransfer3(newIndex)}
        >
          The camber
        </button>
        <button
          className="btn btn-others"
          onClick={() => handleTransfer4(newIndex)}
        >
          The other items
        </button>
      </form>
      <form
        action="#"
        method="GET"
        className={`quantity-update-form main-item-style fridge-form-update-quantity ${
          isVisibleQty ? "fridge-form-update-quantity" : "hiddenUpdateForm"
        }`}
        onSubmit={handleSubmit}
      >
        <label htmlFor="setNewQuantity">New quantity:</label>
        <input
          type="text"
          name="setNewQuantity"
          id="setNewQuantity"
          value={modifyQuantity}
          placeholder="ex. 2 kg"
          ref={updateSLFormRef}
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
        className={`main-item-style fridge-form-update ${
          isVisibleS ? "visible" : "hidden"
        }`}
        onSubmit={handleSubmit}
      >
        <div className="input-container">
          <label className="form-label" htmlFor="newShoppingItem">
            New item:
          </label>
          <input
            type="text"
            name="newShoppingItem"
            id="newShoppingItem"
            placeholder="ex. carrot"
            value={newItem}
            ref={addSLFormRef}
            onChange={(e) => setNewItem(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="newShoppingQuantity">
            New quantity:
          </label>
          <input
            type="text"
            name="newShoppingQuantity"
            id="newShoppingQuantity"
            placeholder="ex. 0.5 kg"
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
