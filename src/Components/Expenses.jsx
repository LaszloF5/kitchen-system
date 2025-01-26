import React, { useState, useEffect } from "react";
import axios from "axios";
import { DateTime } from "luxon";
import { Helmet } from 'react-helmet-async';
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
  const [monthlyDatas, setMonthlyDatas] = useState([]);

  const button1Text = isVisibleExForm ? "Close form" : "Add expense";
  const button2Text = isVisibleCurForm ? "Close form" : "Set currency";

  const handleToggleExForm = () => {
    setIsVisibleExForm(!isVisibleExForm);
    setIsVisibleCurForm(false);
  };

  const handleToggleCurForm = () => {
    setIsVisibleCurForm(!isVisibleCurForm);
    setIsVisibleExForm(false);
  };

  const handleExpense = async (e) => {
    e.preventDefault();
    setIsWorking(true);
    const amount = e.target.expense.value.trim();
    const today = DateTime.now();
    const year = today.year;
    const month = today.month;
    const week = today.weekNumber;
    const userId = localStorage.getItem("userId");
    try {
      await axios.post("http://localhost:5500/expenses", {
        amount,
        year,
        month,
        week,
        userId,
      });
      e.target.expense.value = "";
      setExpenses((prevExpenses) => Number(prevExpenses) + Number(amount));
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
      await axios.delete("http://localhost:5500/expenses", {
        params: { userId },
      });
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
        const monthlyData = [];
        data.forEach((item) => {
          const key = `${item.year} - ${item.month}`;
          if (monthlyData[key]) {
            monthlyData[key].amount += Number(item.amount);
          } else {
            monthlyData[key] = {
              year: item.year,
              month: item.month,
              amount: Number(item.amount),
            };
          }
        });
        setMonthlyDatas(monthlyData);
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
  }, [expenses]);

  return (
    <div className="expenses-container">
      <Helmet>
        <title>My Food Minder | Expenses</title>
      </Helmet>
      <header className="expenses-header">
        <button className="btn btn-others" onClick={handleToggleExForm}>
          {button1Text}
        </button>
        <button className="btn btn-update" onClick={handleToggleCurForm}>
          {button2Text}
        </button>
        <button
          className="btn btn-delete"
          onClick={handleDeleteExpenses}
          disabled={isWorking}
        >
          {isWorking ? "Loading..." : "Delete expenses"}
        </button>
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
            autoFocus
          />
          <button
            className="expense-form_button"
            type="submit"
            disabled={isWorking}
          >
            {isWorking ? "Loading..." : "Add expense"}
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
            autoFocus
          />
          <button className="currency-form_button" disabled={isWorking}>
            {isWorking ? "Loading..." : "Set currency"}
          </button>
        </form>
      )}
      <table className="expenses-table">
        <caption className="expenses-table-caption">
          Weekly expenses overview
        </caption>
        <thead>
          <tr>
            <th className="expenses-table_th">Date (y,m,w)</th>
            <th className="expenses-table_th">Amount</th>
          </tr>
        </thead>
        <tbody>
          {datas.map((item, index) => {
            return (
              <tr key={index}>
                <td className="expenses-table_td">
                  {item.year}. {item.month}. {item.week}.
                </td>
                <td className="expenses-table_td">
                  {item.amount} {currency || "Currency not set."}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <table className="expenses-table">
        <caption className="expenses-table-caption">
          Monthly expenses overview
        </caption>
        <thead>
          <tr>
            <th className="expenses-table_th">Date (y,m)</th>
            <th className="expenses-table_th">Amount</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(monthlyDatas).map(([key, value]) => {
            return (
              <tr key={key}>
                <td className="expenses-table_td">
                  {value.year}. {value.month}.
                </td>
                <td className="expenses-table_td">
                  {value.amount} {currency || "Currency not set."}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
}
