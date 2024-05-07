import { Component, Input, OnInit } from "@angular/core";
import { HttpClient, HttpParams } from "@angular/common/http";
import { provideImageKitLoader } from "@angular/common";

@Component({
  selector: "app-similar-product-details",
  templateUrl: "./similar-product-details.component.html",
  styleUrls: ["./similar-product-details.component.css"],
})
export class SimilarProductDetailsComponent {
  // parameters
  @Input() productData: any;
  searchResults: any;
  similarItems: any = [];
  selectedSortCategory: string = "default";
  selectedSortOrder: string = "ascending";
  showMore = false;
  displayedItems: any[] = [];

  constructor(private http: HttpClient) {}
  ngOnInit(): void {
    console.log("in similar product...");
    console.log(this.productData);
    this.getSimilarItems(this.productData.Item.ItemID);
    this.sortProducts();
    this.displayedItems = this.similarItems.slice(0, 5);
  }

  getSimilarItems(itemId: string): void {
    console.log(itemId);
    this.http
      .get(`http://52.8.182.102:3000/getSimilarItems/${itemId}`)
      .subscribe(
        (response) => {
          console.log("Response from backend:", response);
          this.searchResults = response;
          this.similarItems =
            this.searchResults.getSimilarItemsResponse.itemRecommendations.item;
          console.log("items in similar products...");
          console.log(this.similarItems);
          this.updateDisplayedItems();
        },
        (error) => {
          console.error("Error when communicating with backend:", error);
        }
      );
  }
  // extract time
  extractDays(timeLeft: string): string | null {
    const match = timeLeft.match(/P(\d+)D/);
    return match ? match[1] : null;
  }

  sortProducts() {
    if (this.selectedSortCategory === "default") {
      return;
    }

    this.similarItems.sort((a: any, b: any) => {
      let comparison = 0;

      switch (this.selectedSortCategory) {
        case "productName":
          comparison = a.title.localeCompare(b.title);
          break;
        case "daysLeft":
          const daysA = this.extractDays(a.timeLeft);
          const daysB = this.extractDays(b.timeLeft);
          comparison =
            (daysA ? parseInt(daysA) : 0) - (daysB ? parseInt(daysB) : 0);
          break;
        case "price":
          comparison =
            parseFloat(a.buyItNowPrice.__value__) -
            parseFloat(b.buyItNowPrice.__value__);
          break;
        case "shippingCost":
          comparison =
            parseFloat(a.shippingCost.__value__) -
            parseFloat(b.shippingCost.__value__);
          break;
      }

      if (this.selectedSortOrder === "descending") {
        comparison = -comparison;
      }

      return comparison;
    });
    this.updateDisplayedItems();
  }

  // show more / less
  toggleShowMore(): void {
    this.showMore = !this.showMore;
    this.updateDisplayedItems();
  }

  updateDisplayedItems(): void {
    if (this.showMore) {
      this.displayedItems = [...this.similarItems];
    } else {
      this.displayedItems = this.similarItems.slice(0, 5);
    }
  }

  get showMoreButton(): boolean {
    return this.similarItems.length > 5;
  }
}
