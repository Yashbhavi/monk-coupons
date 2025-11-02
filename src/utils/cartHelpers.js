function cartTotal(cart) {
if (!cart || !Array.isArray(cart.items)) return 0;
return cart.items.reduce((s, it) => s + (it.price || 0) * (it.quantity || 0), 0);
}


function deepClone(obj) {
return JSON.parse(JSON.stringify(obj));
}


function findItemByProductId(cart, product_id) {
if (!cart || !Array.isArray(cart.items)) return null;
return cart.items.find(it => String(it.product_id) === String(product_id)) || null;
}


module.exports = { cartTotal, deepClone, findItemByProductId };