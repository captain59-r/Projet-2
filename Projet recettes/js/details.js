document.addEventListener('DOMContentLoaded', () => {
    const recipe = JSON.parse(localStorage.getItem('currentRecipe'));  
    const ingredientList = document.querySelector('#ingredient-list');
    const stepList = document.querySelector('#step-list');
    const servingsInput = document.querySelector('#new-servings');
    const recalculateButton = document.querySelector('#recalculate');
    const recipeImage = document.querySelector('#recipe-image');  

    function displayRecipeDetails() {
        if (recipe.image) {
            recipeImage.src = recipe.image;  
            recipeImage.alt = recipe.title;  
        }

        ingredientList.innerHTML = '';
        recipe.ingredients.forEach(ingredient => {
            const li = document.createElement('li');
            li.textContent = `${ingredient.name}: ${ingredient.quantity} g`;
            li.dataset.originalQuantity = ingredient.quantity;  
            ingredientList.appendChild(li);
        });

        stepList.innerHTML = '';
        recipe.steps.forEach(step => {
            const li = document.createElement('li');
            li.textContent = step;
            stepList.appendChild(li);
        });
    }

    function recalculateIngredients() {
        const newServings = parseInt(servingsInput.value, 10);
        const originalServings = recipe.servings; 

        const ingredientItems = document.querySelectorAll('#ingredient-list li');
        
        ingredientItems.forEach(item => {
            const originalQuantity = parseInt(item.dataset.originalQuantity, 10);
            const newQuantity = (originalQuantity / originalServings) * newServings;
            item.textContent = `${item.textContent.split(':')[0]}: ${newQuantity.toFixed(2)} g`; 
        });
    }

    recalculateButton.addEventListener('click', recalculateIngredients);

    displayRecipeDetails();
});
