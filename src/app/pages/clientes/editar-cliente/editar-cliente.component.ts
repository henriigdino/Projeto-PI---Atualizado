import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { ClientesService } from '../../../core/services/clientes.service';
import { AcervoService } from '../../../core/services/acervo.service';
import { CommonModule } from '@angular/common';
import { CONSOLES, Cliente } from '../../../core/types/types';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-editar-cliente',
  standalone: true,
  templateUrl: './editar-cliente.component.html',
  styleUrls: ['./editar-cliente.component.css'],
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
})
export class EditarClienteComponent implements OnInit {
  form!: FormGroup;
  idCliente!: string;
  erroBusca: string = '';
  private toastService = inject(ToastService);
  tipoItemAlugado = 'Jogo';
  consoles: string[] = [];
  todosConsoles: string[] = [];
  jogos: string[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder,
    private service: ClientesService,
    private acervoService: AcervoService
  ) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      codigo: [''],
      nomeCompleto: [''], telefone: [''], pontosXP: [''],
      ranking: [''], itemAlugado: [''], dataDevolucao: ['']
    });
    const idDaUrl = this.route.snapshot.paramMap.get('id');
    if (idDaUrl) { this.idCliente = idDaUrl; }
    this.acervoService.listar().subscribe(itens => {
      const unique = new Set<string>([...CONSOLES]);
      itens.forEach(i => {
        if (i.tipoItem !== 'Console' && i.plataforma) unique.add(i.plataforma);
      });
      this.todosConsoles = Array.from(unique).sort();

      this.consoles = itens
        .filter(i => i.tipoItem === 'Console' && i.titulo && i.status === 'Alugado')
        .map(i => i.titulo)
        .sort();
      this.jogos = itens
        .filter(i => i.tipoItem === 'Jogo' && i.titulo && i.status === 'Alugado')
        .map(i => i.titulo + ' - ' + i.plataforma)
        .sort();
      if (this.idCliente) { this.buscarCliente(); }
    });
  }

  buscarCliente(): void {
    this.erroBusca = '';
    if (this.idCliente) {
      this.service.buscarPorId(this.idCliente).subscribe({
        next: (dados) => {
          if (dados) {
            this.form.patchValue(dados);
            this.definirTipoItem(dados.itemAlugado);
          } else {
            this.service.listar().subscribe(lista => {
              const porCodigo = lista.find(c => c.codigo === this.idCliente);
              if (porCodigo) {
                this.idCliente = porCodigo.id;
                this.form.patchValue(porCodigo);
                this.definirTipoItem(porCodigo.itemAlugado);
              } else {
                this.erroBusca = 'Cliente não encontrado.';
              }
            });
          }
        },
        error: () => this.erroBusca = 'Cliente não encontrado. Verifique o código.'
      });
    }
  }

  private definirTipoItem(item: string | undefined) {
    if (item && this.todosConsoles.includes(item)) {
      this.tipoItemAlugado = 'Console';
    } else {
      this.tipoItemAlugado = 'Jogo';
    }
  }

  cancelar() { this.router.navigate(['/clientes/listar']); }

  onSubmit() {
    const clienteAtualizado: Cliente = { ...this.form.getRawValue(), id: this.idCliente };
    this.service.editar(clienteAtualizado).subscribe(() => {
      this.toastService.success('Cliente atualizado com sucesso!');
      this.router.navigate(['/clientes/listar']);
    });
  }
}