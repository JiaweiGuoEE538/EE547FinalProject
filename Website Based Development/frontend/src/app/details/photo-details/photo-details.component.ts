import { Component, Input, OnInit } from "@angular/core";
import { HttpClient } from "@angular/common/http";

@Component({
  selector: "app-photo-details",
  templateUrl: "./photo-details.component.html",
  styleUrls: ["./photo-details.component.css"],
})
export class PhotoDetailsComponent {
  // parameters
  @Input() itemDetails: any;
  searchResults: any;
  displayedPhotos: any[] = [];
  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    // 当您需要初始化组件时，可以在这里添加逻辑。
    // 例如，您可以检查 itemDetails 是否不为 null 或执行其他设置。
    console.log("in photo component...");
    console.log(this.itemDetails.Item.Title);
    if (this.itemDetails) {
      this.fetchImages(this.itemDetails.Item.Title);
    }
  }

  fetchImages(productTitle: string): void {
    const apiUrl = `http://52.8.182.102:3000/searchImages/${productTitle}`; // 你的后端API端点

    this.http.get(apiUrl).subscribe(
      (data: any) => {
        console.log("Data from the server", data);
        this.searchResults = data;
        this.displayedPhotos = this.searchResults.items;
        console.log("inner photo contents...");
        console.log(this.displayedPhotos);
      },
      (error) => {
        console.error("There was an error!", error);
      }
    );
  }
}
