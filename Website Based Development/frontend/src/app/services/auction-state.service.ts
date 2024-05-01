import { Injectable } from "@angular/core";

@Injectable({
  providedIn: "root",
})
export class AuctionStateService {
  private _selectedItem: any = null;

  get selectedItem(): any {
    return this._selectedItem;
  }

  set selectedItem(value: any) {
    this._selectedItem = value;
  }
}
