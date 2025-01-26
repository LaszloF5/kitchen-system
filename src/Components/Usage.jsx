import React from "react";
import { Link } from "react-router-dom";
import { Helmet } from 'react-helmet-async';
import "./Usage.css";

export default function Usage() {

  const handleRegister = (e) => {
    const currUserId = localStorage.getItem("userId");
    if (currUserId !== null) {
      e.preventDefault();
    }
  };
  
  return (
    <div className="usage-container">
      <Helmet>
        <title>My Food Minder | Usage</title>
      </Helmet>
      <h2 className="usage-container_h2">Usage</h2>
      <p className="usage-container_p">
        Discover the web application that simplifies and enhances your daily
        household management! This intuitive platform helps you track and
        organize the food items in your kitchen and pantry while allowing you to
        monitor your shopping and expenses with ease.
      </p>
      <h3 className="usage-container_h3">What does the application offer?</h3>
      <h4 className="usage-container_h4">Food Inventory Management</h4>
      <p className="usage-container_p">
        Keep track of the items in your fridge, freezer, pantry, or other
        storage spaces. The system lets you manage your inventory by quantity
        and expiration date, ensuring nothing gets forgotten and everything is
        used on time.
      </p>
      <h4 className="usage-container_h4">Update Quantities</h4>
      <p className="usage-container_p">
        Easily update your inventory – whether you're adding new items or
        adjusting the quantities of existing ones.
      </p>
      <h4 className="usage-container_h4">
        Shopping List Creation and Management
      </h4>
      <p className="usage-container_p">
        Create a shopping list for items that are running low, and after
        shopping, conveniently transfer the purchased products to their
        designated storage locations, such as the fridge, freezer, or pantry.
      </p>
      <h4 className="usage-container_h4">Track Expenses</h4>
      <p className="usage-container_p">
        Record your purchases and keep an eye on your weekly and monthly
        expenses. The application generates clear reports, helping you
        understand what you're spending your money on and how much you're
        spending.
      </p>
      <h4 className="usage-container_h4">User Account Management</h4>
      <p className="usage-container_p">
        For a secure and personalized experience, registration and login are
        required. Your personal account stores all your data, allowing you to
        access and manage your household inventory from anywhere.
      </p>
      <h4 className="usage-container_h4">Why should you use it?</h4>
      <p className="usage-container_p">
        This application helps optimize your household management, reduces food
        waste, and makes tracking your purchases and expenses more transparent.
        It’s the perfect choice for anyone looking to organize their daily tasks
        and manage their household inventory more efficiently. Start today and
        experience how simple and convenient it can be to manage your kitchen!
      </p>
      <h3 className="usage-container_h3">How it works?</h3>
      <p className="usage-container_important_message">
        The functions are only available after{" "}
        <Link to="/Register" onClick={handleRegister}>registration </Link> and{" "}
        <Link to="/Login">login</Link>!
      </p>
      <h4 className="usage-container_h4">Register or Log in</h4>
      <p className="usage-container_p">
        To create an account, click on the <Link to="/Register" onClick={handleRegister}>Register</Link>{" "}
        menu item in the header and fill out the 'Username' and 'Password'
        fields. If you already have an account, click on the{" "}
        <Link to="/Login">Log in</Link> menu item in the header and fill out the
        'Username' and 'Password' fields.
      </p>
      <h4 className="usage-container_h4">Add item</h4>
      <p className="usage-container_p">
        To add a new item, click on the 'Add item' button and fill out the 'New
        item name' and 'New item quantity' fields.
      </p>
      <img
        className="usage_pictures"
        src={process.env.PUBLIC_URL + "/add-item.png"}
        alt="add item pic"
      />
      <h4 className="usage-container_h4">Update item</h4>
      <p className="usage-container_p">
        To update the quantity of an item, click on the 'Update item' button and
        fill out the 'New quantity' field.
      </p>
      <img
        className="usage_pictures"
        src={process.env.PUBLIC_URL + "/update-item.png"}
        alt="update item pic"
      />
      <h4 className="usage-container_h4">Delete item</h4>
      <p className="usage-container_p">
        To delete an item, click on the 'Delete item' button.
      </p>
      <h4 className="usage-container_h4">Add to shopping list</h4>
      <p className="usage-container_p">
        To add an item to the shopping list, click on the 'Add to SL' button,
        and fill out the 'Set quantity' field.
      </p>
      <img
        className="usage_pictures"
        src={process.env.PUBLIC_URL + "/moveto-sl.png"}
        alt="move to shopping list pic"
      />
      <h4 className="usage-container_h4">Add new item in the shopping list</h4>
      <p className="usage-container_p">
        This action is the same as adding an item.
      </p>
      <h4 className="usage-container_h4">
        Add to fridge/freezer/chamber/others
      </h4>
      <p className="usage-container_p">
        To move an item from the shopping list, click on the 'Move to...'
        button, select one of the options below, and click on it.
      </p>
      <img
        className="usage_pictures"
        src={process.env.PUBLIC_URL + "/moveto.png"}
        alt="move from pic"
      />
      <h4 className="usage-container_h4">Add expense</h4>
      <p className="usage-container_p">
        To record your expense, click on the 'Expenses' menu item in the header.
        Then click on the 'Add expense' button, and fill out the 'Add new
        expense' field.
      </p>
      <img
        className="usage_pictures_small"
        src={process.env.PUBLIC_URL + "/set-expenses.png"}
        alt="set expenses pic"
      />
      <h4 className="usage-container_h4">Add or modify currency</h4>
      <p className="usage-container_p">
        To add or modify your currency, click on the 'Set currency' button and
        fill out the 'Set new currency' field. After performing this action, you
        will see your expenses and currency displayed per week and per month.
      </p>
      <img
        className="usage_pictures_small"
        src={process.env.PUBLIC_URL + "/set-currency.png"}
        alt="set currency pic"
      />
      <h4 className="usage-container_h4">Log out</h4>
      <p className="usage-container_p">
        To log out of your account, click on the 'Log out' menu item in the
        header, then confirm by clicking the 'Log out' button.
      </p>
    </div>
  );
}
