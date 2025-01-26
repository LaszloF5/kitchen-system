import React, { useCallback, useEffect, useState } from "react";
import { HashRouter, Route, Routes, Link } from "react-router-dom";
import axios from "axios";
import { DateTime } from "luxon";
import { HelmetProvider, Helmet } from "react-helmet-async";
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
import Usage from "./Components/Usage";
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
  const [isMobile, setIsMobile] = useState(false);

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
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Hamburger menu

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMobile(true);
      } else {
        setIsMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const [isVisibleHamMenu, setIsVisibleHamMenu] = useState(false);

  const toggleHamMenu = () => {
    setIsVisibleHamMenu(!isVisibleHamMenu);
  };

  const handleCloseHamMenu = () => {
    setIsVisibleHamMenu(false);
  };

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

  // Get items

  const fetchItems = useCallback(async (table) => {
    const userId = localStorage.getItem("userId");
    if (userId === null) {
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
        <HelmetProvider>
          <header className="header">
            <nav className="header-nav">
              <img
                className={`${
                  isMobile ? "hamburger-menu-icon" : "hidden-ham-icon"
                }`}
                src={process.env.PUBLIC_URL + "hamburger-menu.png"}
                alt="hamburger menu icon"
                onClick={toggleHamMenu}
              />
              <ul
                className={`${isMobile ? "hidden-menu" : "header-nav_ul"} ${
                  isVisibleHamMenu ? "visible-ham-menu" : "hidden-ham-menu"
                }`}
              >
                <li>
                  <Link
                    className="header-nav_ul_li_link"
                    to="/"
                    onClick={handleCloseHamMenu}
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link
                    className="header-nav_ul_li_link"
                    to="/usage"
                    onClick={handleCloseHamMenu}
                  >
                    Usage
                  </Link>
                </li>
                {userId === null ? (
                  <li>
                    <Link
                      className="header-nav_ul_li_link"
                      to="/register"
                      onClick={handleCloseHamMenu}
                    >
                      Register
                    </Link>
                  </li>
                ) : (
                  ""
                )}
                <li>
                  <Link
                    className="header-nav_ul_li_link"
                    to="/login"
                    onClick={handleCloseHamMenu}
                  >
                    {userId === null ? "Login" : "Logout"}
                  </Link>
                </li>
                {userId === null ? (
                  ""
                ) : (
                  <li>
                    <Link
                      className="header-nav_ul_li_link"
                      to="/expenses"
                      onClick={handleCloseHamMenu}
                    >
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
                id="currency-id"
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
            <Route path="/Usage" element={<Usage />} />
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
                  <Helmet>
                    <title>My Food Minder</title>
                  </Helmet>
                  <h1>My Food Minder</h1>
                  <FridgeContext.Provider
                    value={{ fridgeState, setFridgeState }}
                  >
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
                  <OthersContext.Provider
                    value={{ othersState, setOthersState }}
                  >
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
                  <FridgeContext.Provider
                    value={{ fridgeState, setFridgeState }}
                  >
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
          <footer className="footer">
            <p className="footer_p">
              �� 2025 My Food Minder. All rights reserved.
            </p>
            <div className="footer-icons-container">
              <a
                href="https://github.com/LaszloF5/kitchen-system"
                target="_blank"
                rel="noreferrer"
              >
                <img
                  className="footer-icons"
                  src={process.env.PUBLIC_URL + "github-icon-blue.png"}
                  alt="GitHub icon"
                />
              </a>
              {/* <a href="#" target="_blank">
              <img
                className="footer-icons"
                src={process.env.PUBLIC_URL + "linkedin-icon-blue.png"}
                alt="LinkedIn icon"
              />
            </a> */}
            </div>
          </footer>
        </HelmetProvider>
      </HashRouter>
    </div>
  );
}
