const Coupon = require('../models/Coupon');
const couponService = require('../services/couponService');
const applyService = require('../services/applyService');
const { BadRequestError, NotFoundError, UnprocessableError } = require('../utils/errors');

exports.createCoupon = async (req, res, next) => {
    try {
        const payload = req.body;
        if (!payload || typeof payload !== 'object') throw new BadRequestError('invalid payload');
        const coupon = await Coupon.create(payload);
        res.json({ success: true, coupon });
    } catch (err) { next(err); }
};

// ========================
// GET ALL COUPONS
// ========================
exports.getAllCoupons = async (req, res, next) => {
    try {
        const coupons = await Coupon.find().lean();
        res.json({ success: true, data: coupons });
    } catch (err) { next(err); }
};

// ========================
// GET COUPON BY ID
// ========================
exports.getCouponById = async (req, res, next) => {
    try {
        const coupon = await Coupon.findById(req.params.id).lean();
        if (!coupon) throw new NotFoundError('Coupon not found');
        res.json({ success: true, data: coupon });
    } catch (err) { next(err); }
};

// ========================
// UPDATE COUPON BY ID
// ========================
exports.updateCouponById = async (req, res, next) => {
    try {
        const updated = await Coupon.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        if (!updated) throw new NotFoundError('Coupon not found');
        res.json({ success: true, coupon: updated });
    } catch (err) { next(err); }
};

// ========================
// DELETE COUPON BY ID
// ========================
exports.deleteCouponById = async (req, res, next) => {
    try {
        // Soft delete: mark inactive instead of removing permanently
        const deleted = await Coupon.findByIdAndUpdate(
            req.params.id,
            { active: false },
            { new: true }
        );
        if (!deleted) throw new NotFoundError('Coupon not found');
        res.json({ success: true, message: 'Coupon deleted (soft)', coupon: deleted });
    } catch (err) { next(err); }
};


// ========================
// GET APPLICABLE COUPONS
// ========================
exports.getApplicableCoupons = async (req, res, next) => {
    try {
        const { cart } = req.body;
        if (!cart || !Array.isArray(cart.items)) throw new BadRequestError('cart.items required');

        const coupons = await Coupon.find({ active: true }).lean();
        const results = [];
        for (const c of coupons) {
            if (c.expiresAt && new Date() > new Date(c.expiresAt)) {
                results.push({ couponId: c._id, code: c.code, type: c.type, applicable: false, reason: 'expired' });
                continue;
            }
            if (c.usageLimit !== null && c.usedCount >= c.usageLimit) {
                results.push({ couponId: c._id, code: c.code, type: c.type, applicable: false, reason: 'usage limit reached' });
                continue;
            }
            const evalRes = couponService.evaluateCouponApplicability(c, cart);
            results.push({ couponId: c._id, code: c.code, type: c.type, ...evalRes });
        }

        res.json({ data: results });
    } catch (err) { next(err); }
};

// ========================
// APPLY COUPON TO CART
// ========================
exports.applyCoupon = async (req, res, next) => {
    try {
        const couponId = req.params.id;
        const { cart } = req.body;
        if (!cart || !Array.isArray(cart.items)) throw new BadRequestError('cart.items required');

        const coupon = await Coupon.findById(couponId);
        if (!coupon) throw new NotFoundError('Coupon not found');
        if (!coupon.active) throw new UnprocessableError('Coupon inactive');
        if (coupon.expiresAt && new Date() > new Date(coupon.expiresAt)) throw new UnprocessableError('Coupon expired');
        if (coupon.usageLimit !== null && coupon.usedCount >= coupon.usageLimit) throw new UnprocessableError('Coupon usage limit reached');

        const result = applyService.applyCouponToCart(coupon.toObject(), cart);
        if (!result.applicable) throw new UnprocessableError(result.reason || 'Coupon not applicable');

        // atomic increment usedCount - use findOneAndUpdate to avoid races
        if (coupon.usageLimit !== null) {
            const updated = await Coupon.findOneAndUpdate(
                { _id: coupon._id, usedCount: { $lt: coupon.usageLimit } },
                { $inc: { usedCount: 1 } },
                { new: true }
            );
            if (!updated) {
                // someone else used the last usage
                throw new UnprocessableError('Coupon usage limit reached (concurrent)');
            }
        }

        res.json({ applied: true, result });
    } catch (err) { next(err); }
};
