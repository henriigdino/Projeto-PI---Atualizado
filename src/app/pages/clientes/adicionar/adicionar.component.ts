import { Component, OnInit, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule, NgForm } from '@angular/forms';
import { Cliente } from '../../../core/types/types';
import { ClientesService } from '../../../core/services/clientes.service';
import { AcervoService } from '../../../core/services/acervo.service';
import { Router } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-adicionar-cliente',
  standalone: true,
  imports: [FormsModule, ReactiveFormsModule],
  templateUrl: './adicionar.component.html',
  styleUrl: './adicionar.component.css'
})
export class AdicionarClienteComponent implements OnInit {
  titulo = 'Cadastrar Cliente';
  private toastService = inject(ToastService);

  cliente: Cliente = {
    id: '', codigo: '', nomeCompleto: '', telefone: '',
    pontosXP: '', ranking: '', itemAlugado: '', dataDevolucao: ''
  };

  tipoItemAlugado = 'Jogo';
  consoles: string[] = [];

  constructor(
    private service: ClientesService,
    private acervoService: AcervoService,
    public router: Router
  ) { }

  ngOnInit() {
    this.acervoService.listar().subscribe(itens => {
      const unique = new Set<string>();
      itens.forEach(i => {
        if (i.tipoItem === 'Console' && i.titulo) unique.add(i.titulo);
        if (i.tipoItem !== 'Console' && i.plataforma) unique.add(i.plataforma);
      });
      this.consoles = Array.from(unique).sort();
    });
  }

  submeter(form: NgForm) {
    if (form.invalid) {
      this.toastService.error('Preencha todos os campos obrigatórios.');
      return;
    }
    this.cliente.id = crypto.randomUUID();
    this.service.incluir(this.cliente).subscribe({
      next: () => {
        this.toastService.success('Cliente cadastrado com sucesso!');
        this.router.navigate(['/clientes/listar']);
      },
      error: () => {
        this.toastService.error('Erro ao cadastrar. Verifique a conexão com o banco.');
      }
    });
  }
}