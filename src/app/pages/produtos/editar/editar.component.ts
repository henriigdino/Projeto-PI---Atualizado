import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { AcervoService } from '../../../core/services/acervo.service';
import { CommonModule } from '@angular/common';
import { ItemAcervo } from '../../../core/types/types';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-editar-produto',
  standalone: true,
  templateUrl: './editar.component.html',
  styleUrls: ['./editar.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class EditarProdutoComponent implements OnInit {
  form!: FormGroup;
  idItem!: string;
  erroBusca: string = '';
  private toastService = inject(ToastService);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: AcervoService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      codigo: [''],
      titulo: [''], plataforma: [''], tipoItem: [''],
      anoLancamento: [''], condicao: [''], status: ['']
    });
    const idDaUrl = this.route.snapshot.paramMap.get('id');
    if (idDaUrl) { this.idItem = idDaUrl; this.carregarItem(); }
  }

  carregarItem(): void {
    this.erroBusca = '';
    if (this.idItem) {
      this.service.buscarPorId(this.idItem).subscribe({
        next: (dados) => {
          if (dados) {
            this.form.patchValue(dados);
          } else {
            this.service.listar().subscribe(lista => {
              const porCodigo = lista.find(i => i.codigo === this.idItem);
              if (porCodigo) {
                this.idItem = porCodigo.id;
                this.form.patchValue(porCodigo);
              } else {
                this.erroBusca = 'Produto não encontrado.';
              }
            });
          }
        },
        error: () => this.erroBusca = 'Produto não encontrado. Verifique o código.'
      });
    }
  }

  onSubmit() {
    const ItemAtualizado: ItemAcervo = { ...this.form.getRawValue(), id: this.idItem };
    this.service.editar(ItemAtualizado).subscribe(() => {
      this.toastService.success('Produto atualizado com sucesso!');
      this.router.navigate(['../listar']);
    });
  }

  cancelar() { this.router.navigate(['../listar']); }
}
