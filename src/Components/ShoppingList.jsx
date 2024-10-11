import React, { useEffect, useState } from "react";
import {getWeek} from 'date-fns';
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
}) {
  // Input values

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [updateIndex, setUpdateIndex] = useState(null);
  const [newIndex, setNewIndex] = useState(null);
  const [expenditure, setExpenditure] = useState([]);

  // Visible amount form

  const [isVisibleAmount, setIsvisibleAmount] = useState(false);
  const isTextAmount = isVisibleAmount ? "Close expenditure form" : "Expenditure recording";
  const handleVisibleAmount = () => {
    setIsvisibleAmount(!isVisibleAmount);
  }

  // Visible Add form

  const [isVisibleS, setIsVisibleS] = useState(false);
  const isTextS = isVisibleS ? "Close add form" : "Add item";
  const handleVisibleAdd = () => {
    setIsVisibleS(!isVisibleS);
  };

  // Visible new qty form

  const [isVisibleQty, setIsVisibleQty] = useState(false);
  const isTextQty = isVisibleQty ? "Close modification" : "Update item";
  const handleVisibleQty = (index) => {
    setIsVisibleQty(!isVisibleQty);
    setUpdateIndex(index);
  };

  // Visible move to form

  const [isVisibleMoveTo, setIsVisibleMoveTo] = useState(false);
  const toggleVisibleMoveTo = (index) => {
    setIsVisibleMoveTo(!isVisibleMoveTo);
    setNewIndex(index);
  };

  const [prevItemsSL, setPrevItemsSL] = useState([]);

  // Functions

  const addExpenditure = (e) => {
    e.preventDefault();
    let amount = Number(e.target.amount.value);
    if (!isNaN(amount)) {
      const now = new Date();
      const currentWeek = getWeek(now);
      setExpenditure((prevExpenditure) => {
        const existingWeekIndex = prevExpenditure.findIndex(exp => exp.week === currentWeek);
        if (existingWeekIndex !== -1) {
          const updatedExpenditure = [...prevExpenditure];
          updatedExpenditure[existingWeekIndex] = {
            ...updatedExpenditure[existingWeekIndex],
            amount: updatedExpenditure[existingWeekIndex].amount + amount,
          }
          return updatedExpenditure;
        } else {
          return [...prevExpenditure, {week: currentWeek, amount}]
        }
      })
    }
    e.target.amount.value = '';
    setIsvisibleAmount(false);
  } 

  useEffect(() => {
    console.log(expenditure);
  }, [expenditure])

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleAdd = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const updateList = [
        ...itemsSL,
        {
          name: newItem.trim(),
          quantity: newQuantity.trim(),
          date:
            new Date().getFullYear() +
            "." +
            " " +
            (new Date().getMonth() + 1) +
            "." +
            " " +
            new Date().getDate() +
            ".",
        },
      ];
      setItemsSL(updateList);
      setNewItem("");
      setNewQuantity("");
      setIsVisibleS(false);
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = (index) => {
    const newList = itemsSL.filter((_, i) => {
      return i !== index;
    });
    setItemsSL(newList);
    setIsVisibleQty(false);
    setUpdateIndex(null);
    setModifyQuantity("");
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
    } else {
      const updateList = [...itemsSL];
      updateList[updateIndex].quantity = modifyQuantity.trim();
      setItemsSL(updateList);
      setIsVisibleQty(false);
      setUpdateIndex(null);
      setModifyQuantity("");
    }
  };

  // Elemek mozgatása komponensek között //

  //Fridge component//

  const handleTransfer1 = (index) => {
    const transferItem = itemsSL[index];
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

  // Load

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("itemsSL")) || [];
    setItemsSL(savedItems);
  }, []);

  // Save

  useEffect(() => {
    let hasChangedSL = false;

    if (JSON.stringify(prevItemsSL) !== JSON.stringify(itemsSL)) {
      const updatedSL = itemsSL.map((item, index) => {
        if (item.quantity !== prevItemsSL[index]?.quantity) {
          hasChangedSL = true;
          return { ...item };
        }
        return item;
      });
      if (hasChangedSL || itemsSL.length !== prevItemsSL.length) {
        localStorage.setItem("itemsSL", JSON.stringify(updatedSL));
        setPrevItemsSL(updatedSL);
      }
    }
  }, [itemsSL]);

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
                  onClick={() => handleVisibleQty(index)}
                >
                  {isTextQty}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      <button className="btn btn-others" onClick={handleVisibleAdd}>
        {isTextS}
      </button>
      <button className="btn btn-others" onClick={handleVisibleAmount}>{isTextAmount}</button>
      <form className={`amount-form ${isVisibleAmount ? 'visibleAmountForm' : 'hiddenAmountForm'}`} onSubmit={addExpenditure}>
        <input
          className="amount-form_input"
          type="number"
          name="amount"
          id="amountId"
          required
          min="0"
          placeholder="500"
          step='0.01'
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
