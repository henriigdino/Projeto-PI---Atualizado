import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { ClientesService } from '../../../core/services/clientes.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-remover-cliente',
  standalone: true,
  templateUrl: './remover.component.html',
  styleUrls: ['./remover.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RemoverClienteComponent {
  codigoExcluir: string = '';
  erroMensagem: string = '';
  private toastService = inject(ToastService);

  constructor(
    private service: ClientesService,
    private router: Router
  ) { }

  removerCliente(): void {
    this.erroMensagem = '';
    if (this.codigoExcluir) {
      this.service.listar().subscribe({
        next: (dados) => {
          const cliente = dados.find(c => c.codigo === this.codigoExcluir || c.id === this.codigoExcluir);
          if (cliente) {
            this.service.excluir(cliente.id).subscribe({
              next: () => {
                this.toastService.success('Cliente removido com sucesso!');
                this.router.navigate(['../listar']);
              },
              error: () => this.erroMensagem = 'Erro ao excluir.'
            });
          } else {
            this.erroMensagem = 'Cliente não encontrado. Verifique o código.';
          }
        },
        error: () => this.erroMensagem = 'Erro ao conectar com o banco.'
      });
    }
  }
}