import React, { useEffect, useState } from "react";
import axios from "axios";
import Fridge from "./Components/Fridge";
import Freezer from "./Components/Freezer";
import Chamber from "./Components/Chamber";
import Others from "./Components/Others";
import ShoppingList from "./Components/ShoppingList";
import "./App.css";

export default function App() {
  ///////////////////////////////////////////////////
  const [newItem, setNewItem] = useState("");
  const [newQuantity, setNewQuantity] = useState("");
  ///////////////////////////////////////////////////
  const [fridgeItems, setFridgeItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [chamberItems, setChamberItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [yourAmount, setYourAmount] = useState([]);
  const headerText = "Weekly expenses: ";
  const [currency, setCurrency] = useState("");
  const [prevCurrency, setPrevCurrency] = useState("");

  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;
  const regexQtyBreakdown = /\d+(\.\d+)?/;

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisibleCurrencyForm, setIsVisibleCurrencyForm] = useState(false);
  const currencyText = isVisibleCurrencyForm
    ? "Close currency form"
    : "Set your currency";

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleCurrencyForm = () => {
    setIsVisibleCurrencyForm(!isVisibleCurrencyForm);
  };

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

  // Get items

  const fetchItems = async (table) => {
    try {
      const response = await axios.get(`http://localhost:5500/${table}`);
      return Array.isArray(response.data.items) ? response.data.items : [];
    } catch (error) {
      console.error("Error fetching items: ", error);
      return [];
    }
  };

  // Post items

  const addItem = async (table, newItem, newQuantity, setItems) => {
    if (newItem.length > 0 && newQuantity.length > 0) {
      const validQty = Number(...newQuantity.match(regexQtyBreakdown));
      const unit = newQuantity.replace(Number.parseFloat(newQuantity), "");
      const newItemData = {
        name: newItem.trim(),
        quantity: `${validQty} ${unit}`,
        date_added: new Date().toISOString().split("T")[0],
      };
      try {
        const response = await axios.post(
          `http://localhost:5500/${table}`,
          newItemData
        );
        setItems((prevItems) => [...prevItems, response.data]);
        return response.data;
      } catch (error) {
        console.error("Error adding item:", error);
        alert("An error occurred while adding the item.");
      }
    } else {
      alert("The name and quantity fields mustn't be empty.");
    }
  };

  // Delete item

  const deleteItem = async (table, itemToDelete, setItems) => {
    try {
      await axios.delete(`http://localhost:5500/${table}/${itemToDelete.id}`);
      const response = await axios.get(`http://localhost:5500/${table}`);
      setItems(response.data.items);
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    }
  };

  const moveToSL = async (
    itemName,
    newQuantity,
    date,
    sourceTable,
    targetTable
  ) => {
    try {
      await axios.post("http://localhost:5500/moveto_sl", {
        itemName,
        newQuantity,
        date,
        sourceTable,
        targetTable,
      });
    } catch {
      alert("Error moving to the SL.");
    }
  };

  const handleCurrency = (e) => {
    e.preventDefault();
    if (e.target.currency.value.length === 0) {
      alert("This input field must be filled.");
    } else {
      setCurrency(e.target.currency.value.toUpperCase());
      e.target.currency.value = "";
      setIsVisibleCurrencyForm(false);
    }
  };

  // Load

  useEffect(() => {
    const currentCurrency = JSON.parse(localStorage.getItem("currency"));
    setCurrency(currentCurrency);
  }, []);

  // Save

  useEffect(() => {
    if (prevCurrency !== currency) {
      localStorage.setItem("currency", JSON.stringify(currency));
      setPrevCurrency(currency);
    }
  }, [currency]);

  return (
    <div className={`${isDarkMode ? "getDark" : "getLight"} App`}>
      <header className="header">
        <button className="btn btn-update" onClick={toggleCurrencyForm}>
          {currencyText}
        </button>
        <div>
          {headerText}
          {yourAmount.length > 0 && (
            <span>
              {yourAmount[yourAmount.length - 1].amount} {currency}
            </span>
          )}
        </div>
      </header>

      {isVisibleCurrencyForm ? (
        <form className="currencyForm" onSubmit={handleCurrency}>
          <input
            className="currencyForm_input"
            type="text"
            name="currency"
            placeholder="ex. USD"
            autoComplete="off"
            autoFocus
          />
          <button className="btn btn-others" type="submit">
            Currency
          </button>
        </form>
      ) : null}

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
        fetchItems={fetchItems}
        addItem={addItem}
        deleteItem={deleteItem}
        moveToSL={moveToSL}
        regex={regex}
        regexQtyBreakdown={regexQtyBreakdown}
      />
      <Freezer
        items={freezerItems}
        setItems={setFreezerItems}
        fetchItems={fetchItems}
        addItem={addItem}
        deleteItem={deleteItem}
        moveToSL={moveToSL}
        regex={regex}
        regexQtyBreakdown={regexQtyBreakdown}
      />
      <Chamber
        items={chamberItems}
        setItems={setChamberItems}
        fetchItems={fetchItems}
        addItem={addItem}
        deleteItem={deleteItem}
        moveToSL={moveToSL}
        regex={regex}
        regexQtyBreakdown={regexQtyBreakdown}
      />
      <Others
        items={otherItems}
        setItems={setOtherItems}
        fetchItems={fetchItems}
        addItem={addItem}
        deleteItem={deleteItem}
        moveToSL={moveToSL}
        regex={regex}
        regexQtyBreakdown={regexQtyBreakdown}
      />
      <ShoppingList
        items={shoppingListItems}
        setItems={setShoppingListItems}
        fetchItems={fetchItems}
        addItem={addItem}
        deleteItem={deleteItem}
        expenditure={yourAmount}
        setExpenditure={setYourAmount}
        regex={regex}
        regexQtyBreakdown={regexQtyBreakdown}
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
  - Adatbázis készítése, összekötni az oldallal;

  TODO:
  - A bevásárlások értékének bevitele.Ezeket gyűjteni egy objektumba, heti és havi kimutatást készíteni diagram formájában is, de szerintem csak ha az aktuális heti, és havi ráfordítás megjelnne az is jó lenne. A diagramok pedig külön oldalon szerepelnének.
  A valuta megadására hívja fel a figyelmet, ha az nincs megadva. Ez külön legyen kezelve a form-tól.
  - Bejelentkezési felület, és bejelentkezés;
  - Bizonyos termékekre mennyi volt a havi ráfordítás (Vagy akár az összesre.);
  - 1 gomb amivel lehet váltani az adott tétel színét, jelezve a vásárlás sikerességét (esetleg pipa v x), vagy az adott elem nevére kattintáskor áthúzni az elemet, ezzel jelezve a vásárlás sikerességét. EZ NEM BIZTOS HOGY HASZNOS ÖTLET;
  - Egy input mező, ahova be lehet írni / másolni hozzávalókat ételekhez, és végigfuttatni egy keresést arra vonatkozóan, hogy a beadott    elemek szerepelnek-e valamelyik containerbe. Visszatérési érték az az elem lenne, amelyik nem található meg egyik container-be sem /Vagy elemek/;
*/
