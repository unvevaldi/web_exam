const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api";
const token = "5afddbfd-45c9-4278-85a0-14acb0d7beb5";
const searchInput = document.getElementById("searchInput");
const searchButton = document.getElementById("searchBtn");
const searchResults = document.getElementById("searchResult")
searchInput.parentNode.insertBefore(searchResults, searchInput.nextSibling);
const catalog = document.getElementById("catalog");
const sortOrderSelect = document.getElementById('sortOrder');

let searchTimeout;
let currentSearchTerm = "";

function saveCart(cart) {
        localStorage.setItem('cart', JSON.stringify(cart));
}

function addToCart(goodId) {
    const cartObj = localStorage.getItem('cart');

    let cart = JSON.parse(cartObj) || [];
    let goods = [];
    cart.forEach(item => {
        goods.push(item.id);
    })
    if(!goods.includes(goodId)){
        cart.push({id: goodId});
    }
    else{
        alert("заказ уже в корзине");
    }

    saveCart(cart);
}

function removeFromCart(itemId) {
    let cart = getCart();

    const existingProductIndex = cart.findIndex(item => item === itemId);

    cart = cart.filter(item => item.id !== itemId);

    saveCart(cart);
    displayCartItems();
}

async function getAutocomplete(query) {
    try {
        const response = await fetch(`${API_URL}/autocomplete?api_key=${token}&query=${query}`);
        const data = await response.json();
        if (!data || !Array.isArray(data) || data.length == 0) {
            return [];
        }
        return data;
    } catch (error) {
       catalog.innnerHTML = `<p> Произошла ошибка. Попробуйте позже </p>`;
        return;
    }
}

async function searchGoods(query) {
    try {
        const response = await fetch(`${API_URL}/goods?api_key=${token}&query=${query}`);
        const data = await response.json();
        if (!data || !Array.isArray(data) || data.length == 0) {
            catalog.innerHTML = '<p>Нет товаров, соответствующих вашему запросу</p>';
            return;
        }
        goodsData = data;
        renderGoods(goodsData);
    } catch (error) {
        catalog.innerHTML = '<p>Произошла ошибка при поиске.</p>';
    }
}

searchInput.addEventListener('input', async () => {
    currentSearchTerm = searchInput.value;
    searchResults.innerHTML = '';

    const lastWord = currentSearchTerm.trim().split(" ").pop();

    const suggestions = await getAutocomplete(lastWord);

    if (suggestions.length > 0) {
        searchResults.classList.add('show');
    } else {
        searchResults.classList.remove('show');
    }

    suggestions.forEach(good => {
        const resultItem = document.createElement('option');
        resultItem.className = 'list-group-item list-group-item-action';
        resultItem.textContent = good;
        resultItem.addEventListener('click', () => {
            const words = currentSearchTerm.trim().split(" ");
            words.pop();
            words.push(good);
            searchInput.value = words.join(" ");
            searchResults.innerHTML = '';
        });
        searchResults.appendChild(resultItem);
    });
});

searchInput.addEventListener('focus', () => {
    if (searchResults.children.length > 0) {
        searchResults.classList.add('show');
    }
});

searchButton.addEventListener('click', () => {
    const query = searchInput.value;
    searchGoods(query);
});

searchInput.addEventListener('blur', () => {
    setTimeout(() => {
        searchResults.innerHTML = '';
    }, 200)
});


async function loadGoods() {
    try {
        const response = await fetch(`${API_URL}/goods?api_key=${token}`);
        const data = await response.json();

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка HTTP: ${response.status} - ${errorText}`);
        }

        goodsData = data;
        renderGoods(goodsData);

    } catch (error) {
            catalog.innnerHTML = `<p> Произошла ошибка. Попробуйте позже </p>`;
            return;
    }
}

// Функция отрисовки товаров
function renderGoods(goods) {
    catalog.innerHTML = '';
    goods.forEach((item) => {
        const card = document.createElement("div");
        card.className = "col-md-4 col-sm-6";
        card.innerHTML = `
            <div class="card h-100 shadow-sm">
                <img src="${item.image_url}" class="card-img-top" alt="${item.name}">
                <div class="card-body">
                    <h5 class="card-title">${item.name}</h5>
                    <div class="d-flex align-items-center mb-2">
                        <div class="text-warning me-2">⭐ ${item.rating.toFixed(1)}</div>
                    </div>
                    <div class="d-flex justify-content-between align-items-center">
                        <span class="text-danger fw-bold">${item.discount_price || item.actual_price}₽</span>
                        ${item.discount_price ? `<small class="text-muted text-decoration-line-through">${item.actual_price}₽</small>` : ""}
                    </div>
                    <button class="addToCartButton btn btn-primary w-100 mt-3" data-id=${item.id}>В корзину</button>
                </div>
            </div>
        `;
        catalog.appendChild(card);
    });
    let addToCartButtons = document.querySelectorAll('.addToCartButton');
    addToCartButtons.forEach(button => {
        button.addEventListener('click', () => {
            const goodId = parseInt(button.dataset.id);
            button.className = "addToCartButton btn btn-danger w-100 mt-3"
            addToCart(goodId);
        });
    });
}

function sortGoods(sortType) {

    if (!Array.isArray(goodsData) || goodsData.length === 0) {
        catalog.innnerHTML = `<p> Произошла ошибка. Попробуйте позже </p>`;
        return;
    }

    let sortedGoods = goodsData;

    switch (sortType) {
        case 'rating_asc':
            sortedGoods.sort((a, b) => a.rating - b.rating);
            break;
        case 'rating_desc':
            sortedGoods.sort((a, b) => b.rating - a.rating);
            break;
        case 'price_asc':
            sortedGoods.sort((a, b) => (a.discount_price || a.actual_price) - (b.discount_price || b.actual_price));
            break;
        case 'price_desc':
            sortedGoods.sort((a, b) => (b.discount_price || b.actual_price) - (a.discount_price || a.actual_price));
            break;
        default:
            break;
    }

    catalog.innerHTML = '';
    renderGoods(sortedGoods);
}

sortOrderSelect.addEventListener('change', () => {
    sortGoods(sortOrderSelect.value);
});


loadGoods();
