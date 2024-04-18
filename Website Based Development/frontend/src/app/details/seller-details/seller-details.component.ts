import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-seller-details',
  templateUrl: './seller-details.component.html',
  styleUrls: ['./seller-details.component.css'],
})
export class SellerDetailsComponent {
  @Input() itemDetails: any; // 这将从父组件接收数据
  starIcon: string = '';
  starColor: string = ''; // for starIcon and color
  constructor() {}

  ngOnInit(): void {
    // 当您需要初始化组件时，可以在这里添加逻辑。
    // 例如，您可以检查 itemDetails 是否不为 null 或执行其他设置。
    console.log('in seller component...');
    console.log(this.itemDetails);
    this.setStarRating();
  }
  hasRecords(): boolean {
    if (!this.itemDetails?.Item) {
      return false;
    }
    const seller = this.itemDetails.Item.Seller;
    const storefront = this.itemDetails.Item.Storefront;

    // 列出所有需要检查的属性
    const properties = [
      seller?.FeedbackScore,
      seller?.PositiveFeedbackPercent,
      seller?.FeedbackRatingStar,
      seller?.TopRatedSeller,
      storefront?.StoreName,
      storefront?.StoreURL,
    ];

    // 检查是否至少有一个属性是定义的
    return properties.some((prop) => prop !== undefined);
  }

  setStarRating(): void {
    if (this.itemDetails?.Item?.Seller) {
      const score = this.itemDetails.Item.Seller.FeedbackScore;
      console.log('this score...', score);
      // 定义反馈分数与星星图标和颜色的对应关系
      const ratings = [
        { min: 0, max: 9, color: 'transparent' }, // None: No graphic displayed, feedback score 0-9.
        { min: 10, max: 49, color: 'yellow' }, // Yellow: Yellow Star, feedback score 10-49.
        { min: 50, max: 99, color: 'blue' }, // Blue: Blue Star, feedback score 50-99.
        { min: 100, max: 499, color: 'turquoise' }, // Turquoise: Turquoise Star, feedback score 100-499.
        { min: 500, max: 999, color: 'purple' }, // Purple: Purple Star, feedback score 500-999.
        { min: 1000, max: 4999, color: 'red' }, // Red: Red Star, feedback score 1,000-4,999.
        { min: 5000, max: 9999, color: 'green' }, // Green: Green Star, feedback score 5,000-9,999.
        { min: 10000, max: 24999, color: 'yellow' }, // YellowShooting: Yellow Shooting Star, feedback score 10,000-24,999.
        { min: 25000, max: 49999, color: 'turquoise' }, // TurquoiseShooting: Turquoise Shooting Star, feedback score 25,000-49,999.
        { min: 50000, max: 99999, color: 'purple' }, // PurpleShooting: Purple Shooting Star, feedback score 50,000-99,999.
        { min: 100000, max: 499999, color: 'red' }, // RedShooting: Red Shooting Star, feedback score 100,000-499,999.
        { min: 500000, max: 999999, color: 'green' }, // GreenShooting: Green Shooting Star, feedback score 500,000-999,999.
        {
          min: 1000000,
          max: Number.POSITIVE_INFINITY,
          color: 'silver',
        }, // SilverShooting: Silver Shooting Star, feedback score 1,000,000 or more.
      ];

      for (const rating of ratings) {
        if (score >= rating.min && score <= rating.max) {
          this.starIcon = score >= 10000 ? 'stars' : 'star_border'; // 大于等于10000用'stars'，其他用'star_border'
          this.starColor = rating.color;
          break;
        }
      }
    }
  }
}
