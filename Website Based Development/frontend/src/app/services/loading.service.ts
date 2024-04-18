import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<boolean>(false);

  // 用于组件订阅的 loading 状态的 observable
  public loading$ = this.loadingSubject.asObservable();

  constructor() {}

  setLoading(isLoading: boolean): void {
    console.log('Loading status is now: ', isLoading);
    this.loadingSubject.next(isLoading);
  }
}
