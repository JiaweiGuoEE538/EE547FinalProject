// wishlist.service.ts
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { AuthenticationService } from "./authentication.service";
import { tap } from "rxjs/operators";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class WishlistService {
  private wishlistUpdated = new Subject<void>();
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {
    this.authService.currentUser.subscribe((user) => {
      if (user) {
        console.log("Current User's Username:", user.user.username);
      }
    });
  }

  getWishlistUpdates(): Observable<void> {
    return this.wishlistUpdated.asObservable();
  }

  // get wish list
  // getWishlist(): Observable<any> {
  //   return this.http.get("http://localhost:3000/api/wishlist");
  // }
  getWishlist(username: string): Observable<any> {
    return this.http.get(
      `http://52.8.182.102:3000/api/wishlist?username=${username}`
    );
  }
  // 获取当前心愿单的物品数量
  getWishlistItemCount(username: string): Observable<number> {
    return this.http
      .get<any>(`http://52.8.182.102:3000/api/wishlist?username=${username}`)
      .pipe(map((items: any) => items.length)); // 假设服务器返回的是物品数组
  }

  // remove from wishlist
  // removeFromWishlist(itemId: string) {
  //   return this.http.post(`http://localhost:3000/api/removeFromCart`, {
  //     itemId: itemId,
  //   });
  // }
  removeFromWishlist(itemId: string, username: string) {
    return this.http
      .post(`http://52.8.182.102:3000/api/removeFromCart`, {
        itemId: itemId,
        username: username, // 确保发送 username
      })
      .pipe(tap(() => this.wishlistUpdated.next()));
  }

  addToWishlist(itemData: any, username: string) {
    return this.http
      .post(`http://52.8.182.102:3000/api/addToCart`, {
        itemData,
        username,
      })
      .pipe(tap(() => this.wishlistUpdated.next()));
  }
  // removeFromWishlist(itemId: string, username: string): Observable<any> {
  //   return this.http
  //     .delete(
  //       `http://localhost:3000/api/removeFromCart/${itemId}?username=${username}`
  //     )
  //     .pipe(tap(() => this.wishlistUpdated.next()));
  // }

  // addToWishlist(itemData: any, username: string): Observable<any> {
  //   return this.http
  //     .post(`http://localhost:3000/api/addToCart`, {
  //       itemData,
  //       username,
  //     })
  //     .pipe(tap(() => this.wishlistUpdated.next()));
  // }
}
