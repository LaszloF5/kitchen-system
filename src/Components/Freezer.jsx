import React, { useEffect, useState, useRef } from "react";

export default function Freezer({
  itemsFreezer,
  setItemsFreezer,
  dataFromSL,
  cleanFreezerData,
  addToShoppingList,
}) {
  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;
  // Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [tempQty, setTempQty] = useState("");
  //////////////////////////////////////////////////
  const [isVisibleF, setIsVisibleF] = useState(false);
  const isText = isVisibleF ? "Close add form" : "Add item";
  ////////////////////////////////////////////////////////
  const [updateIndex, setUpdateIndex] = useState(null);
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [isVisibleUpdateF, setIsVisibleUpdateF] = useState(false);
  const updateText = isVisibleUpdateF ? "Close modification" : "Update item";
  const [tempIndex, setTempIndex] = useState(null);
  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const setQtyFreezerFormRef = useRef(null);
  const updateFreezerFormRef = useRef(null);
  const addFreezerFormRef = useRef(null);
  
  const [prevItemsFreezer, setPrevItemsFreezer] = useState([]);

  // Data from shopping list
  
  useEffect(() => {
    if (dataFromSL.length > 0) {
      const exsistingItem = itemsFreezer.find(
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
        exsistingItem.date = new Date().getFullYear() +'.' + ' ' + (new Date().getMonth() + 1) + '.' + ' ' + new Date().getDate() + '.';
        setItemsFreezer([...itemsFreezer]);
      } else {
        setItemsFreezer([...itemsFreezer, ...dataFromSL]);
      }
      cleanFreezerData();
    }
  }, [dataFromSL]);

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

  }, [isVisibleTransferForm, isVisibleUpdateF, isVisibleF])
  
  ////////// FUNCTIONS //////////
  
  const toggleTransferForm = (index) => {
    setTempIndex(index);
    setIsVisibleTransferForm(!isVisibleTransferForm);
  };
  
  const SLText = isVisibleTransferForm ? 'Close modification' : 'Add to the SL';
  
  const handleTransferItem = () => {
    if (tempQty !== "") {
      const transferItem = { ...itemsFreezer[tempIndex], quantity: tempQty, date: new Date().getFullYear() +'.' + ' ' + (new Date().getMonth() + 1) + '.' + ' ' + new Date().getDate() + '.'  };
      addToShoppingList(transferItem);
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

  const toggleVisibilityUpdateF = (index) => {
    setIsVisibleUpdateF(!isVisibleUpdateF);
    setUpdateIndex(index);
  };

  const handleAddFreezer = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      setItemsFreezer([
        ...itemsFreezer,
        { name: newItem.trim(), quantity: newQuantity.trim(),  date: new Date().getFullYear() +'.' + ' ' + (new Date().getMonth() + 1) + '.' + ' ' + new Date().getDate() + '.' },
      ]);
      setNewItem("");
      setNewQuantity("");
      setIsVisibleF(false);
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };
  const handleDeleteF = (index) => {
    const newList = itemsFreezer.filter((_, i) => {
      return i !== index;
    });
    setItemsFreezer(newList);
    setIsVisibleUpdateF(false);
    setModifyQuantity("");
    setIsVisibleTransferForm(false);
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
      return;
    } else {
      const updatedList = [...itemsFreezer];
      updatedList[updateIndex].quantity = modifyQuantity.trim();
      setItemsFreezer(updatedList);
      setIsVisibleUpdateF(false);
      setUpdateIndex(null);
      setModifyQuantity("");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem('itemsFreezer')) || [];
    setItemsFreezer(savedItems);
}, []);


  // Save

  useEffect(() => {
    let hasChangedFreezer = false;

    if (JSON.stringify(prevItemsFreezer) !== JSON.stringify(itemsFreezer)) {
      const updatedItemsFreezer = itemsFreezer.map((item, index) => {
        if (itemsFreezer.quantity !== prevItemsFreezer[index]?.quantity) {
          hasChangedFreezer = true;
          return { ...item };
        }
        return item;
      });
      if (hasChangedFreezer || itemsFreezer.length !== prevItemsFreezer.length) {
        localStorage.setItem('itemsFreezer', JSON.stringify(updatedItemsFreezer));
        setPrevItemsFreezer(updatedItemsFreezer);
      }
    }
  }, [itemsFreezer])

  return (
    <>
      <h2>Freezer items</h2>
      <ul className="fridge-ul main-item-style">
        {itemsFreezer.length === 0 ? (
          <p>Your freezer is empty.</p>
        ) : (
          itemsFreezer.map((item, index) => {
            return (
              <li
                className={`fridge-li-element ${
                  regex.test(item.quantity) ? "alert-color" : "default-color"
                }`}
                key={index}
              >
                {item.name} - {item.quantity}
                <p className="date">{item.date}</p>
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
        onSubmit={handleSubmit}
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
