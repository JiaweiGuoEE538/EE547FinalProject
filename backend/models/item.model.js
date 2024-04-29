const mongoose = require("mongoose");
// this data dealing is cited by chatgot
// define product schema
const ItemSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  galleryURL: [String],
  itemId: { type: [String] },
  title: [String],
  postalCode: [String],
  condition: [
    {
      conditionId: [String],
      conditionDisplayName: [String],
    },
  ],
  primaryCategory: [
    {
      categoryId: [String],
      categoryName: [String],
    },
  ],
  shippingInfo: [
    {
      shippingServiceCost: [
        {
          "@currencyId": String,
          __value__: Number,
        },
      ],
      shippingType: [String],
      shipToLocations: [String],
      expeditedShipping: [String],
      oneDayShippingAvailable: [String],
      handlingTime: [Number],
    },
  ],
  sellingStatus: [
    {
      currentPrice: [
        {
          "@currencyId": String,
          __value__: String,
        },
      ],
      convertedCurrentPrice: [
        {
          "@currencyId": String,
          __value__: String,
        },
      ],
      sellingState: [String],
      timeLeft: [String],
    },
  ],
  returnsAccepted: [String],
});

// export schema
const Item = mongoose.model("Item", ItemSchema);
module.exports = Item;
