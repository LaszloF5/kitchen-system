import React, { useEffect, useState } from "react";
import Fridge from "./Components/Fridge";
import Freezer from "./Components/Freezer";
import Chamber from "./Components/Chamber";
import Others from "./Components/Others";
import ShoppingList from "./Components/ShoppingList";
import "./App.css";

/*
  A freezer komponensben a bevitt adatok mentésre kerülnek, és törölni is lehet, bár az nem tökéletes.
  A szerver oldalon az id-k nem passzolnak ha 1 törlés megtörténik, lehet hogy név alapján kéne törölni. 2024.10.17-én javítani.
  Ha az adott tábla üres, az autoincrementet lehetne nullázni. 
*/

export default function App() {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [chamberItems, setChamberItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [yourAmount, setYourAmount] = useState([]);
  const headerText = "Weekly expenses: ";
  const [currency, setCurrency] = useState("");
  const [prevCurrency, setPrevCurrency] = useState("");
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisibleCurrencyForm, setIsVisibleCurrencyForm] = useState(false);
  const currencyText = isVisibleCurrencyForm ? 'Close currency form' : 'Set your currency';

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleCurrencyForm = () => {
    setIsVisibleCurrencyForm(!isVisibleCurrencyForm);
  }

  useEffect(() => {
    const savedState = JSON.parse(localStorage.getItem("toggle"));
    if (savedState) {
      setIsDarkMode(savedState);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("toggle", JSON.stringify(isDarkMode));
  }, [isDarkMode]);

  useEffect(() => {
    if (yourAmount[yourAmount.length - 1]?.amount > 0 && currency === "") {
        alert("Enter the currency that you want to use.");
    }
  }, []);

  // Elemek áthelyezése a shopping list komponensbe

  const [toTheShoppingList, setToTheShoppingList] = useState([]);
  const addToShoppingList = (item) => {
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

  const handleCurrency = (e) => {
    e.preventDefault();
    if (e.target.currency.value.length === 0) {
      alert('This input field must be filled.');
    } else {
      setCurrency(e.target.currency.value.toUpperCase());
      e.target.currency.value = '';
      setIsVisibleCurrencyForm(false);
    }
  }

  // Load

  useEffect(() => {
    const currentCurrency = JSON.parse(localStorage.getItem('currency'));
    setCurrency(currentCurrency);
  }, [])

  // Save

  useEffect(() => {
    if (prevCurrency !== currency) {
      localStorage.setItem('currency', JSON.stringify(currency));
      setPrevCurrency(currency);
    }
  }, [currency])

  return (
    <div className={`${isDarkMode ? "getDark" : "getLight"} App`}>
      <header className="header">
        <button className="btn btn-update" onClick={toggleCurrencyForm}>{currencyText}</button>
        <div>
        {headerText}
        {yourAmount.length > 0 && (
          <span>
            {yourAmount[yourAmount.length - 1].amount} {currency}
          </span>
        )}
        </div>
      </header>

      {isVisibleCurrencyForm ? (<form className="currencyForm" onSubmit={handleCurrency}>
        <input className="currencyForm_input" type="text" name="currency" placeholder="ex. USD" autoComplete="off" autoFocus/>
        <button className="btn btn-others" type="submit">Currency</button>
      </form>) : null}

      <h1>Kitchen system</h1>
      {isDarkMode ? (
        <img
          className="white-filter"
          src={process.env.PUBLIC_URL + "dark-mode.png"}
          alt="Dark mode"
          role="button"
          tabIndex="0"
          onClick={toggleDarkMode}
        />
      ) : (
        <img
          src={process.env.PUBLIC_URL + "light-mode.png"}
          alt="Light mode"
          role="button"
          tabIndex="0"
          onClick={toggleDarkMode}
        />
      )}

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
        expenditure={yourAmount}
        setExpenditure={setYourAmount}
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
  - Bevásárlólista más színű;
  - DARK MODE-BAN AZ ADD ITEM MEGNYITÁSAKOR A SZÖVEG NEM LÁTSZÓDIK, MA KÖTELEZŐ JAVÍTANI! 2024-10-11. + A VONALAZÁST IS;
  - Dark mode-ban az árnyék alul és jobb oldalon legyen;

  TODO:
  - A bevásárlások értékének bevitele.Ezeket gyűjteni egy objektumba, heti és havi kimutatást készíteni diagram formájában is, de szerintem csak ha az aktuális heti, és havi ráfordítás megjelnne az is jó lenne. A diagramok pedig külön oldalon szerepelnének.
  A valuta megadására hívja fel a figyelmet, ha az nincs megadva. Ez külön legyen kezelve a form-tól.
  - Adatbázis készítése, összekötni az oldallal;
  - Bejelentkezési felület, és bejelentkezés;
  - Bizonyos termékekre mennyi volt a havi ráfordítás (Vagy akár az összesre.);
  - 1 gomb amivel lehet váltani az adott tétel színét, jelezve a vásárlás sikerességét (esetleg pipa v x), vagy az adott elem nevére kattintáskor áthúzni az elemet, ezzel jelezve a vásárlás sikerességét. EZ NEM BIZTOS HOGY HASZNOS ÖTLET;
  - Egy input mező, ahova be lehet írni / másolni hozzávalókat ételekhez, és végigfuttatni egy keresést arra vonatkozóan, hogy a beadott    elemek szerepelnek-e valamelyik containerbe. Visszatérési érték az az elem lenne, amelyik nem található meg egyik container-be sem /Vagy elemek/;
*/
