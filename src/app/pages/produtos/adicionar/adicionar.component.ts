import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ItemAcervo } from '../../../core/types/types';
import { AcervoService } from '../../../core/services/acervo.service';
import { Router, RouterModule } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-adicionar-produto',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule, RouterModule],
  templateUrl: './adicionar.component.html',
  styleUrl: './adicionar.component.css'
})
export class AdicionarProdutoComponent {
  titulo = 'Cadastrar Produto';
  private toastService = inject(ToastService);

  item: ItemAcervo = {
    id: '', codigo: '', titulo: '', plataforma: '', tipoItem: '',
    anoLancamento: '', condicao: '', status: ''
  };

  constructor(
    private service: AcervoService,
    private router: Router
  ) { }

  submeter() {
    this.item.id = crypto.randomUUID();
    this.service.incluir(this.item).subscribe({
      next: () => {
        this.toastService.success('Produto cadastrado com sucesso!');
        this.router.navigate(['../listar']);
      },
      error: () => {
        this.toastService.error('Erro ao cadastrar. Verifique a conexão com o banco.');
      }
    });
  }
}