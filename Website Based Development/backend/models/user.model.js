const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

// 定义 Item 结构作为子文档
const ItemSchema = new mongoose.Schema({
  createdAt: {
    type: Date,
    default: Date.now,
  },
  galleryURL: [String],
  itemId: [String], // 注意这里不再是唯一的，避免了前面的错误
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

// 定义 User 结构
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  wishlist: [ItemSchema], // 直接嵌入 Item 结构
  recommendationParams: {
    // 新增字段存储推荐参数
    selectedKeyword: String,
    maxPrice: Number,
    minPrice: Number,
    maxShippingCost: Number,
    hasShippingCost: Boolean,
    allFreeShipping: Boolean,
    allPaidShipping: Boolean,
    allAcceptReturns: Boolean,
  },
});

// 密码加密钩子
userSchema.pre("save", async function (next) {
  if (this.isModified("password") || this.isNew) {
    const salt = await bcrypt.genSalt(10);
    const hash = await bcrypt.hash(this.password, salt);
    this.password = hash;
  }
  next();
});

// 辅助方法，用于验证密码
userSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

const User = mongoose.model("User", userSchema);

module.exports = User;
