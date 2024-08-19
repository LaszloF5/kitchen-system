import React, { useState } from "react";
import Fridge from "./Components/Fridge";
import Freezer from "./Components/Freezer";
import Chamber from "./Components/Chamber";
import Others from "./Components/Others";
import "./App.css";

export default function App() {
  // useEffect later.
  const [fridgeItems, setFridgeItems] = useState([]);
  const [freezerItems, setFreezerItems] = useState([]);
  const [chamberItems, setChamberItems] = useState([]);
  const [otherItems, setOtherItems] = useState([]);

  return (
    <div className="App">
      <h1>Kitchen system</h1>
      <Fridge items={fridgeItems} setItems={setFridgeItems} />
      <Freezer items={freezerItems} setItems={setFreezerItems} />
      <Chamber items={chamberItems} setItems={setChamberItems} />
      <Others items={otherItems} setItems={setOtherItems} />
      <footer className="footer">Footer</footer>
    </div>
  );
}
