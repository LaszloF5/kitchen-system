import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import { DateTime } from "luxon";
import Fridge from "./Components/Fridge";
import Freezer from "./Components/Freezer";
import Chamber from "./Components/Chamber";
import Others from "./Components/Others";
import ShoppingList from "./Components/ShoppingList";
import Login from "./Components/Login";
import Register from "./Components/Register";
import Expenses from "./Components/Expenses";
import FridgeContext from "./Contexts/FridgeContext";
import FreezerContext from "./Contexts/FreezerContext";
import ChamberContext from "./Contexts/ChamberContext";
import OthersContext from "./Contexts/OthersContext";
import SLContext from "./Contexts/SLContext";
import "./App.css";

export default function App() {
  const [fridgeItems, setFridgeItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [chamberItems, setChamberItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);
  const [shoppingListItems, setShoppingListItems] = useState([]);
  const [yourAmount, setYourAmount] = useState([]);
  const [currency, setCurrency] = useState("");
  const [prevCurrency, setPrevCurrency] = useState("");
  const [userId, setUserId] = useState(localStorage.getItem("userId") || null);
  const [isVisibleScrollBtn, setIsVisibleScrollBtn] = useState(false);

  // ScrollToTop

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsVisibleScrollBtn(true);
      } else {
        setIsVisibleScrollBtn(false);
      }
    };
    window.addEventListener("scroll", handleScroll);

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const handleScrollToTop = () => {
    window.scrollTo({top: 0, behavior: 'smooth'})
  }

  // Contexts

  const [fridgeState, setFridgeState] = useState(false);
  const [freezerState, setFreezerState] = useState(false);
  const [chamberState, setChamberState] = useState(false);
  const [othersState, setOthersState] = useState(false);
  const [sLState, setSLState] = useState(false);

  // Validate qty with regex
  const regex = /^(0(\.\d+)?|1(\.0+)?)\b(?!\.\d).*$/;
  const regexQtyBreakdown = /\d+(\.\d+)?/;

  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isVisibleCurrencyForm, setIsVisibleCurrencyForm] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
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
  // useEffect(() => {
  //   if (yourAmount[yourAmount.length - 1]?.amount > 0 && currency === "") {
  //     alert("Enter the currency that you want to use.");
  //   }
  // }, []);

  // Get items

  const fetchItems = useCallback(async (table) => {
    const userId = localStorage.getItem("userId");
    if (userId === null) {
      // console.log('You need to be logged in to perform this aciton.');
      return [];
    }
    try {
      const response = await axios.get(`http://localhost:5500/${table}`, {
        params: { userId },
      });
      return Array.isArray(response.data.items) ? response.data.items : [];
    } catch (error) {
      console.error("Error fetching items: ", error);
      return [];
    }
  }, []);

  // Post items

  const addItem = async (table, newItem, newQuantity, setItems) => {
    const userId = localStorage.getItem("userId");
    console.log("Frontend userId: ", userId);
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
          {
            params: { userId },
          }
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
    const userId = localStorage.getItem("userId");
    try {
      await axios.delete(`http://localhost:5500/${table}/${itemToDelete.id}`, {
        params: { userId },
      });

      setItems((prevItems) =>
        prevItems.filter((item) => item.id !== itemToDelete.id)
      );
    } catch (error) {
      console.error("Error deleting item:", error);
      alert("Error deleting item. Please try again.");
    }
  };

  // Update item

  const updateItem = async (table, modifyQuantity, updateId, setItems) => {
    const userId = localStorage.getItem("userId");
    const dateNow = DateTime.now().toISO().replace(/T.*/, "");
    console.log("date: ", dateNow);
    console.log("updateItem id: ", userId);

    if (!userId) {
      console.error("No userId found in localStorage!");
      return;
    }

    await axios.put(
      `http://localhost:5500/${table}/${updateId}?user_id=${userId}`,
      { quantity: modifyQuantity.trim(), dateNow }
    );

    const response = await axios.get(
      `http://localhost:5500/${table}?user_id=${userId}`
    );
    setItems(response.data.items);
  };

  const moveToSL = async (
    itemName,
    newQuantity,
    date,
    sourceTable,
    targetTable
  ) => {
    const userId = localStorage.getItem("userId");
    try {
      await axios.post(`http://localhost:5500/moveto_sl?userId=${userId}`, {
        itemName,
        newQuantity,
        date,
        sourceTable,
        targetTable,
      });
    } catch {
      alert("Error moving to the SL.");
    }
    setSLState(!sLState);
  };

  /* Csak a targetTable renderelése kell ebben az esetben. vagyis a sl-items. */

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
      {isVisibleScrollBtn && (
        <img
          className="top-arrow"
          src={process.env.PUBLIC_URL + "top-arrow.png"}
          alt="top arrow button"
          onClick={handleScrollToTop}
        />
      )}
      <HashRouter>
        <header className="header">
          <nav className="header-nav">
            <ul className="header-nav_ul">
              <li>
                <Link className="header-nav_ul_li_link" to="/">
                  Home
                </Link>
              </li>
              {userId === null ? (
                <li>
                  <Link className="header-nav_ul_li_link" to="/register">
                    Register
                  </Link>
                  ;
                </li>
              ) : (
                ""
              )}
              <li>
                <Link className="header-nav_ul_li_link" to="/login">
                  {userId === null ? "Login" : "Logout"}
                </Link>
              </li>
              {userId === null ? (
                ""
              ) : (
                <li>
                  <Link className="header-nav_ul_li_link" to="/expenses">
                    Expenses
                  </Link>
                </li>
              )}
            </ul>
          </nav>
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
        {isDarkMode ? (
          <img
            className="white-filter darkOrLight"
            src={process.env.PUBLIC_URL + "dark-mode.png"}
            alt="Dark mode"
            role="button"
            tabIndex="0"
            onClick={toggleDarkMode}
          />
        ) : (
          <img
            className="darkOrLight"
            src={process.env.PUBLIC_URL + "light-mode.png"}
            alt="Light mode"
            role="button"
            tabIndex="0"
            onClick={toggleDarkMode}
          />
        )}
        <Routes>
          <Route path="/Register" element={<Register />} />
          <Route
            path="/Login"
            element={<Login userId={userId} setUserId={setUserId} />}
          />
          <Route path="/Expenses" element={<Expenses />} />
          <Route
            path="/"
            element={
              <>
                <h1>Kitchen system</h1>
                <FridgeContext.Provider value={{ fridgeState, setFridgeState }}>
                  <Fridge
                    items={fridgeItems}
                    setItems={setFridgeItems}
                    fetchItems={fetchItems}
                    addItem={addItem}
                    deleteItem={deleteItem}
                    updateItem={updateItem}
                    moveToSL={moveToSL}
                    regex={regex}
                    userId={userId}
                    setUserId={setUserId}
                  />
                </FridgeContext.Provider>
                <FreezerContext.Provider
                  value={{ freezerState, setFreezerState }}
                >
                  <Freezer
                    items={freezerItems}
                    setItems={setFreezerItems}
                    fetchItems={fetchItems}
                    addItem={addItem}
                    deleteItem={deleteItem}
                    updateItem={updateItem}
                    moveToSL={moveToSL}
                    regex={regex}
                    userId={userId}
                    setUserId={setUserId}
                  />
                </FreezerContext.Provider>
                <ChamberContext.Provider
                  value={{ chamberState, setChamberState }}
                >
                  <Chamber
                    items={chamberItems}
                    setItems={setChamberItems}
                    fetchItems={fetchItems}
                    addItem={addItem}
                    deleteItem={deleteItem}
                    updateItem={updateItem}
                    moveToSL={moveToSL}
                    regex={regex}
                    userId={userId}
                    setUserId={setUserId}
                  />
                </ChamberContext.Provider>
                <OthersContext.Provider value={{ othersState, setOthersState }}>
                  <Others
                    items={otherItems}
                    setItems={setOtherItems}
                    fetchItems={fetchItems}
                    addItem={addItem}
                    deleteItem={deleteItem}
                    updateItem={updateItem}
                    moveToSL={moveToSL}
                    regex={regex}
                    userId={userId}
                    setUserId={setUserId}
                  />
                </OthersContext.Provider>
                <FridgeContext.Provider value={{ fridgeState, setFridgeState }}>
                  <FreezerContext.Provider
                    value={{ freezerState, setFreezerState }}
                  >
                    <ChamberContext.Provider
                      value={{ chamberState, setChamberState }}
                    >
                      <OthersContext.Provider
                        value={{ othersState, setOthersState }}
                      >
                        <SLContext.Provider value={{ sLState, setSLState }}>
                          <ShoppingList
                            items={shoppingListItems}
                            setItems={setShoppingListItems}
                            fetchItems={fetchItems}
                            addItem={addItem}
                            deleteItem={deleteItem}
                            updateItem={updateItem}
                            expenditure={yourAmount}
                            setExpenditure={setYourAmount}
                            userId={userId}
                            setUserId={setUserId}
                          />
                        </SLContext.Provider>
                      </OthersContext.Provider>
                    </ChamberContext.Provider>
                  </FreezerContext.Provider>
                </FridgeContext.Provider>
              </>
            }
          />
        </Routes>
        <footer className="footer">Footer</footer>
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
  - Bejelentkezési felület, és bejelentkezés;
  A valuta megadására hívja fel a figyelmet, ha az nincs megadva. Ez külön legyen kezelve a form-tól.
  - A bevásárlások értékének bevitele.Ezeket gyűjteni egy objektumba, heti és havi kimutatást készíteni diagram formájában is, de szerintem csak ha az aktuális heti, és havi ráfordítás megjelnne az is jó lenne. A diagramok pedig külön oldalon szerepelnének.
  - A shoppinglistből a célkomponensbe nem frissül a dátum.
  - Ha van szerver kapcsolat, viszont nincs bejelentkezve a felhasználó, akkor ne dobáljon hibaüzeneteket.
  - To top arrow.

  TODO:
  - Footer.
  - Responsive design.
  - Ha az Add to SL nyitva van, ne lehessen kinyitni az update itemet, és fordítva. (Szarul néz ki + helytakarékosság.)
  - Egy input mező, ahova be lehet írni / másolni hozzávalókat ételekhez, és végigfuttatni egy keresést arra vonatkozóan, hogy a beadott    elemek szerepelnek-e valamelyik containerbe. Visszatérési érték az az elem lenne, amelyik nem található meg egyik container-be sem /Vagy elemek/;
*/
