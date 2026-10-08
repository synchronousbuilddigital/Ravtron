import mongoose from "mongoose";

const UsedBySchema = new mongoose.Schema(
  {
    email: { type: String, required: true, lowercase: true, trim: true },
    orderId: { type: String, default: "", trim: true },
    usedAt: { type: Date, default: Date.now }
  },
  { _id: false }
);

const CouponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    title: { type: String, required: true },
    description: { type: String, default: "" },
    type: { type: String, enum: ["percentage", "fixed"], default: "percentage" },
    discountValue: { type: Number, required: true },
    minPurchase: { type: Number, default: 0 },
    applicableCategory: { type: String, default: "All" },
    applicableProductId: { type: String, default: "" },
    applicableProductName: { type: String, default: "" },
    badgeType: { type: String, default: "Festive Offer" },
    expiryDate: { type: String, default: "" },
    oneTimePerUser: { type: Boolean, default: true },
    active: { type: Boolean, default: true },
    // Atomic redemption tracking to eliminate race condition double-use
    usedBy: { type: [UsedBySchema], default: [] },
    usageCount: { type: Number, default: 0 },
    usageLimit: { type: Number, default: null }
  },
  { timestamps: true }
);

CouponSchema.index({ code: 1, "usedBy.email": 1 });

if (mongoose.models.Coupon) {
  delete mongoose.models.Coupon;
}

export default mongoose.models.Coupon || mongoose.model("Coupon", CouponSchema);
