import { Routes } from '@angular/router';
import { BoardComponent } from './features/board/board.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  { path: ':teamId', component: BoardComponent },
  { path: '', component: DashboardComponent }
];
