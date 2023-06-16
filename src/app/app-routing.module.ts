import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HelpComponent } from './help/help.component';
import { OAComponent } from './oa/oa.component';

const routes: Routes = [
  {path:'OA',component:OAComponent},
  {path:'Help',component:HelpComponent},
  {path: '', redirectTo: 'OA', pathMatch: 'full'}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
