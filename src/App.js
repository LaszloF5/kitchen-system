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

  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  }

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem('toggle'));
    if (savedState) {
      setIsDarkMode(savedState);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('toggle', JSON.stringify(isDarkMode))
  }, [isDarkMode]);

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
    <div className={`${isDarkMode ? 'getDark' : 'getLight'} App`}>
      <h1>Kitchen system</h1>
      {isDarkMode ? <img className="white-filter" src={process.env.PUBLIC_URL + 'dark-mode.png'} alt="Dark mode" role="button" tabIndex='0' onClick={toggleDarkMode}/> : <img src={process.env.PUBLIC_URL + 'light-mode.png'} alt="Light mode" role="button" tabIndex='0' onClick={toggleDarkMode}/>}

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
        itemsSL={shoppingListItems}
        setItemsSL={setShoppingListItems}
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
/////////////////          DONE:          /////////////////

  - Első körben 1 ugyanolyan system mint eddig.
  - Az összes komponensbe be lehet építeni egy olyan visszajelzőt, hogy jelzi, ha az adott tételből kevés van. Pl 1 db/l vagy más mértékegység. Ha 1 van belőle, a tétel színe pirosra vált, a font-weight: bold-ra. Regex.
  - 1 move to gomb, amivel át lehet csoportosítani a tételeket, ahova a felhasználó szeretné. Gomb neve: "Move to..."
  - A move to gomb kattintásával, felajálja a 4 lehetséges csoportot, ahova beszúrhatjuk a tételt.
  - Amint a kiválasztott csoportba helyezzük az adott tételt, ellenőrizni kell, hogy van-e már olyan tétel a kiválasztott csoportban: - ha igen: akkor össze kell vonni a 2 mennyiséget, és nem hozunk létre újabb tételt. -ha nincs: akkor létrehozunk egy új tételt, az elem nevével és mennyiségével.
  - Ha az adott tételt beszúrtuk valahova, akkor a ShoppingList felsorolásból automatikusan el kell távolítani.
  A komponensekhez adni 1 gombot, amivel fel lehet venni az adott tételt a bevásárlólistára, mennyiség megadásával.
  - Localstorage létrehozása.
  - Container nevek nagyobb betűméret;
  - Füzetszerű ábrázolás;
  - Dark mode;
  - Dátumozva, mi mikor került az adott container-be. /HTML details/ UPDATE: Nem details-el oldottam meg, találtam ésszerűbb megoldást.;

  TODO:
  - Bevásárlólista más színű; /Közvéleménykutatás folyamatban./
  - Adatbázis készítése, összekötni az oldallal;
  - Bejelentkezési felület, és bejelentkezés;
  - Bizonyos termékekre mennyi volt a havi ráfordítás (Vagy akár az összesre.);
  - 1 gomb amivel lehet váltani az adott tétel színét, jelezve a vásárlás sikerességét (esetleg pipa v x), vagy az adott elem nevére kattintáskor áthúzni az elemet, ezzel jelezve a vásárlás sikerességét. EZ NEM BIZTOS HOGY HASZNOS ÖTLET;
  - Egy input mező, ahova be lehet írni / másolni hozzávalókat ételekhez, és végigfuttatni egy keresést arra vonatkozóan, hogy a beadott    elemek szerepelnek-e valamelyik containerbe. Visszatérési érték az az elem lenne, amelyik nem található meg egyik container-be sem /Vagy elemek/;
*/