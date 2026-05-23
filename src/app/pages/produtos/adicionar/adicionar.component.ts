import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
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

  onTipoChange() {
    if (this.item.tipoItem === 'Console') {
      this.item.plataforma = '';
      this.item.titulo = '';
    }
  }

  onNomeConsoleChange() {
    this.item.plataforma = this.item.titulo;
  }

  onStatusChange() {
    const s = this.item.status?.toLowerCase();
    if (s === 'alugado') {
      this.item.condicao = 'Usado';
    }
  }

  submeter(form: NgForm) {
    if (form.invalid) {
      this.toastService.error('Preencha todos os campos corretamente.');
      return;
    }
    if (this.item.tipoItem === 'Console' && this.item.codigo !== undefined) {
      this.item.codigo = this.item.codigo.replace(/^00/, '');
      this.item.codigo = '00' + this.item.codigo;
    }
    if (!this.item.condicao) { this.item.condicao = 'Usado'; }
    this.item.id = crypto.randomUUID();
    this.service.incluir(this.item).subscribe({
      next: () => {
        this.toastService.success('Produto cadastrado com sucesso!');
        this.router.navigate(['/produtos/listar']);
      },
      error: () => {
        this.toastService.error('Erro ao cadastrar. Verifique a conexão com o banco.');
      }
    });
  }
}