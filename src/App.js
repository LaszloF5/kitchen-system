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
  }
  const cleanOthersData = () => {
    setToTheOthers([]);
  }

  return (
    <div className="App">
      <h1>Kitchen system</h1>
      <Fridge
        items={fridgeItems}
        setItems={setFridgeItems}
        dataFromSL={toTheFridge}
        cleanFridgeData={cleanFridgeData}
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
      />
      <footer className="footer">Footer</footer>
    </div>
  );
}
