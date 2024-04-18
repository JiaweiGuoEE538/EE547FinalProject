import {
  Component,
  EventEmitter,
  Output,
  Input,
  SimpleChanges,
} from "@angular/core";
import { SharedService } from "../services/shared.service"; // 确保路径正确
import { AuthenticationService } from "../services/authentication.service";
@Component({
  selector: "app-result-wishlist-button",
  templateUrl: "./result-wishlist-button.component.html",
  styleUrls: ["./result-wishlist-button.component.css"],
})
export class ResultWishlistButtonComponent {
  activeButton: "result" | "wishlist" | "recommendations" = "result"; // 包括推荐状态
  @Output() wishlistClicked = new EventEmitter<void>();
  @Output() resultsClicked = new EventEmitter<void>();
  @Output() recommendationsClicked = new EventEmitter<void>(); // 新增发射器
  @Input() active!: "result" | "wishlist" | "recommendations"; // 接收外部的激活状态

  isLoggedIn = false; // Track user's login status
  constructor(
    private authService: AuthenticationService,
    private sharedService: SharedService
  ) {
    // 监听用户登录状态
    this.authService.currentUser.subscribe((user) => {
      this.isLoggedIn = !!user;
      if (!user) {
        this.sharedService.updateActiveButton("result"); // 登出时自动切换到 Results
      }
    });
  }

  ngOnInit() {
    this.authService.currentUser.subscribe((user) => {
      console.log("current user:", user);
      this.isLoggedIn = !!user; // Update login status based on user's presence
    });
  }
  ngOnChanges(changes: SimpleChanges) {
    if (changes["active"] && this.active) {
      this.toggleButton(this.active);
    }
  }

  toggleButton(buttonType: "result" | "wishlist" | "recommendations") {
    this.activeButton = buttonType;
    this.sharedService.updateActiveButton(buttonType);
    if (buttonType === "wishlist") {
      this.wishlistClicked.emit();
    } else if (buttonType === "result") {
      this.resultsClicked.emit();
    } else if (buttonType === "recommendations") {
      this.recommendationsClicked.emit(); // 处理推荐按钮点击
    }
  }
}
