import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { ModalModule } from 'src/app/_modal/modal.module'
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { OAComponent } from './oa/oa.component';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import {DragDropModule} from '@angular/cdk/drag-drop';
import {ScrollingModule} from '@angular/cdk/scrolling';
import {CdkTableModule} from '@angular/cdk/table';
import {CdkTreeModule} from '@angular/cdk/tree';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {MatButtonModule} from'@angular/material/button'
import {MatTableModule} from '@angular/material/table'
import {MatInputModule} from '@angular/material/input';
import {MatExpansionModule} from '@angular/material/expansion';
import {MatTabsModule} from '@angular/material/tabs'
import {MatCardModule} from '@angular/material/card';
import { HelpComponent } from './help/help.component';
import { NgxSpinnerModule } from 'ngx-spinner';
import { SplitterModule } from "primeng/splitter";
import {MatProgressSpinnerModule} from '@angular/material/progress-spinner';
import {MatAutocompleteModule} from '@angular/material/autocomplete';
import {MatFormFieldModule} from '@angular/material/form-field';
import {FormControl} from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    OAComponent,
    HelpComponent
  ],
  imports: [
    MatAutocompleteModule,
    MatFormFieldModule,
    ModalModule,
    NgxSpinnerModule,
    SplitterModule,
    HttpClientModule,
    MatProgressSpinnerModule,
    BrowserModule,
    MatTableModule,
    AppRoutingModule,
    MatInputModule,
    MatExpansionModule,
    MatTabsModule,
    MatCardModule,
    FormsModule,
    MatButtonModule,
    ReactiveFormsModule,
    BrowserAnimationsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
