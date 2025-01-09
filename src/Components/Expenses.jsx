import React, { useState } from "react";
import Axios from "axios";
import { DateTime } from 'luxon';
import "./Expenses.css";

export default function Expenses() {
  const [isVisibleExForm, setIsVisibleExForm] = useState(false);
  const [isVisibleCurForm, setIsVisibleCurForm] = useState(false);
  const [currency, setCurrency] = useState(() => localStorage.getItem("curr") || "");

  const button1Text = isVisibleExForm ? "Close form" : "Add expense";
  const button2Text = isVisibleCurForm ? "Close form" : "Set currency";

  const handleToggleExForm = () => {
    setIsVisibleExForm(!isVisibleExForm);
  };

  const handleToggleCurForm = () => {
    setIsVisibleCurForm(!isVisibleCurForm);
  };

  const handleExpense = (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const amount = e.target.expense.value;
    const today = DateTime.now();
    const year = today.year;
    const month = today.month;
    const week = today.weekNumber;
  }

  const handleCurrency = (e) => {
    e.preventDefault();
    const curr = e.target.currency.value.trim().toUpperCase();
    localStorage.setItem("curr", curr);
    setCurrency(curr);
    e.target.currency.value = "";
    setIsVisibleCurForm(false);
  };

  const today = DateTime.now();
    const year = today.year;

  return (
    <div className="expenses-container">
      <header>
        <h2>
          Expenses for Week{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            year: "numeric",
          })}
        </h2>
        <button onClick={handleToggleExForm}>{button1Text}</button>
        <button onClick={handleToggleCurForm}>{button2Text}</button>
      </header>
      <h1>Expenses</h1>
      {isVisibleExForm && (
        <form action="#" className="expense-form">
          <p className="expense-form_p">Add new expense</p>
          <input
            className="expense-form_input"
            type="number"
            name='expense'
            placeholder="Enter expense amount"
            required
          />
          <button className="expense-form_button" type="submit">
            Add expense
          </button>
        </form>
      )}
      {isVisibleCurForm && (
        <form action="#" className="currency-form" onSubmit={handleCurrency}>
          <p className="currency-form_p">Set new currency</p>
          <input
            className="currency-form_input"
            type="text"
            name="currency"
            placeholder="ex. USD"
            required
          />
          <button className="currency-form_button">Set currency</button>
        </form>
      )}
      <p>Currency: {currency || "Not set"}</p>
    </div>
  );
}
