import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'localeDate' })
export class LocaleDatePipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    if (!value) return '';
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
  }
}
