import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { WishlistService } from "../services/wishlist.service";
import { HttpClient } from "@angular/common/http";
import { SelectedItemService } from "../services/selected-item.service";
import { FavoriteIconService } from "../services/favorite-icon.service";
import { LoadingService } from "../services/loading.service";
import { AuthenticationService } from "../services/authentication.service";
import { RecommendationService } from "../services/recommendation.service";
@Component({
  selector: "app-wishlist",
  templateUrl: "./wishlist.component.html",
  styleUrls: ["./wishlist.component.css"],
})
export class WishlistComponent implements OnInit {
  wishlistItems: any[] = [];
  // selectedItem: any = null; // 添加一个新的属性来跟踪选中的项
  showDetails: boolean = false; // 是否显示详情页面
  itemDetails: any; // get single items details
  get selectedItem() {
    return this.selectedItemService.selectedItem;
  }
  @Output() viewDetails = new EventEmitter<any>(); // Use this to emit the selected item details
  @Output() viewGeneral = new EventEmitter<any>(); // Use this to emit the selected item general info
  constructor(
    private wishlistService: WishlistService,
    private http: HttpClient,
    private favoriteIconService: FavoriteIconService,
    private selectedItemService: SelectedItemService,
    private loadingService: LoadingService,
    private recommendationService: RecommendationService,
    private authService: AuthenticationService
  ) {}

  ngOnInit() {
    this.loadingService.setLoading(true);
    this.loadWishlist();
    this.loadingService.setLoading(false);
  }

  // loadWishlist() {
  //   this.wishlistService.getWishlist().subscribe(
  //     (data) => {
  //       this.wishlistItems = data;
  //       console.log("In wishlist...");
  //       console.log(this.wishlistItems);
  //       // 假设每个从数据库中检索到的项都是激活的
  //       const itemIdsFromDB = data.map((item: any) => item.itemId);
  //       this.wishlistItems.forEach((item) => {
  //         item.isActive = itemIdsFromDB.includes(item.itemId);
  //         console.log(
  //           "for shipping options...",
  //           item.shippingInfo[0].shippingServiceCost[0].__value__
  //         );
  //       });
  //     },
  //     (error) => {
  //       console.error("There was an error!", error);
  //     }
  //   );
  // }
  loadWishlist() {
    const username = this.authService.currentUserValue.user.username;

    if (username) {
      this.wishlistService.getWishlist(username).subscribe(
        (data) => {
          this.wishlistItems = data;
          console.log("In wishlist...");
          console.log(this.wishlistItems);
          const itemIdsFromDB = data.map((item: any) => item.itemId);
          this.wishlistItems.forEach((item) => {
            item.isActive = itemIdsFromDB.includes(item.itemId);
            console.log(
              "for shipping options...",
              item.shippingInfo[0].shippingServiceCost[0].__value__
            );
          });
        },
        (error) => {
          console.error("There was an error!", error);
        }
      );
    } else {
      console.error("No username found, unable to load wishlist");
    }
  }

  // 新方法处理移除操作
  // 处理从愿望清单和数据库中删除项
  // removeItem(item: any, event: Event) {
  //   event.stopPropagation();
  //   this.wishlistService.removeFromWishlist(item.itemId).subscribe(
  //     (response) => {
  //       // 从视图列表中移除该项
  //       this.wishlistItems = this.wishlistItems.filter(
  //         (i) => i.itemId !== item.itemId
  //       );
  //       this.favoriteIconService.setActiveState(item.isActive);
  //     },
  //     (error) => {
  //       console.error("Error removing item from wishlist", error);
  //     }
  //   );
  // }
  removeItem(item: any, event: Event) {
    event.stopPropagation();
    const username = this.authService.currentUserValue.user.username; // 获取当前用户名

    this.wishlistService.removeFromWishlist(item.itemId, username).subscribe(
      (response) => {
        // 更新视图列表
        this.wishlistItems = this.wishlistItems.filter(
          (i) => i.itemId !== item.itemId
        );
        this.loadRecommendationParams();
        console.log("Item removed successfully from the wishlist");
      },
      (error) => {
        console.error("Error removing item from wishlist", error);
      }
    );
  }

  // develop details button
  // 当用户点击一行时调用
  selectItem(item: any) {
    this.selectedItemService.selectedItem = item;
    this.showDetails = true;
  }

  setSelectedItem(item: any): void {
    this.selectedItemService.selectedItem = item;
  }

  getSingleItem(item: any): void {
    this.loadingService.setLoading(true);
    this.selectedItemService.selectedItem = item;
    this.showDetails = true; // 显示详情页面
    console.log("get itemId at front!");
    console.log("current object...", this.selectedItemService.selectedItem);
    console.log(this.selectedItemService.selectedItem.itemId);
    const apiUrl = `https://hw3ebayadvanced.wl.r.appspot.com/getItemDetails/${this.selectedItemService.selectedItem.itemId}`;
    this.http.get(apiUrl).subscribe(
      (response) => {
        console.log(response);
        this.itemDetails = response; // get the item details
        this.viewDetails.emit(this.itemDetails); // send the details
        console.log("general in result-table...");
        console.log(this.selectedItem);
        this.viewGeneral.emit(this.selectedItem); // send the general one
        this.loadingService.setLoading(false);
      },
      (error) => {
        console.error("Error fetching single item:", error);
      }
    );
  }

  // backToList(): void {
  //   this.showDetails = false; // 隐藏详情页面
  // }

  showDetailsView(): void {
    if (this.selectedItemService.selectedItem) {
      this.showDetails = true;
      this.getSingleItem(this.selectedItemService.selectedItem);
    }
    console.log("the item need to show...");
    console.log(this.selectedItemService.selectedItem);
  }

  // set title length
  truncateTitle(title: string, limit: number = 35): string {
    if (!title) return "N/A";
    return title.length > limit ? title.substring(0, limit) + "..." : title;
  }

  // for total price
  getTotalPrice(): string {
    let total = this.wishlistItems.reduce((acc, item) => {
      let price =
        item.sellingStatus &&
        item.sellingStatus[0].convertedCurrentPrice &&
        item.sellingStatus[0].convertedCurrentPrice[0].__value__
          ? parseFloat(item.sellingStatus[0].convertedCurrentPrice[0].__value__)
          : 0;
      return acc + price;
    }, 0);
    return total.toFixed(2);
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
