import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { Subject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class SharedService {
  private dataSource = new BehaviorSubject<any>(null);
  currentData = this.dataSource.asObservable();
  // make data trasfer from result-table to details
  public itemSelected: Subject<any> = new Subject();

  // 更新类型定义以包括 'recommendations'
  private activeButtonSource = new BehaviorSubject<
    "result" | "wishlist" | "recommendations"
  >(
    "result" // 默认仍然可以是 'result'
  );
  currentActiveButton = this.activeButtonSource.asObservable();

  constructor() {}

  updateData(data: any) {
    this.dataSource.next(data);
  }

  clearData() {
    this.dataSource.next(null);
  }

  // 更新方法以接受新的类型
  updateActiveButton(buttonType: "result" | "wishlist" | "recommendations") {
    this.activeButtonSource.next(buttonType);
  }
}
