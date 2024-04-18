import { Component, Input, Output, EventEmitter } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { FavoriteIconService } from "../services/favorite-icon.service";
import { LoadingService } from "../services/loading.service";
import { AuthenticationService } from "../services/authentication.service";
import { WishlistService } from "../services/wishlist.service";
import { RecommendationService } from "../services/recommendation.service";
@Component({
  selector: "app-details",
  templateUrl: "./details.component.html",
  styleUrls: ["./details.component.css"],
})
export class DetailsComponent {
  @Input() itemDetails: any; // This property will receive the selected item from the parent
  @Input() itemGeneral: any;
  @Output() backToListEvent = new EventEmitter<void>(); // Event to inform the parent component to show the list again
  inWishList: boolean = false;
  activeSection: string = "product"; // Default section to show is 'product'
  constructor(
    private http: HttpClient,
    private favoriteIconService: FavoriteIconService,
    private loadingService: LoadingService,
    private authService: AuthenticationService,
    private recommendationService: RecommendationService,
    private wishlistService: WishlistService // 注入 WishlistService
  ) {}

  ngOnInit(): void {
    // Any initialization logic for the component can go here
    // For example, you might want to check that itemDetails is not null
    console.log("Complete itemDetails:", this.itemDetails);
    console.log("title:...");
    console.log(this.itemDetails.Item.Title);
    console.log("check general info...");
    console.log(this.itemGeneral);
    this.favoriteIconService.isActive$.subscribe((isActive) => {
      console.log("State in DetailsComponent:", isActive);
      this.inWishList = isActive;
    });
    // 检查当前项目是否在愿望清单中
    console.log(this.itemGeneral.itemId[0]);
    this.checkIfItemInWishlist(this.itemGeneral.itemId[0]);
  }

  // Handle the click event of the Back button
  backToList(): void {
    this.loadingService.setLoading(true);
    this.backToListEvent.emit(); // Inform the parent component to switch the view back to the list
    this.loadingService.setLoading(false);
  }

  // Method to change the active section in the details view
  setActiveSection(section: string): void {
    this.activeSection = section; // Change the current active section
  }

  // for function of adding and removing in mongoDB
  // onAddOrRemoveFromCart() {
  //   console.log("Before:", this.inWishList);
  //   this.inWishList = !this.inWishList;
  //   console.log("After:", this.inWishList);
  //   // this.inWishList = !this.inWishList; // 切换按钮的状态
  //   this.favoriteIconService.setActiveState(this.inWishList); // share the status of the wishlist button
  //   if (this.inWishList) {
  //     // 如果按钮现在是活跃状态，添加商品
  //     this.http
  //       .post("http://localhost:3000/api/addToCart", this.itemGeneral)
  //       .subscribe(
  //         (response) => console.log(response),
  //         (error) => console.error(error)
  //       );
  //   } else {
  //     // 如果按钮不是活跃状态，从数据库中删除商品
  //     const itemId = this.itemGeneral.itemId[0]; // 假设 itemId 是存储在数组中的字符串
  //     console.log("need to delete...", itemId);
  //     this.http
  //       .post("http://localhost:3000/api/removeFromCart", {
  //         itemId,
  //       })
  //       .subscribe(
  //         (response) => console.log(response),
  //         (error) => console.error(error)
  //       );
  //   }
  // }
  onAddOrRemoveFromCart() {
    console.log("Before:", this.inWishList);
    this.inWishList = !this.inWishList;
    console.log("After:", this.inWishList);
    // this.inWishList = !this.inWishList; // 切换按钮的状态
    this.favoriteIconService.setActiveState(this.inWishList); // share the status of the wishlist button

    const username = this.authService.currentUserValue.user.username; // 获取当前用户名
    if (!username) {
      console.error("No username available. User might not be logged in.");
      return;
    }

    if (this.inWishList) {
      // 如果按钮现在是活跃状态，添加商品至愿望清单
      this.wishlistService.addToWishlist(this.itemGeneral, username).subscribe(
        (response) => {
          console.log("Added to wishlist: ", response);
          this.loadRecommendationParams(); // Reload recommendation parameters
        },
        (error) => console.error("Error adding to wishlist: ", error)
      );
    } else {
      // 如果按钮不是活跃状态，从愿望清单中删除商品
      this.wishlistService
        .removeFromWishlist(this.itemGeneral.itemId[0], username)
        .subscribe(
          (response) => {
            console.log("Removed from wishlist: ", response);
            this.loadRecommendationParams(); // Reload recommendation parameters
          },
          (error) => console.error("Error removing from wishlist: ", error)
        );
    }
  }

  // share on facebook
  shareOnFacebook() {
    if (!this.itemDetails || !this.itemDetails.Item) {
      console.error("Item details are not available");
      return;
    }

    const productName = this.itemDetails.Item.Title;
    const price = this.itemDetails.Item.CurrentPrice?.Value;
    const link = this.itemDetails.Item.ViewItemURLForNaturalSearch;

    this.http
      .post(
        "https://hw3ebayadvanced.wl.r.appspot.com/api/generateFacebookShareLink",
        {
          productName,
          price,
          link,
        }
      )
      .subscribe(
        (response: any) => {
          if (response && response.shareUrl) {
            window.open(response.shareUrl, "_blank");
          }
        },
        (error) => {
          console.error("Failed to generate Facebook share link", error);
        }
      );
  }

  // 新方法：检查当前项目是否在愿望清单中
  // checkIfItemInWishlist(itemId: string): void {
  //   this.http.get<string[]>("http://localhost:3000/api/getItemIds").subscribe(
  //     (idsInDatabase) => {
  //       console.log("current id...", itemId);
  //       const flattenedIds = idsInDatabase.flat();
  //       console.log("get all ids in details...", flattenedIds);
  //       if (flattenedIds) {
  //         this.inWishList = flattenedIds.includes(itemId);
  //       }
  //     },
  //     (error) => {
  //       console.error("Error checking item in wishlist:", error);
  //     }
  //   );
  // }
  checkIfItemInWishlist(itemId: string): void {
    const username = this.authService.currentUserValue.user.username; // 从 AuthenticationService 获取当前用户名
    console.log("current user: ", username);
    if (!username) {
      console.error("No user logged in");
      return;
    }

    this.http
      .get<string[]>(
        `http://localhost:3000/api/getItemIds?username=${username}`
      )
      .subscribe(
        (idsInDatabase) => {
          console.log("Current item ID:", itemId);
          console.log("All item IDs in wishlist:", idsInDatabase);
          this.inWishList = idsInDatabase.includes(itemId); // 直接检查 itemId 是否存在于返回的数组中
        },
        (error) => {
          console.error("Error checking item in wishlist:", error);
        }
      );
  }
  loadRecommendationParams() {
    const username = this.authService.currentUserValue.user.username;
    if (username) {
      this.recommendationService.getRecommendationParams();
    } else {
      console.error(
        "Username is required for fetching recommendation parameters."
      );
    }
  }
}
