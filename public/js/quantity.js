document.addEventListener('DOMContentLoaded', function () {
  const quantityInputs = document.querySelectorAll('.input-number');
  quantityInputs.forEach((input) => {
    const plusButton = input.nextElementSibling.querySelector('.quantity-right-plus');
    const minusButton = input.previousElementSibling.querySelector('.quantity-left-minus');
    const itemId = input.id.split('-')[1]; // Get the item ID from the input ID
    plusButton.addEventListener('click', async function (e) {
      e.preventDefault();
      const currentQuantity = parseInt(input.value);
      const response = await fetch(`/user/${itemId}/increment`, { method: 'POST' });
      if (response.ok) {
        const { quantity } = await response.json();
        input.value = quantity;
        updateQuantity(itemId, input.value); // Update the displayed quantity
        updateTotalAmount(); // Update total amount after quantity change
      } else {
        console.error('Failed to increment quantity:', response.statusText);
      }
    });
    minusButton.addEventListener('click', async function (e) {
      e.preventDefault();
      const currentQuantity = parseInt(input.value);
      if (currentQuantity > 1) {
        const response = await fetch(`/user/${itemId}/decrement`, { method: 'POST' });
        if (response.ok) {
          const { quantity } = await response.json();
          input.value = quantity;
          updateQuantity(itemId, input.value); // Update the displayed quantity
          updateTotalAmount(); // Update total amount after quantity change
        } else {
          console.error('Failed to decrement quantity:', response.statusText);
        }
      }
    });
    input.addEventListener('change', async function (e) {
      const newQuantity = parseInt(e.target.value);
      if (!isNaN(newQuantity) && newQuantity >= 1) {
        const response = await fetch(`/user/${itemId}/updateQuantity`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ quantity: newQuantity })
        });
        if (response.ok) {
          const { quantity } = await response.json();
          input.value = quantity;
          updateQuantity(itemId, input.value); // Update the displayed quantity
          updateTotalAmount(); // Update total amount after quantity change
        } else {
          console.error('Failed to update quantity:', response.statusText);
        }
      } else {
        console.error('Invalid quantity input');
        input.value = 1; // Reset to 1 if invalid input
      }
    });
  });
  function updateQuantity(itemId, value) {
    const displayQuantity = document.getElementById(`display-quantity-${itemId}`);
    if (displayQuantity) {
      displayQuantity.textContent = value;
    }
  }
  async function updateTotalAmount() {
    try {
      const response = await fetch('/user/cart/totalAmount');
      if (response.ok) {
        const { totalAmount } = await response.json();
        const totalAmountElement = document.getElementById('total-amount');
        if (totalAmountElement) {
          totalAmountElement.textContent = totalAmount.toFixed(2); // Update total amount in the DOM
        }
      } else {
        console.error('Failed to fetch total amount:', response.statusText);
      }
    } catch (error) {
      console.error('Error updating total amount:', error);
    }
  }
});
