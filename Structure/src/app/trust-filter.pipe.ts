import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'trustFilter',
  standalone: true   // ✅ MUST ADD THIS
})
export class TrustFilterPipe implements PipeTransform {

  transform(value: any[], searchText: string): any[] {

    if (!value) return [];

    if (!searchText || searchText.trim() === '') {
      return value;
    }

    return value.filter(item =>
      item.name.toLowerCase().includes(searchText.toLowerCase())
    );
  }
}