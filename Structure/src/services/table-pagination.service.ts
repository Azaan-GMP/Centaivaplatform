import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class TablePaginationService {

  private _data: any[] = [];
  page = 1;
  pageSize = 10;

  setData(data: any[], pageSize: number = 10) {
    this._data = data;
    this.pageSize = pageSize;
    this.page = 1;
  }

  get data() {
    const start = (this.page - 1) * this.pageSize;
    return this._data.slice(start, start + this.pageSize);
  }

  get totalPages() {
    return Math.ceil(this._data.length / this.pageSize);
  }

  next() {
    if (this.page < this.totalPages) this.page++;
  }

  prev() {
    if (this.page > 1) this.page--;
  }

  goTo(num: number) {
    if (num >= 1 && num <= this.totalPages) this.page = num;
  }
}
