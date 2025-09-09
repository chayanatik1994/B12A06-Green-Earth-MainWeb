fetch('https://openapi.programming-hero.com/api/categories')//Categories
.then(res => res.json())
.then(data => {
    const categories = data.categories;
    const container = document.getElementById('categories-container');

    categories.forEach(category => {
        const button = document.createElement('button');
        button.textContent = category.category_name;
        button.className = 'hover:bg-green-600 text-black font-bold py-2 px-4 rounded h-[50px]';
        container.appendChild(button);
    });
})
.catch(error => console.log(error));