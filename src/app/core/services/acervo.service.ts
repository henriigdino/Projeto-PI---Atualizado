import { Injectable } from '@angular/core';
import { ItemAcervo } from '../types/types';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class AcervoService {
  
  private readonly API = 'http://localhost:3000/acervo';

  constructor(private http: HttpClient) {}

  listar(): Observable<ItemAcervo[]> {
    return this.http.get<ItemAcervo[]>(this.API);
  }

  incluir(obj: ItemAcervo): Observable<ItemAcervo> {
    return this.http.post<ItemAcervo>(this.API, obj);
  }

  excluir(id: string): Observable<any> {
  return this.http.delete(`${this.API}/${id}`);
}

  buscarPorId(id: string): Observable<ItemAcervo | undefined> {
  return this.http.get<ItemAcervo>(`${this.API}/${id}`);
}

  editar(obj: ItemAcervo): Observable<ItemAcervo> {
    return this.http.put<ItemAcervo>(`${this.API}/${obj.id}`, obj);
  }
}