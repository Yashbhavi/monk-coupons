const { cartTotal, deepClone, findItemByProductId } = require('../utils/cartHelpers');
const couponService = require('./couponService');

function applyCartWise(coupon, cart) {
    const clone = deepClone(cart);
    const evalRes = couponService.evaluateCouponApplicability(coupon, clone);
    if (!evalRes.applicable) return { applicable: false, reason: evalRes.reason };
    const discount = evalRes.discountAmount || 0;
    const total = cartTotal(clone);
    if (total <= 0) return { applicable: false, reason: 'cart total zero' };
    let remaining = discount;
    for (let i = 0; i < clone.items.length; i++) {
        const it = clone.items[i];
        const share = +((it.price * it.quantity) / total * discount).toFixed(2);
        it.total_discount = share;
        remaining = +(remaining - share).toFixed(2);
    }
    if (remaining !== 0 && clone.items.length) {
        clone.items[0].total_discount = +(clone.items[0].total_discount + remaining).toFixed(2);
    }
    const original_total = total;
    const total_discount = +discount.toFixed(2);
    const final_price = +(original_total - total_discount).toFixed(2);
    return { applicable: true, cart: clone, original_total, total_discount, final_price };
}

function applyProductWise(coupon, cart) {
    const clone = deepClone(cart);
    const evalRes = couponService.evaluateCouponApplicability(coupon, clone);
    if (!evalRes.applicable) return { applicable: false, reason: evalRes.reason };
    const { product_id, discountType, discount } = coupon.details;
    const item = findItemByProductId(clone, product_id);
    if (!item) return { applicable: false, reason: 'product not in cart' };
    let discountAmount = 0;
    if (discountType === 'percentage') {
        discountAmount = +(item.price * item.quantity * (discount / 100)).toFixed(2);
    } else {
        discountAmount = Math.min(item.price * item.quantity, discount);
        discountAmount = +discountAmount.toFixed(2);
    }
    item.total_discount = discountAmount;
    const original_total = cartTotal(clone);
    const total_discount = +discountAmount.toFixed(2);
    const final_price = +(original_total - total_discount).toFixed(2);
    return { applicable: true, cart: clone, original_total, total_discount, final_price };
}

function applyBxGy(coupon, cart) {
    const clone = deepClone(cart);
    const evalRes = couponService.evaluateCouponApplicability(coupon, clone);
    if (!evalRes.applicable) return { applicable: false, reason: evalRes.reason };

    const freeItems = evalRes.freeItems || [];
    for (const f of freeItems) {
        const item = findItemByProductId(clone, f.product_id);
        const getProductMeta = (coupon.details.get_products || []).find(g => g.product_id === f.product_id) || {};
        const assumedPrice = item ? item.price : (getProductMeta.price || 0);
        const freeQty = f.freeQty;
        if (item) {
            const discountAmount = +(Math.min(freeQty, item.quantity) * assumedPrice).toFixed(2);
            item.total_discount = (item.total_discount || 0) + discountAmount;
        } else {
            clone.items.push({
                product_id: f.product_id,
                quantity: freeQty,
                price: assumedPrice,
                total_discount: +(freeQty * assumedPrice).toFixed(2),
                _created_by_coupon: true
            });
        }
    }
    const original_total = cartTotal(clone);
    const total_discount = clone.items.reduce((s, it) => s + (it.total_discount || 0), 0);
    const final_price = +(original_total - total_discount).toFixed(2);
    return { applicable: true, cart: clone, original_total, total_discount: +total_discount.toFixed(2), final_price };
}

function applyCouponToCart(coupon, cart) {
    if (coupon.type === 'cart-wise') return applyCartWise(coupon, cart);
    if (coupon.type === 'product-wise') return applyProductWise(coupon, cart);
    if (coupon.type === 'bxgy') return applyBxGy(coupon, cart);
    return { applicable: false, reason: 'unknown coupon type' };
}

module.exports = { applyCouponToCart };