import { Routes } from '@angular/router';

export const routes: Routes = [
	{ path: '', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
	{ path: 'home', loadComponent: () => import('./pages/home/home.component').then(m => m.HomeComponent) },
	{ path: 'devices', loadComponent: () => import('./pages/devices/devices.component').then(m => m.DevicesComponent) },
	{ path: 'about', loadComponent: () => import('./pages/about/about.component').then(m => m.AboutComponent) },
	{ path: 'logs', loadComponent: () => import('./pages/logs/logs.component').then(m => m.LogsComponent) },
	{ path: 'login', loadComponent: () => import('./pages/login/login.component').then(m => m.LoginComponent) },
	{ path: 'dashboard/user', loadComponent: () => import('./pages/dashboard-user/dashboard-user.component').then(m => m.DashboardUserComponent) },
	{ path: 'dashboard/admin', loadComponent: () => import('./pages/dashboard-admin/dashboard-admin.component').then(m => m.DashboardAdminComponent) },
	{ path: '**', redirectTo: '' }
];
