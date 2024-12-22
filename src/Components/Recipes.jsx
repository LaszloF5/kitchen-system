import React, { useState } from "react";
import "./Recipes.css";

export default function Recipes() {
  const [isVisibleForm, setVisibleForm] = useState(false);
  const [ingredients, setIngredients] = useState([]);
  const [myRecipes, setMyRecipes] = useState([]);

  const toggleFunction = () => {
    setVisibleForm(!isVisibleForm);
  };

  const addInput = () => {
    setIngredients([...ingredients, { name: "", quantity: "" }]);
  };

  const handleChange = (index, field, value) => {
    const updatedIngredients = [...ingredients];
    updatedIngredients[index][field] = value;
    setIngredients(updatedIngredients);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Recept létrehozása
    const newRecipe = {
      name: e.target.name.value,
      ingredients: ingredients.map((ingredient) => ({
        itemname: ingredient.name,
        quantity: ingredient.quantity,
      })),
      preparation: e.target.preparation.value,
    };

    // Hozzáadás a myRecipes tömbhöz
    setMyRecipes([...myRecipes, newRecipe]);
    setVisibleForm(false);

    // Törlés a formból
    setIngredients([]);
    e.target.reset();
    console.log(myRecipes);
  };

  return (
    <div>
      <h1>My recipes</h1>
      <button className="toggleNewRecipe" onClick={toggleFunction}>
        Add new recipe
      </button>
      {isVisibleForm && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className="form-inside-container">
            Name
            <input
              type="text"
              id="name"
              name="name"
              required
              className="name-input"
            />
          </label>
          <h3>Hozzávalók</h3>
          {ingredients.map((ingredient, index) => (
            <div key={index}>
              <input
                type="text"
                placeholder="Hozzávaló neve"
                value={ingredient.name}
                onChange={(e) => handleChange(index, "name", e.target.value)}
                required
              />
              <input
                type="text"
                placeholder="Mennyiség"
                value={ingredient.quantity}
                onChange={(e) =>
                  handleChange(index, "quantity", e.target.value)
                }
                required
              />
            </div>
          ))}
          <button type="button" onClick={addInput}>
            Új hozzávaló hozzáadása
          </button>
          <label htmlFor="preparation" className="form-inside-container">
            Preparation
            <textarea name="preparation" id="preparation"></textarea>
          </label>
          <button type="submit">Recept mentése</button>
        </form>
      )}
      <div>
        <h2>Saved Recipes</h2>
        <ul className="name">
          {myRecipes.map((recipe, index) => (
            <li key={index}>
              <h3>{recipe.name}</h3>
              <ul className="ingredient-ul">
                {recipe.ingredients.map((ingredient, i) => (
                    <li key={i} className="ingredient-element">
                    {ingredient.itemname}: {ingredient.quantity}
                  </li>
                ))}
              </ul>
              <p className="preparation-p">{recipe.preparation}</p>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
