// import { Injectable } from "@angular/core";
// import { HttpClient } from "@angular/common/http";
// import { BehaviorSubject, Observable } from "rxjs";
// import { map } from "rxjs/operators";

// @Injectable({
//   providedIn: "root",
// })
// export class AuthenticationService {
//   private currentUserSubject: BehaviorSubject<any>;
//   public currentUser: Observable<any>;

//   constructor(private http: HttpClient) {
//     this.currentUserSubject = new BehaviorSubject<any>(
//       JSON.parse(localStorage.getItem("currentUser") || "{}")
//     );

//     this.currentUser = this.currentUserSubject.asObservable();
//   }

//   public get currentUserValue(): any {
//     return this.currentUserSubject.value;
//   }

//   login(username: string, password: string) {
//     return this.http
//       .post<any>(`http://localhost:3000/login`, { username, password })
//       .pipe(
//         map((user) => {
//           // store user details and jwt token in local storage to keep user logged in between page refreshes
//           sessionStorage.setItem("currentUser", JSON.stringify(user));
//           this.currentUserSubject.next(user);
//           console.log(user);
//           return user;
//         })
//       );
//   }

//   logout(): Observable<any> {
//     // remove user from local storage and set current user to null
//     sessionStorage.removeItem("currentUser");
//     this.currentUserSubject.next(null);
//     return this.http.post("http://localhost:3000/logout", {});
//   }
// }
import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { BehaviorSubject, Observable } from "rxjs";
import { map } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AuthenticationService {
  private currentUserSubject: BehaviorSubject<any>;
  public currentUser: Observable<any>;

  constructor(private http: HttpClient) {
    const storedUser = sessionStorage.getItem("currentUser");
    this.currentUserSubject = new BehaviorSubject<any>(
      storedUser ? JSON.parse(storedUser) : null
    );
    this.currentUser = this.currentUserSubject.asObservable();
  }

  public get currentUserValue(): any {
    return this.currentUserSubject.value;
  }

  login(username: string, password: string): Observable<any> {
    return this.http
      .post<any>(`http://52.8.182.102:3000/login`, { username, password })
      .pipe(
        map((user) => {
          // store user details and jwt token in session storage to keep user logged in between page refreshes
          sessionStorage.setItem("currentUser", JSON.stringify(user));
          this.currentUserSubject.next(user);
          return user;
        })
      );
  }

  logout(): Observable<any> {
    // remove user from session storage and set current user to null
    sessionStorage.removeItem("currentUser");
    this.currentUserSubject.next(null);
    return this.http.post("http://52.8.182.102:3000/logout", {});
  }
}
