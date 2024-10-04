import React, { useEffect, useState } from "react";
import Fridge from "./Components/Fridge";
import Freezer from "./Components/Freezer";
import Chamber from "./Components/Chamber";
import Others from "./Components/Others";
import ShoppingList from "./Components/ShoppingList";
import "./App.css";

export default function App() {
  // useEffect later.
  const [fridgeItems, setFridgeItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [chamberItems, setChamberItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [shoppingListItems, setShoppingListItems] = useState([]);

  // Elemek áthelyezése a shopping list komponensbe

  const [toTheShoppingList, setToTheShoppingList] = useState([]);
  const addToShoppingList = (item) => {
    console.log(item.name, item.quantity);
    setToTheShoppingList([...toTheShoppingList, item]);
  };
  const clearTransferredData = () => {
    setToTheShoppingList([]);
  };

  // Adatátvitel a shoppinglist és a fridge komponensek között
  const [toTheFridge, setToTheFridge] = useState([]);
  const addToFridge = (item) => {
    setToTheFridge([item]);
  };
  const cleanFridgeData = () => {
    setToTheFridge([]);
  };

  // Adatátvitel a shoppinglist és a freezer komponensek között

  const [toTheFreezer, setToTheFreezer] = useState([]);
  const addToFreezer = (item) => {
    setToTheFreezer([item]);
  };
  const cleanFreezerData = () => {
    setToTheFreezer([]);
  };

  // Adatátvitel a shoppinglist és a Chamber komponensek között

  const [toTheChamber, setToTheChamber] = useState([]);
  const addToChamber = (item) => {
    setToTheChamber([item]);
  };
  const cleanChamberData = () => {
    setToTheChamber([]);
  };

  // Adatátvitel a shoppinglist és a Chamber komponensek között

  const [toTheOthers, setToTheOthers] = useState([]);
  const addToOthers = (item) => {
    setToTheOthers([item]);
  };
  const cleanOthersData = () => {
    setToTheOthers([]);
  };

  return (
    <div className="App">
      <h1>Kitchen system</h1>
      <Fridge
        items={fridgeItems}
        setItems={setFridgeItems}
        dataFromSL={toTheFridge}
        cleanFridgeData={cleanFridgeData}
        addToShoppingList={addToShoppingList}
      />
      <Freezer
        itemsFreezer={freezerItems}
        setItemsFreezer={setFreezerItems}
        dataFromSL={toTheFreezer}
        cleanFreezerData={cleanFreezerData}
        addToShoppingList={addToShoppingList}
      />
      <Chamber
        itemsChamber={chamberItems}
        setItemsChamber={setChamberItems}
        dataFromSL={toTheChamber}
        cleanChamberData={cleanChamberData}
        addToShoppingList={addToShoppingList}
      />
      <Others
        itemsOthers={otherItems}
        setItemsOthers={setOtherItems}
        dataFromSL={toTheOthers}
        cleanOthersData={cleanOthersData}
        addToShoppingList={addToShoppingList}
      />
      <ShoppingList
        items={shoppingListItems}
        setItems={setShoppingListItems}
        addToFridge={addToFridge}
        addToFreezer={addToFreezer}
        addToChamber={addToChamber}
        addToOthers={addToOthers}
        dataFromFridge={toTheShoppingList}
        clearTransferredData={clearTransferredData}
      />
      <footer className="footer">Footer</footer>
    </div>
  );
}


/*
  TODO:
  Adatbázis készítése, összekötni az oldallal;
  Bejelentkezési felület, és bejelentkezés;
  Container nevek nagyobb betűméret;
  Füzetszerű ábrázolás;
  Bevásárlólista más színű;
  Bizonyos termékekre mennyi volt a havi ráfordítás;
  Dátumozva, mi mkkor került az adott container-be. /HTML details/;

*/