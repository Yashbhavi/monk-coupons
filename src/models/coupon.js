const mongoose = require('mongoose');


const CouponSchema = new mongoose.Schema({
code: { type: String, required: true, unique: true },
name: { type: String },
type: { type: String, enum: ['cart-wise','product-wise','bxgy'], required: true },
active: { type: Boolean, default: true },
details: { type: mongoose.Schema.Types.Mixed, required: true },
expiresAt: { type: Date },
usageLimit: { type: Number, default: null },
usedCount: { type: Number, default: 0 },
createdAt: { type: Date, default: Date.now }
});


CouponSchema.methods.isExpired = function() {
if (!this.expiresAt) return false;
return new Date() > this.expiresAt;
};


module.exports = mongoose.model('Coupon', CouponSchema);