import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-shipping-details',
  templateUrl: './shipping-details.component.html',
  styleUrls: ['./shipping-details.component.css'],
})
export class ShippingDetailsComponent {
  @Input() itemGeneral: any;

  ngOnInit() {
    console.log('in shipping component...');
    console.log(this.itemGeneral);
  }
}
