import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { RecommendationService } from "../services/recommendation.service";
import { SelectedItemService } from "../services/selected-item.service";
import { LoadingService } from "../services/loading.service";
import { AuthenticationService } from "../services/authentication.service";
import { HttpClient } from "@angular/common/http";
import { WishlistService } from "../services/wishlist.service";
import { FavoriteIconService } from "../services/favorite-icon.service";
import { ChangeDetectorRef } from "@angular/core";
@Component({
  selector: "app-recommendation",
  templateUrl: "./recommendation.component.html",
  styleUrls: ["./recommendation.component.css"],
})
export class RecommendationComponent implements OnInit {
  itemsInWishlist: any;
  recommendationParams: any;
  recommendationItems: any[] = [];
  showDetails: boolean = false; // 是否显示详情页面
  selectedItem: any = null; // 添加一个新的属性来跟踪选中的项
  itemDetails: any; // get single items details
  @Output() viewDetails = new EventEmitter<any>(); // Use this to emit the selected item details
  @Output() viewGeneral = new EventEmitter<any>(); // Use this to emit the selected item general info

  constructor(
    private recommendationService: RecommendationService,
    private selectedItemService: SelectedItemService,
    private loadingService: LoadingService,
    private authService: AuthenticationService,
    private favoriteIconService: FavoriteIconService,
    private wishlistService: WishlistService, // 注入 WishlistService
    private cd: ChangeDetectorRef,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.updateWishlistItemCount();
    this.loadRecommendations();
    this.recommendationService.loadAndUpdateRecommendationParams();
    console.log("current params", this.recommendationParams);
    this.recommendationService.recommendationParams$.subscribe((params) => {
      this.recommendationParams = params;
      this.cd.detectChanges();
    });
    console.log("current params", this.recommendationParams);
  }

  loadRecommendations() {
    this.loadingService.setLoading(true);
    this.recommendationService.getRecommendations().subscribe({
      next: (data) => {
        this.recommendationItems = data;
        this.loadingService.setLoading(false);
        this.recommendationService.loadAndUpdateRecommendationParams();
        console.log("Recommendations loaded:", this.recommendationItems);
      },
      error: (error) => {
        console.error("Failed to load recommendations:", error);
        this.loadingService.setLoading(false);
      },
    });
  }

  setSelectedItem(item: any) {
    this.selectedItem = item;
    this.selectedItemService.selectedItem = item;
    this.showDetails = true;
    // this.viewDetails.emit(item);
  }

  // showDetailsView() {
  //   if (this.selectedItem) {
  //     this.viewDetails.emit(this.selectedItem);
  //   }
  // }
  selectItem(item: any) {
    this.selectedItemService.selectedItem = item;
    this.showDetails = true;
  }

  // getSingleItem(item: any) {
  //   this.selectedItemService.selectedItem = item;
  //   this.showDetails = true; // 显示详情页面
  //   console.log("get itemId at front!");
  //   console.log("current object...", this.selectedItemService.selectedItem);
  //   console.log(this.selectedItemService.selectedItem.itemId);
  //   const apiUrl = `http://localhost:3000/getItemDetails/${this.selectedItemService.selectedItem.itemId}`;
  //   this.http.get<any>(apiUrl).subscribe({
  //     // 使用 HttpClient
  //     next: (response: any) => {
  //       // 明确类型为any
  //       console.log(response);
  //       // 进一步处理响应
  //     },
  //     error: (error: any) => {
  //       // 明确类型为any
  //       console.error("Error fetching item details:", error);
  //     },
  //   });
  // }
  getSingleItem(item: any): void {
    this.loadingService.setLoading(true);
    this.selectedItemService.selectedItem = item;
    this.showDetails = true; // 显示详情页面
    console.log("get itemId at front!");
    console.log("current object...", this.selectedItemService.selectedItem);
    console.log(this.selectedItemService.selectedItem.itemId);
    const apiUrl = `http://52.8.182.102:3000/getItemDetails/${this.selectedItemService.selectedItem.itemId}`;
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

  // 可以设置标题的长度
  truncateTitle(title: string, limit: number = 35): string {
    if (!title) return "N/A";
    return title.length > limit ? title.substring(0, limit) + "..." : title;
  }

  onAddOrRemoveFromCart(item: any, event: Event) {
    event.stopPropagation();
    item.isActive = !item.isActive; // Toggle the active state
    this.favoriteIconService.setActiveState(item.isActive); // Update the icon state

    const username = this.authService.currentUserValue.user.username; // Get current username
    if (item.isActive) {
      // If the item is now active, add to wishlist
      this.wishlistService.addToWishlist(item, username).subscribe(
        (response) => {
          console.log("Added to wishlist: ", response);
          this.recommendationService.loadAndUpdateRecommendationParams();
          this.updateWishlistItemCount();
        },
        (error) => console.error("Error adding to wishlist: ", error)
      );
    } else {
      // If the item is not active, remove from wishlist
      this.wishlistService
        .removeFromWishlist(item.itemId[0], username)
        .subscribe(
          (response) => {
            console.log("Removed from wishlist: ", response);
            this.recommendationService.loadAndUpdateRecommendationParams();
            this.updateWishlistItemCount();
          },
          (error) => console.error("Error removing from wishlist: ", error)
        );
    }
  }

  checkItemsInDatabase(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.user.username) {
      console.error("No user logged in or username is not available");
      return;
    }

    const username = currentUser.user.username;
    this.http
      .get<string[]>(
        `http://52.8.182.102:3000/api/getItemIds?username=${username}`
      )
      .subscribe(
        (idsInDatabase) => {
          console.log("Retrieved IDs from database:", idsInDatabase);
          console.log(idsInDatabase.length);
          this.recommendationItems.forEach((item) => {
            item.isActive = idsInDatabase.includes(item.itemId[0]);
          });
        },
        (error) => {
          console.error("Error fetching item IDs: ", error);
        }
      );
  }
  updateWishlistItemCount() {
    const username = this.authService.currentUserValue.user.username;
    this.wishlistService.getWishlistItemCount(username).subscribe((count) => {
      this.itemsInWishlist = count;
      this.cd.detectChanges(); // 触发变更检测以更新视图
    });
  }
}
