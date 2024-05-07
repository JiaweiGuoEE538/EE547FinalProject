import { Component, ViewChild, ElementRef, AfterViewInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import * as bootstrap from "bootstrap";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.css"],
})
export class RegisterComponent implements AfterViewInit {
  username: string = "";
  password: string = "";
  usernameError: string = "";
  passwordError: string = "";
  @ViewChild("registerModal") registerModal!: ElementRef;

  constructor(private http: HttpClient) {}

  resetForm(): void {
    this.username = "";
    this.password = "";
    this.usernameError = "";
    this.passwordError = "";
  }

  ngAfterViewInit(): void {
    // Bootstrap 模态关闭后的事件监听
    const modalElement = this.registerModal.nativeElement;
    const bsModal = new bootstrap.Modal(modalElement, {
      keyboard: false,
    });

    // 监听 hidden 事件
    modalElement.addEventListener("hidden.bs.modal", () => {
      document.body.classList.remove("modal-open");
      const backdrops = document.querySelectorAll(".modal-backdrop");
      backdrops.forEach((el) => el.remove());
    });
    document.body.style.overflow = "auto";
  }

  onRegister(): void {
    if (!this.username.trim()) {
      this.usernameError = "Please input a valid username!";
      return;
    }
    if (!this.password.trim()) {
      this.passwordError = "Please input a valid password!";
      return;
    }

    const userData = { username: this.username, password: this.password };
    this.http.post("http://52.8.182.102:3000/register", userData).subscribe({
      next: (response) => {
        console.log("successfully submitted!", response);
        this.closeModal(); // 成功后关闭模态框
      },
      error: (error) => {
        console.error("register denied!", error);
        this.usernameError =
          "Username has already existed! Please choose another name!";
      },
    });
  }

  closeModal(): void {
    const bsModal = bootstrap.Modal.getInstance(
      this.registerModal.nativeElement
    );
    if (bsModal) {
      bsModal.hide();
      document.body.style.overflow = "auto";
    }
  }
  onModalHidden(): void {
    document.body.style.overflow = "auto"; // 恢复滚动
  }
}
