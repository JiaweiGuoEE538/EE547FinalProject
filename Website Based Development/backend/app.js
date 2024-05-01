const express = require("express");
const axios = require("axios");
const cors = require("cors");
const PORT = process.env.PORT || 3000;

//这里做JWT登录
const app = express();
const jwt = require('jsonwebtoken');

//这里暂时搞不了https加密， 因为我们的域名没有对应的证书，获取证书的过程需要配置
//后期两种：1.继续使用GCP提供给我们的域名，不清楚是否可以自定义域名。2.购买域名网站，且自行配置CA证书

const JWT_SECRET = process.env.JWT_SECRET || 
'4756c5425d0c5ae59ebb9f32258880ff0b92267df1dfcca15355e88717730f351825fd01c46ee7884d5b5457f1663e25cadf2a448eb655b9c4f2ecdd0656ae1e';

const mongoose = require("mongoose");
const router = express.Router();

app.use(cors({ 
  origin: "*" ,
  methods: ['GET', 'POST']}));

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
    console.log("123");
    const response = await axios.get(
      "https://svcs.ebay.com/services/search/FindingService/v1",
      { params: params }
    );
    console.log(params);
    res.json(response.data);
    console.log(response.data);
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

// //如果使用session -> 需要保存session，如果是默认环境下服务器重启会导致session缓存丢失
// //若需要保存session，则需要借助外部服务器如redis
// //否则，使用JWT，并将token储存在浏览器的localStorage中
// app.post("/login", (req, res, next) => {
//   passport.authenticate("local", (err, user, info) => {
//     if (err) {
//       return res.status(500).json({ message: err.message });
//     }
//     if (!user) {
//       // 登录失败，返回前端错误信息
//       return res.status(401).json({ message: info.message });
//     }
//     req.logIn(user, (err) => {
//       if (err) {
//         return res.status(500).json({ message: err.message });
//       }
//       // 登录成功
//       return res.json({ message: "Logged in successfully", user: user });
//     });
//   })(req, res, next);
// });

app.post("/login", (req, res, next) => {
  console.log("user login");
  const {username, password} = req.body;
  passport.authenticate('local', {session : false}, (err, user, info) => {
    if(err){
      return res.status(500).json({message:err.message});
    }

    if(!user){
      return res.status(401).json({message: err.message});
    }

    const token = jwt.sign({id: user.id, username: user.username}, JWT_SECRET, {expiresIn : '1h'});

    res.json({message : 'Logged in successfully', user: user, token: token});
  })(req, res, next);
})

app.post("/logout", (req, res) => {
  req.logout(function (err) {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).send({ message: "Logout failed", error: err });
    }
    res.status(200).send({ message: "Logged out successfully" });
  });
});

// add, remove
const Item = require("./models/item.model"); // 更新这个路径以指向您的模型文件

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

    let allNGrams = [];
    let keywordItems = [];
    let maxShippingCost = 0; // 初始化最大运费为0
    let hasShippingCost = false; // 初始化是否有运费成本的标志
    let allFreeShipping = true;
    let allPaidShipping = true;
    user.wishlist.forEach((item) => {
      const title = item.title[0].toLowerCase();
      const unigrams = title.split(/\s+/);
      const bigrams = NGrams.bigrams(title);
      const trigrams = NGrams.trigrams(title);
      allNGrams.push(
        ...unigrams,
        ...bigrams.map((bigram) => bigram.join(" ")),
        ...trigrams.map((trigram) => trigram.join(" "))
      );
      keywordItems.push(item);
    });

    const stopWords = new Set([
      "a",
      "the",
      "an",
      "of",
      "and",
      "or",
      "none",
      "no",
      "nor",
      "-",
      ".",
    ]);

    const frequency = {};
    allNGrams.forEach((ngram) => {
      if (!stopWords.has(ngram)) {
        frequency[ngram] = (frequency[ngram] || 0) + 1;
      }
    });

    let maxFreq = 0;
    let selectedKeyword = "";
    Object.entries(frequency).forEach(([key, value]) => {
      // 更新最大频率的关键字，如果频率相同，则选择最长的关键字
      if (
        value > maxFreq ||
        (value === maxFreq && key.length > selectedKeyword.length)
      ) {
        maxFreq = value;
        selectedKeyword = key;
      }
    });

    let maxPrice = 0;
    let minPrice = Number.MAX_SAFE_INTEGER;
    user.wishlist.forEach((item) => {
      if (item.title[0].toLowerCase().includes(selectedKeyword)) {
        const price = parseFloat(
          item.sellingStatus[0].currentPrice[0].__value__
        );
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
          item.shippingInfo[0].shippingServiceCost[0].__value__ !== "0.0"
        ) {
          allFreeShipping = false;
          const shippingCost = parseFloat(
            item.shippingInfo[0].shippingServiceCost[0].__value__
          );
          if (shippingCost > maxShippingCost) {
            maxShippingCost = shippingCost;
          }
        }
      }
      console.log(item.shippingInfo.shippingServiceCost);
    });

    const allAcceptReturns = user.wishlist.every(
      (item) => item.returnsAccepted[0] === "true"
    );

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

    // 保存更新
    await user.save();
    console.log(user.recommendationParams);
    const params = {
      "OPERATION-NAME": "findItemsAdvanced",
      "SERVICE-VERSION": "1.0.0",
      "SECURITY-APPNAME": "JiaweiGu-Jiawei57-PRD-4dd800d9a-8dd1f31c",
      "RESPONSE-DATA-FORMAT": "JSON",
      "REST-PAYLOAD": "",
      keywords: selectedKeyword,
      "paginationInput.entriesPerPage": "300",
      "itemFilter(0).name": "MinPrice",
      "itemFilter(0).value": minPrice,
      "itemFilter(0).paramName": "Currency",
      "itemFilter(0).paramValue": "USD",
      "itemFilter(1).name": "MaxPrice",
      "itemFilter(1).value": maxPrice,
      "itemFilter(1).paramName": "Currency",
      "itemFilter(1).paramValue": "USD",
    };

    if (allAcceptReturns) {
      params["itemFilter(2).name"] = "ReturnsAcceptedOnly";
      params["itemFilter(2).value"] = "true";
    }

    const response = await axios.get(
      "https://svcs.ebay.com/services/search/FindingService/v1",
      { params }
    );
    let items = response.data.findItemsAdvancedResponse[0].searchResult[0].item;

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

// class EventEmitter {
//   // 补全代码
//   //on 函数添加事件， emit函数移除事件
//   //同一时间名称可能有多个不同的执行函数
//   constructor() {
//     this.events = {};
//   }
  
//   on(event, listener){
//     if(!this.events[event]){
//       this.events[event] = [];
//     }

//     this.events[event].push(listener);
//   }
  
//   emit(event){
//     if(this.events[event]){
//       this.events[event].forEach(listener => {
//         listener();
//       })
//     }
//   }

//   removeListener(event, listener){
//     if(this.events[event]){
//       this.events[event] = this.events[event].filter(item => item !== listener);
//     }
//   }

//   //移除所有监听器
//   off(event){
//     if(this.events[event]){
//       delete this.events[event];
//     }
//   }
  
// }


