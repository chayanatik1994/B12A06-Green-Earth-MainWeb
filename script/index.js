// Global variables
let cart = [];
let allPlants = [];

document.addEventListener('DOMContentLoaded', function() {
    loadAllPlants();
    loadCategories();
});

const loadAllPlants = () => {
  loadingSpinner(true)
  fetch("https://openapi.programming-hero.com/api/plants")
    .then((res) => res.json())
    .then((plants) => {
      allPlants = plants.plants;
      const limitedPlants = plants.plants.slice(0, 6);
      displayAllPlants(limitedPlants);
    })
    .catch(error => {
      console.log('Error loading plants:', error);
      loadingSpinner(false);
    });
};

const displayAllPlants = (plants) => {
  const cardsContainer = document.getElementById("card_container");
  
  cardsContainer.innerHTML = '';
  
  if (!plants || plants.length === 0) {
    cardsContainer.innerHTML = `
      <div class="col-span-full text-center py-8">
        <p class="text-gray-500 text-lg">No plants found</p>
        <p class="text-gray-400 text-sm mt-2">Try selecting a different category</p>
      </div>
    `;
    loadingSpinner(false);
    return;
  }
  
  plants.forEach((plant) => {
    const cardParent = document.createElement("div");
    cardParent.innerHTML = `
          <div class="bg-white card p-5 shadow-md" style="height: 381.8px;">
            <img class="h-40 w-full object-cover mb-4 rounded-lg" src="${plant.image}" alt="${plant.name}">
            <h2 onclick="loadPlantDetails(${
              plant.id
            })" class="font-bold text-xl cursor-pointer hover:text-green-600">${plant.name}</h2>
            <p class="font-medium text-gray-400 line-clamp-2 mt-2"> ${
              plant.description
            }</p>
            <div class="flex justify-between items-center my-4">
              <span class="bg-green-100 px-2 py-1 rounded-2xl text-sm">${
                plant.category
              }</span>
              <h3 class="font-bold text-lg">৳${plant.price}</h3>
            </div>
            <button onclick="addCart('${encodeURIComponent(
              JSON.stringify(plant)
            )}')" 
            class="btn w-full" style="background-color: #15803D; border-radius: 999px; color: white;">Add to Cart
            </button>
          </div>
        `;
    cardsContainer.appendChild(cardParent);
  });
  loadingSpinner(false)
};

const loadingSpinner = (show) => {
    const spinner = document.getElementById('loading-spinner');
    const cardContainer = document.getElementById('card_container');
    
    if (show) {
        spinner.innerHTML = '';
        for (let i = 0; i < 6; i++) {
            const skeletonCard = document.createElement('div');
            skeletonCard.className = 'flex w-52 flex-col gap-4';
            skeletonCard.innerHTML = `
                <div class="skeleton h-32 w-full"></div>
                <div class="skeleton h-4 w-28"></div>
                <div class="skeleton h-4 w-full"></div>
                <div class="skeleton h-4 w-full"></div>
            `;
            spinner.appendChild(skeletonCard);
        }
        
        spinner.classList.remove('hidden');
        cardContainer.classList.add('hidden');
    } else {
        spinner.classList.add('hidden');
        cardContainer.classList.remove('hidden');
    }
};

const loadCategories = () => {
    fetch('https://openapi.programming-hero.com/api/categories')
        .then(res => res.json())
        .then(data => {
            const categories = data.categories;
            const container = document.getElementById('categories_btn_box');
            
            const allButton = document.createElement('button');
            allButton.textContent = 'All Trees';
            allButton.className = 'w-full bg-green-500 hover:bg-green-600 text-white p-2 rounded-md mb-2 text-sm font-medium active-category';
            allButton.onclick = () => {
                setActiveCategory(allButton);
                loadAllPlants();
            };
            container.appendChild(allButton);

            categories.forEach(category => {
                const button = document.createElement('button');
                button.textContent = category.category_name;
                button.className = 'w-full hover:bg-green-100 text-black font-medium py-2 px-4 rounded mb-2 text-sm border border-gray-200';
                button.onclick = () => {
                    console.log(`Clicked category: ${category.category_name} (ID: ${category.id})`);
                    setActiveCategory(button);
                    loadPlantsByCategory(category.id);
                };
                container.appendChild(button);
            });
        })
        .catch(error => console.log(error));
};

