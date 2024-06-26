const express = require("express");
const axios = require("axios");
const cors = require("cors");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 3000;

const mongoose = require("mongoose");
const router = express.Router();

app.use(cors({ origin: "*" }));
app.options("*", cors());
// Enable CORS for all routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/search", async (req, res) => {
  const keywords = req.query.keywords;
  const conditions = req.query.conditions
    ? JSON.parse(req.query.conditions)
    : [];
  const shippingOptions = req.query.shippingOptions;
  const localPickup = req.query.localPickup;
  const postalCode = req.query.postalCode;
  const maxDistance = req.query.maxDistance;
  const category = req.query.category; // Extract category from query
  const filters = [];

  if (conditions.length) {
    filters.push({ name: "Condition", value: conditions });
  }

  if (shippingOptions === "free") {
    filters.push({ name: "FreeShippingOnly", value: "true" });
  }

  if (localPickup === "localPickup") {
    filters.push({ name: "LocalPickupOnly", value: "true" });
  }

  if (maxDistance) {
    filters.push({ name: "MaxDistance", value: maxDistance });
  }

  const params = {
    "OPERATION-NAME": "findItemsAdvanced",
    "SERVICE-VERSION": "1.0.0",
    "SECURITY-APPNAME": "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c",
    "RESPONSE-DATA-FORMAT": "JSON",
    keywords: keywords,
    "paginationInput.entriesPerPage": "50",
  };

  if (postalCode) {
    params["buyerPostalCode"] = postalCode;
  }

  // if (maxDistance) {
  //   params["MaxDistance"] = maxDistance;
  // }

  if (category && category !== "default") {
    // Ensure category is present and not 'default'
    params["categoryId"] = category;
  }

  filters.forEach((filter, i) => {
    params[`itemFilter(${i}).name`] = filter.name;
    if (Array.isArray(filter.value)) {
      filter.value.forEach((v, j) => {
        params[`itemFilter(${i}).value(${j})`] = v;
      });
    } else {
      params[`itemFilter(${i}).value`] = filter.value;
    }
  });

  console.log(params);

  try {
    const response = await axios.get(
      "https://svcs.ebay.com/services/search/FindingService/v1",
      { params: params }
    );
    console.log(params);
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from eBay." });
  }
});

// eBay get item endpoint
const OAuthToken = require("./ebay_oauth_token");
const client_id = "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c";
const client_secret = "PRD-dd800d9a6857-68c7-4d0d-906f-4664";
const oauthToken = new OAuthToken(client_id, client_secret);
oauthToken
  .getApplicationToken()
  .then((accessToken) => {
    console.log("Access Token:", accessToken);
  })
  .catch((error) => {
    console.log("Error", error);
  });
app.get("/getItemDetails/:itemId", async (req, res) => {
  // const item_id = req.query.item_id;
  const item_id = req.params.itemId;
  console.log(item_id);
  if (!item_id) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  const params = {
    callname: "GetSingleItem",
    responseencoding: "JSON",
    appid: "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c",
    siteid: "0",
    version: "967",
    ItemID: item_id,
    IncludeSelector: "Description,Details,ItemSpecifics",
  };
  console.log(params);
  const headers = {
    "X-EBAY-API-IAF-TOKEN": await oauthToken.getApplicationToken(),
  };

  try {
    const response = await axios.get("https://open.api.ebay.com/shopping", {
      params: params,
      headers: headers,
    });
    res.json(response.data);
    console.log(response);
    console.log("get data!");
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch data from eBay." });
  }
});

// Serve static files
app.get("/", (req, res) => {
  res.send("Server is Running.");
});

app.listen(PORT, () => {
  console.log(`Server started on http://localhost:${PORT}`);
});

// mongo db
const mongoDBUrl =
  "mongodb+srv://jiaweiguo429:Richard429@cluster0.q4zdsf5.mongodb.net/?retryWrites=true&w=majority";
