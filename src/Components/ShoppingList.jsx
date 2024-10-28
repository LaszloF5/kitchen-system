import React, { useEffect, useState, useRef } from "react";
import { getWeek } from "date-fns";
import axios from "axios";
import "./ShoppingList.css";

export default function ShoppingList({
  itemsSL,
  setItemsSL,
  addToFridge,
  addToFreezer,
  addToChamber,
  addToOthers,
  dataFromFridge,
  clearTransferredData,
  expenditure,
  setExpenditure,
}) {
  // Input values

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [updateIndex, setUpdateIndex] = useState(null);
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
    setUpdateIndex(index);
    setUpdateIdSL(id);
  };

  // Visible move to form

  const toggleVisibleMoveTo = (index) => {
    setIsVisibleMoveTo(!isVisibleMoveTo);
    setNewIndex(index);
  };

  const [prevItemsSL, setPrevItemsSL] = useState([]);
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
    const fetchItems = async () => {
      try {
        const response = await axios.get("http://localhost:5500/shoppingList_items");
        setItemsSL(response.data.items);
      } catch (error) {
        console.error(error);
      }
    }
    fetchItems();
  }, [])

  const handleAdd = async () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const newItemSL = {
        name: newItem.trim(),
        quantity: newQuantity.trim(),
        date_added: new Date().toISOString().split("T")[0],
      };
      try {
        await axios.post("http://localhost:5500/shoppingList_items", newItemSL);
        setItemsSL([...itemsSL, newItemSL]);
        setNewItem("");
        setNewQuantity("");
        setIsVisibleS(false);
      } catch (error) {
        console.error(error);
      }
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = async (index) => {
    try {
      const itemToDelete = itemsSL[index];
      await axios.delete(`http://localhost:5500/shoppingList_items/${itemToDelete.id}`);
      const newList = itemsSL.filter((_, i) => {
        return i !== index;
      });
      setItemsSL(newList);
      setIsVisibleQty(false);
      setUpdateIndex(null);
      setModifyQuantity("");
    } catch {
      alert("An error occurred while deleting the item.");
    }
  };

  const handleUpdate = async () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    }
    try {
      await axios.put(`http://localhost:5500/shoppingList_items/${updateIdSL}`, {quantity: modifyQuantity});
      const updateList = [...itemsSL];
      updateList[updateIndex].quantity = modifyQuantity.trim();
      setItemsSL(updateList);
      setIsVisibleQty(false);
      setUpdateIndex(null);
      setUpdateIdSL(null);
      setModifyQuantity("");
    } catch (error){
      console.log(error);
    }
  };

  // Elemek mozgatása komponensek között //

  //Fridge component//

  const handleTransfer1 = (index) => {
    const transferItem = { ...itemsSL[index] };
    addToFridge(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  };

  //Freezer component//

  const handleTransfer2 = (index) => {
    const transferItem = itemsSL[index];
    addToFreezer(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  };

  //Chamber component//

  const handleTransfer3 = (index) => {
    const transferItem = itemsSL[index];
    addToChamber(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  };

  //Others component//

  const handleTransfer4 = (index) => {
    const transferItem = itemsSL[index];
    addToOthers(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  };

  //items from components//

  useEffect(() => {
    if (dataFromFridge.length > 0) {
      const existItem = itemsSL.find(
        (item) => item.name === dataFromFridge[0].name
      );
      if (existItem) {
        const core = existItem.quantity.replace(
          Number.parseFloat(existItem.quantity),
          ""
        );
        const firstNum = Number.parseFloat(existItem.quantity);
        const secondNum = Number.parseFloat(dataFromFridge[0].quantity);
        const sumQty = firstNum + secondNum;
        existItem.quantity = sumQty + " " + core;
        setItemsSL([...itemsSL]);
        clearTransferredData();
      } else {
        setItemsSL([...itemsSL, ...dataFromFridge]);
        clearTransferredData();
      }
    }
  }, [dataFromFridge]);

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
        {itemsSL.length === 0 ? (
          <p>Your shopping list is empty.</p>
        ) : (
          itemsSL.map((item, index) => (
            <li className="fridge-li-element" key={index}>
              {item.name} - {item.quantity}
              <p className="date">{item.date}</p>
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
