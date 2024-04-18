// import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
// import { HttpClient } from "@angular/common/http";
// import * as bootstrap from "bootstrap";

// @Component({
//   selector: "app-login",
//   templateUrl: "./login.component.html",
//   styleUrls: ["./login.component.css"],
// })
// export class LoginComponent implements AfterViewInit {
//   username: string = "";
//   password: string = "";
//   usernameError: string = "";
//   passwordError: string = "";
//   attemptsLeft: number = 3;
//   isLoggedIn: boolean = false;
//   loggedInUsername: string = "";
//   @ViewChild("loginModal") loginModal!: ElementRef;
//   constructor(private http: HttpClient) {}

//   ngAfterViewInit() {
//     // Listen for the hidden event on the modal
//     const modalElement = this.loginModal.nativeElement;
//     const bsModal = new bootstrap.Modal(modalElement, {
//       keyboard: false,
//     });

//     modalElement.addEventListener("hidden.bs.modal", () => {
//       // Handle the cleanup after the modal is hidden
//       document.body.classList.remove("modal-open");
//       const backdrops = document.querySelectorAll(".modal-backdrop");
//       backdrops.forEach((el) => el.remove());
//     });
//   }

//   resetForm(): void {
//     this.username = "";
//     this.password = "";
//     this.usernameError = "";
//     this.passwordError = "";
//     this.attemptsLeft = 3;
//   }

//   onLogin(): void {
//     this.usernameError = "";
//     this.passwordError = "";

//     if (!this.username.trim()) {
//       this.usernameError = "Please input a valid username!";
//       return;
//     }

//     // 检查密码是否有效
//     if (!this.password.trim()) {
//       this.passwordError = "Please input a valid password!";
//       return; // 如果无效，停止执行并显示错误
//     }

//     const userData = { username: this.username, password: this.password };
//     // this.http.post("http://localhost:3000/login", userData).subscribe({
//     //   next: (response) => {
//     //     console.log("successfully submitted!", response);
//     //     this.closeModal(); // 登录成功后关闭模态框
//     //   },
//     //   error: (error) => {
//     //     console.error("login failed!", error);
//     //     if (error.error.message.includes("username")) {
//     //       this.usernameError = "Incorrect username!"; // 显示用户名错误信息
//     //     } else if (error.error.message.includes("password")) {
//     //       this.passwordError = "Incorrect password!"; // 显示密码错误信息
//     //     }
//     //   },
//     // });
//     this.http.post("http://localhost:3000/login", userData).subscribe({
//       next: (response) => {
//         console.log("successfully submitted!", response);
//         this.isLoggedIn = true; // 设置为已登录
//         this.loggedInUsername = this.username; // 保存用户名
//         this.closeModal();
//       },
//       error: (error) => {
//         console.error("login failed!", error);
//         this.attemptsLeft--; // 减少尝试次数
//         if (this.attemptsLeft === 0) {
//           this.closeModal(); // 尝试次数用尽，关闭模态框
//         } else {
//           if (error.error.message.includes("username")) {
//             this.usernameError = "Incorrect username!";
//           } else if (error.error.message.includes("password")) {
//             this.passwordError = "Incorrect password!";
//           }
//         }
//       },
//     });
//   }

//   closeModal(): void {
//     const bsModal = bootstrap.Modal.getInstance(this.loginModal.nativeElement);
//     if (bsModal) {
//       bsModal.hide();
//     }
//   }
//   onModalHidden(): void {
//     document.body.style.overflow = "auto"; // 恢复滚动
//   }
//   onLogout(): void {
//     // 可以调用后端API来处理登出逻辑
//     // 假设登出请求不需要向服务器发送数据
//     this.http.post("http://localhost:3000/logout", {}).subscribe({
//       next: () => {
//         this.isLoggedIn = false;
//         this.loggedInUsername = "";
//         console.log("Logged out successfully");
//       },
//       error: (error) => {
//         console.error("Logout failed", error);
//       },
//     });
//   }

//   openLoginModal(): void {
//     const bsModal = new bootstrap.Modal(this.loginModal.nativeElement, {
//       keyboard: false,
//     });
//     bsModal.show();
//   }
// }

import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { AuthenticationService } from "../services/authentication.service";
import * as bootstrap from "bootstrap";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.css"],
})
export class LoginComponent implements AfterViewInit {
  username: string = "";
  password: string = "";
  usernameError: string = "";
  passwordError: string = "";
  attemptsLeft: number = 3;
  loggedInUsername: string = "";
  isLoggedIn: Boolean = false;
  @ViewChild("loginModal") loginModal!: ElementRef;

  constructor(private authService: AuthenticationService) {}

  ngAfterViewInit() {
    const modalElement = this.loginModal.nativeElement;
    const bsModal = new bootstrap.Modal(modalElement, { keyboard: false });
    modalElement.addEventListener(
      "hidden.bs.modal",
      this.onModalHidden.bind(this)
    );
  }

  resetForm(): void {
    this.username = "";
    this.password = "";
    this.usernameError = "";
    this.passwordError = "";
    this.attemptsLeft = 3;
  }

  onLogin(): void {
    if (!this.username.trim()) {
      this.usernameError = "Please input a valid username!";
      return;
    }
    if (!this.password.trim()) {
      this.passwordError = "Please input a valid password!";
      return;
    }

    this.authService.login(this.username, this.password).subscribe({
      next: (user) => {
        console.log("Login successful", user);
        this.loggedInUsername = user.user.username;
        this.isLoggedIn = true;
        console.log(this.loggedInUsername);
        this.closeModal();
      },
      error: (error) => {
        console.error("login failed!", error);
        this.attemptsLeft--; // 减少尝试次数
        if (this.attemptsLeft === 0) {
          this.closeModal(); // 尝试次数用尽，关闭模态框
        } else {
          if (error.error.message.includes("username")) {
            this.usernameError = "Incorrect username!";
          } else if (error.error.message.includes("password")) {
            this.passwordError = "Incorrect password!";
          }
        }
      },
    });
  }

  onLogout(): void {
    this.authService.logout().subscribe({
      next: () => {
        console.log("Logged out successfully");
        this.isLoggedIn = false;
        this.loggedInUsername = "";
      },
      error: (error) => {
        console.error("Logout failed", error);
      },
    });
  }

  closeModal(): void {
    const bsModal = bootstrap.Modal.getInstance(this.loginModal.nativeElement);
    bsModal?.hide();
  }

  onModalHidden(): void {
    document.body.style.overflow = "auto";
    this.resetForm();
  }

  openLoginModal(): void {
    const bsModal = new bootstrap.Modal(this.loginModal.nativeElement, {
      keyboard: false,
    });
    bsModal.show();
  }
}
