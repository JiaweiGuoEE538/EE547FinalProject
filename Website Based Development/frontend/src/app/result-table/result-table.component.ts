import { Component, OnInit, EventEmitter, Output } from "@angular/core";
import { SharedService } from "../services/shared.service";
import { HttpClient } from "@angular/common/http";
import { SelectedItemService } from "../services/selected-item.service";
import { FavoriteIconService } from "../services/favorite-icon.service";
import { LoadingService } from "../services/loading.service";
import { AuthenticationService } from "../services/authentication.service";
import { WishlistService } from "../services/wishlist.service";
import { RecommendationService } from "../services/recommendation.service";
@Component({
  selector: "app-result-table",
  templateUrl: "./result-table.component.html",
  styleUrls: ["./result-table.component.css"],
})
export class ResultTableComponent implements OnInit {
  searchResults!: any;
  innerItem: any[] = [];

  // 分页属性
  currentPage: number = 1;
  itemsPerPage: number = 10;

  // details present
  // selectedItem: any = null; // 当前选中的item
  get selectedItem() {
    return this.selectedItemService.selectedItem;
  }
  showDetails: boolean = false; // 是否显示详情页面

  // check if no result
  hasSearched: boolean = false;

  // get single items details
  itemDetails: any;

  // check ids
  idsInDatabase: string[] = [];

  @Output() viewDetails = new EventEmitter<any>(); // Use this to emit the selected item details
  @Output() viewGeneral = new EventEmitter<any>(); // Use this to emit the selected item general info

  constructor(
    private sharedService: SharedService,
    private http: HttpClient,
    private selectedItemService: SelectedItemService,
    private favoriteIconService: FavoriteIconService,
    private loadingService: LoadingService,
    private authService: AuthenticationService, // 注入 AuthenticationService
    private recommendationService: RecommendationService,
    private wishlistService: WishlistService // 注入 WishlistService
  ) {}

  ngOnInit() {
    console.log("current round seearch...", this.innerItem);
    // this.getSelectedItem();
    // this.sharedService.currentData.subscribe((updatedData) => {
    //   // ... 其他代码 ...

    //   console.log('the selected item is...');
    //   // 修改1：使用服务的 selectedItem 属性
    //   console.log(this.selectedItemService.selectedItem);
    // });

    this.sharedService.currentData.subscribe((updatedData) => {
      // this.clearTable();
      if (updatedData) {
        console.log("result table will show...");
        this.hasSearched = true;
        console.log(updatedData);
        this.searchResults = updatedData;
        this.innerItem =
          this.searchResults.findItemsAdvancedResponse[0].searchResult[0].item;
        console.log(this.innerItem);

        this.currentPage = 1;
        // 重要：当你接收到新数据时，你需要重新检查数据库中的项
        this.checkItemsInDatabase();
      }
    });
    this.checkItemsInDatabase();
  }

