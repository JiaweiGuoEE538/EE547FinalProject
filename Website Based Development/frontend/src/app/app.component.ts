import { Component, ViewChild } from "@angular/core";
import { SharedService } from "./services/shared.service";
import { ResultTableComponent } from "./result-table/result-table.component";
@Component({
  selector: "app-root",
  templateUrl: "./app.component.html",
  styleUrls: ["./app.component.css"],
})
export class AppComponent {
  title = "frontend";
  activeButton!: "result" | "wishlist" | "recommendations";
  // 控制是否显示详情组件
  showDetails: boolean = false;
  showResults: boolean = true;
  @ViewChild(ResultTableComponent, { static: false })
  resultTableComponent?: ResultTableComponent;
  isResultTableComponentLoaded: boolean = false;

  // 用于存储选中行的数据，如果需要的话
  itemDetails: any = null; // Holds the currently selected item details
  itemGeneral: any = null; // holds the general info
  constructor(private sharedService: SharedService) {}

  ngOnInit() {
    this.sharedService.currentActiveButton.subscribe((buttonType) => {
      this.activeButton = buttonType;
    });
  }

  handleViewDetails(item: any) {
    this.itemDetails = item; // Set the selected item based on what was clicked
    this.itemGeneral = item;
    this.showDetails = true; // Show the details component
  }

  // 当从列表组件接收到一般信息时调用
  onGeneralReceived(itemGeneral: any) {
    this.itemGeneral = itemGeneral; // 保存一般信息
    // 不需要改变视图，因为这只是额外的信息
  }

  // Method to handle going back to the list from the details view
  handleBackToList() {
    this.showDetails = false; // Hide the details component
    // this.itemDetails = null; // Clear the selection
    // this.itemGeneral = null;
    // this.loadingService.setLoading(false);
  }

  goToWishlist() {
    this.showDetails = false; // Hide the details view
    this.activeButton = "wishlist"; // Set the active button to 'wishlist'
  }

  // clear process
  handleFormCleared() {
    // 切换到 'result' 按钮
    this.activeButton = "result";
    this.showDetails = false;
    // 清空 result-table 组件内容
    this.showResults = true;
    setTimeout(() => {
      if (this.resultTableComponent) {
        this.resultTableComponent.clearTable();
        setTimeout(() => {
          this.showResults = false;
        }, 10);
      } else {
        console.error("ResultTableComponent is not available.");
      }
    });
    this.showResults = true;
    // this.handleShowResult();
  }
  handleShowResult() {
    this.showResults = false;
  }

  handleHideDetails() {
    // 隐藏details组件
    this.showDetails = false;
    // 切换result-wishlist-button的状态
    this.activeButton = "result";
    this.handleFormCleared();
  }

  goToResults() {
    this.showDetails = false; // Hide the details view
    this.activeButton = "result"; // Set the active button to 'result'
  }

  goToRecommendation() {
    this.showDetails = false; // Hide details view when viewing recommendations
    this.activeButton = "recommendations"; // Set the active button state
  }
}
