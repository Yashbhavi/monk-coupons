const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');
const Coupon = require('../models/Coupon');


const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/monk_coupons_test';


beforeAll(async () => {
await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
await Coupon.deleteMany({});
});


afterAll(async () => {
await mongoose.connection.dropDatabase();
await mongoose.connection.close();
});


test('coupon creation and apply flows', async () => {
const cartCoupon = (await request(app).post('/coupons').send({ code: 'CART10', type: 'cart-wise', details: { threshold: 100, discountType: 'percentage', discount: 10 } })).body;
const productCoupon = (await request(app).post('/coupons').send({ code: 'PROD20', type: 'product-wise', details: { product_id: 2, discountType: 'percentage', discount: 20 } })).body;
const bxgyCoupon = (await request(app).post('/coupons').send({ code: 'B3G1', type: 'bxgy', details: { buy_products: [{ product_id: 1, quantity: 3 }], get_products: [{ product_id: 3, quantity: 1, price: 25 }], repetition_limit: 2 } })).body;


const cart = { items: [ { product_id: 1, quantity: 6, price: 50 }, { product_id: 2, quantity: 3, price: 30 }, { product_id: 3, quantity: 2, price: 25 } ] };
const applicable = (await request(app).post('/coupons/applicable').send({ cart })).body;
expect(applicable.data).toBeDefined();


const applyRes = await request(app).post(`/coupons/apply/${cartCoupon._id}`).send({ cart });
expect(applyRes.body.applied).toBe(true);


const applyProd = await request(app).post(`/coupons/apply/${productCoupon._id}`).send({ cart });
expect(applyProd.body.applied).toBe(true);


const applyBx = await request(app).post(`/coupons/apply/${bxgyCoupon._id}`).send({ cart });
expect(applyBx.body.applied).toBe(true);
});