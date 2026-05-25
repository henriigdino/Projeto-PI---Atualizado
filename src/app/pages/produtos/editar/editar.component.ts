import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
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
  plataformas: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: AcervoService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      codigo: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      titulo: ['', Validators.required], plataforma: ['', Validators.required],
      tipoItem: ['', Validators.required],
      anoLancamento: ['', [Validators.required, Validators.pattern(/^[0-9]*$/)]],
      condicao: [''], status: ['', Validators.required]
    });
    this.service.listar().subscribe(itens => {
      const unique = new Set<string>();
      itens.forEach(i => {
        if (i.tipoItem === 'Console' && i.titulo) unique.add(i.titulo);
        if (i.tipoItem !== 'Console' && i.plataforma) unique.add(i.plataforma);
      });
      this.plataformas = Array.from(unique).sort();
    });
    this.form.get('tipoItem')?.valueChanges.subscribe(val => {
      const platCtrl = this.form.get('plataforma');
      if (val === 'Console') {
        platCtrl?.clearValidators();
        platCtrl?.patchValue('');
      } else {
        platCtrl?.setValidators(Validators.required);
      }
      platCtrl?.updateValueAndValidity();
      this.form.get('titulo')?.updateValueAndValidity();
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
    if (this.form.invalid) {
      this.toastService.error('Preencha todos os campos corretamente.');
      return;
    }
    const raw = this.form.getRawValue();
    if (raw.tipoItem === 'Console' && raw.codigo !== undefined) {
      raw.codigo = raw.codigo.replace(/^00/, '');
      raw.codigo = '00' + raw.codigo;
    }
    if (!raw.condicao) { raw.condicao = 'Usado'; }
    const ItemAtualizado: ItemAcervo = { ...raw, id: this.idItem };
    this.service.editar(ItemAtualizado).subscribe(() => {
      this.toastService.success('Produto atualizado com sucesso!');
      this.router.navigate(['/produtos/listar']);
    });
  }

  onTipoChange() {
    if (this.form.get('tipoItem')?.value === 'Console') {
      this.form.patchValue({ plataforma: '', titulo: '' });
    }
  }

  onNomeConsoleChange() {
    this.form.patchValue({ plataforma: this.form.get('titulo')?.value });
  }

  onStatusChange() {
    const s = this.form.get('status')?.value?.toLowerCase();
    if (s === 'alugado') {
      this.form.patchValue({ condicao: 'Usado' });
    }
  }

  cancelar() { this.router.navigate(['/produtos/listar']); }
}
