import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface ConfigurationLanguage {
  iso639_1: string;
  englishName: string;
  name: string;
}

@Injectable({ providedIn: 'root' })
export class LanguagesService {
  private readonly http = inject(HttpClient);

  getLanguages() {
    return this.http.get<ConfigurationLanguage[]>(
      `${environment.apiUrl}/reference/languages`,
    );
  }
}
