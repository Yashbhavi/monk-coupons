const { cartTotal, findItemByProductId } = require('../utils/cartHelpers');


function evaluateCartWise(coupon, cart) {
const { threshold = 0, discountType = 'percentage', discount = 0 } = coupon.details || {};
const total = cartTotal(cart);
if (!(total >= threshold)) return { applicable: false, reason: `cart total ${total} < threshold ${threshold}` };
let discountAmount = 0;
if (discountType === 'percentage') discountAmount = +(total * (discount / 100)).toFixed(2);
else discountAmount = Math.min(total, discount);
return { applicable: true, discountAmount };
}


function evaluateProductWise(coupon, cart) {
const { product_id, discountType = 'percentage', discount = 0 } = coupon.details || {};
const item = findItemByProductId(cart, product_id);
if (!item) return { applicable: false, reason: `product ${product_id} not in cart` };
let discountAmount = 0;
if (discountType === 'percentage') discountAmount = +(item.price * item.quantity * (discount / 100)).toFixed(2);
else discountAmount = Math.min(item.price * item.quantity, discount);
return { applicable: true, discountAmount };
}


function evaluateBxGy(coupon, cart) {
const details = coupon.details || {};
const buyProducts = details.buy_products || [];
const getProducts = details.get_products || [];
const repetitionLimit = details.repetition_limit || Infinity;


if (!buyProducts.length || !getProducts.length) return { applicable: false, reason: 'invalid bxgy details' };


let times = Infinity;
for (const b of buyProducts) {
const item = findItemByProductId(cart, b.product_id);
const qtyInCart = item ? item.quantity : 0;
const req = b.quantity || 1;
times = Math.min(times, Math.floor(qtyInCart / req));
}
if (times === Infinity || times === 0) return { applicable: false, reason: 'buy requirements not met' };
times = Math.min(times, repetitionLimit);


const freeItems = getProducts.map(g => ({ product_id: g.product_id, freeQty: g.quantity * times }));


let discountAmount = 0;
for (const f of freeItems) {
const item = findItemByProductId(cart, f.product_id);
const price = item ? item.price : (f.price || 0);
const applicableQty = f.freeQty;
discountAmount += +(price * applicableQty).toFixed(2);
}


return { applicable: true, discountAmount, freeItems };
}


function evaluateCouponApplicability(coupon, cart) {
if (coupon.type === 'cart-wise') return evaluateCartWise(coupon, cart);
if (coupon.type === 'product-wise') return evaluateProductWise(coupon, cart);
if (coupon.type === 'bxgy') return evaluateBxGy(coupon, cart);
return { applicable: false, reason: 'unknown coupon type' };
}


module.exports = { evaluateCouponApplicability };