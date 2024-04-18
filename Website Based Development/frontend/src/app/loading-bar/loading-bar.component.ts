import { Component, OnDestroy, OnInit } from '@angular/core';
import { LoadingService } from '../services/loading.service'; // 确保路径正确
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-loading-bar', // 确认这个选择器匹配你在父组件模板中使用的标签
  templateUrl: './loading-bar.component.html',
  styleUrls: ['./loading-bar.component.css'], // 如果有对应的样式文件
})
export class LoadingBarComponent implements OnInit, OnDestroy {
  isLoading: boolean = false; // 本地状态
  progressValue: number = 0; // 新增属性来存储进度值

  private loadingSubscription: Subscription = new Subscription();
  constructor(private loadingService: LoadingService) {}

  ngOnInit(): void {
    // 当组件初始化时，订阅服务中的 loading 状态
    this.loadingSubscription = this.loadingService.loading$.subscribe(
      (status) => {
        this.isLoading = status; // 当状态更新时，更新本地状态
        // 更新进度值
        if (this.isLoading) {
          this.progressValue = 50;
        } else {
          this.progressValue = 100;
        }
      }
    );
  }

  ngOnDestroy(): void {
    // 当组件销毁时，取消订阅以防止内存泄漏
    if (this.loadingSubscription) {
      this.loadingSubscription.unsubscribe();
    }
  }
}
