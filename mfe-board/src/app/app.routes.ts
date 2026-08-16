import { Routes } from '@angular/router';
import { BoardComponent } from './features/board/board.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ArchivedTasklistComponent } from './features/archived-tasklist/archived-tasklist.component';
import { ArchivedTaskdetailsComponent } from './features/archived-taskdetails/archived-taskdetails.component';
import { authGuard } from './core/auth.guard';

export const routes: Routes = [
  { path: '', component: DashboardComponent, canActivate: [authGuard] },
  { path: 'archived/:teamId', component: ArchivedTasklistComponent, canActivate: [authGuard] },
  { path: ':teamId', component: BoardComponent, canActivate: [authGuard] },
  { path: 'archived-task/:taskId', component: ArchivedTaskdetailsComponent, canActivate: [authGuard] },
];
