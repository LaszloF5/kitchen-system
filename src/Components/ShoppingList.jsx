import React, { useState } from "react";

export default function ShoppingList({
  items,
  setItems,
  addToFridge,
  addToFreezer,
  addToChamber,
  addToOthers,
}) {
  /////////////////          DONE:          /////////////////

  // első körben 1 ugyanolyan system mint eddig.
  // Az összes komponensbe be lehet építeni egy olyan visszajelzőt, hogy jelzi, ha az adott tételből kevés van. Pl 1 db/l vagy más mértékegység. Ha 1 van belőle, a tétel színe pirosra vált, a font-weight: bold-ra. Regex.
  // 1 move to gomb, amivel át lehet csoportosítani a tételeket, ahova a felhasználó szeretné. Gomb neve: "Move to..."
  // A move to gomb kattintásával, felajálja a 4 lehetséges csoportot, ahova beszúrhatjuk a tételt.
  // Amint a kiválasztott csoportba helyezzük az adott tételt, ellenőrizni kell, hogy van-e már olyan tétel a kiválasztott csoportban: - ha igen: akkor össze kell vonni a 2 mennyiséget, és nem hozunk létre újabb tételt. -ha nincs: akkor létrehozunk egy új tételt, az elem nevével és mennyiségével.
  // Ha az adott tételt beszúrtuk valahova, akkor a ShoppingList felsorolásból automatikusan el kell távolítani.

  /////////////////          TODO:          /////////////////

  // 1 gomb amivel lehet váltani az adott tétel színét, jelezve a vásárlás sikerességét (esetleg pipa v x) EZ NEM BIZTOS HOGY HASZNOS ÖTLET
  // A komponensekhez adni 1 gombot, amivel fel lehet venni az adott tételt a bevásárlólistára, mennyiség megadásával.

  // Input values

  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  const [modifyQuantity, setModifyQuantity] = useState("");
  const [updateIndex, setUpdateIndex] = useState(null);
  const [newIndex, setNewIndex] = useState(null);

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

  // Functions

  const handleSubmit = (e) => {
    e.preventDefault();
  };

  const handleAdd = () => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const updateList = [
        ...items,
        { name: newItem.trim(), quantity: newQuantity.trim() },
      ];
      setItems(updateList);
      setNewItem("");
      setNewQuantity("");
      setIsVisibleS(false);
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  const handleDelete = (index) => {
    const newList = items.filter((_, i) => {
      return i !== index;
    });
    setItems(newList);
    setIsVisibleQty(false);
    setUpdateIndex(null);
    setModifyQuantity("");
  };

  const handleUpdate = () => {
    if (modifyQuantity === "") {
      alert("Please enter a quantity.");
    } else {
      const updateList = [...items];
      updateList[updateIndex].quantity = modifyQuantity.trim();
      setItems(updateList);
      setIsVisibleQty(false);
      setUpdateIndex(null);
      setModifyQuantity("");
    }
  };

  // Elemek mozgatása komponensek között //

  //Fridge component//

  const handleTransfer1 = (index) => {
    const transferItem = items[index];
    addToFridge(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  };

  //Freezer component//

  const handleTransfer2 = (index) => {
    const transferItem = items[index];
    addToFreezer(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  };

  //Chamber component//

  const handleTransfer3 = (index) => {
    const transferItem = items[index];
    addToChamber(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  };

  //Others component//

  const handleTransfer4 = (index) => {
    const transferItem = items[index];
    addToOthers(transferItem);
    handleDelete(index);
    setIsVisibleMoveTo(false);
    setNewIndex(null);
  }

  return (
    <>
      <h3>Shopping list</h3>
      <ul className="fridge-ul main-item-style">
        {items.length === 0 ? (
          <p>Your shopping list is empty.</p>
        ) : (
          items.map((item, index) => (
            <li className="fridge-li-element" key={index}>
              {item.name} - {item.quantity}
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
        <button className="btn btn-others" onClick={() => handleTransfer4(newIndex)}>The other items</button>
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
