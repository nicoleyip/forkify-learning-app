import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarkView from './views/bookmarkView.js';
import addRecipeView from './views/addRecipeView.js';
import { CLOSE_MODAL_SEC } from './config.js';

import 'core-js/stable';
import 'regenerator-runtime/runtime';

// https://forkify-api.herokuapp.com/v2

////////////////////////////////////////////////

// Code from parcel
// if (module.hot) {
//   module.hot.accept();
// }

const controlRecipes = async function () {
  try {
    // window.location is the current url
    const id = window.location.hash.slice(1);

    if (!id) return;

    // -1. Update results view and bookmark view to selected search results
    resultsView.update(model.getSearchResultsPage());
    bookmarkView.update(model.state.bookmarks);

    // 0. Render spinner
    recipeView.renderSpinner();

    // 1. Loading recipe
    await model.loadRecipe(id);

    // 2. Rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.error(err);
    recipeView.renderError();
  }
};

const controlSearchResults = async function () {
  try {
    // 1. Get search query
    const query = searchView.getQuery();
    if (!query) return;

    // 2. Load search results
    resultsView.renderSpinner();
    await model.loadSearchResults(query);

    // 3. Render search results
    resultsView.render(model.getSearchResultsPage());

    // 4. Render initial pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.error(err);
    resultsView.renderError();
  }
};

const controlPagination = function (goToPage) {
  // 1. Render NEW search results
  resultsView.render(model.getSearchResultsPage(goToPage));

  // 2. Render NEW pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServings) {
  // 1. Update the recipe servings (in state)
  model.updateServings(newServings);

  // 2. Update the recipe view
  // recipeView.render(model.state.recipe);
  recipeView.update(model.state.recipe);
};

const controlAddBookmark = function () {
  // 1. Add or delete bookmark
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);
  console.log(model.state.recipe);

  // 2. Update recipe view
  recipeView.update(model.state.recipe);

  // 3. Render bookmark view
  bookmarkView.render(model.state.bookmarks);
};

// ** Add item -> render
// ** Change contents of exist item -> update

// Render bookmarks firstly whenever the page loads
const controlBookmarks = function () {
  bookmarkView.render(model.state.bookmarks);
};

const controlAddRecipe = async function (newRecipe) {
  try {
    // 0. Render spinner
    addRecipeView.renderSpinner();

    // 1. Upload the new recipe data
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    // 2. Render new recipe
    recipeView.render(model.state.recipe);

    // 3. Render success message
    addRecipeView.renderMessage();

    // 4. Render bookmarks view
    bookmarkView.render(model.state.bookmarks);

    // 5. Change ID in URL
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    // 6. Close form window
    setTimeout(() => {
      addRecipeView.toggleWindow();
    }, CLOSE_MODAL_SEC * 1000);
  } catch (err) {
    console.error('💥', err);
    addRecipeView.renderError(err.message);
  }
};

const init = function () {
  bookmarkView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipes);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controlAddBookmark);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  addRecipeView.addHandlerUpload(controlAddRecipe);
  console.log('Welcome!');
};
init();
