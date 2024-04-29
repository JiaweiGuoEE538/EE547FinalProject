import { Component, OnInit, Output, EventEmitter } from "@angular/core";
import {
  FormBuilder,
  FormGroup,
  Validators,
  AbstractControl,
  ValidatorFn,
  ValidationErrors,
} from "@angular/forms";
import { HttpClient, HttpParams } from "@angular/common/http";
import { Observable, of } from "rxjs";
import { debounceTime, switchMap } from "rxjs/operators";
import { LoadingService } from "../services/loading.service";
import { SharedService } from "../services/shared.service";

@Component({
  selector: "app-search-form",
  templateUrl: "./search-form.component.html",
  styleUrls: ["./search-form.component.css"],
})
export class SearchFormComponent implements OnInit {
  searchForm!: FormGroup;
  isLocationObtained = false; // 模拟的变量，实际实现中可能会有不同的逻辑

  filteredPostalCodes$: Observable<any> = of([]);
  showPostalCodes: boolean = true; // need to show the list at the beginning
  isLoading = false; // 新属性来表示是否正在加载
  @Output() formCleared = new EventEmitter<void>();
  @Output() hideDetails = new EventEmitter<void>(); // do clear process
  @Output() searchPerformed = new EventEmitter<void>(); // do search process
  @Output() keywordsEmitted = new EventEmitter<string>();

  constructor(
    private fb: FormBuilder,
    private http: HttpClient,
    private loadingService: LoadingService, // 注入服务
    private sharedService: SharedService
  ) {}

  ngOnInit(): void {
    this.initializeForm(); // form initializing

    this.setupLocationChangeWatcher(); // detect if current location or given zipcode

    this.onLocationChange(); // get autocomplete of the zip code
  }

  initializeForm(): void {
    this.searchForm = this.fb.group({
      keywords: ["", [Validators.required, notOnlyWhitespaceValidator()]],
      category: ["default"],
      newCondition: [false],
      usedCondition: [false],
      unspecifiedCondition: [false],
      localPickup: [false],
      freeShipping: [false],
      distance: [10],
      location: ["current", Validators.required],
      // zipCode: [{ value: '', disabled: true }, Validators.required],
      zipCode: [
        { value: "", disabled: true },
        [Validators.required, Validators.pattern("^[0-9]{5}$")],
      ],
      finalZipCode: [""], // this is the final zip code that we need to pass to nodejs
    });

    this.getCurrentLocation().subscribe((response) => {
      this.searchForm.patchValue({
        finalZipCode: response.postal,
      });
      console.log(response.postal);
    });
    console.log(this.searchForm.get("finalZipCode")?.value);
  }

  setupLocationChangeWatcher(): void {
    this.searchForm.get("location")?.valueChanges.subscribe((value) => {
      const zipCodeControl = this.searchForm.get("zipCode");
      if (value === "zip") {
        zipCodeControl?.enable();
        this.setupZipCodeWatcher(); // Setup the ZIP code auto-complete when "zip" is selected
      } else {
        zipCodeControl?.disable();
        zipCodeControl?.setValue(""); // 清空zipCode的值
        this.getCurrentLocation().subscribe((response) => {
          // Assuming the response has a 'postal' property for the ZIP code
          const postalValue = response.postal;
          console.log(postalValue);
          this.searchForm.patchValue({
            finalZipCode: postalValue, // set intial final zipcode
          });
        });
      }
    });
  }

  setupZipCodeWatcher(): void {
    const zipControl = this.searchForm.get("zipCode");

    zipControl?.valueChanges.subscribe((value) => {
      this.searchForm.patchValue({ finalZipCode: value });
      console.log(this.searchForm.get("finalZipCode")?.value);
      this.showPostalCodes = true; // if user start input, show the list
    });

    this.filteredPostalCodes$ = (
      zipControl ? zipControl.valueChanges : of("")
    ).pipe(
      debounceTime(300),
      switchMap((value) => {
        if (!value) {
          return of([]);
        }
        return this.http.get(
          `https://hw3ebayadvanced.wl.r.appspot.com/api/postalCodeSearch`,
          {
            params: {
              postalcode_startsWith: value,
              maxRows: 5,
            },
          }
        );
      })
    );
  }

