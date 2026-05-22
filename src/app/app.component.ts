import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router, RouterOutlet, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { ToastComponent } from './shared/toast/toast.component';
import { GamificationService } from './core/services/gamification.service';
import { ActivityService } from './core/services/activity.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent implements OnInit, OnDestroy {
  private router = inject(Router);
  gamification = inject(GamificationService);
  activityService = inject(ActivityService);
  sidebarAberta = true;
  relogio = '';
  tema = 'dashboard';
  private timer: any;

  menuItems = [
    { path: '/dashboard', icon: '📋', label: 'DASHBOARD' },
    { path: '/produtos', icon: '🎮', label: 'PRODUTOS' },
    { path: '/clientes', icon: '👤', label: 'CLIENTES' }
  ];

  ngOnInit() {
    this.atualizarRelogio();
    this.timer = setInterval(() => this.atualizarRelogio(), 1000);
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe(() => {
      const url = this.router.url;
      if (url.startsWith('/produtos')) this.tema = 'produtos';
      else if (url.startsWith('/clientes')) this.tema = 'clientes';
      else this.tema = 'dashboard';
    });
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
  }

  isActive(path: string): boolean {
    return this.router.url.startsWith(path);
  }

  alternarSidebar() {
    this.sidebarAberta = !this.sidebarAberta;
  }

  atualizarRelogio() {
    const agora = new Date();
    this.relogio = agora.toLocaleTimeString('pt-BR', { hour12: false });
  }
}
