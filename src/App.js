import React, { useState } from "react";
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
  const clearDataFromFridge = () => {
    setToTheShoppingList([]);
  };

  // Adatátvitel a shoppinglist és a fridge komponensek között
  // Folytatni a shoppinglist komponensben, mert az adatok már megérkeznek oda. Fel kell őket dolgozni.
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
        items={freezerItems}
        setItems={setFreezerItems}
        dataFromSL={toTheFreezer}
        cleanFreezerData={cleanFreezerData}
      />
      <Chamber
        items={chamberItems}
        setItems={setChamberItems}
        dataFromSL={toTheChamber}
        cleanChamberData={cleanChamberData}
      />
      <Others
        items={otherItems}
        setItems={setOtherItems}
        dataFromSL={toTheOthers}
        cleanOthersData={cleanOthersData}
      />
      <ShoppingList
        items={shoppingListItems}
        setItems={setShoppingListItems}
        addToFridge={addToFridge}
        addToFreezer={addToFreezer}
        addToChamber={addToChamber}
        addToOthers={addToOthers}
        dataFromFridge={toTheShoppingList}
        clearDataFromFridge={clearDataFromFridge}
      />
      <footer className="footer">Footer</footer>
    </div>
  );
}
