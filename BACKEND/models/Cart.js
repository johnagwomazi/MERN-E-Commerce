import mongoose from 'mongoose';

const productSnapshotSchema = new mongoose.Schema(
  {
    _id: {
      type: mongoose.Schema.Types.Mixed
    },
    name: {
      type: String,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    price: {
      type: Number
    },
    image: {
      type: String
    },
    category: {
      type: String,
      trim: true
    },
    inventoryCount: {
      type: Number
    }
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    productSnapshot: {
      type: productSnapshotSchema,
      default: null
    },
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    }
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    items: [cartItemSchema]
  },
  { timestamps: true }
);

export default mongoose.model('Cart', cartSchema);
