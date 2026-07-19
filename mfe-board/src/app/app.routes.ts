import { Routes } from '@angular/router';
import { BoardComponent } from './features/board/board.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { ArchivedTasklistComponent } from './features/archived-tasklist/archived-tasklist.component';
import { ArchivedTaskdetailsComponent } from './features/archived-taskdetails/archived-taskdetails.component';

export const routes: Routes = [
  { path: '', component: DashboardComponent },
  { path: 'archived/:teamId', component: ArchivedTasklistComponent },
  { path: ':teamId', component: BoardComponent },
  { path: 'archived-task/:taskId', component: ArchivedTaskdetailsComponent }
];