mongoose.connect(mongoDBUrl, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("error", (err) => {
  console.error("Failed to connect to MongoDB", err);
});

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
});

// login and logout
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const User = require("./models/user.model");
const session = require("express-session");

app.use(
  session({
    secret: "123456", // 替换为你自己的密钥
    resave: true,
    saveUninitialized: true,
  })
);

// Passport 中间件
app.use(passport.initialize());
app.use(passport.session());

// Passport 本地策略
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username: username });
      if (!user) {
        return done(null, false, { message: "Incorrect username." });
      }
      const match = await user.isValidPassword(password);
      if (!match) {
        return done(null, false, { message: "Incorrect password." });
      }
      return done(null, user);
    } catch (e) {
      return done(e);
    }
  })
);

// Passport serialize and deserialize
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

// 注册新用户的路由
app.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username: username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already exists." });
    }
    const newUser = new User({ username, password });
    await newUser.save();
    res.status(201).json({ message: "User registered successfully." });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 用户登录的路由
app.post("/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({ message: err.message });
    }
    if (!user) {
      // 登录失败，返回前端错误信息
      return res.status(401).json({ message: info.message });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({ message: err.message });
      }
      // 登录成功
      return res.json({ message: "Logged in successfully", user: user });
    });
  })(req, res, next);
});

app.post("/logout", (req, res) => {
  // 使用回调函数确保登出操作完成
  req.logout(function (err) {
    if (err) {
      // 如果登出过程中发生错误，返回错误信息
      console.error("Logout error:", err);
      return res.status(500).send({ message: "Logout failed", error: err });
    }
    // 登出成功后发送响应
    res.status(200).send({ message: "Logged out successfully" });
  });
});

// add, remove
const Item = require("./models/item.model"); // 更新这个路径以指向您的模型文件

// app.post("/api/addToCart", async (req, res) => {
//   // 从请求体中获取商品数据
//   const itemData = req.body;
//   console.log(itemData);
//   // 检查 itemId 是否是数组，并获取第一个元素
//   if (Array.isArray(itemData.itemId)) {
//     itemData.itemId = itemData.itemId[0];
//   }

//   try {
//     // 使用接收到的数据创建 Item 模型的一个新实例
//     const newItem = new Item(itemData);

//     // 将新商品项保存到数据库
//     await newItem.save();

