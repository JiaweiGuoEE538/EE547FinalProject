import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class AuctionService {
  private apiUrl = "http://localhost:3000/searchAuctions"; // 你的API地址

  constructor(private http: HttpClient) {}

  searchAuctions(keywords: string): Observable<any> {
    return this.http.get(`${this.apiUrl}`, { params: { keywords } });
  }

  fetchSimilarItems(itemId: string): Observable<any> {
    return this.http.get(
      `http://localhost:3000/api/fetchSimilarItems/${itemId}`
    );
  }
}
