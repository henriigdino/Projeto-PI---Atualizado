import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcervoService } from '../../../core/services/acervo.service';
import { ItemAcervo } from '../../../core/types/types';

@Component({
  selector: 'app-buscar-produto',
  standalone: true,
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.css'],
  imports: [CommonModule, FormsModule],
})
export class BuscarProdutoComponent {
  codigoBusca: string = '';
  ItemEncontrado: ItemAcervo | null = null;
  erroBusca: string = '';

  constructor(private service: AcervoService) { }

  buscarItem(): void {
    this.erroBusca = '';
    this.ItemEncontrado = null;

    if (this.codigoBusca !== '') {
      this.service.listar().subscribe({
        next: (dados) => {
          const encontrado = dados.find(i => i.codigo === this.codigoBusca || i.id === this.codigoBusca);
          if (encontrado) {
            this.ItemEncontrado = encontrado;
          } else {
            this.erroBusca = 'Produto não encontrado.';
          }
        },
        error: () => {
          this.erroBusca = 'Erro ao buscar produto. Verifique a conexão com o banco.';
        }
      });
    }
  }
}