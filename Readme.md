# Monk Commerce 2025 — Coupon Management API (Backend Task)
## 👨‍💻 Tech Stack

- Node.js / Express.js

- MongoDB + Mongoose

- Modular Services Architecture:

- couponService.js → handles coupon applicability logic

- applyService.js → applies discount logic to carts

- Custom Error Handling (BadRequestError, NotFoundError, UnprocessableError)

## 📘 Objective

- A RESTful API to manage and apply discount coupons for an e-commerce platform.

### Supports:

- Cart-wise discounts

- Product-wise discounts

- “Buy X Get Y” (BxGy) deals with a structure designed for easy addition of future coupon types.

## ⚙️ API Endpoints

| **Method** | **Endpoint** | **Description** |
|-------------|--------------|-----------------|
| **POST** | `/coupons` | Create a new coupon. |
| **GET** | `/coupons` | Retrieve all coupons. |
| **GET** | `/coupons/:id` | Retrieve a coupon by ID. |
| **PUT** | `/coupons/:id` | Update coupon details. |
| **DELETE** | `/coupons/:id` | Soft delete (mark coupon as inactive). |
| **POST** | `/coupons/applicable` | Get all applicable coupons for a given cart. |
| **POST** | `/coupons/apply/:id` | Apply a specific coupon and return the discounted cart. |


## ✅ Implemented Cases
 1️⃣ Cart-Wise Coupons

- Logic:
- Apply discount to the entire cart if total ≥ threshold.

 - Example:

- Condition: cart total > ₹100

- Discount: 10% off

- Implementation Highlights:

- Calculates total using cartTotal()

- Supports percentage or flat discounts

- Distributes discount proportionally across all cart items

## 2️⃣ Product-Wise Coupons

- Logic:
- Apply discount only on a specific product.

- Example:

- Product ID = 2

- Discount = 20%

- Implementation Highlights:

- Finds product via findItemByProductId()

- Handles both percentage and flat discount types

- Affects only the matching item

## 3️⃣ BxGy (Buy X Get Y) Coupons

- Logic:
- Buy specified products → get others free (with repetition limit).

- Example:

- Buy 3 of Product 1 → Get 1 of Product 3 free (repeat 2 times max)

- Implementation Highlights:

- Checks each “buy” product quantity and applies repetition limit

- Adds or discounts “get” products automatically

- Supports assumed prices for free items

## 4️⃣ Coupon Constraints & Safety Checks

- ✅ Implemented:

- Coupon activation check

- Expiry check (expiresAt)

- Usage limit with atomic $inc on apply

- Soft deletion using active: false

- Centralized error handling with meaningful messages

## 5️⃣ Extensible Design

- Adding a new coupon type only requires:

- Adding an evaluator in couponService.js

- Adding an application handler in applyService.js

- Extending the switch logic in both services

- → No need to change controllers or schema.

## 🚫 Unimplemented / Future Cases

| **Case** | **Description** |
|-----------|-----------------|
| **Multiple Coupon Stacking** | Only one coupon can be applied per transaction. |
| **Per-User Usage Tracking** | Uses a global usage counter only (no per-user tracking). |
| **Category-Wise Discounts** | Not implemented yet. |
| **Product Exclusion Lists** | No “excluded products” feature available. |
| **Partial Buy Combinations** | Requires a full match per product ID. |
| **Best Coupon Selection** | Not implemented. |
| **Currency Handling** | Supports a single currency (₹). |
| **Rounding Rules** | Uses standard JavaScript rounding to 2 decimal places. |


## ⚠️ Assumptions

- Each cart item is { product_id, quantity, price }.

- Only one coupon can be applied per cart.

- If a “get” product in BxGy isn’t in the cart, it’s added automatically.

- Discounts never exceed cart or product value.

- Prices are in INR (₹) and use 2-decimal rounding.

- Coupon usage is global, not per-user.

- Expiration dates are checked in UTC time.

- Deleted coupons remain in DB but inactive.

## 🚧 Limitations
| **Area** | **Limitation** |
|-----------|----------------|
| **Coupon Stacking** | Not supported. |
| **Performance** | Linear iteration per coupon and cart; acceptable for small-scale usage. |
| **Product Catalog Integration** | Simplified — no category or brand metadata. |
| **Rounding** | Floating-point rounding may cause slight discrepancies. |
| **Reporting** | No analytics or audit logs available. |
| **Test Coverage** | Unit tests only; integration suite not yet implemented. |

## 🧠 Example Payloads

### Create Coupon (Cart-Wise)


```json
{
  "code": "CART10",
  "name": "10% Off on Carts above ₹100",
  "type": "cart-wise",
  "details": {
    "threshold": 100,
    "discountType": "percentage",
    "discount": 10
  },
  "expiresAt": "2025-12-31T23:59:59.000Z",
  "usageLimit": 100
}
```

 ### 🛒 Apply Coupon

```json
{
  "cart": {
    "items": [
      { "product_id": 1, "quantity": 6, "price": 50 },
      { "product_id": 2, "quantity": 3, "price": 30 },
      { "product_id": 3, "quantity": 2, "price": 25 }
    ]
  }
}
```


### 🧾 Example Response
```json
{
  "applied": true,
  "result": {
    "applicable": true,
    "original_total": 490,
    "total_discount": 50,
    "final_price": 440,
    "cart": {
      "items": [
        { "product_id": 1, "quantity": 6, "price": 50, "total_discount": 0 },
        { "product_id": 2, "quantity": 3, "price": 30, "total_discount": 0 },
        { "product_id": 3, "quantity": 4, "price": 25, "total_discount": 50 }
      ]
    }
  }
}
```


## 🧪 Testing

### Includes test cases for:

- Coupon creation

- Applicability evaluation

- Discount calculation logic

## Run:

- npm test

## 🧱 Directory Structure
src/
 ├── controllers/
 │    └── couponController.js
 ├── routes/
 │    └── coupons.js
 ├── models/
 │    └── Coupon.js
 ├── services/
 │    ├── couponService.js
 │    └── applyService.js
 ├── utils/
 │    ├── cartHelpers.js
 │    └── errors.js
 └── tests/
      └── coupon.test.js

## 🚀 Setup & Run
- npm install
- add .env file with MongoDB url for connecting the database 
- npm run dev


- Then visit:

- http://localhost:5000/coupons

## 🔮 Future Enhancements (Proposed)

| **Enhancement** | **Description** |
|------------------|-----------------|
| **Category-wise Coupons** | Apply discounts to all products in a given category (e.g., “10% off Electronics”). |
| **User-Specific Coupons** | Track redemption per user, integrated with login or user ID. |
| **Coupon Stacking Rules** | Define priorities for combining cart-wise and product-wise coupons. |
| **Loyalty / Referral Coupons** | Issue personalized coupons based on user loyalty or referrals. |
| **Dynamic Expiry Rules** | Automatically expire coupons based on usage count or date range. |
| **Multi-Currency Support** | Enable currency conversion based on user region or store locale. |
| **Coupon Analytics Dashboard** | Track usage statistics, revenue impact, and top-performing coupons. |
| **Integration with Inventory API** | Validate product existence, category, and real-time pricing. |
| **Best Coupon Recommendation Engine** | Suggest the highest-value coupon automatically before checkout. |
| **Scheduled / Seasonal Coupons** | Automatically activate or deactivate coupons during sales campaigns. |


## 🏁 Conclusion

- This API fully satisfies the Monk Commerce 2025 backend task requirements:

- Complete CRUD for coupon management

- Core logic for cart-wise, product-wise, and BxGy discounts

- Well-defined extensible architecture

- Clean code, modular design, and documented assumptions