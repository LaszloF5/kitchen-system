import React, { useState, useEffect } from "react";
import axios from "axios";
import { DateTime } from "luxon";
import "./Expenses.css";

export default function Expenses() {
  const [isVisibleExForm, setIsVisibleExForm] = useState(false);
  const [isVisibleCurForm, setIsVisibleCurForm] = useState(false);
  const [isWorking, setIsWorking] = useState(false);
  const [currency, setCurrency] = useState(
    () => localStorage.getItem("curr") || ""
  );
  const [expenses, setExpenses] = useState([]);
  const [datas, setDatas] = useState([]);

  const button1Text = isVisibleExForm ? "Close form" : "Add expense";
  const button2Text = isVisibleCurForm ? "Close form" : "Set currency";

  const handleToggleExForm = () => {
    setIsVisibleExForm(!isVisibleExForm);
  };

  const handleToggleCurForm = () => {
    setIsVisibleCurForm(!isVisibleCurForm);
  };

  const handleExpense = async (e) => {
    setIsWorking(true);
    e.preventDefault();
    const amount = e.target.expense.value.trim();
    const today = DateTime.now();
    const year = today.year;
    const month = today.month;
    const week = today.weekNumber;
    const userId = localStorage.getItem("userId");
    try {
      const response = await axios.post("http://localhost:5500/expenses", {
        amount,
        year,
        month,
        week,
        userId,
      });
      console.log("Expense added successfully: ", response.data);
      e.target.expense.value = '';
      setExpenses(prevExpenses => Number(prevExpenses) + Number(amount))
      setIsVisibleExForm(false);
    } catch (err) {
      console.error("Error adding expense:", err.response?.data || err.message);
    } finally {
      setIsWorking(false);
    }
  };

  const handleCurrency = (e) => {
    e.preventDefault();
    setIsWorking(true);
    const curr = e.target.currency.value.trim().toUpperCase();
    localStorage.setItem("curr", curr);
    setCurrency(curr);
    e.target.currency.value = "";
    setIsVisibleCurForm(false);
    setIsWorking(false);
  };

  const handleDeleteExpenses = async () => {
    const userId = localStorage.getItem("userId");
    setIsWorking(true);
    try {
      const response = await axios.delete("http://localhost:5500/expenses", {
        params: { userId },
      });
      console.log("Expenses deleted successfully", response.data);
    } catch (err) {
      console.error({ err: err.message });
    } finally {
      setIsWorking(false);
    }
  };

  useEffect(() => {
    const getExpenses = async () => {
      const userId = localStorage.getItem("userId");
      try {
        const response = await axios.get("http://localhost:5500/expenses", {
          params: { userId },
        });
        const data = response.data.expenses;
        setDatas(data);
        console.log(
          "Válasz: ",
          response.data.expenses[response.data.expenses.length - 1].amount
        );
        console.log("A teljes adathalmaz: ", data);
        setExpenses(
          response.data.expenses[response.data.expenses.length - 1].amount
        );
      } catch (err) {
        console.error(
          "Error fetching expenses:",
          err.response?.data || err.message
        );
      }
    };
    getExpenses();
  }, []);

  return (
    <div className="expenses-container">
      <header className="expenses-header">
        {/* <h2>
          Expenses for Week{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            month: "long",
            year: "numeric",
          })}
        </h2> */}
        <button onClick={handleToggleExForm}>{button1Text}</button>
        <button onClick={handleToggleCurForm}>{button2Text}</button>
        <button onClick={handleDeleteExpenses} disabled={isWorking}>{isWorking ? 'Loading...' : 'Delete expenses'}</button>
      </header>
      <h1>Expenses</h1>
      {isVisibleExForm && (
        <form action="#" className="expense-form" onSubmit={handleExpense}>
          <p className="expense-form_p">Add new expense</p>
          <input
            className="expense-form_input"
            type="number"
            name="expense"
            placeholder="Enter expense amount"
            required
          />
          <button className="expense-form_button" type="submit" disabled={isWorking}>
            {isWorking ? 'Loading...' : 'Add expense'}
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
          <button className="currency-form_button" disabled={isWorking}>{isWorking ? 'Loading...' : 'Set currency'}</button>
        </form>
      )}
      <p>Expenses: {expenses || 0} {currency || "Currency not set."}</p>
      <p>
        Ez a teljes adathalmaz, amivel majd kell dolgozni a havi költésnél, és a
        chartoknál:
      </p>
      <div>
        {datas.map((item, index) => {
          return (
            <ul className="expenses-ul" key={index}>
              <li className="expenses-ul_li">
                Amount: {item.amount} {currency || "Currency not set."}
              </li>
              <li className="expenses-ul_li">Year: {item.year}</li>
              <li className="expenses-ul_li">Month: {item.month}</li>
              <li className="expenses-ul_li">Week: {item.week}</li>
            </ul>
          );
        })}
      </div>
    </div>
    //Itt lista helyett vagy táblázatos megoldás lesz, vagy chart.
    // Ha nincs kapcsolat a szerverrel, automatikusan kijelenetkeztetni a felhasználókat.
  );
}