//     // 发送一个成功响应
//     res.status(201).json({ message: "Item added successfully!" });
//   } catch (error) {
//     // 如果出现错误，发送一个错误响应
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post("/api/addToCart", async (req, res) => {
//   const { itemData, username } = req.body; // 接收整个 item 对象和 username

//   try {
//     // 查找用户并填充其 wishlist 的所有 item
//     const user = await User.findOne({ username }).populate({
//       path: "wishlist",
//       model: "Item",
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 检查心愿单中是否已存在该 itemId
//     const existingItem = user.wishlist.find(
//       (item) => item.itemId === itemData.itemId
//     );

//     if (existingItem) {
//       return res
//         .status(409)
//         .json({ message: "Item already exists in wishlist" }); // 409 Conflict
//     }

//     // 如果商品不存在，则创建新的商品
//     let newItem = new Item(itemData);
//     await newItem.save();

//     // 更新用户的 wishlist，添加新的商品
//     user.wishlist.push(newItem);
//     await user.save(); // 保存用户文档的更新

//     res.status(201).json({
//       message: "Item added to wishlist successfully",
//       wishlist: user.wishlist,
//     });
//   } catch (error) {
//     console.error("Error adding item to wishlist: ", error);
//     res.status(500).json({ message: error.message });
//   }
// });
// app.post("/api/addToCart", async (req, res) => {
//   const { itemData, username } = req.body;

//   try {
//     const user = await User.findOne({ username }).populate({
//       path: "wishlist",
//       model: "Item",
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 检查心愿单中是否已存在该 itemId
//     const existingItem = user.wishlist.find((item) =>
//       item.itemId.includes(itemData.itemId[0])
//     );

//     if (existingItem) {
//       return res
//         .status(409)
//         .json({ message: "Item already exists in wishlist" });
//     }

//     // 检查数据库中是否已存在该 itemId
//     const itemExists = await Item.findOne({ itemId: itemData.itemId[0] });
//     if (itemExists) {
//       // 如果商品已存在，直接添加到用户的心愿单
//       user.wishlist.push(itemExists);
//       await user.save();
//       return res.status(201).json({
//         message: "Existing item added to wishlist successfully",
//         wishlist: user.wishlist,
//       });
//     }

//     // 如果商品不存在，则创建新的商品
//     let newItem = new Item(itemData);
//     await newItem.save();

//     // 更新用户的 wishlist，添加新的商品
//     user.wishlist.push(newItem);
//     await user.save();

//     res.status(201).json({
//       message: "New item added to wishlist successfully",
//       wishlist: user.wishlist,
//     });
//   } catch (error) {
//     console.error("Error adding item to wishlist: ", error);
//     res.status(500).json({ message: error.message });
//   }
// });
app.post("/api/addToCart", async (req, res) => {
  const { itemData, username } = req.body;

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 检查心愿单中是否已存在该 itemId
    const existingItem = user.wishlist.find((item) =>
      item.itemId.includes(itemData.itemId[0])
    );

    if (existingItem) {
      return res
        .status(409)
        .json({ message: "Item already exists in wishlist" });
    }

    // 直接添加新商品到用户的心愿单
    user.wishlist.push(itemData);
    await user.save();

    res.status(201).json({
      message: "Item added to wishlist successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error adding item to wishlist: ", error);
    res.status(500).json({ message: error.message });
  }
});

// remove from cart
// app.post("/api/removeFromCart", async (req, res) => {
//   const { itemId } = req.body; // 从请求体中获取 itemId

//   try {
//     // 在数据库中找到该项目并删除它
//     await Item.findOneAndDelete({ itemId: itemId });

//     res.json({ message: "Item removed from cart successfully" });
//   } catch (error) {
//     console.error("Error removing item from cart: ", error);
//     res.status(500).json({ message: error.message });
//   }
// });

// app.post("/api/removeFromCart", async (req, res) => {
//   const { itemId, username } = req.body; // 确保前端发送 username 和 itemId

//   try {
//     // 查找用户并填充其 wishlist
//     const user = await User.findOne({ username }).populate("wishlist");
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 在用户的 wishlist 中查找具有指定 itemId 的 Item
//     // 注意这里的修改，我们使用 Array.includes 方法来检查 itemId 是否存在于数组中
//     const itemToRemove = user.wishlist.find((item) =>
//       item.itemId.includes(itemId)
//     );
//     console.log(user.wishlist);
//     console.log(itemId, itemToRemove);
//     if (!itemToRemove) {
//       return res.status(404).json({ message: "Item not found in wishlist" });
//     }

//     // 从数据库中移除该 Item 对象
//     await Item.findByIdAndRemove(itemToRemove._id);

//     // 从用户的 wishlist 中移除对该 Item 的引用
//     await User.findOneAndUpdate(
//       { _id: user._id },
//       { $pull: { wishlist: itemToRemove._id } },
//       { new: true }
//     );

//     res.json({
//       message: "Item removed from wishlist successfully",
//       wishlist: user.wishlist, // 这可能需要再次填充来反映最新状态
//     });
//   } catch (error) {
//     console.error("Error removing item from wishlist: ", error);
//     res.status(500).json({ message: error.message });
//   }
// });

app.post("/api/removeFromCart", async (req, res) => {
  const { itemId, username } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const itemIndex = user.wishlist.findIndex((item) =>
      item.itemId.includes(itemId)
    );

    if (itemIndex === -1) {
      return res.status(404).json({ message: "Item not found in wishlist" });
    }

    // 从用户的心愿单中移除该项目
    user.wishlist.splice(itemIndex, 1);
    await user.save();

    res.json({
      message: "Item removed from wishlist successfully",
      wishlist: user.wishlist,
    });
  } catch (error) {
    console.error("Error removing item from wishlist: ", error);
    res.status(500).json({ message: error.message });
  }
});

//get

app.get("/api/wishlist", async (req, res) => {
  const { username } = req.query; // 从查询参数获取用户名
  try {
    // 查找用户并填充心愿单项
    const userWithWishlist = await User.findOne({ username }).populate(
      "wishlist"
    );
    res.json(userWithWishlist.wishlist);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// get all ItemIds

// app.get("/api/getItemIds", async (req, res) => {
//   try {
//     // 查询所有商品，但只返回 'itemId' 字段
//     const itemIds = await Item.find({}, "itemId -_id"); // '-_id' 是说我们不想返回默认的 MongoDB '_id' 字段
//     // 这将是一个对象数组，例如：[{itemId: 'id1'}, {itemId: 'id2'}, ...]
//     // 如果你想要一个纯粹的 'itemId' 字符串数组，你可以简单地从这些对象中提取它们
//     const idArray = itemIds.map((item) => item.itemId);

//     res.json(idArray); // 返回 itemId 数组
//     console.log(idArray);
//   } catch (error) {
//     console.error("Error fetching item IDs: ", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

// app.get("/api/getItemIds", async (req, res) => {
//   const { username } = req.query; // 从请求的查询参数中获取 username

//   if (!username) {
//     return res.status(400).json({ message: "Username is required" });
//   }

//   try {
//     // 首先，找到该用户并填充其 wishlist
//     const user = await User.findOne({ username }).populate({
//       path: "wishlist",
//       model: "Item",
//     });

//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // 从用户的心愿单中提取 itemId
//     const itemIds = user.wishlist.map((item) => item.itemId);
//     const flattenedIds = itemIds.flat(); // 由于 itemId 是数组，所以我们需要展平它们

//     res.json(flattenedIds); // 返回展平后的 itemId 数组
//     console.log(flattenedIds);
//   } catch (error) {
//     console.error("Error fetching item IDs: ", error);
//     res.status(500).send("Internal Server Error");
//   }
// });

app.get("/api/getItemIds", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }

  try {
    const user = await User.findOne({ username });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 直接从用户的心愿单中提取 itemId
    const itemIds = user.wishlist.map((item) => item.itemId);

    res.json(itemIds); // 返回 itemId 数组
    console.log(itemIds);
  } catch (error) {
    console.error("Error fetching item IDs: ", error);
    res.status(500).send("Internal Server Error");
  }
});

// get similar product
app.get("/getSimilarItems/:itemId", async (req, res) => {
  const itemId = req.params.itemId; // 从 URL 中获取 itemId

  // 检查 itemId 是否提供
  if (!itemId) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  try {
    // 准备调用 eBay API 的参数
    const params = new URLSearchParams({
      "OPERATION-NAME": "getSimilarItems",
      "SERVICE-NAME": "MerchandisingService",
      "SERVICE-VERSION": "1.1.0",
      "CONSUMER-ID": "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c", // 用你的 eBay App ID 替换
      "RESPONSE-DATA-FORMAT": "JSON",
      "REST-PAYLOAD": "",
      itemId: itemId,
      maxResults: "20", // 或任何你想要的结果数量
    });

    // 发起对 eBay API 的请求
    const response = await axios.get(
      `https://svcs.ebay.com/MerchandisingService?${params.toString()}`
    );

    // 发回结果
    res.json(response.data);
  } catch (error) {
    console.error("Error fetching similar items: ", error.message);
    res.status(500).json({
      error: "Failed to fetch similar items.",
      details: error.message,
    });
  }
});

// for photo getting function
const apiKey = "AIzaSyByo8fe0VKf3ZRdybnbZACtTVVMaxe9xS8"; //  Google Custom Search API key
const searchEngineId = "b761d3d029c2246c1"; // search engine ID

app.get("/searchImages/:productTitle", async (req, res) => {
  const productTitle = req.params.productTitle; // 从 URL 中获取产品标题

  if (!productTitle) {
    return res.status(400).json({ error: "Product title is required" });
  }

  try {
    const url = "https://www.googleapis.com/customsearch/v1";

    const params = {
      q: productTitle, // 设置 'q' 为你从 URL 参数中获取的产品标题
      cx: searchEngineId,
      imgSize: "huge",
      imgType: "photo",
      num: 8,
      searchType: "image",
      key: apiKey,
    };

    // 发起带有参数的 GET 请求
    const response = await axios.get(url, { params });

    // 返回结果
    res.json(response.data);
  } catch (error) {
    console.error("Error performing the search:", error.message);
    res.status(500).json({
      error: "Failed to perform the search.",
      details: error.message,
    });
  }
});

// facebook post
app.post("/api/generateFacebookShareLink", (req, res) => {
  const { productName, price, link } = req.body;

  if (!productName || !price || !link) {
    return res
      .status(400)
      .json({ error: "Some essential item properties are missing" });
  }

  const shareContent = `Buy ${productName} at ${price} from ${link} below.`;
  const encodedShareContent = encodeURIComponent(shareContent);
  const shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
    link
  )}&quote=${encodedShareContent}`;

  res.json({ shareUrl });
});

// postal code
app.get("/api/postalCodeSearch", async (req, res) => {
  try {
    const response = await axios.get(
      `http://api.geonames.org/postalCodeSearchJSON`,
      {
        params: {
          postalcode_startsWith: req.query.postalcode_startsWith,
          maxRows: req.query.maxRows,
          username: "jiawei_9904",
          country: "US",
        },
      }
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// recommendation
// recommendation
const natural = require("natural");
const NGrams = natural.NGrams;
async function extractKeywords(titles) {
  const apiKey = "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"; // 替换为你的OpenAI API密钥
  const headers = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${apiKey}`,
  };
  const titlesString = titles.join("\n");
  const data = {
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "You will be provided with some items titles in the user wishlist, and your task is to guess the most possible keywords that the user want to search. Just give me the most possible one and the indexes of the titles which contain this keyword. The format of the answer should be: [keyword, indexes]",
      },
      {
        role: "user",
        content: titlesString,
      },
    ],
    max_tokens: 60,
  };

  try {
    const response = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      data,
      { headers }
    );
    const result = response.data.choices[0].message.content;
    const [keyword, indexes] = JSON.parse(result); // 假设返回的是 "[\"Apple iPhone 13\", [2, 3, 4]]" 形式的字符串
    return { keyword, indexes };
  } catch (error) {
    console.error("Error calling OpenAI API:", error);
    throw error;
  }
}

app.get("/api/recommendations", async (req, res) => {
  try {
    const { username } = req.query;
    if (!username) {
      return res.status(400).send("username required");
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).send("user is not existed");
    }

    let maxShippingCost = 0; // 初始化最大运费为0
    let hasShippingCost = false; // 初始化是否有运费成本的标志
    let allFreeShipping = true;
    let allPaidShipping = true;
    let selectedKeyword = "";
    const titles = user.wishlist.map((item) => item.title[0]);
    const { keyword, indexes } = await extractKeywords(titles);
    selectedKeyword = keyword;
    console.log("current keywords: ", selectedKeyword);
    let maxPrice = 0;
    let minPrice = Number.MAX_SAFE_INTEGER;
    // await user.wishlist.forEach((item) => {
    //   console.log(item.title[0]);
    //   if (item.title[0].toLowerCase().includes(selectedKeyword)) {
    //     const price = parseFloat(
    //       item.sellingStatus[0].currentPrice[0].__value__
    //     );
    //     if (price > maxPrice) maxPrice = price;
    //     if (price < minPrice) minPrice = price;
    //     if (
    //       item.shippingInfo &&
    //       item.shippingInfo[0].shippingType &&
    //       item.shippingInfo[0].shippingType.includes("Free")
    //     ) {
    //       allPaidShipping = false;
    //     } else if (
    //       item.shippingInfo &&
    //       item.shippingInfo[0].shippingServiceCost &&
    //       item.shippingInfo[0].shippingServiceCost[0].__value__ !== "0.0"
    //     ) {
    //       allFreeShipping = false;
    //       const shippingCost = parseFloat(
    //         item.shippingInfo[0].shippingServiceCost[0].__value__
    //       );
    //       if (shippingCost > maxShippingCost) {
    //         maxShippingCost = shippingCost;
    //       }
    //     }
    //   }
    // });
    let allAcceptReturns = true;
    indexes.forEach((index) => {
      const item = user.wishlist[index];
      const price = parseFloat(item.sellingStatus[0].currentPrice[0].__value__);

      if (price > maxPrice) maxPrice = price;
      if (price < minPrice) minPrice = price;

      if (
        item.shippingInfo &&
        item.shippingInfo[0].shippingType &&
        item.shippingInfo[0].shippingType.includes("Free")
      ) {
        allPaidShipping = false;
      } else if (
        item.shippingInfo &&
        item.shippingInfo[0].shippingServiceCost &&
        parseFloat(item.shippingInfo[0].shippingServiceCost[0].__value__) > 0
      ) {
        allFreeShipping = false;
        const shippingCost = parseFloat(
          item.shippingInfo[0].shippingServiceCost[0].__value__
        );
        if (shippingCost > maxShippingCost) maxShippingCost = shippingCost;
      }
      if (item.returnsAccepted[0] === "false") {
        allAcceptReturns = false;
      }
    });

    // const allAcceptReturns = user.wishlist.every(
    //   (item) => item.returnsAccepted[0] === "true"
    // );

    // update user's portait
    user.recommendationParams = {
      selectedKeyword,
      maxPrice,
      minPrice,
      maxShippingCost,
      hasShippingCost,
      allFreeShipping,
      allPaidShipping,
      allAcceptReturns,
    };
    let maxSubmitPrice = maxPrice * 1.5;
    let minSubmitPrice = minPrice * 0.5;
    console.log("min Price:", minSubmitPrice);
    console.log("max Price", maxSubmitPrice);
    // 保存更新
    await user.save();
    const params = {
      "OPERATION-NAME": "findItemsAdvanced",
      "SERVICE-VERSION": "1.0.0",
      "SECURITY-APPNAME": "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c",
      "RESPONSE-DATA-FORMAT": "JSON",
      "REST-PAYLOAD": "",
      keywords: selectedKeyword,
      "paginationInput.entriesPerPage": "300",
      "itemFilter(0).name": "MinPrice",
      "itemFilter(0).value": minSubmitPrice,
      "itemFilter(0).paramName": "Currency",
      "itemFilter(0).paramValue": "USD",
      "itemFilter(1).name": "MaxPrice",
      "itemFilter(1).value": maxSubmitPrice,
      "itemFilter(1).paramName": "Currency",
      "itemFilter(1).paramValue": "USD",
    };

    if (allAcceptReturns) {
      params["itemFilter(2).name"] = "ReturnsAcceptedOnly";
      params["itemFilter(2).value"] = "true";
    }
    console.log("Using keyword for search:", selectedKeyword);

    const response = await axios.get(
      "https://svcs.ebay.com/services/search/FindingService/v1",
      { params }
    );
    console.log(
      "eBay API full response:",
      JSON.stringify(response.data, null, 2)
    );

    console.log(response.data.findItemsAdvancedResponse[0]);
    let items = response.data.findItemsAdvancedResponse[0].searchResult[0].item;
    console.log("eBay API response:", response.data);
    // 根据运费过滤
    console.log(hasShippingCost);
    if (allFreeShipping) {
      items = items.filter((item) => {
        // 使用可选链确保访问安全
        const shippingCostValue =
          item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__;
        const shippingType = item.shippingInfo?.[0]?.shippingType?.[0]; // 确保数组和元素存在
        if (shippingType === "Free") {
          return true; // 如果没有运费数据或为免费运费，则排除这个项目
        } else {
          return false;
        }
      });
    } else if (allPaidShipping) {
      items = items.filter((item) => {
        // 使用可选链确保访问安全
        const shippingCostValue =
          item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__;
        const shippingType = item.shippingInfo?.[0]?.shippingType?.[0]; // 确保数组和元素存在
        if (!shippingCostValue || shippingType === "Free") {
          return false; // 如果没有运费数据或为免费运费，则排除这个项目
        }
        const shippingCost = parseFloat(shippingCostValue);
        return shippingCost <= maxShippingCost && shippingCost !== 0;
      });
    } else {
      items = items.filter((item) => {
        // 使用可选链确保访问安全
        const shippingCostValue =
          item.shippingInfo?.[0]?.shippingServiceCost?.[0]?.__value__;
        const shippingType = item.shippingInfo?.[0]?.shippingType?.[0];
        const shippingCost = parseFloat(shippingCostValue);
        return shippingCost <= maxShippingCost;
      });
    }
    const wishlistItemIds = new Set(
      user.wishlist.map((item) => item.itemId[0])
    );
    items = items.filter((item) => !wishlistItemIds.has(item.itemId[0]));
    res.json(items.slice(0, 10));
  } catch (error) {
    console.error("fail to get data", error);
    res.status(500).send("fail to fetch eBay API");
  }
});

// get user portrait
app.get("/api/recommendationParams", async (req, res) => {
  const { username } = req.query;

  if (!username) {
    return res.status(400).send("username required");
  }

  try {
    const user = await User.findOne({ username }, "recommendationParams");
    if (!user) {
      return res.status(404).send("user is not exisited");
    }

    res.json(user.recommendationParams);
  } catch (error) {
    console.error("fail to get data:", error);
    res.status(500).send("server error");
  }
});

// search auctions
const moment = require("moment");
app.get("/searchAuctions", async (req, res) => {
  const { keywords } = req.query;

  // 计算当前时间加5分钟
  const endTimeLaterThan = moment().add(5, "minutes").toISOString();

  const params = {
    "OPERATION-NAME": "findItemsAdvanced",
    "SERVICE-VERSION": "1.0.0",
    "SECURITY-APPNAME": "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c",
    "RESPONSE-DATA-FORMAT": "JSON",
    "REST-PAYLOAD": "",
    keywords: keywords,
    "paginationInput.entriesPerPage": "50",
    "itemFilter(0).name": "ListingType",
    "itemFilter(0).value": "Auction",
    "itemFilter(1).name": "EndTimeLaterThan",
    "itemFilter(1).value": endTimeLaterThan, // 设置拍卖剩余时间晚于当前时间5分钟
  };

  try {
    const response = await axios.get(
      "https://svcs.ebay.com/services/search/FindingService/v1",
      { params }
    );
    res.json(
      response.data.findItemsAdvancedResponse[0].searchResult[0].item || []
    );
  } catch (error) {
    console.error("Error fetching auction items: ", error);
    res.status(500).json({ message: "Failed to fetch data from eBay." });
  }
});

// fetch competed auction items
// "Apple iPhone 11  128GB  Green Verizon AT&T T-Mobile Unlocked "
async function fetchSimilarItems(itemId) {
  const params = new URLSearchParams({
    "OPERATION-NAME": "getSimilarItems",
    "SERVICE-NAME": "MerchandisingService",
    "SERVICE-VERSION": "1.1.0",
    "CONSUMER-ID": "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c", // 使用你的eBay App ID
    "RESPONSE-DATA-FORMAT": "JSON",
    "REST-PAYLOAD": "",
    ListingType: "Chinese",
    itemId: itemId,
    maxResults: "100", // 你可以调整这个参数以返回不同数量的结果
  });

  try {
    const response = await axios.get(
      `https://svcs.ebay.com/MerchandisingService?${params.toString()}`
    );
    return response.data;
  } catch (error) {
    console.error("Error fetching similar items:", error);
    throw error;
  }
}