const setActiveCategory = (activeButton) => {
    const allButtons = document.querySelectorAll('#categories_btn_box button');
    allButtons.forEach(btn => {
        btn.classList.remove('bg-green-500', 'text-white', 'active-category');
        btn.classList.add('hover:bg-green-100', 'text-black', 'border', 'border-gray-200');
    });
    
    activeButton.classList.add('bg-green-500', 'text-white', 'active-category');
    activeButton.classList.remove('hover:bg-green-100', 'text-black', 'border', 'border-gray-200');
};

const loadPlantsByCategory = (categoryId) => {
    loadingSpinner(true);
    console.log(`Loading plants for category ID: ${categoryId}`);
    
    fetch(`https://openapi.programming-hero.com/api/category/${categoryId}`)
        .then(res => res.json())
        .then(data => {
            console.log('Category API response:', data);
            if (data.status && data.plants) {
                displayAllPlants(data.plants);
            } else {
                displayAllPlants([]);
            }
        })
        .catch(error => {
            console.log('Error loading category plants:', error);
            loadingSpinner(false);
            const cardsContainer = document.getElementById("card_container");
            cardsContainer.innerHTML = `
                <div class="col-span-full text-center py-8">
                    <p class="text-red-500 text-lg">Error loading plants</p>
                    <p class="text-gray-400 text-sm mt-2">Please try again</p>
               </div>
            `;
        }); 
};

const addCart = (plantString) => {
    const plant = JSON.parse(decodeURIComponent(plantString));
    
    const existingItem = cart.find(item => item.id === plant.id);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({...plant, quantity: 1});
    }
    
    showNotification(`${plant.name} added to cart!`);
    
    displayCart();
    updateTotal();
};

const showNotification = (message) => {
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50';
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
};

const removeFromCart = (plantId) => {
    cart = cart.filter(item => item.id !== plantId);
    displayCart();
    updateTotal();
};

const updateQuantity = (plantId, change) => {
    const item = cart.find(item => item.id === plantId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(plantId);
            return;
        }
        displayCart();
        updateTotal();
    }
};

const displayCart = () => {
    const cartContainer = document.getElementById('cart_container');
    
    if (cart.length === 0) {
        cartContainer.innerHTML = '<p class="text-gray-500 text-center py-4">Your cart is empty</p>';
        return;
    }
    
    cartContainer.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg mb-2 border border-green-200">
            <div class="flex-1">
                <h4 class="font-medium text-sm text-gray-800">${item.name}</h4>
                <p class="text-xs text-gray-600">৳${item.price} × ${item.quantity}</p>
            </div>
            <div class="flex items-center gap-2">
                <button onclick="updateQuantity(${item.id}, -1)" 
                        class="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-xs font-bold">-</button>
                <span class="text-sm font-medium min-w-[20px] text-center">${item.quantity}</span>
                <button onclick="updateQuantity(${item.id}, 1)" 
                        class="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold" style="background-color: #15803D; color: white;">+</button>
                <button onclick="removeFromCart(${item.id})" 
                        class="w-6 h-6 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center text-xs font-bold ml-2">❌</button>
            </div>
        </div>
    `).join('');
};

const updateTotal = () => {
    const totalContainer = document.getElementById('total-container');
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    totalContainer.innerHTML = `<span class="font-bold text-lg text-green-600">৳${total}</span>`;
};

const loadPlantDetails = (plantId) => {
    const plant = allPlants.find(p => p.id === plantId);
    if (plant) {
        const modal = document.getElementById('trees_detail_modal');
        const detailsContainer = document.getElementById('details-modal');
        
        detailsContainer.innerHTML = `
            <div class="flex flex-col md:flex-row gap-4">
                <img src="${plant.image}" alt="${plant.name}" class="w-full md:w-1/2 h-64 object-cover rounded-lg">
                <div class="flex-1">
                    <h3 class="text-2xl font-bold mb-2">${plant.name}</h3>
                    <p class="text-gray-600 mb-4">${plant.description}</p>
                    <div class="flex items-center gap-4 mb-4">
                        <span class="bg-green-100 px-3 py-1 rounded-full text-sm">${plant.category}</span>
                        <span class="text-2xl font-bold text-green-600">৳${plant.price}</span>
                    </div>
                 <button onclick="addCart('${encodeURIComponent(JSON.stringify(plant))}'); document.getElementById('trees_detail_modal').close();" 
        class="btn" style="background-color: #15803D; border-radius: 999px; color: white;">
            Add to Cart
            </button>
                </div>
            </div>
          `
        ;
        modal.showModal();
    }
};