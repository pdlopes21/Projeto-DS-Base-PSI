import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})

//Usa a API dos CTT
export class PostalCodeService {
  private apiKey = 'dce05bc968b44521851718366ca254d8'; 
  private baseUrl = 'https://www.cttcodigopostal.pt/api/v1';

  constructor(private http: HttpClient) {}

  getPostalCodeInfo(cp4: string, cp3: string) {
    const url = `${this.baseUrl}/${this.apiKey}/${cp4}-${cp3}`;
    return this.http.get(url);
  }
}