app.get("/api/fetchSimilarItems/:itemId", async (req, res) => {
  const itemId = req.params.itemId;
  if (!itemId) {
    return res.status(400).json({ error: "Item ID is required" });
  }

  try {
    const data = await fetchSimilarItems(itemId);
    if (
      data &&
      data.getSimilarItemsResponse &&
      data.getSimilarItemsResponse.itemRecommendations &&
      data.getSimilarItemsResponse.itemRecommendations.item
    ) {
      const items = data.getSimilarItemsResponse.itemRecommendations.item;
      console.log(items);
      // 初始化数据集合
      let noBidCountItems = [];
      let hasBidCountItems = [];

      // 初始化统计变量
      let totalNoBidCountPrice = 0;
      let noBidCountItemsCount = 0;
      let weightedPriceSum = 0;
      let totalBidCounts = 0;

      // 遍历并处理每个item
      items.forEach((item) => {
        const bidCount = item.bidCount ? parseInt(item.bidCount) : -1;
        const priceValue = item.currentPrice
          ? parseFloat(item.currentPrice.__value__)
          : parseFloat(item.buyItNowPrice.__value__);
        const itemData = {
          itemId: item.itemId,
          bidCount: bidCount,
          price: priceValue,
        };
        if (!item.bidCount) {
          // 没有bidCount的item
          noBidCountItems.push(itemData);
          totalNoBidCountPrice += parseFloat(item.buyItNowPrice.__value__);
          noBidCountItemsCount++;
        } else {
          // 有bidCount的item
          auctionBuyNow = parseFloat(item.buyItNowPrice.__value__);
          if (auctionBuyNow != 0.0) {
            totalNoBidCountPrice += auctionBuyNow;
            noBidCountItemsCount++;
          }
          hasBidCountItems.push(itemData);
          weightedPriceSum += priceValue * bidCount;
          totalBidCounts += bidCount;
        }
      });

      // 计算平均数和加权平均数
      const averagePriceNoBid =
        noBidCountItemsCount > 0
          ? totalNoBidCountPrice / noBidCountItemsCount
          : 0;
      const weightedAveragePrice =
        totalBidCounts > 0 ? weightedPriceSum / totalBidCounts : 0;

      // 去掉一个最高和一个最低价格的项目后计算加权平均价格
      let revisedWeightedAveragePrice = weightedAveragePrice;
      if (hasBidCountItems.length > 2) {
        // 排序并去除最高和最低价格的商品
        hasBidCountItems.sort((a, b) => a.price - b.price);
        const trimmedItems = hasBidCountItems.slice(1, -1);
        const revisedWeightedPriceSum = trimmedItems.reduce(
          (sum, item) => sum + item.price * item.bidCount,
          0
        );
        const revisedTotalBidCounts = trimmedItems.reduce(
          (sum, item) => sum + item.bidCount,
          0
        );
        revisedWeightedAveragePrice =
          revisedTotalBidCounts > 0
            ? revisedWeightedPriceSum / revisedTotalBidCounts
            : 0;
      }

      // 返回结果
      res.json({
        totalItems: items.length,
        noBidCountItems: noBidCountItems,
        hasBidCountItems: hasBidCountItems,
        averagePriceNoBid: averagePriceNoBid.toFixed(2),
        weightedAveragePrice: weightedAveragePrice.toFixed(2),
        revisedWeightedAveragePrice: revisedWeightedAveragePrice.toFixed(2),
      });
    } else {
      res.status(404).json({ message: "No items found." });
    }
  } catch (error) {
    console.error("Error when fetching similar items", error);
    res.status(500).json({
      message: "Failed to fetch similar items",
      error: error.message,
    });
  }
});
