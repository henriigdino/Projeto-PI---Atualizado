import { Component, OnInit } from '@angular/core';
import { CONSOLES, Cliente, ItemAcervo } from '../../../core/types/types';
import { ClientesService } from '../../../core/services/clientes.service';
import { AcervoService } from '../../../core/services/acervo.service';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-listar-clientes',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './listar.component.html',
  styleUrl: './listar.component.css'
})
export class ListarClientesComponent implements OnInit {
  listaClientes: Cliente[] = [];
  abaAtiva: 'todos' | 'jogos' | 'consoles' = 'todos';
  consoles: string[] = [];
  itensAcervo: ItemAcervo[] = [];

  constructor(
    private service: ClientesService,
    private acervoService: AcervoService
  ) {}

  ngOnInit(): void {
    this.acervoService.listar().subscribe(itens => {
      const unique = new Set<string>();
      itens.forEach(i => {
        if (i.tipoItem === 'Console' && i.titulo) unique.add(i.titulo);
        if (i.tipoItem !== 'Console' && i.plataforma) unique.add(i.plataforma);
      });
      this.consoles = Array.from(unique).sort();
    });
    this.carregarDados();
  }

  get clientesFiltrados(): Cliente[] {
    if (this.abaAtiva === 'consoles') {
      return this.listaClientes.filter(c => c.itemAlugado && this.consoles.includes(c.itemAlugado));
    }
    if (this.abaAtiva === 'jogos') {
      return this.listaClientes.filter(c => !c.itemAlugado || !this.consoles.includes(c.itemAlugado));
    }
    return this.listaClientes;
  }

  carregarDados() {
    this.service.listar().subscribe((dados) => {
      this.listaClientes = dados.reverse();
    }); 
  }

  tipoItemCliente(c: Cliente): string {
    return c.itemAlugado && CONSOLES.includes(c.itemAlugado) ? 'Console' : 'Jogo';
  }

  produtoAlugado(c: Cliente): ItemAcervo | null {
    if (!c.itemAlugado) return null;
    if (CONSOLES.includes(c.itemAlugado)) {
      return this.itensAcervo.find(i => i.tipoItem === 'Console' && i.titulo === c.itemAlugado) || null;
    }
    const parts = c.itemAlugado.split(' - ');
    if (parts.length >= 2) {
      const plataforma = parts[parts.length - 1];
      const titulo = parts.slice(0, -1).join(' - ');
      return this.itensAcervo.find(i => i.tipoItem === 'Jogo' && i.titulo === titulo && i.plataforma === plataforma) || null;
    }
    return null;
  }

  excluir(id: string) {
    if (id) {
      this.service.excluir(id).subscribe(() => {
        this.listaClientes = this.listaClientes.filter(c => c.id !== id);
      });
    }
  }

  xpPercent(xp: string | undefined): number {
    const val = parseInt(xp || '0');
    return ((val % 1000) / 1000) * 100;
  }

  xpColor(xp: string | undefined): string {
    const val = parseInt(xp || '0');
    const level = Math.floor(val / 1000);
    const colors = ['var(--neon-blue)', 'var(--neon-purple)', 'var(--pacman-yellow)', '#ff8800', '#00ff88'];
    return colors[level % colors.length];
  }
}
