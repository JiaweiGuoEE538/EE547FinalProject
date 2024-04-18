import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SelectedItemService {
  _selectedItem: any;

  get selectedItem(): any {
    return this._selectedItem;
  }

  set selectedItem(value: any) {
    console.log('in service, selected item before set is...');
    console.log(JSON.stringify(this._selectedItem));
    this._selectedItem = value;
    console.log('in service, selected item after set is...');
    console.log(JSON.stringify(this._selectedItem));
  }
}
