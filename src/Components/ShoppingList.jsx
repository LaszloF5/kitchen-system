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
  expenditure,
  setExpenditure,
  regex,
  regexQtyBreakdown,
}) {
  // Input values

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [newIndex, setNewIndex] = useState(null);
  const [isVisibleAmount, setIsvisibleAmount] = useState(false);
  const [isVisibleS, setIsVisibleS] = useState(false);
  const [isVisibleQty, setIsVisibleQty] = useState(false);
  const [isVisibleMoveTo, setIsVisibleMoveTo] = useState(false);
  const [updateIdSL, setUpdateIdSL] = useState(null);

  const updateSLFormRef = useRef(null);
  const addSLFormRef = useRef(null);
  const expenditureFormRef = useRef(null);

  useEffect(() => {
    if (isVisibleAmount) {
      expenditureFormRef.current.focus();
    }

    if (isVisibleQty) {
      updateSLFormRef.current.focus();
    }

    if (isVisibleS) {
      addSLFormRef.current.focus();
    }
  }, [isVisibleAmount, isVisibleQty, isVisibleS]);

  // Visible amount form

  const isTextAmount = isVisibleAmount
    ? "Close expenditure form"
    : "Expenditure recording";
  const handleVisibleAmount = () => {
    setIsvisibleAmount(!isVisibleAmount);
  };

  // Visible Add form

  const isTextS = isVisibleS ? "Close add form" : "Add item";
  const handleVisibleAdd = () => {
    setIsVisibleS(!isVisibleS);
  };

  // Visible new qty form

  const isTextQty = isVisibleQty ? "Close modification" : "Update item";
  const handleVisibleQty = (index, id) => {
    setIsVisibleQty(!isVisibleQty);
    setUpdateIdSL(id);
  };

  // Visible move to form

  const toggleVisibleMoveTo = (index) => {
    setIsVisibleMoveTo(!isVisibleMoveTo);
    setNewIndex(index);
  };

  const [prevExpenditure, setPrevExpenditure] = useState([]);

  // Functions

  const addExpenditure = (e) => {
    e.preventDefault();
    let amount = Number(e.target.amount.value);
    if (!isNaN(amount)) {
      const now = new Date();
      const currentWeek = getWeek(now);
      setExpenditure((prevExpenditure) => {
        const existingWeekIndex = prevExpenditure.findIndex(
          (exp) => exp.week === currentWeek
        );
        if (existingWeekIndex !== -1) {
          const updatedExpenditure = [...prevExpenditure];
          updatedExpenditure[existingWeekIndex] = {
            ...updatedExpenditure[existingWeekIndex],
            amount: updatedExpenditure[existingWeekIndex].amount + amount,
          };
          return updatedExpenditure;
        } else {
          return [...prevExpenditure, { week: currentWeek, amount }];
        }
      });
    }
    e.target.amount.value = "";
    setIsvisibleAmount(false);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const getDatas = async () => {
      const data = await fetchItems("shoppingList_items");
      setItems(data);
    };
    getDatas();
  }, [items]);

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
  };

  const handleUpdate = async () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5500/shoppingList_items/${updateIdSL}`,
        { quantity: modifyQuantity }
      );
      const response = await axios.get(
        "http://localhost:5500/shoppingList_items"
      );
      setItems(response.data.items);
      setIsVisibleQty(false);
      setUpdateIdSL(null);
      setModifyQuantity("");
    } catch (error) {
      console.log(error);
    }
  };

  // Elemek mozgatása komponensek között //

  const moveItem = async (itemId, itemName, sourceTable, targetTable) => {
    try {
      const response = await axios.post("http://localhost:5500/move-item", {
        id: itemId,
        itemName,
        sourceTable,
        targetTable,
      });

      if (response.status === 200) {
        const newList = await axios.get(
          "http://localhost:5500/shoppingList_items"
        );
        setItems(newList.data.items);
        setIsVisibleMoveTo(false);
        setNewIndex(null);
        alert("Elem sikeresen áthelyezve.");
      }
    } catch (error) {
      console.error(error);
      alert("Hiba a mozgatáskor.");
    }
  };

  //Fridge component//

  const handleTransfer1 = (index) => {
    const itemToTransfer = items[index];
    moveItem(
      itemToTransfer.id,
      itemToTransfer.name,
      "shoppingList_items",
      "fridge_items"
    );
  };

  //Freezer component//

  const handleTransfer2 = (index) => {
    const itemToTransfer = items[index];
    moveItem(
      itemToTransfer.id,
      itemToTransfer.name,
      "shoppingList_items",
      "freezer_items"
    );
  };

  //Chamber component//

  const handleTransfer3 = (index) => {
    const itemToTransfer = items[index];
    moveItem(
      itemToTransfer.id,
      itemToTransfer.name,
      "shoppingList_items",
      "chamber_items"
    );
  };

  //Others component//

  const handleTransfer4 = (index) => {
    const itemToTransfer = items[index];
    moveItem(
      itemToTransfer.id,
      itemToTransfer.name,
      "shoppingList_items",
      "others_items"
    );
  };

  useEffect(() => {
    const updatedExpenditure = JSON.parse(
      localStorage.getItem("expenditureLT")
    );
    setExpenditure(updatedExpenditure);
  }, []);

  useEffect(() => {
    let hasChangedEx = false;
    if (JSON.stringify(prevExpenditure) !== JSON.stringify(expenditure)) {
      hasChangedEx = true;
    }
    if (hasChangedEx) {
      localStorage.setItem("expenditureLT", JSON.stringify(expenditure));
      setPrevExpenditure(expenditure);
    }
  }, [expenditure]);

  return (
    <>
      <h2>Shopping list</h2>
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
      <button className="btn btn-others center" onClick={handleVisibleAmount}>
        {isTextAmount}
      </button>
      <form
        className={`amount-form ${
          isVisibleAmount ? "visibleAmountForm" : "hiddenAmountForm"
        }`}
        onSubmit={addExpenditure}
      >
        <input
          className="amount-form_input"
          type="number"
          name="amount"
          id="amountId"
          required
          min="0"
          placeholder="500"
          step="0.01"
          ref={expenditureFormRef}
        />
        <button type="submit" className="btn btn-others">
          Add
        </button>
      </form>
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
          <label className="form-label" htmlFor="newShoppingItemId">
            New item:
          </label>
          <input
            type="text"
            name="newShoppingItem"
            id="newShoppingItemId"
            placeholder="ex. carrot"
            value={newItem}
            ref={addSLFormRef}
            onChange={(e) => setNewItem(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="newShoppingQuantityId">
            New quantity:
          </label>
          <input
            type="text"
            name="newShoppingQuantity"
            id="newShoppingQuantityId"
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