  onLocationChange() {
    console.log("start");
    const locationValue = this.searchForm.get("location")?.value;
    if (locationValue === "current") {
      this.getCurrentLocation();
    }
    if (locationValue === "zip") {
      this.setupLocationChangeWatcher();
    }
  }

  getCurrentLocation(): Observable<any> {
    // Fetch the current location using the API
    return this.http.get(`https://ipinfo.io/json?token=185a4a40a11ba5`);
  }

  setSelectedZip(zip: string): void {
    const zipControl = this.searchForm.get("zipCode");
    if (zipControl) {
      zipControl.setValue(zip);
    }
    this.showPostalCodes = false; // when chose 1 zip and we need to hide the list
  }

  canSearch(): boolean {
    const keywordsValid = this.searchForm.get("keywords")?.valid;
    const location = this.searchForm.get("location")?.value;

    if (location === "current") {
      return !!keywordsValid;
    } else {
      const zipValid = this.searchForm.get("zipCode")?.valid;
      return !!keywordsValid && !!zipValid;
    }
  }

  clearForm() {
    this.searchForm.patchValue({
      keywords: "",
      category: "default",
      newCondition: false,
      usedCondition: false,
      unspecifiedCondition: false,
      localPickup: false,
      freeShipping: false,
      distance: 10,
      location: "current",
      zipCode: "",
    });
    this.showPostalCodes = true;
    this.formCleared.emit();
    this.hideDetails.emit();
  }
  // send to backend
  onSearchClick(): void {
    console.log(this.searchForm);
    if (this.canSearch()) {
      this.keywordsEmitted.emit(this.searchForm.get("keywords")?.value);
      this.sharedService.clearData();
      this.loadingService.setLoading(true); // 开始加载时调用
      const dataToSend = this.convertToFrontendData(this.searchForm.value);
      this.sendToBackend(dataToSend);
      this.searchPerformed.emit();
    }
  }

  // need DEBUGGING!!
  convertToFrontendData(formValues: any): any {
    let conditions = [];
    if (formValues.newCondition) conditions.push("New");
    if (formValues.usedCondition) conditions.push("Used");
    if (formValues.unspecifiedCondition) conditions = []; // there will be no condition here

    let shippingOptions;
    if (formValues.freeShipping) shippingOptions = "free";
    let localPickup;
    if (formValues.localPickup) localPickup = "localPickup";
    let categoryValue =
      formValues.category === "default" ? "" : formValues.category;

    return {
      keywords: formValues.keywords,
      conditions: JSON.stringify(conditions),
      shippingOptions: shippingOptions,
      localPickup: localPickup,
      postalCode: String(formValues.finalZipCode),
      maxDistance: String(formValues.distance),
      category: categoryValue, // Use the category ID value here
    }; // params
  }

  // 如果您还没有定义 sendToBackend 方法，您可以这样定义：
  sendToBackend(data: any): void {
    const params = new HttpParams({ fromObject: data });
    console.log(params);
    this.http
      .get("https://hw3ebayadvanced.wl.r.appspot.com/search", { params })
      .subscribe(
        (response) => {
          console.log("Response from backend:", response);
          // this.sharedService.clearData(); // clear the old data
          this.sharedService.updateData(response);
          this.loadingService.setLoading(false); // 加载完成时调用
        },
        (error) => {
          console.error("Error when communicating with backend:", error);
          this.loadingService.setLoading(false); // 即使有错误也要停止加载
        }
      );
  }
}

export function notOnlyWhitespaceValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (control.value && control.value.trim().length === 0) {
      return { onlyWhitespace: true };
    }
    return null;
  };
}
