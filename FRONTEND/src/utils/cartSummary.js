export const resolveCartItemProduct = (item) => {
  if (!item) {
    return null;
  }

  if (item.productId && typeof item.productId === 'object') {
    return item.productId;
  }

  return item.productSnapshot || null;
};

export const calculateCartSummary = (items = [], shippingFee = 0) => {
  const normalizedItems = (items || []).map((item) => ({
    ...item,
    product: resolveCartItemProduct(item)
  }));

  const subtotal = normalizedItems.reduce(
    (sum, item) => sum + (Number(item.product?.price) || 0) * Number(item.quantity || 0),
    0
  );
  const total = subtotal + shippingFee;

  return {
    items: normalizedItems,
    subtotal,
    shippingFee,
    total
  };
};
