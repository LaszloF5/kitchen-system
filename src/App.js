import React, { useCallback, useEffect, useState, useRef } from "react";
import axios from "axios";
import { getWeek } from "date-fns";
import { HashRouter, Link, Route, Routes } from "react-router-dom";
import Chart from "./Components/Chart";
import Fridge from "./Components/Fridge";
import Freezer from "./Components/Freezer";
import Chamber from "./Components/Chamber";
import Others from "./Components/Others";
import ShoppingList from "./Components/ShoppingList";
import Register from "./Components/Register";
import Login from "./Components/Login";
import DeleteUser from "./Components/DeleteUser";
import "./App.css";

export default function App() {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [chamberItems, setChamberItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [yourAmount, setYourAmount] = useState([]);
  const [expenditure, setExpenditure] = useState([]);
  const headerText = "Weekly expenses: ";
  const [currency, setCurrency] = useState("");
  const [prevCurrency, setPrevCurrency] = useState("");
  const [renderToken, setRenderToken] = useState("");
  const [transferState, setTransferState] = useState(false);
  const [transferFromSL, setTransferFromSL] = useState(false);
  const [changedState, setChangedState] = useState(false);

  //// KIADÁSOK /////
  const [isVisibleAmount, setIsvisibleAmount] = useState(false);
  const expenditureFormRef = useRef(null);
  ///////////////////

  ///////////////////
  const [token, setToken] = useState(localStorage.getItem("token") || null);
  const handleLogout = () => {
    if (loginText === "Log out") {
      setToken(null);
      localStorage.removeItem("token");
      setRenderToken("");
      alert("Logout successful.");
    }
  };
  ///////////////////

  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;
  const regexQtyBreakdown = /\d+(\.\d+)?/;

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisibleCurrencyForm, setIsVisibleCurrencyForm] = useState(false);
  const currencyText = isVisibleCurrencyForm
    ? "Close currency form"
    : "Set your currency";

  const [goToLogin, setGoToLogin] = useState(false);
  const loginText = token === null ? "Log in" : "Log out";

  const alreadyHaveAcc = () => {
    setGoToLogin(true);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  }, []);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const toggleCurrencyForm = () => {
    setIsVisibleCurrencyForm(!isVisibleCurrencyForm);
  };

  useEffect(() => {
    if (isVisibleAmount) {
      expenditureFormRef.current.focus();
    }
  }, [isVisibleAmount]);

  const isTextAmount = isVisibleAmount
    ? "Close expenditure form"
    : "Expenditure recording";
  const handleVisibleAmount = () => {
    setIsvisibleAmount(!isVisibleAmount);
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

  // USEMEMO????
  useEffect(() => {
    if (yourAmount[yourAmount.length - 1]?.amount > 0 && currency === "") {
      alert("Enter the currency that you want to use.");
    }
  }, []);
  /*
useEffect(() => {
    alert('A token tartalma megváltozott!');
  }, [renderToken])

  Be és kijelentkezésnél a renderToken tartalma megváltozik. Ez az useEffect bizonyítja.
*/

/////////////////////////////////////
//////////KIADÁS LEKÉRDEZÉS//////////
/////////////////////////////////////

  useEffect(() => {
    const getExpenses = async () => {
      try {
        const response = await fetch("http://localhost:5500/expenses", {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        });
        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        setExpenditure(data.expenses);
        console.log("data. ", data.expenses);
        setChangedState(false);
      } catch (error) {
        console.error("Failed to fetch expenses: ", error);
        alert("Nem sikerült lekérni a kiadásokat.");
      }
    };
    if (token) {
      getExpenses();
    }
  }, [changedState]);

  const deleteExpenses = async () => {
    try {
      const response = await fetch("http://localhost:5500/expenses", {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Server error: ${response.statusText}`);
      }

      const data = await response.json();
      console.log("Backend response: ", data);
    } catch (error) {
      console.error("Failed to delete expenses: ", error);
      alert("Nem sikerült törölni a kiadásokat.");
    }
  };

  const addExpenditure = async (e) => {
    e.preventDefault();
    const amount = Number(e.target.amount.value);
    console.log("amount: ", amount);

    if (!isNaN(amount)) {
      const now = new Date();
      const currentWeek = getWeek(now);

      try {
        const response = await fetch("http://localhost:5500/expenses", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          body: JSON.stringify({
            amount,
            date: currentWeek, // Dátum YYYY-MM-DD formátumban
          }),
        });

        if (!response.ok) {
          throw new Error(`Server error: ${response.statusText}`);
        }

        const data = await response.json();
        console.log("Backend response: ", data);
        setChangedState(true);
      } catch (error) {
        console.error("Failed to add expenditure: ", error.message);
        alert("Nem sikerült a kiadást rögzíteni.");
      }
    }

    e.target.amount.value = "";
    setIsvisibleAmount(false);
  };

  // Get items

  const fetchItems = useCallback(async (table) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("You need to be logged in to perform this action.");
      return [];
    }
    try {
      const response = await axios.get(`http://localhost:5500/${table}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return Array.isArray(response.data.items) ? response.data.items : [];
    } catch (error) {
      console.error("Error fetching items: ", error);
      return [];
    }
  }, []);

  // Post items

  const addItem = async (table, newItem, newQuantity, setItems) => {
    const token = localStorage.getItem("token");
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
          newItemData,
          { headers: { Authorization: `Bearer ${token}` } }
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

  // Update item

  const updateItem = async (table, modifyQuantity, updateId, setItems) => {
    await axios.put(`http://localhost:5500/${table}/${updateId}`, {
      quantity: modifyQuantity.trim(),
    });
    const response = await axios.get(`http://localhost:5500/${table}`);
    setItems(response.data.items);
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

  // Load currency

  useEffect(() => {
    const currentCurrency = JSON.parse(localStorage.getItem("currency"));
    setCurrency(currentCurrency);
  }, []);

  // Save currency

  useEffect(() => {
    if (prevCurrency !== currency) {
      localStorage.setItem("currency", JSON.stringify(currency));
      setPrevCurrency(currency);
    }
  }, [currency]);

  return (
    <div className={`${isDarkMode ? "getDark" : "getLight"} App`}>
      <HashRouter>
        <header className="header">
          <Link className="chart btn btn-others" to="/">
            Home
          </Link>
          <Link className="chart btn btn-update" to="/Register">
            Register
          </Link>
          <Link className="chart btn btn-update" to="/Login" onClick={handleLogout}>
            {loginText}
          </Link>
          {token !== null ? <Link className="chart btn btn-update" to="/Chart">
            Chart
          </Link> : ''}
          <button onClick={deleteExpenses}>Delete amount (test)</button>
          <button className="btn btn-others" onClick={handleVisibleAmount}>
            {isTextAmount}
          </button>
          <button className="btn btn-update" onClick={toggleCurrencyForm}>
            {currencyText}
          </button>
          <div>
            {headerText}
            {expenditure.length === 0 && token?.length > 0 ? (
              <span className="expenditure">No expenditures yet</span>
            ) : (
              <div className="expenditure">
                <span>
                  Week: {expenditure[expenditure.length - 1]?.date}. Amount:{" "}
                  {expenditure[expenditure.length - 1]?.amount} {currency}
                </span>
              </div>
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
        <form
          className={`amount-form ${
            isVisibleAmount ? "visibleAmountForm" : "hiddenAmountForm"
          }`}
          onSubmit={addExpenditure}
        >
          <input
            className="amount-form_input"
            type="number"
            name="amount"
            id="amountId"
            required
            min="0"
            placeholder="500"
            step="0.01"
            ref={expenditureFormRef}
          />
          <button type="submit" className="btn btn-others">
            Add
          </button>
        </form>
        <Routes>
          <Route path="/chart" element={<Chart />} />
          <Route
            path="register"
            element={
              <Register
                alreadyHaveAcc={alreadyHaveAcc}
                goToLogin={goToLogin}
              />
            }
          />
          <Route
            path="login"
            element={
              <Login
                token={token}
                setToken={setToken}
                setRenderToken={setRenderToken}
              />
            }
          />
          <Route
            path="*"
            element={
              <>
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
                  updateItem={updateItem}
                  moveToSL={moveToSL}
                  regex={regex}
                  renderToken={renderToken}
                  transferState={transferState}
                  setTransferState={setTransferState}
                  transferFromSL={transferFromSL}
                  setTransferFromSL={setTransferFromSL}
                  token={token}
                  setToken={setToken}
                />
                <Freezer
                  items={freezerItems}
                  setItems={setFreezerItems}
                  fetchItems={fetchItems}
                  addItem={addItem}
                  deleteItem={deleteItem}
                  updateItem={updateItem}
                  moveToSL={moveToSL}
                  regex={regex}
                  renderToken={renderToken}
                  transferState={transferState}
                  setTransferState={setTransferState}
                  transferFromSL={transferFromSL}
                  setTransferFromSL={setTransferFromSL}
                  token={token}
                  setToken={setToken}
                />
                <Chamber
                  items={chamberItems}
                  setItems={setChamberItems}
                  fetchItems={fetchItems}
                  addItem={addItem}
                  deleteItem={deleteItem}
                  updateItem={updateItem}
                  moveToSL={moveToSL}
                  regex={regex}
                  renderToken={renderToken}
                  transferState={transferState}
                  setTransferState={setTransferState}
                  transferFromSL={transferFromSL}
                  setTransferFromSL={setTransferFromSL}
                  token={token}
                  setToken={setToken}
                />
                <Others
                  items={otherItems}
                  setItems={setOtherItems}
                  fetchItems={fetchItems}
                  addItem={addItem}
                  deleteItem={deleteItem}
                  updateItem={updateItem}
                  moveToSL={moveToSL}
                  regex={regex}
                  renderToken={renderToken}
                  transferState={transferState}
                  setTransferState={setTransferState}
                  transferFromSL={transferFromSL}
                  setTransferFromSL={setTransferFromSL}
                  token={token}
                  setToken={setToken}
                />
                <ShoppingList
                  items={shoppingListItems}
                  setItems={setShoppingListItems}
                  fetchItems={fetchItems}
                  addItem={addItem}
                  deleteItem={deleteItem}
                  updateItem={updateItem}
                  expenditure={yourAmount}
                  setExpenditure={setYourAmount}
                  renderToken={renderToken}
                  transferState={transferState}
                  setTransferState={setTransferState}
                  setTransferFromSL={setTransferFromSL}
                  token={token}
                  setToken={setToken}
                />
              </>
            }
          />
        </Routes>
        <footer className="footer">
          <h1>Footer</h1>
          {token !== null ? <DeleteUser/> : ''}
        </footer>
      </HashRouter>
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
