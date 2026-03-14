import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
})
export class FormatDatePipe implements PipeTransform {
  transform(value: Date, ...args: number[]): string {
    const date = new Date(value);
    let day =
      date.getDate() < 10 ? `0${date.getDate()}` : String(date.getDate());
    let month =
      date.getMonth() + 1 < 10
        ? `0${date.getMonth() + 1}`
        : String(date.getMonth() + 1);
    const year = String(date.getFullYear());
    const format = args[0];

    switch (format) {
      case 1:
        return `${day}${month}${year}`;
      case 2:
        return `${month} / ${day} / ${year}`;
      case 3:
        return `${day}/${month}/${year}`;
      case 4:
        return `${year}-${month}-${day}`;
      default:
        return `${day}/${month}/${year}`;
    }
  }
}
