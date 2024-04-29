import {
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  Output,
  EventEmitter,
} from "@angular/core";
import { AuctionService } from "../services/auction.service"; // 确保路径正确
import { AuctionStateService } from "../services/auction-state.service";

@Component({
  selector: "app-auctions",
  templateUrl: "./auctions.component.html",
  styleUrls: ["./auctions.component.css"],
})
export class AuctionsComponent implements OnChanges {
  @Input() keywords: string = "";
  @Output() viewAuctionDetails = new EventEmitter<string>();
  innerItem: any[] = []; // 存储拍卖项数据
  selectedItem: any = null; // 跟踪选中的项目
  showDetails: boolean = false; // 控制详情视图的显示
  currentPage: number = 1; // 当前页码
  itemsPerPage: number = 10; // 每页显示的项目数
  totalPages: number = 0; // 总页数，基于项目数计算得出
  private previousKeywords: string = "";
  constructor(
    private auctionService: AuctionService,
    public stateService: AuctionStateService
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes["keywords"] && this.keywords !== this.previousKeywords) {
      this.previousKeywords = this.keywords;
      console.log(this.keywords);
      console.log(this.previousKeywords);
      this.fetchAuctions(this.keywords);
    }
  }

  fetchAuctions(keywords: string): void {
    this.auctionService.searchAuctions(keywords).subscribe(
      (response) => {
        console.log("API response:", response);
        this.innerItem = response; // 假设响应直接是拍卖项数组
        this.totalPages = Math.ceil(this.innerItem.length / this.itemsPerPage);
      },
      (error) => {
        console.error("API call error:", error);
      }
    );
  }

  setSelectedItem(item: any): void {
    this.stateService.selectedItem = item;
    console.log(this.stateService.selectedItem.itemId[0]);
  }

  showDetailsView(): void {
    this.showDetails = true;
    console.log(this.stateService.selectedItem.itemId[0]);
    this.viewAuctionDetails.emit(this.stateService.selectedItem.itemId[0]);
  }

  setPage(page: number): void {
    this.currentPage = page;
  }

  clearTable() {
    this.innerItem = [];
    this.selectedItem = null;
    this.showDetails = false;
    this.stateService.selectedItem = null;
    this.viewAuctionDetails.emit("");
    console.log("for auction cleaning...");
    console.log("current innerItem...", this.innerItem);
    console.log("show details...", this.showDetails);
    console.log("selected auction...", this.stateService.selectedItem);
  }
}
