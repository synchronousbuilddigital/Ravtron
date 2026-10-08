import mongoose from "mongoose";

const OrderItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  qty: { type: Number, required: true },
  productId: { type: String },
  selectedSize: { type: String }
});

const TrackingStepSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true },
  done: { type: Boolean, default: false }
});

const ReturnRequestSchema = new mongoose.Schema({
  reason: { type: String, required: true },
  comments: { type: String, default: "" },
  requestedAt: { type: String, default: () => new Date().toLocaleString() },
  status: { type: String, default: "Pending" }
});

const OrderSchema = new mongoose.Schema(
  {
    id: { type: String, required: true, unique: true },
    date: { type: String, required: true },
    status: { type: String, required: true },
    statusColor: { type: String, required: true },
    total: { type: Number, required: true },
    savings: { type: Number, default: 0 },
    coupon: { type: String, default: "" },
    deliveryPref: { type: String, default: "standard" },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    customerPhone: { type: String, default: "" },
    paymentMethod: { type: String, default: "CARD" },
    // Razorpay real payment tracking fields
    razorpayOrderId: { type: String, default: null, sparse: true, index: true },
    razorpayPaymentId: { type: String, default: null, sparse: true, index: true },
    paymentStatus: {
      type: String,
      default: "pending",
      enum: ["pending", "paid", "failed", "cod"]
    },
    // Full shipping address stored on order (not just in localStorage)
    shippingAddress: {
      street: { type: String, default: "" },
      city: { type: String, default: "" },
      state: { type: String, default: "" },
      zip: { type: String, default: "" },
      country: { type: String, default: "India" }
    },
    items: { type: [OrderItemSchema], default: [] },
    trackingSteps: { type: [TrackingStepSchema], default: [] },
    returnRequest: { type: ReturnRequestSchema, default: null },
    // Express Courier & Shipment Tracking Fields
    courier: { type: String, default: "" },
    courierName: { type: String, default: "" },
    trackingId: { type: String, default: "" },
    trackingUrl: { type: String, default: "" },
    estimatedDelivery: { type: String, default: "" },
    dispatchNote: { type: String, default: "" },
    dispatchedAt: { type: String, default: "" },
    lastTrackingEmailSentAt: { type: String, default: "" }
  },
  { timestamps: true }
);

// Database-level uniqueness constraints to prevent concurrent duplicate orders
OrderSchema.index({ razorpayOrderId: 1 }, { unique: true, sparse: true });
OrderSchema.index({ razorpayPaymentId: 1 }, { unique: true, sparse: true });

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export default mongoose.models.Order || mongoose.model("Order", OrderSchema);
