import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { AuthenticationService } from "./authentication.service";
import { BehaviorSubject } from "rxjs";
@Injectable({
  providedIn: "root",
})
export class RecommendationService {
  constructor(
    private http: HttpClient,
    private authService: AuthenticationService
  ) {}

  private recommendationParamsSubject = new BehaviorSubject<any>(null);
  recommendationParams$ = this.recommendationParamsSubject.asObservable();

  getRecommendations(): Observable<any> {
    const username = this.authService.currentUserValue.user.username;
    if (!username) {
      throw new Error("Username is required for recommendations.");
    }
    return this.http.get(
      `http://localhost:3000/api/recommendations?username=${username}`
    );
  }
  getRecommendationParams(): Observable<any> {
    const username = this.authService.currentUserValue.user.username;
    if (!username) {
      throw new Error("Username is required for recommendations.");
    }
    return this.http.get<any>(
      `http://localhost:3000/api/recommendationParams?username=${username}`
    );
  }

  loadAndUpdateRecommendationParams() {
    const username = this.authService.currentUserValue.user.username;
    if (!username) {
      throw new Error("Username is required for recommendations.");
    }

    this.http
      .get<any>(
        `http://localhost:3000/api/recommendationParams?username=${username}`
      )
      .subscribe(
        (params) => {
          console.log(params.maxPrice);

          this.updateRecommendationParams(params);
        },
        (error) => {
          console.error("Failed to load recommendation parameters", error);
        }
      );
  }

  updateRecommendationParams(params: any) {
    console.log(params);
    this.recommendationParamsSubject.next(params);
  }
}
