import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { SearchFormComponent } from './search-form/search-form.component';

import { HttpClientModule } from '@angular/common/http';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { MatIconModule } from '@angular/material/icon';
import { ResultWishlistButtonComponent } from './result-wishlist-button/result-wishlist-button.component';
import { LoadingBarComponent } from './loading-bar/loading-bar.component';
import { ResultTableComponent } from './result-table/result-table.component';
import { ProductDetailsComponent } from './details/product-details/product-details.component';
import { PhotoDetailsComponent } from './details/photo-details/photo-details.component';
import { ShippingDetailsComponent } from './details/shipping-details/shipping-details.component';
import { SellerDetailsComponent } from './details/seller-details/seller-details.component';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { WishlistComponent } from './wishlist/wishlist.component';
import { DetailsComponent } from './details/details.component';
import { SimilarProductDetailsComponent } from './details/similar-product-details/similar-product-details.component';
import { FormsModule } from '@angular/forms';
import { RoundProgressModule } from 'angular-svg-round-progressbar';
import { RegisterComponent } from './register/register.component';
import { LoginComponent } from './login/login.component';
import { RecommendationComponent } from './recommendation/recommendation.component';
import { AuctionsComponent } from './auctions/auctions.component';
import { AuctionDetailComponent } from './auction-detail/auction-detail.component';

@NgModule({
  declarations: [
    AppComponent,
    SearchFormComponent,
    ResultWishlistButtonComponent,
    LoadingBarComponent,
    ResultTableComponent,
    WishlistComponent,
    DetailsComponent,
    PhotoDetailsComponent,
    SimilarProductDetailsComponent,
    ShippingDetailsComponent,
    ProductDetailsComponent,
    SellerDetailsComponent,
    RegisterComponent,
    LoginComponent,
    RecommendationComponent,
    AuctionsComponent,
    AuctionDetailComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    MatAutocompleteModule,
    HttpClientModule,
    MatIconModule,
    NgbModule,
    FormsModule,
    RoundProgressModule,
  ],
  providers: [],
  bootstrap: [AppComponent],
})
export class AppModule {}
