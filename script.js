let currentPage = 1;
let recipesPerPage = 3;
let allRecipes = [];

function getRecommendations() {
  const input = document.getElementById('user-instructions').value;
  const ingredients = input.split(',').map(item => item.trim().toLowerCase());

  const results = document.getElementById('results');
  results.classList.remove('hidden');
  results.innerHTML = `<div class="blink">👩🏽‍🍳 Generating recipe for ${input}...</div>`;

  fetch('http://127.0.0.1:5000/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ingredients: ingredients })
  })
    .then(response => response.json())
    .then(data => {
      allRecipes = data;
      currentPage = 1;

      if (allRecipes.length === 0) {
        results.innerHTML = '<p>No recipes found.</p>';
        return;
      }

      renderRecipes();
      renderPagination();
    })
    .catch(error => {
      console.error('Error:', error);
      results.innerHTML = '<p>Error fetching recipes. Please try again.</p>';
    });
}

function renderRecipes() {
  const results = document.getElementById('results');
  results.innerHTML = '';

  const start = (currentPage - 1) * recipesPerPage;
  const end = start + recipesPerPage;
  const paginatedRecipes = allRecipes.slice(start, end);

  paginatedRecipes.forEach((recipe, index) => {
    const div = document.createElement('div');
    div.className = 'recipe';
    div.innerHTML = `<h3 class="recipe-title clickable" data-index="${start + index}">${recipe.title}</h3>`;
    results.appendChild(div);
  });

  // Hide back button when viewing list
  document.getElementById('back-button-container').classList.add('hidden');

  attachRecipeClickHandlers();
}

function renderPagination() {
  const results = document.getElementById('results');
  const totalPages = Math.ceil(allRecipes.length / recipesPerPage);

  if (totalPages <= 1) return;

  const pagination = document.createElement('div');
  pagination.className = 'pagination';

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.innerText = i;
    btn.className = (i === currentPage) ? 'active' : '';
    btn.addEventListener('click', () => {
      currentPage = i;
      renderRecipes();
      renderPagination();
    });
    pagination.appendChild(btn);
  }

  results.appendChild(pagination);
}

function attachRecipeClickHandlers() {
  const titles = document.querySelectorAll('.recipe-title');
  titles.forEach(title => {
    title.addEventListener('click', () => {
      const index = parseInt(title.getAttribute('data-index'));
      displayRecipe(allRecipes[index]);
    });
  });
}

function displayRecipe(recipe) {
    const results = document.getElementById('results');
    results.innerHTML = `<div id="recipe" class="recipe-detail"></div>`;
  
    const ingredients = JSON.parse(recipe.ingredients.replace(/'/g, '"'));
    const ingredientsList = ingredients
      .map(item => `<li>${item.trim()}</li>`)
      .join('');
      const instructions = JSON.parse(recipe.directions.replace(/'/g, '"'));
      const instructionsList = instructions
        .map(step => `<li>${step.trim().replace(/\n/g, '')}</li>`)
        .join('');
  
    const fullText = `
      <h1 style="text-align:center; font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem;">${recipe.title}</h1>
      <br>
      <strong>Ingredients:</strong>
      <ul>${ingredientsList}</ul>
      <br>
      <strong>Instructions:</strong>
      <ol>${instructionsList}</ol>
      <br>
      <h2><p style="text-align:center;"><em>Enjoy your delicious ${recipe.title.toLowerCase()}!!!</em></p></h2>
    `;
  
    const typewriter = new Typewriter("#recipe", {
      autoStart: true,
      delay: 20,
      cursor: "",
    });
  
    typewriter
      .typeString(fullText)
      .callFunction(() => {
        document.getElementById("back-button-container").classList.remove("hidden");
      })
      .start();
  }
  
  

function goBack() {
  renderRecipes();
  renderPagination();
}
