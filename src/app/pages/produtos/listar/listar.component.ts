import { Component, OnInit } from '@angular/core';
import { ItemAcervo } from '../../../core/types/types';
import { AcervoService } from '../../../core/services/acervo.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listar-produtos',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
})
export class ListarProdutosComponent implements OnInit {
  listaItens: ItemAcervo[] = [];
  abaAtiva: 'todos' | 'jogos' | 'consoles' = 'todos';

  constructor(private service: AcervoService) {}

  ngOnInit(): void {
    this.carregarDados();
  }

  platIcon(item: ItemAcervo): string {
    return item.plataforma || (item.tipoItem === 'Console' ? item.titulo : '');
  }

  get itensFiltrados(): ItemAcervo[] {
    if (this.abaAtiva === 'consoles') {
      return this.listaItens.filter(f => f.tipoItem === 'Console');
    }
    if (this.abaAtiva === 'jogos') {
      return this.listaItens.filter(f => f.tipoItem === 'Jogo');
    }
    return this.listaItens;
  }

  carregarDados() {
    this.service.listar().subscribe((dados) => {
      this.listaItens = dados.reverse();
    });
  }

  excluir(id: string) {
    if (id) {
      this.service.excluir(id).subscribe(() => {
        this.listaItens = this.listaItens.filter(f => f.id !== id);
      });
    }
  }
}
