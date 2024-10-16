import React, { useEffect, useState, useRef } from "react";

export default function Chamber({
  itemsChamber,
  setItemsChamber,
  dataFromSL,
  cleanChamberData,
  addToShoppingList,
}) {
  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;
  // Input values
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [tempQty, setTempQty] = useState("");
  const [tempIndex, setTempIndex] = useState(null);
  const setQtyChamberFormRef = useRef(null);
  const updateChamberFormRef = useRef(null);
  const addChamberFormRef = useRef(null);

  // Visible transfer form
  const [isVisibleTransferForm, setIsVisibleTransferForm] = useState(false);
  const toggleVisibleTransferForm = (index) => {
    setIsVisibleTransferForm(!isVisibleTransferForm);
    setTempIndex(index);
  };

  const SLText = isVisibleTransferForm ? "Close modification" : "Add to the SL";

  // Visible Add form
  const [isVisible, setIsVisible] = useState(false);
  const isText = isVisible ? "Close add form" : "Add item";

  // Visible Update form

  const [isVisibleQuantity, setIsVisibleQuantity] = useState(false);
  const qunatityText = isVisibleQuantity ? "Close modification" : "Update item";

  const [updateIndex, setUpdateIndex] = useState(null);

  const [prevItemsChamber, setPrevItemsChamber] = useState([]);

  // Functions

  // to the shopping list

  const handleTransferItem = () => {
    if (tempQty !== "") {
      const transferItem = {
        ...itemsChamber[tempIndex],
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
      alert("Please enter a valid quantity.");
    }
  };

  // Datas from shopping list

  useEffect(() => {
    if (dataFromSL.length > 0) {
      const exsistingItem = itemsChamber.find(
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
        setItemsChamber([...itemsChamber]);
      } else {
        setItemsChamber([...itemsChamber, ...dataFromSL]);
      }
      cleanChamberData();
    }
  }, [dataFromSL]);

  useEffect(() => {
    if (isVisibleTransferForm) {
      setQtyChamberFormRef.current.focus();
    }

    if (isVisibleQuantity) {
      updateChamberFormRef.current.focus();
    }

    if (isVisible) {
      addChamberFormRef.current.focus();
    }
  }, [isVisibleTransferForm, isVisibleQuantity, isVisible])

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const toggleAddForm = () => {
    setIsVisible(!isVisible);
  };

  const toggleUpdateForm = (index) => {
    setIsVisibleQuantity(!isVisibleQuantity);
    setUpdateIndex(index);
  };

  // Item modifier functions

  const handleAddChamber = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const updatedItems = [
        ...itemsChamber,
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
      setItemsChamber(updatedItems);
      setNewItem("");
      setNewQuantity("");
      setIsVisible(false);
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = (index) => {
    const newList = itemsChamber.filter((_, i) => i !== index);
    setItemsChamber(newList);
    setIsVisibleQuantity(false);
    setModifyQuantity("");
    setUpdateIndex(null);
    setIsVisibleTransferForm(false);
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
    } else {
      const updatedItems = [...itemsChamber];
      updatedItems[updateIndex].quantity = modifyQuantity.trim();
      setItemsChamber(updatedItems);
      setModifyQuantity("");
      setIsVisibleQuantity(false);
      setUpdateIndex(null);
    }
  };

  useEffect(() => {
    const savedItems = JSON.parse(localStorage.getItem("itemsChamber")) || [];
    setItemsChamber(savedItems);
  }, []);

  useEffect(() => {
    let handleChangedChamber = false;

    if (JSON.stringify(prevItemsChamber) !== JSON.stringify(itemsChamber)) {
      const updatedItemsChamber = itemsChamber.map((item, index) => {
        if (item.quantity !== prevItemsChamber[index]?.quantity) {
          handleChangedChamber = true;
          return { ...item };
        }
        return item;
      });
      if (
        handleChangedChamber ||
        itemsChamber.length !== prevItemsChamber.length
      ) {
        localStorage.setItem(
          "itemsChamber",
          JSON.stringify(updatedItemsChamber)
        );
        setPrevItemsChamber(updatedItemsChamber);
      }
    }
  }, [itemsChamber]);

  return (
    <>
      <h2>Chamber items</h2>
      <ul className="fridge-ul main-item-style">
        {itemsChamber.length === 0 ? (
          <p>Your chamber is empty.</p>
        ) : (
          itemsChamber.map((item, index) => (
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
                  onClick={() => toggleUpdateForm(index)}
                >
                  {qunatityText}
                </button>
              </div>
            </li>
          ))
        )}
      </ul>
      <button className="btn btn-others centerBtn" onClick={toggleAddForm}>
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
          ref={setQtyChamberFormRef}
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
          isVisibleQuantity ? "fridge-form-update-quantity" : "hiddenUpdateForm"
        }`}
        onSubmit={handleSubmit}
      >
        <label htmlFor="updateChamberItemQuantity">New quantity:</label>
        <input
          type="text"
          name="updateChamberItemQuantity"
          id="updateChamberItemQuantity"
          placeholder="ex. 1kg"
          value={modifyQuantity}
          ref={updateChamberFormRef}
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
        onSubmit={handleSubmit}
        className={`main-item-style fridge-form-update ${
          isVisible ? "visible" : "hidden"
        }`}
      >
        <div className="input-container">
          <label className="form-label" htmlFor="newChamberItem">
            New item:
          </label>
          <input
            type="text"
            name="newChamberItem"
            id="newChamberItem"
            placeholder="ex. rice"
            value={newItem}
            ref={addChamberFormRef}
            onChange={(e) => setNewItem(e.target.value)}
          />
        </div>
        <div className="input-container">
          <label className="form-label" htmlFor="newChamberQuantity">
            New quantity:
          </label>
          <input
            type="text"
            name="newChamberQuantity"
            id="newChamberQuantity"
            placeholder="ex. 1kg"
            value={newQuantity}
            onChange={(e) => setNewQuantity(e.target.value)}
          />
        </div>
        <input
          type="submit"
          value="Update"
          onClick={handleAddChamber}
          className="btn btn-others centerBtn"
        />
      </form>
    </>
  );
}
