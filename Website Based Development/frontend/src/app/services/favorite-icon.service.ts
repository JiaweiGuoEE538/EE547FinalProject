import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
@Injectable({
  providedIn: 'root',
})
export class FavoriteIconService {
  private _isActive = new BehaviorSubject<boolean>(false);
  isActive$ = this._isActive.asObservable();

  setActiveState(isActive: boolean) {
    console.log('Setting active state in service:', isActive);
    this._isActive.next(isActive);
  }
}
