import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AcervoService } from '../../../core/services/acervo.service';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-remover-produto',
  standalone: true,
  templateUrl: './remover.component.html',
  styleUrls: ['./remover.component.css'],
  imports: [CommonModule, FormsModule, RouterModule],
})
export class RemoverProdutoComponent {
  codigoExcluir: string = '';
  erroMensagem: string = '';
  private toastService = inject(ToastService);

  constructor(
    private service: AcervoService,
    private router: Router
  ) { }

  removerItem(): void {
    this.erroMensagem = '';
    if (this.codigoExcluir) {
      this.service.listar().subscribe({
        next: (dados) => {
          const item = dados.find(i => i.codigo === this.codigoExcluir || i.id === this.codigoExcluir);
          if (item) {
            this.service.excluir(item.id).subscribe({
              next: () => {
                this.toastService.success('Produto removido com sucesso!');
                this.router.navigate(['/produtos/listar']);
              },
              error: () => this.erroMensagem = 'Erro ao excluir.'
            });
          } else {
            this.erroMensagem = 'Produto não encontrado. Verifique o código.';
          }
        },
        error: () => this.erroMensagem = 'Erro ao conectar com o banco.'
      });
    }
  }
}