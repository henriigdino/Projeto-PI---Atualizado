import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AcervoService } from '../../core/services/acervo.service';
import { ClientesService } from '../../core/services/clientes.service';
import { GamificationService, Achievement } from '../../core/services/gamification.service';
import { ItemAcervo, Cliente } from '../../core/types/types';
import { SpinnerComponent } from '../../shared/spinner/spinner.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, SpinnerComponent],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private acervoService = inject(AcervoService);
  private clientesService = inject(ClientesService);
  gamification = inject(GamificationService);

  loading = true;
  totalProdutos = 0;
  totalClientes = 0;
  itensAlugados = 0;
  itensDisponiveis = 0;
  itensManutencao = 0;
  clientesVip = 0;
  produtosRecentes: ItemAcervo[] = [];
  clientesRecentes: Cliente[] = [];
  topClientes: Cliente[] = [];
  todosClientes: Cliente[] = [];
  relogio = '';
  dataAtual = '';
  uptimeSeconds = 0;
  private timer: any;
  private uptimeTimer: any;

  statusData: { label: string; count: number; color: string }[] = [];
  plataformaData: { label: string; count: number; color: string }[] = [];

  newAchievements: Achievement[] = [];
  showAchievementPopup = false;

  ngOnInit() {
    this.carregarStats();
    this.atualizarRelogio();
    this.timer = setInterval(() => this.atualizarRelogio(), 1000);
    this.uptimeTimer = setInterval(() => this.uptimeSeconds++, 1000);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.uptimeTimer) clearInterval(this.uptimeTimer);
  }

  carregarStats() {
    this.loading = true;

    this.acervoService.listar().subscribe(dados => {
      this.totalProdutos = dados.length;
      this.itensAlugados = dados.filter(i =>
        i.status?.toLowerCase().includes('alugado') || i.status?.toLowerCase().includes('locado')
      ).length;
      this.itensDisponiveis = dados.filter(i =>
        i.status?.toLowerCase().includes('dispon')
      ).length;
      this.itensManutencao = dados.filter(i =>
        i.status?.toLowerCase().includes('manuten')
      ).length;

      this.statusData = [
        { label: 'DISPONÍVEL', count: this.itensDisponiveis, color: 'var(--neon-blue)' },
        { label: 'ALUGADO', count: this.itensAlugados, color: 'var(--neon-pink)' },
        { label: 'MANUTENÇÃO', count: this.itensManutencao, color: 'var(--pacman-yellow)' }
      ];

      const plataformaCores: Record<string, string> = {
        SNES: '#e60012', NES: '#8b0000', MegaDrive: '#0055dd',
        PS1: '#0288d1', PS2: '#1a237e', 'Nintendo 64': '#2e7d32',
        GameCube: '#6a1b9a'
      };
      const pmap = new Map<string, number>();
      dados.forEach(i => pmap.set(i.plataforma || 'OUTROS', (pmap.get(i.plataforma || 'OUTROS') || 0) + 1));
      this.plataformaData = Array.from(pmap.entries())
        .sort((a, b) => b[1] - a[1]).slice(0, 7)
        .map(([label, count]) => ({ label, count, color: plataformaCores[label] || 'var(--text-dim)' }));

      this.produtosRecentes = dados.slice(-4).reverse();
      this.loading = false;
    });

    this.clientesService.listar().subscribe(dados => {
      this.totalClientes = dados.length;
      this.todosClientes = dados;
      this.clientesVip = dados.filter(c =>
        c.ranking?.toLowerCase().includes('vip') || c.ranking?.toLowerCase().includes('colecionador')
      ).length;

      this.topClientes = [...dados]
        .sort((a, b) => parseInt(b.pontosXP || '0') - parseInt(a.pontosXP || '0'))
        .slice(0, 5);

      this.clientesRecentes = dados.slice(-4).reverse();

      this.gamification.setXpFromClients(dados);
      const novos = this.gamification.checkAchievements(this.totalProdutos, this.totalClientes);
      if (novos.length > 0) {
        this.newAchievements = novos;
        this.showAchievementPopup = true;
        setTimeout(() => this.showAchievementPopup = false, 5000);
      }

    });
  }

  atualizarRelogio() {
    const agora = new Date();
    this.relogio = agora.toLocaleTimeString('pt-BR', { hour12: false });
    this.dataAtual = agora.toLocaleDateString('pt-BR', {
      weekday: 'short', day: '2-digit', month: 'short', year: 'numeric'
    });
  }

  platColor(plataforma: string | undefined): string {
    const cores: Record<string, string> = {
      SNES: '#e60012', NES: '#8b0000', MegaDrive: '#0055dd',
      PS1: '#0288d1', PS2: '#1a237e', 'Nintendo 64': '#2e7d32',
      GameCube: '#6a1b9a'
    };
    return cores[plataforma || ''] || 'var(--text-dim)';
  }

  barWidth(count: number, total: number): string {
    return total > 0 ? (count / total * 100) + '%' : '0%';
  }

  calcularXpPercent(xp: string | undefined): number {
    return Math.min((parseInt(xp || '0') / 1000) * 100, 100);
  }

  getUptime(): string {
    const h = Math.floor(this.uptimeSeconds / 3600);
    const m = Math.floor((this.uptimeSeconds % 3600) / 60);
    const s = this.uptimeSeconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  dismissAchievement() { this.showAchievementPopup = false; }
}
