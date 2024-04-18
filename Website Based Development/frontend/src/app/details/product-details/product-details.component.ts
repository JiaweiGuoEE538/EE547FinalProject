import {
  Component,
  Input,
  OnInit,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  AfterViewInit,
  ViewChild,
  ElementRef,
} from '@angular/core';
// 引入用于控制模态框的服务
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
declare var bootstrap: any;
@Component({
  selector: 'app-product-details',
  templateUrl: './product-details.component.html',
  styleUrls: ['./product-details.component.css'],
})
export class ProductDetailsComponent
  implements OnInit, OnChanges, AfterViewInit
{
  @Input() itemDetails: any;
  tableData: any[] = []; // 用于在表中显示的数据
  currentImageIndex = 0; // 当前显示的图片索引
  @ViewChild('carousel') carousel!: ElementRef;
  constructor(
    private modalService: NgbModal,
    private cdRef: ChangeDetectorRef
  ) {}
  imageUrls: string[] = [];
  ngOnInit(): void {
    if (this.imageUrls.length === 1) {
      this.imageUrls.push(this.imageUrls[0]);
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['itemDetails'] && changes['itemDetails'].currentValue) {
      // 当 itemDetails 输入属性发生变化时，更新表格数据
      this.prepareTableData();
    }
  }

  prepareTableData(): void {
    // 清空当前的表格数据
    this.tableData = [];

    // 确保 itemDetails 不是 undefined 或 null，并且有实际的数据内容
    if (this.itemDetails && this.itemDetails.Item) {
      const item = this.itemDetails.Item;

      // 检查并添加图片
      if (item.PictureURL?.length) {
        this.tableData.push({
          key: 'Product Images',
          value: item.PictureURL, // 这可能是一个 URL 数组
        });
      }

      // 检查并添加价格
      if (item.ConvertedCurrentPrice?.Value) {
        this.tableData.push({
          key: 'Price',
          value: item.ConvertedCurrentPrice.Value,
        });
      }

      // 检查并添加位置
      if (item.Location) {
        this.tableData.push({
          key: 'Location',
          value: item.Location,
        });
      }

      // 检查并添加退货政策
      if (
        item.ReturnPolicy?.ReturnsAccepted &&
        item.ReturnPolicy?.ReturnsWithin
      ) {
        this.tableData.push({
          key: 'Return Policy (US)',
          value: `${item.ReturnPolicy.ReturnsAccepted} within ${item.ReturnPolicy.ReturnsWithin}`,
        });
      }

      // 检查并添加项目具体信息
      if (item.ItemSpecifics?.NameValueList?.length) {
        item.ItemSpecifics.NameValueList.forEach((spec: any) => {
          if (spec.Name && spec.Value) {
            this.tableData.push({ key: spec.Name, value: spec.Value[0] }); // 假设 Value 是一个数组
          }
        });
      }
    }
    console.log('for product session...');
    console.log(this.tableData); // 用于调试：在控制台打印表格数据

    // 在数据准备好之后，确保设置imageUrls数组
    const imagesData = this.tableData.find(
      (data) => data.key === 'Product Images'
    );
    if (imagesData) {
      this.imageUrls = imagesData.value;
    }

    console.log('this url array...', this.imageUrls);
  }

  getCurrentImageUrl(): string {
    const imagesData = this.tableData.find(
      (data) => data.key === 'Product Images'
    );
    return imagesData ? imagesData.value[this.currentImageIndex] : '';
  }

  isLastImage(): boolean {
    const imagesData = this.tableData.find(
      (data) => data.key === 'Product Images'
    );
    return imagesData
      ? this.currentImageIndex >= imagesData.value.length - 1
      : true;
  }

  openImageModal(content: any) {
    this.modalService.open(content, { size: 'md' }); // 用于打开模态框
  }

  openImageInNewTab(imageUrl: string) {
    window.open(imageUrl, '_blank');
  }

  ngAfterViewInit(): void {
    // 确保视图已经完全初始化
    if (this.carousel) {
      var carousel = new bootstrap.Carousel(this.carousel.nativeElement, {
        interval: false, // 不自动翻页
        wrap: true, // 即使只有一张图片，也允许循环
      });
    }
  }
}
