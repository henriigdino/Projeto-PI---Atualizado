import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Cliente } from '../../../core/types/types';
import { ClientesService } from '../../../core/services/clientes.service';

@Component({
  selector: 'app-buscar-cliente',
  standalone: true,
  templateUrl: './buscar.component.html',
  styleUrls: ['./buscar.component.css'],
  imports: [CommonModule, FormsModule],
})
export class BuscarClienteComponent {
  codigoBusca: string = '';
  clienteEncontrado: Cliente | null = null;
  erroBusca: string = '';

  constructor(private service: ClientesService) {}

  buscarCliente(): void {
    this.erroBusca = '';
    this.clienteEncontrado = null;

    if (this.codigoBusca !== '') {
      this.service.listar().subscribe({
        next: (dados) => {
          const encontrado = dados.find(c => c.codigo === this.codigoBusca || c.id === this.codigoBusca);
          if (encontrado) {
            this.clienteEncontrado = encontrado;
          } else {
            this.erroBusca = 'Cliente não encontrado.';
          }
        },
        error: () => {
          this.erroBusca = 'Erro ao buscar cliente. Verifique a conexão com o banco.';
        }
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