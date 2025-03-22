const api_url = "https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api";
const token = "5afddbfd-45c9-4278-85a0-14acb0d7beb5";
    async function fetchOrders() {
        try {
            const response = await fetch(`${api_url}/orders?api_key=${token}`);
            const orders = await response.json();
            const ordersTable = document.getElementById('orders-table');

            ordersTable.innerHTML = orders.map((order, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${order.created_at.split('T')}</td>
                    <td>${order.good_ids.join(', ')}</td>
                    <td>${order.delivery_date}</td>
                    <td>
                        <button class="btn btn-info btn-sm" onclick="viewOrder(${order.id})" data-bs-toggle="modal" data-bs-target="#viewOrderModal">Просмотр</button>
                        <button class="btn btn-warning btn-sm" onclick="editOrder(${order.id})" data-bs-toggle="modal" data-bs-target="#editOrderModal">Редактирование</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteOrder(${order.id})" data-bs-toggle="modal" data-bs-target="#deleteOrderModal">Удаление</button>
                    </td>
                </tr>
            `).join('');
        } catch (error) {
            return;
        }
    }



    async function viewOrder(orderId) {
        try {
            const response = await fetch(`${api_url}/orders/${orderId}?api_key=${token}`);
            const order = await response.json();
            const viewOrderContent = document.getElementById('viewOrderContent');

            viewOrderContent.innerHTML = `
                <p><strong>Дата оформления:</strong> ${order.created_at.split('T')}</p>
                <p><strong>Имя:</strong> ${order.full_name}</p>
                <p><strong>Номер телефона:</strong> ${order.phone}</p>
                <p><strong>Email:</strong> ${order.email}</p>
                <p><strong>Адрес доставки:</strong> ${order.delivery_address}</p>
                <p><strong>Дата доставки:</strong> ${order.delivery_date}</p>
                <p><strong>Время доставки:</strong> ${order.delivery_interval}</p>
                <p><strong>Состав заказа:</strong> ${order.good_ids.join(', ')}</p>
                <p><strong>Комментарий:</strong> ${order.comment}</p>
            `;
        } catch (error) {
            return;
        }
    }



    async function editOrder(orderId) {
        try {
            const response = await fetch(`${api_url}/orders/${orderId}?api_key=${token}`);
            const order = await response.json();

            document.getElementById('editName').value = order.full_name;
            document.getElementById('editPhone').value = order.phone;
            document.getElementById('editEmail').value = order.email;
            document.getElementById('editAddress').value = order.delivery_address;
            document.getElementById('editDeliveryDate').value = order.delivery_date;
            document.getElementById('editDeliveryTime').value = order.delivery_interval;
            document.getElementById('editComment').value = order.comment;

            document.getElementById('saveEditOrder').addEventListener('click',async () => {
                const updatedOrder = {
                    full_name: document.getElementById('editName').value,
                    phone: document.getElementById('editPhone').value,
                    email: document.getElementById('editEmail').value,
                    delivery_address: document.getElementById('editAddress').value,
                    delivery_date: document.getElementById('editDeliveryDate').value,
                    delivery_interval: document.getElementById('editDeliveryTime').value,
                    comment: document.getElementById('editComment').value,
                };
                try {
                    await fetch(`${api_url}/orders/${orderId}?api_key=${token}`, {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(updatedOrder),
                    });
                    fetchOrders();
                    alert('Заказ успешно обновлён!');
                } catch (error) {
                    return;
                }
            });
        } catch (error) {
            console.error('Error fetching order for editing:', error);
        }
    }



    function deleteOrder(orderId) {
        document.getElementById('confirmDeleteOrder').addEventListener('click',async () => {
            try {
                await fetch(`${api_url}/orders/${orderId}?api_key=${token}`, {
                    method: 'DELETE',
                });
                fetchOrders();
                alert('Заказ успешно обновлён!');
            } catch (error) {
                return;
            }
        });
    }


    fetchOrders();
