import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { AuctionService } from "../services/auction.service";
import { AuctionStateService } from "../services/auction-state.service";
interface PriceRangeData {
  [key: string]: {
    minPrice: number;
    maxPrice: number;
    ranges: Array<{ range: string; count: number }>;
  };
}

@Component({
  selector: "app-auction-detail",
  templateUrl: "./auction-detail.component.html",
  styleUrls: ["./auction-detail.component.css"],
})
export class AuctionDetailComponent implements OnChanges {
  @Input() auctionId: string | null = null;
  @Output() back = new EventEmitter<void>();
  similarItems: any;
  priceRangeData: PriceRangeData = {};
  indicatedPrice: string | number = "-";
  description: string = "";
  constructor(
    private auctionService: AuctionService,
    public auctionStateService: AuctionStateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["auctionId"] && this.auctionId) {
      this.fetchSimilarItems(this.auctionId);
    }
  }

  fetchSimilarItems(itemId: string): void {
    this.auctionService.fetchSimilarItems(itemId).subscribe(
      (data) => {
        this.similarItems = data;
        this.calculateIndicatedPrice();
        console.log(this.similarItems);
        this.priceRangeData = this.preparePriceData(data);
      },
      (error) => {
        console.error("Error fetching similar items:", error);
      }
    );
  }

  preparePriceData(data: any): PriceRangeData {
    console.log(this.auctionStateService.selectedItem.viewItemURL[0]);
    const result: PriceRangeData = {};
    ["noBidCountItems", "hasBidCountItems"].forEach((type) => {
      const items = data[type];
      const prices = items.map((item: any) => item.price);
      const minPrice = Math.min(...prices);
      const maxPrice = Math.max(...prices);
      const rangeSize = (maxPrice - minPrice) / 5;
      const bins = new Array(5).fill(0).map(() => ({ count: 0 }));

      items.forEach((item: any) => {
        const price = item.price;
        const index = Math.min(Math.floor((price - minPrice) / rangeSize), 4);
        bins[index].count++;
      });

      result[type] = {
        minPrice,
        maxPrice,
        ranges: bins.map((bin, idx) => ({
          range: `${(minPrice + rangeSize * idx).toFixed(2)} - ${(
            minPrice +
            rangeSize * (idx + 1)
          ).toFixed(2)}`,
          count: bin.count,
        })),
      };
    });
    return result;
  }

  shouldShowDownwardGreenArrow(): boolean {
    if (!this.similarItems || !this.auctionStateService.selectedItem) {
      return false;
    }
    const currentPrice = parseFloat(
      this.auctionStateService.selectedItem.sellingStatus[0]
        .convertedCurrentPrice[0].__value__
    );
    const highestBid = parseFloat(this.similarItems.averagePriceNoBid);
    return highestBid > currentPrice;
  }

  shouldShowUpwardRedArrow(): boolean {
    if (!this.similarItems || !this.auctionStateService.selectedItem) {
      return false;
    }
    const currentPrice = parseFloat(
      this.auctionStateService.selectedItem.sellingStatus[0]
        .convertedCurrentPrice[0].__value__
    );
    const highestBid = parseFloat(this.similarItems.averagePriceNoBid);
    return highestBid < currentPrice;
  }

  shouldShowUpwardGreenArrow(): boolean {
    if (!this.similarItems || !this.auctionStateService.selectedItem) {
      return false;
    }
    const revisedPrice = parseFloat(
      this.similarItems.revisedWeightedAveragePrice
    );
    const currentPrice = parseFloat(
      this.auctionStateService.selectedItem.sellingStatus[0]
        .convertedCurrentPrice[0].__value__
    );
    const highestBid = parseFloat(this.similarItems.averagePriceNoBid);

    console.log("Revised Price:", revisedPrice);
    console.log("Current Price:", currentPrice);
    console.log("Highest Bid:", highestBid);
    console.log(
      "Condition result:",
      revisedPrice > currentPrice && revisedPrice < highestBid
    );

    return revisedPrice > currentPrice && revisedPrice < highestBid;
  }

  shouldShowUpwardRedArrowForRevised(): boolean {
    if (!this.similarItems || !this.auctionStateService.selectedItem) {
      return false;
    }
    const currentPrice = parseFloat(
      this.auctionStateService.selectedItem.sellingStatus[0]
        .convertedCurrentPrice[0].__value__
    );
    const revisedPrice = parseFloat(
      this.similarItems.revisedWeightedAveragePrice
    );
    return revisedPrice < currentPrice;
  }

  calculateIndicatedPrice(): void {
    if (this.similarItems) {
      const highestBid = parseFloat(this.similarItems.averagePriceNoBid);
      const otherOffer = parseFloat(
        this.similarItems.revisedWeightedAveragePrice
      );
      const currentPrice = parseFloat(
        this.auctionStateService.selectedItem.sellingStatus[0]
          .convertedCurrentPrice[0].__value__
      );

      if (highestBid > currentPrice && otherOffer > currentPrice) {
        // common believe value higher than current price
        this.indicatedPrice = ((highestBid + otherOffer) / 2).toFixed(2); // most likely get the price
        this.description = `Given that the maximum value of the bidding item is ${highestBid} USD which is higher that current price ${currentPrice} USD and the common believe that the item's current value is ${otherOffer} USD which is also higher than current price ${currentPrice} USD, it means that current item has some room for bargin. The final bidding price is likey to be ${this.indicatedPrice} USD`;
      } else if (highestBid > currentPrice && otherOffer < currentPrice) {
        // common believe value is less than current price
        let upperBound = (currentPrice + highestBid) / 2;
        let lowerBound = Math.max(currentPrice, (highestBid + otherOffer) / 2);
        this.indicatedPrice = Math.max(upperBound, lowerBound).toFixed(2);
        this.description = `Given that the maximum value of the bidding item is ${highestBid} USD which is higher that current price ${currentPrice} USD, but the common believe that the item's current value is ${otherOffer} USD which is lower than current price ${currentPrice} USD, it means that at this time, this item's value may not worth the money shown on the bidding price. The final bidding price is likey to be ${this.indicatedPrice} USD`;
      } else {
        // the maximum value is less than current price
        this.description = `Given that the maximum value of the bidding item is ${highestBid} USD which is higher that current price ${currentPrice} USD, it means that current price will never worth the value shown on the bidding price. This bid is valueless`;
        this.indicatedPrice = "-";
      }
    } else {
      this.indicatedPrice = "-";
    }
  }
  // to the ebay bid platform
  goToEbay(): void {
    const url = this.auctionStateService.selectedItem.viewItemURL[0];
    window.open(url, "_blank");
  }
}
