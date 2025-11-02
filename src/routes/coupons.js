// const express = require('express');
// const router = express.Router();
// const controller = require('../controllers/couponController');


// router.post('/', controller.createCoupon);
// router.get('/', controller.listCoupons);
// router.get('/:id', controller.getCoupon);
// router.put('/:id', controller.updateCoupon);
// router.delete('/:id', controller.deleteCoupon);


// router.post('/applicable', controller.getApplicableCoupons); // POST /coupons/applicable
// router.post('/apply/:id', controller.applyCoupon);


// module.exports = router;


const express = require('express');
const router = express.Router();
const controller = require('../controllers/couponController');

// only register routes whose handlers exist in controller
router.post('/', controller.createCoupon);
router.get('/', controller.getAllCoupons);             // GET /coupons
router.get('/:id', controller.getCouponById);          // GET /coupons/:id
router.put('/:id', controller.updateCouponById);       // PUT /coupons/:id
router.delete('/:id', controller.deleteCouponById);    // DELETE /coupons/:id
router.post('/applicable', controller.getApplicableCoupons); // POST /coupons/applicable
router.post('/apply/:id', controller.applyCoupon);

module.exports = router;