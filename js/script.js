document.addEventListener('DOMContentLoaded', () => {
    const addRecipeForm = document.querySelector('#add-recipe-form');
    const recipeList = document.querySelector('#recipe-list');
    const favoriteList = document.querySelector('#favorite-list');
    const searchField = document.querySelector('#search-field');

    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    console.log('Loaded recipes from localStorage:', recipes);
    console.log('Loaded favorites from localStorage:', favorites);

    function loadRecipes(filter = '') {
        const filteredRecipes = recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(filter.toLowerCase())
        );

        recipeList.innerHTML = '';

        if (filteredRecipes.length === 0) {
            recipeList.innerHTML = '<p>Aucune recettes trouvés.</p>';
            return;
        }

        filteredRecipes.forEach((recipe, index) => {
            const recipeCard = document.createElement('div');
            recipeCard.className = 'col-md-4 mb-4';

            const isFavorite = favorites.some(fav => fav && fav.title === recipe.title);
            const heartIconClass = isFavorite ? 'bi-heart-fill' : 'bi-heart';

            recipeCard.innerHTML = `
                <div class="card">
                    <img src="${recipe.image || '../images/recette.jpg'}" class="card-img-top" alt="${recipe.title}">
                    <div class="card-body">
                        <h5 class="card-title d-flex justify-content-between align-items-center">
                            ${recipe.title}
                            <button class="btn btn-outline-danger btn-sm remove-recipe" data-index="${index}">
                                <i class="bi bi-trash"></i>
                            </button>
                        </h5>
                        <div class="d-flex justify-content-between">
                            <button class="btn btn-outline-primary btn-sm btn-favorite" data-index="${index}">
                                <i class="bi ${heartIconClass}"></i>
                            </button>
                            <button class="btn btn-outline-success btn-sm btn-details" data-index="${index}">
                                Voir les détails
                            </button>
                        </div>
                    </div>
                </div>
            `;

            recipeList.appendChild(recipeCard);
        });

        attachEventListeners(); 
    }

    function loadFavorites() {
        favoriteList.innerHTML = '';

        if (favorites.length === 0) {
            favoriteList.innerHTML = '<p>Pas encore de recette favorite.</p>';
            return;
        }

        favorites.forEach((recipe, index) => {
            const favoriteCard = document.createElement('div');
            favoriteCard.className = 'col-md-4 mb-4';

            favoriteCard.innerHTML = `
                <div class="card">
                    <img src="${recipe.image}" class="card-img-top" alt="${recipe.title}">
                    <div class="card-body">
                        <h5 class="card-title d-flex justify-content-between align-items-center">
                            ${recipe.title}
                            <button class="btn btn-outline-danger btn-sm remove-favorite" data-index="${index}">
                                <i class="bi bi-trash"></i>
                            </button> 
                        </h5>
                    </div>
                </div>
            `;

            favoriteList.appendChild(favoriteCard);
        });

        attachEventListenersForFavorites();
    }

    function addRecipe(event) {
        event.preventDefault();

        const title = document.querySelector('#recipe-title').value.trim();
        const image = document.querySelector('#recipe-image').value.trim() || '../images/recette.jpg';
        const servings = parseInt(document.querySelector('#recipe-servings').value.trim(), 10);

        const ingredients = Array.from(document.querySelectorAll('#ingredients-list .d-flex')).map(row => ({
            name: row.children[0].value.trim(),
            quantity: parseInt(row.children[1].value.trim(), 10),
        }));

        const steps = Array.from(document.querySelectorAll('#steps-list input')).map(input => input.value.trim());

        if (!title || ingredients.length === 0 || steps.length === 0) {
            alert('Merci de remplir tous les champs.');
            return;
        }

        const newRecipe = { title, image, servings, ingredients, steps };
        recipes.push(newRecipe);
        localStorage.setItem('recipes', JSON.stringify(recipes));

        console.log('Nouvelle recette ajouté:', newRecipe);

        addRecipeForm.reset();
        loadRecipes(); 
        alert('Nouvelle recette ajouté !');
    }

    searchField.addEventListener('input', () => {
        loadRecipes(searchField.value.trim());
    });

    function attachEventListeners() {
        document.querySelectorAll('.btn-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                toggleFavorite(index);
            });
        });

        document.querySelectorAll('.btn-details').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                viewDetails(index);
            });
        });

        document.querySelectorAll('.remove-recipe').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                removeRecipe(index);
            });
        });
    }

    function toggleFavorite(index) {
        const recipe = recipes[index];
        const favoriteIndex = favorites.findIndex(fav => fav && fav.title === recipe.title);

        if (favoriteIndex === -1) {
            favorites.push(recipe);
            alert('Recette ajouté aux favorites !');
        } else {
            favorites.splice(favoriteIndex, 1);
            alert('Recette ajouté aux favorites.');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites(); 
    }

    function removeRecipe(index) {
        recipes.splice(index, 1);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        loadRecipes();
        alert('Recette supprimé.');
    }

    function removeFavorite(index) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
        alert('Retiré des favoris.');
    }

    function viewDetails(index) {
        const recipe = recipes[index];
        localStorage.setItem('currentRecipe', JSON.stringify(recipe));
        window.location.href = 'details.html';
    }

    function attachEventListenersForFavorites() {
        document.querySelectorAll('.remove-favorite').forEach(button => {
            button.addEventListener('click', (e) => {
                const index = e.target.getAttribute('data-index');
                removeFavorite(index);
            });
        });
    }

    document.querySelector('#add-ingredient').addEventListener('click', () => {
        const ingredientsList = document.querySelector('#ingredients-list');
        const newIngredientRow = document.createElement('div');
        newIngredientRow.classList.add('d-flex', 'mb-2');
        newIngredientRow.innerHTML = `
            <input type="text" class="form-control me-2" placeholder="Nom de l'ingrédient" required>
            <input type="number" class="form-control" placeholder="Quantité (g)" required>
        `;
        ingredientsList.appendChild(newIngredientRow);
    });

    document.querySelector('#add-step').addEventListener('click', () => {
        const stepsList = document.querySelector('#steps-list');
        const newStepInput = document.createElement('input');
        newStepInput.type = 'text';
        newStepInput.classList.add('form-control', 'mb-2');
        newStepInput.placeholder = 'Étape de préparation';
        stepsList.appendChild(newStepInput);
    });

    loadRecipes();
    loadFavorites();

    addRecipeForm.addEventListener('submit', addRecipe);
});
