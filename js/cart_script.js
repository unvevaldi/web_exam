const API_URL = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api";
const token = "5afddbfd-45c9-4278-85a0-14acb0d7beb5";
const cartItems = document.getElementById('cart-items');
const emptyCartMessage = document.getElementById('empty-cart-message');
const orderForm = document.getElementById('orderForm');
const notifications = document.getElementById('notifications');
let removeButtons = [];

function getCart() {
    const cart = localStorage.getItem('cart');
    return cart ? JSON.parse(cart) : [];
}

function saveCart(cart) {
    try {
        localStorage.setItem('cart', JSON.stringify(cart));
    } catch (error){
        return
    }
}

function displayCartItems() {
    cartItems.innerHTML = '';
    const cart = getCart();
    if(cart.length < 1){
        emptyCartMessage.style.display = "block"
    }


    cart.forEach(async item => {
        const response = await fetch(`${API_URL}/goods/${item.id}?api_key=${token}`);
        const data = await response.json();
        const card = document.createElement('div');
        let button;
        card.className = 'col';
        card.innerHTML = `
             <div class="card h-100 shadow-sm">
                <img src="${data.image_url}" class="card-img-top" alt="${data.name}">
                <div class="card-body">
                    <h5 class="card-title">${data.name}</h5>
                    <span class="text-danger fw-bold">Стоимость: ${data.discount_price || data.actual_price}₽</span>
                    <button class="btn btn-danger remove-from-cart" data-id="${item.id}">Удалить</button>
                </div>
            </div>
        `;
        button = card.querySelector("button.remove-from-cart");
        button.addEventListener('click', () => {
            const goodId = parseInt(button.dataset.id);
            removeFromCart(goodId);
        });
        cartItems.appendChild(card);
    });
}

async function removeFromCart(itemId) {
    let cart = getCart();
    cart = cart.filter(item => item.id !== itemId);
    saveCart(cart);
    displayCartItems();
}

orderForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    const cart = getCart();
    let goods = [];
    cart.forEach(item => {
        goods.push(item.id);
    })
    let deliveryDate = document.getElementById("deliveryDate").value;
    const dateParts = deliveryDate.split('-');
    deliveryDate = `${dateParts[2]}.${dateParts[1]}.${dateParts[0]}`;

    const formData = new FormData(orderForm);
    const orderData = {
        good_ids: goods, // Формируем массив товаров для запроса
        full_name: document.getElementById('name').value,
        email: document.getElementById('email').value,
        phone: document.getElementById('phone').value,
        subscribe: document.getElementById('subscribe').value === 'on',
        delivery_address: document.getElementById('address').value,
        delivery_date: deliveryDate,
        delivery_interval: document.getElementById('deliveryInterval').value,
        comment: document.getElementById('comment').value
    };

    const response = fetch(`${API_URL}/orders?api_key=${token}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData)
    })
    if (response.ok){
        alert("заказ создан");
    }
});

displayCartItems();
