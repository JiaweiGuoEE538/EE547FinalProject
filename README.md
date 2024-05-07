# Full-Stack Website Shopping Application

## Overview

This platform realize the functions both on general search and on user interaction.

### General Search

This platform is an advanced web application designed for product search, leveraging the eBay API to display search results, details, and similar product suggestions.

### User Interaction

This plaform incorporates user interaction features such as product wishlisting and sharing on Facebook account.

Besides, platform also aims to enhance interactions with eBay's auction system, making it easier for users to search, manage, and bid on products efficiently. The platform targets active eBay users and leverages advanced technologies to improve user experience by providing better recommendations and auction functionalities.

## Website Developemnt

### [Access To Deployed Application](http://ee547frontend.s3-website-us-west-1.amazonaws.com/)
To get access to the platform, the developer account is:
- **username:** Jiawei
- **password:** 123

You can use this account to play around if you do not want to register.

### Construction Flow

#### General Search Realization

- **Search Form:** Users can search for products using specific criteria (keyword, category, etc.). The form includes autocomplete for ease of use and validation to ensure accurate input.
  [Search Form Video Demo](https://youtu.be/qiZNtfwdshQ)
- **Results Display:** Search results are shown in a tabular format with pagination. Each listing provides key details and allows adding to a wishlist.
  [Result Display Video Demo](https://youtu.be/LY2qOg5vFXg)
- **Product Details:** Clicking on a product name opens a detailed view with tabs for info, photos, shipping details, seller info, and similar products.
  [Product Details Video Demo](https://youtu.be/AFKidcQSxuE)

#### User Interaction Realization

- **Login and Registration**:
  - New users can register by providing required information, which is validated for uniqueness and security.[Registration Video Demo](https://youtu.be/977lE9rz9lo)
  - Users enter their username and password to access their accounts. The system includes security measures such as encryption and limited login attempts. [Login Video Demo](https://youtu.be/ZvYKETAhmGE)
- **Wishlist Management:** Users can add or remove products from their wishlist, which is stored in MongoDB.
  [Wishlist Management Video Demo](https://youtu.be/zbCboRSzgFc)

- **Recommendations Management:** Users receive product recommendations based on their wishlist contents. The system uses **author created** algorithms to enhance the relevance of suggestions.[Recommendations Management Video Demo](https://youtu.be/zKxEZmh8SdI)

- **Auctions Management:** Users can view and participate in live auctions. The platform offers tools of price prediction analysis to help users make informed decisions during auctions.[Auctions Management Video Demo](https://youtu.be/ErXAQEwj3Os)

- **Social Sharing:** Share product details on social media. [Social Media Sharing Display Demo](https://youtu.be/uXPUM9Z_1bg)
- **Responsive Design:** The application is fully responsive on iPhone 12 Pro, ensuring a seamless experience across devices.
  [Resopnsive Desgin Video Demo](https://youtu.be/5JrSye3IeF4)

### Technology Stack

- **Frontend:**

  - **Angular** for dynamic content rendering
  - **Bootstrap** for responsive design, and Angular Material for UI components.

- **Backend:**

  - **Node.js** with Express framework for server-side logic.

- **Database:**

  - **MongoDB** for storing user wishlists and other user sensitive data.

- **APIs:**

  - **eBay API** for product search and details
  - **Google Customized Search API** for additional product photos
  - **Geonames API** for location autocomplete.
  - **OpenAI Completions** for extracting keywords from items' titles.

- **Deployment:**
  - **Backend** deployed on **Amazon Web Services EC2 Instance** with **Elastic IP Address**
  - **Frontend** deployed on **Amazon Web Services S3 Service**

### Technical Highlights

- **Recommendation Algorithm:** Features a recommendation platform that dynamically generates product suggestions based on users' interactions with the site. This algorithm:

  - **Custom Algorithm for Recommendations:** Tailors suggestions by analyzing user interactions and wishlist data without the use of machine learning, relying instead on a set of statistical methods to ensure relevant and personalized product recommendations.

- **Auction Functionality:** Provides users with access to current auctions, featuring a real-time display of items up for bidding. The system enhances user engagement by offering:

  - **Price Prediction:** Utilizes historical data from similar auctioned items to predict future closing prices, helping users make more informed bidding decisions.

  - **Detailed Analysis:** Offers a comprehensive analysis of similar items' price ranges enabling users to understand market trends and value estimates effectively.

- **RESTful Communication:** Utilizes Angular's HttpClient for efficient data exchange with the backend, showcasing RESTful API integration for seamless JSON data handling.

- **Responsive Design:** Achieved through Angular Material or custom CSS, ensuring the app is fully responsive across various devices and screen sizes.

- **API Integration:** Incorporates multiple external APIs (e.g., eBay, Google Customized Search, Geonames) for advanced data fetching and manipulation, enriching user experience.

- **MongoDB & Cloud Deployment:** Demonstrates MongoDB usage for CRUD operations and cloud deployment on platforms AWS highlighting the app's scalability and global reach.

## Installation

### Repository Structure

- **backend/:** Contains all server-side code.

  - **models/:** Includes Mongoose schemas/models for MongoDB database.
    - **user.model.js**: data structure related to store user sensitive information
  - **app.js:** The main Node.js application file.
  - **package.json:** Lists package dependencies for Node.js.
  - **ebay_oauth_token.js:** Handles OAuth token generation for eBay API.

- **frontend/**: Contains all client-side code.

  - **src/:** Source files for the Angular application.

    - **app/:** Core Angular components.

      - **auction-detail/:** Component for displaying auction item details.
      - **auctions/:** Component to list all auction items.
      - **login/, register/:** Components for user authentication.
      - **recommendation:** Components for user portait and recommendation list display
      - **result-table:** Components for search results display
      - **search-form/:** Component for the search functionality.
      - **wishlist/:** Manages and displays the user's wishlist.
      - **services/:** Services that handle data logic and API requests.
      - **result-wishlist-button:** Components for controlling the states of add / remove button.
      - **details:** Components for display product details of the specific item.

    - **app.component.ts/html/css:** Root Angular component files.
    - **app.module.ts:** Main Angular module.
    - **app-routing.module.ts:** Defines routes for the application.
    - **styles.css:** Global styles for the frontend.
    - **index.html:** Entry HTML file for the Angular application.

### Technical Requirements

- **Node.js**
- **Angular CLI**

### Setup and Installation

1. Clone code.

```bash
git clone https://github.com/JiaweiGuoEE538/EE547FinalProject.git
```

1. **Node.js Setup:** Ensure Node.js is installed. [Node.js Officical Download](https://nodejs.org/en)
1. **Dependencies Installation:** Navigate to both the backend/ and frontend/ directories and run:

```bash
npm install
```

### Configuration

#### eBay API and MongoDB

Currently, For eBay API and MongoDB, APP_ID and APP_KEY has been set to author's personal APP_ID and APP_KEY and they are available.

If you want to use your own:

- **eBay API Configuration:**
  In app.js, make sure that all **APP_ID** and **APP_KEY** will be replaced by your own.

```JavaScript
const client_id = "your_own_id";
const client_secret = "your_own_key";
```

```JavaScript
// check each request, for example
const params = {
    callname: "GetSingleItem",
    responseencoding: "JSON",
    appid: "your_own_id", // change here
    siteid: "0",
    version: "967",
    ItemID: item_id,
    IncludeSelector: "Description,Details,ItemSpecifics",
  };
```

- **MongoDB Connection:**
  - Make sure you have your own valid MongoDB account.
  - In app.js, change URL into your own:
  ```JavaScript
  const mongoDBUrl =
  "your_own_url"; // change this
  ```

#### OpenAI Completion

currently, openAI completion(GPT-4) is not free and the author's account can keep this API active for approximately 1 month. To use your own API account, change following app.js part into your own:

```JavaScript
async function extractKeywords(titles) {
  const apiKey = "your_own_key";
  ...
}
```

### Running the Application

#### Run On Local Computer

In initally downloaded package, frontend has already been connected with AWS EC2 instance created by author. To run the project locally, change frontend request like this:

```JavaScript
// initially
this.http.get(`http://52.8.182.102:3000/...`);
this.http.post(`http://l52.8.182.102:3000/...`);
// change into
this.http.get(`http://localhost:3000/...`);
this.http.post(`http://localhost:3000/...`);
```

After revising code, start the backend:

```bash
cd backend
node app.js
```

Launch the Frontend:

```bash
cd frontend
ng serve
```

Navigate to http://localhost:4200 in a web browser to view the application.

#### Run By Using Deployed Frontend and Backend

See **"Access To Deployed Application"** part.

## Acknowledgements

- Thanks to the eBay API for providing the rich set of resources
- Appreciation for Bootstrap for their excellent UI components.

- Extend deepest gratitude to Amazon Web Services (AWS) for their invaluable support throughout the development and deployment phases of this project.
