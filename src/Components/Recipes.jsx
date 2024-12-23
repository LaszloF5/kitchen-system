import React, { useState, useEffect } from "react";
import axios from "axios";
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

  const deleteRecipes = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("You need to be logged in to perform this action.");
      return;
    }
    try {
      await axios.delete("http://localhost:5500/recipes", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      alert("All recipes deleted successfully.");
    } catch (error) {
      console.error("Error deleting recipes:", error);
      alert("Failed to delete recipes. Please try again later.");
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("You need to be logged in to perform this action.");
      alert("You need to be logged in to perform this action.");
      return;
    }

    const fetchData = async () => {
      try {
        const response = await axios.get("http://localhost:5500/recipes", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setMyRecipes(response.data);
      } catch (error) {
        console.error("Error fetching recipes:", error);
        alert("Failed to fetch recipes. Please try again later.");
      }
    };

    fetchData();
  }, []);

  // Ezt az useEffect függőséget bővíteni kell majd, hogy első renderelésnél, és ha változik a myRecipes.length akkor is frissüljön.

  const handleSubmit = async (e) => {
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

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("You need to be logged in to perform this action.");
        return;
      }
      await axios.post("http://localhost:5500/recipes", newRecipe, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setVisibleForm(false);
      e.target.reset();
      setIngredients([]);
    } catch (error) {
      console.error("Error adding recipe:", error);
      alert("Error adding recipe. Please try again.");
    }
  };

  return (
    <div>
      <h1 className="recipes-h1">My recipes</h1>
      <button
        className="toggleNewRecipe btn btn-others"
        onClick={toggleFunction}
      >
        Add new recipe
      </button>
      <button
        className="toggleNewRecipe btn btn-others"
        onClick={deleteRecipes}
      >
        Delete recipes
      </button>
      {isVisibleForm && (
        <form onSubmit={handleSubmit}>
          <label htmlFor="name" className="form-inside-container">
            Recipe name
            <input
              type="text"
              id="name"
              name="name"
              required
              className="name-input"
            />
          </label>
          <h3>Ingredients</h3>
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
          <button type="button" onClick={addInput} className="btn btn-update">
            Add a new ingredient
          </button>
          <label htmlFor="preparation" className="form-inside-container">
            Preparation
            <textarea name="preparation" id="preparation"></textarea>
          </label>
          <button type="submit" className="btn btn-update">
            Saving a recipe
          </button>
        </form>
      )}
      <div>
        <h2 className="recipes-h2">Saved Recipes</h2>
        <ul className="saved-recipes-ul">
          {myRecipes.length > 0
            ? myRecipes.map((recipe, index) => (
                <li key={index} className="one-recipe">
                  <h2 className="recipe-name">{recipe.name}</h2>
                  <ul className="ingredient-ul">
                    <h3>Ingredients</h3>
                    {recipe.ingredients.map((ingredient, i) => (
                      <li key={i} className="ingredient-element">
                        {ingredient.itemname}: {ingredient.quantity}
                      </li>
                    ))}
                  </ul>
                  <h3>Preparation</h3>
                  <p className="preparation-p">{recipe.preparation}</p>
                </li>
              ))
            : ""}
        </ul>
      </div>
    </div>
  );
}
