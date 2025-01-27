document.addEventListener('DOMContentLoaded', () => {
    const addRecipeForm = document.querySelector('#add-recipe-form');
    const recipeList = document.querySelector('#recipe-list');
    const favoriteList = document.querySelector('#favorite-list');
    const searchField = document.querySelector('#search-field');

    const dropZone = document.querySelector('#drop-zone');
    const recipeImageInput = document.querySelector('#recipe-image');
    const uploadButton = document.querySelector('#upload-button'); 
    let uploadedImageURL = '';

    let recipes = JSON.parse(localStorage.getItem('recipes')) || [];
    let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

    console.log('Loaded recipes from localStorage:', recipes);
    console.log('Loaded favorites from localStorage:', favorites);

    function isMobileDevice() {
        return /Mobi|Android/i.test(navigator.userAgent);
    }

    if (isMobileDevice()) {
        dropZone.style.display = 'none'; 
        uploadButton.style.display = 'block'; 
    } else {
        uploadButton.style.display = 'none';
        dropZone.style.display = 'flex';
    }

    dropZone.addEventListener('click', () => recipeImageInput.click());

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('drag-over');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('drag-over');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('drag-over');

        const file = e.dataTransfer.files[0];
        handleImageUpload(file);
    });

    uploadButton.addEventListener('click', () => recipeImageInput.click());

    recipeImageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        handleImageUpload(file);
    });

    function handleImageUpload(file) {
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                uploadedImageURL = e.target.result;
                if (isMobileDevice()) {
                    uploadButton.textContent = 'Image téléchargée !'; 
                } else {
                    dropZone.innerHTML = `<img src="${uploadedImageURL}" alt="Image de la recette" style="max-width: 100%; height: auto;">`;
                }
            };
            reader.readAsDataURL(file);
        } else {
            alert('Veuillez sélectionner un fichier image valide.');
        }
    }

    function loadRecipes(filter = '') {
        const filteredRecipes = recipes.filter(recipe =>
            recipe.title.toLowerCase().includes(filter.toLowerCase())
        );

        recipeList.innerHTML = '';

        if (filteredRecipes.length === 0) {
            recipeList.innerHTML = '<p>Aucune recettes trouvées.</p>';
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
        const image = uploadedImageURL || '../images/recette.jpg'; 
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

        console.log('Nouvelle recette ajoutée:', newRecipe);

        addRecipeForm.reset();
        uploadedImageURL = ''; 
        if (!isMobileDevice()) {
            dropZone.innerHTML = '<p>Glissez une image ici ou cliquez pour en sélectionner une</p>';
        }
        loadRecipes();
        alert('Nouvelle recette ajoutée !');
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
            alert('Recette ajoutée aux favoris !');
        } else {
            favorites.splice(favoriteIndex, 1);
            alert('Recette retirée des favoris.');
        }

        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
    }

    function removeRecipe(index) {
        recipes.splice(index, 1);
        localStorage.setItem('recipes', JSON.stringify(recipes));
        loadRecipes();
        alert('Recette supprimée.');
    }

    function removeFavorite(index) {
        favorites.splice(index, 1);
        localStorage.setItem('favorites', JSON.stringify(favorites));
        loadFavorites();
        alert('Retirée des favoris.');
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