  get totalPages(): number {
    return Math.ceil(this.innerItem.length / this.itemsPerPage);
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages) {
      return;
    }
    this.currentPage = page;
  }
  // set title length
  truncateTitle(title: string, limit: number = 35): string {
    if (!title) return "N/A";
    return title.length > limit ? title.substring(0, limit) + "..." : title;
  }

  // get selected item
  // getSelectedItem() {
  //   this.selectedItem = this.selectedItemService.selectedItem;
  // }
  // set selected Item
  setSelectedItem(item: any): void {
    // console.log('current item id: ', item.itemId[0]);
    console.log("Selected item before set:", this.selectedItem);
    this.selectedItemService.selectedItem = item;
    // console.log('Selected item after set:', JSON.stringify(this.selectedItem));
    // console.log('selectedItem id: ', this.selectedItem.itemId[0]);
    // console.log(this.selectedItem?.itemId[0] === item.itemId[0]);
  }

  getSingleItem(item: any): void {
    // this.selectedItem = item; // 设置当前选中的item
    this.selectedItemService.selectedItem = item;
    this.showDetails = true; // 显示详情页面
    console.log("get itemId at front!");
    console.log(item.itemId[0]);
    this.loadingService.setLoading(true);
    const apiUrl = `https://hw3ebayadvanced.wl.r.appspot.com/getItemDetails/${item.itemId[0]}`;
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
      console.log(
        "showDetails is now true, selectedItem is:",
        this.selectedItemService.selectedItem
      );
      this.getSingleItem(this.selectedItemService.selectedItem);
    }
    console.log("the item need to show...");
    console.log(this.selectedItemService.selectedItem);
  }

  // wish list function
  // onAddOrRemoveFromCart(item: any, event: Event) {
  //   event.stopPropagation();
  //   item.isActive = !item.isActive; // 切换按钮的状态
  //   this.favoriteIconService.setActiveState(item.isActive); // share the status of the wishlist button
  //   if (item.isActive) {
  //     // 如果按钮现在是活跃状态，添加商品
  //     this.http.post("http://localhost:3000/api/addToCart", item).subscribe(
  //       (response) => console.log(response),
  //       (error) => console.error(error)
  //     );
  //   } else {
  //     // 如果按钮不是活跃状态，从数据库中删除商品
  //     const itemId = item.itemId[0]; // 假设 itemId 是存储在数组中的字符串
  //     this.http
  //       .post("http://localhost:300/api/removeFromCart", {
  //         itemId,
  //       })
  //       .subscribe(
  //         (response) => console.log(response),
  //         (error) => console.error(error)
  //       );
  //   }
  // }
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
          this.loadRecommendationParams(); // Reload recommendation parameters
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
            this.loadRecommendationParams(); // Reload recommendation parameters
          },
          (error) => console.error("Error removing from wishlist: ", error)
        );
    }
  }

  // 新方法：检查数据库中的项并更新状态
  // checkItemsInDatabase(): void {
  //   this.http.get<string[]>("http://localhost:3000/api/getItemIds").subscribe(
  //     (idsInDatabase) => {
  //       console.log("all ids...");
  //       console.log(idsInDatabase);
  //       const flattenedIds = idsInDatabase.flat();
  //       // if (idsInDatabase && this.innerItem) {
  //       //   this.innerItem.forEach((item) => {
  //       //     // 这里是关键，我们需要确保比较的是字符串类型的 itemId [0]
  //       //     item.isActive = idsInDatabase.includes(item.itemId[0]); // 注意这里使用的是 item.itemId[0]
  //       //   });
  //       // }
  //       if (flattenedIds && this.innerItem) {
  //         this.innerItem.forEach((item) => {
  //           // 确保比较的是字符串类型的 itemId [0]
  //           item.isActive = flattenedIds.includes(item.itemId[0]);
  //         });
  //       }
  //     },
  //     (error) => {
  //       console.error("Error fetching item IDs: ", error);
  //     }
  //   );
  // }
  // 新方法：检查数据库中的项并更新状态
  // checkItemsInDatabase(): void {
  //   const currentUser = this.authService.currentUserValue;
  //   console.log(currentUser);
  //   if (!currentUser || !currentUser.user.username) {
  //     console.error("No user logged in or username is not available");
  //     // 可选：重定向到登录页面或显示登录提示
  //     return;
  //   }

  //   const username = currentUser.user.username;
  //   this.http
  //     .get<string[]>(
  //       `http://localhost:3000/api/getItemIds?username=${username}`
  //     )
  //     .subscribe(
  //       (idsInDatabase) => {
  //         console.log("Retrieved IDs from database:", idsInDatabase);
  //         this.innerItem.forEach((item) => {
  //           item.isActive = idsInDatabase.includes(item.itemId[0]);
  //         });
  //       },
  //       (error) => {
  //         console.error("Error fetching item IDs: ", error);
  //       }
  //     );
  // }

  checkItemsInDatabase(): void {
    const currentUser = this.authService.currentUserValue;
    if (!currentUser || !currentUser.user.username) {
      console.error("No user logged in or username is not available");
      return;
    }

    const username = currentUser.user.username;
    this.http
      .get<string[][]>(
        `http://localhost:3000/api/getItemIds?username=${username}`
      )
      .subscribe(
        (nestedIdsInDatabase) => {
          const idsInDatabase = nestedIdsInDatabase.flat(2); // 使用flat(2)确保将嵌套数组转换为一维数组
          console.log("Retrieved IDs from database:", idsInDatabase);
          this.innerItem.forEach((item) => {
            item.isActive = idsInDatabase.includes(item.itemId[0]);
          });
        },
        (error) => {
          console.error("Error fetching item IDs: ", error);
        }
      );
  }

  // clear process
  clearTable() {
    // setTimeout(() =>{});
    console.log("start clearing...");
    console.log("current innerItem...", this.innerItem);
    console.log("current hasSearched...", this.hasSearched);
    console.log("current showDetails...", this.showDetails);
    console.log("current search result...", this.searchResults);
    this.innerItem = []; // 清空数组
    this.hasSearched = false; // 重置搜索标志
    this.showDetails = false;
    this.setSelectedItem(null);
    this.searchResults = null;
    // 可能还需要重置其他与表格内容相关的状态
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
