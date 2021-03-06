declare var require: any;
import { RouterModule } from '@angular/router';
import { routes } from './app.routes';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { NgModule } from '@angular/core';
import { SDKBrowserModule } from '../../sdk/index';
import { AppComponent } from './app.component';
import { IpQueryComponent, QueryNameDialogComponent, ImportDialogComponent, ConfirmOverwriteDialog } from './ip-query/ip-query.component';
import { IpRangesComponent } from './ip-ranges/ip-ranges.component';
import { IpRangesResolver } from './ip-ranges/ip-ranges.resolver';
import { NgCircleProgressModule } from 'ng-circle-progress';
import { NgxLoadingModule } from 'ngx-loading';
import { NvD3Module } from 'ng2-nvd3';
import 'd3';
import 'nvd3';

import {
  MatButtonModule,
  MatCheckboxModule,
  MatCardModule,
  MatFormFieldModule,
  MatToolbarModule,
  MatGridListModule,
  MatTableModule,
  MatInputModule,
  MatDividerModule,
  MatListModule,
  MatIconModule,
  MatTooltipModule,
  MatSortModule,
  MatChipsModule,
  MatDialogModule,
  MatDialog,
  MatSidenavModule,
  MatSelectModule,
  MatMenuModule,
  MatButtonToggleModule,
  MatAutocompleteModule,
  MatProgressSpinnerModule,
  MatPaginatorModule,
  MatSlideToggleModule,
  MatExpansionModule,
  MatTabsModule,
  MatRadioModule,
  MatDatepickerModule,
  MatNativeDateModule,
} from '@angular/material';
import {
    IpDetailComponent,
    EditNoteDialog,
    DeleteNoteDialog,
    WatchlistDialogComponent,
} from './ip-detail/ip-detail.component';
import { IpDetailResolver } from './ip-detail/ip-detail.resolver';
import { IpsService } from './services/ips.service';
import { NoteService } from './services/note.service';
import { HttpClientModule } from '@angular/common/http';
import { LoginComponent } from './login/login.component';
import { FlexLayoutModule } from '@angular/flex-layout';
import { LoginResolver } from './login/login.resolver';
import { IpRiskCircleComponent } from './ip-risk-circle/ip-risk-circle.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import {
  WatchlistComponent,
  CreateWatchlistDialog,
  SearchDeleteDialog
} from './watchlist/watchlist.component';
import { WatchlistResolver } from './watchlist/watchlist.resolver';
import { IpQueryResolver } from './ip-query/ip-query.resolver';
import { TrendsComponent } from './trends/trends.component';
import { TrendsResolver } from './trends/trends.resolver';
import { IpTagsComponent, CreateTagDialog, TagDeleteDialog } from './ip-tags/ip-tags.component';
import { AdminComponent, DeleteUserDialog, CreateUserDialog, CreateApiKeyDialog, DeleteApiKeyDialog } from './admin/admin.component';
import { AdminResolver } from './admin/admin.resolver';
import { AgmCoreModule } from '@agm/core';
import { AgmSnazzyInfoWindowModule } from '@agm/snazzy-info-window';
import { GmapComponent, SaveListDialog } from './gmap/gmap.component';
import { GmapResolver } from './gmap/gmap.resolver';
import { MyAccountComponent } from './my-account/my-account.component';
import { MyAccountResolver } from './my-account/my-account.resolver';

@NgModule({
  declarations: [
    AppComponent,
    IpQueryComponent,
    IpDetailComponent,
    EditNoteDialog,
    DeleteNoteDialog,
    WatchlistDialogComponent,
    LoginComponent,
    IpRiskCircleComponent,
    ImportDialogComponent,
    ConfirmOverwriteDialog,
    QueryNameDialogComponent,
    WatchlistComponent,
    TrendsComponent,
    IpTagsComponent,
    CreateTagDialog,
    CreateWatchlistDialog,
    SearchDeleteDialog,
    TagDeleteDialog,
    IpRangesComponent,
    DeleteUserDialog,
    CreateUserDialog,
    CreateApiKeyDialog,
    DeleteApiKeyDialog,
    AdminComponent,
    GmapComponent,
    SaveListDialog,
    MyAccountComponent,
  ],
  imports: [
    NvD3Module,
    RouterModule.forRoot(routes,
    {
      useHash: false
    }
    ),
    AgmCoreModule.forRoot({
      apiKey: 'AIzaSyBusR6KbRONW95CPdaTs9o9i4vM13eG1oA'
    }),
    AgmSnazzyInfoWindowModule,
    FormsModule,
    BrowserModule,
    ReactiveFormsModule,
    BrowserModule,
    HttpClientModule,
    BrowserAnimationsModule,
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatGridListModule,
    MatTableModule,
    MatInputModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatSortModule,
    MatChipsModule,
    MatDialogModule,
    MatSidenavModule,
    MatSelectModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatProgressSpinnerModule,
    MatPaginatorModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatTabsModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    NgxLoadingModule.forRoot({}),
    NgCircleProgressModule.forRoot({
      // set defaults here
      radius: 100,
      outerStrokeWidth: 16,
      innerStrokeWidth: 8,
      outerStrokeColor: '#78C000',
      innerStrokeColor: '#C7E596',
      animationDuration: 300
    }),
    FlexLayoutModule,
    SDKBrowserModule.forRoot()
  ],
  exports: [
    MatButtonModule,
    MatCheckboxModule,
    MatCardModule,
    MatFormFieldModule,
    MatToolbarModule,
    MatGridListModule,
    MatTableModule,
    MatInputModule,
    MatDividerModule,
    MatListModule,
    MatIconModule,
    MatTooltipModule,
    MatSortModule,
    ImportDialogComponent,
    QueryNameDialogComponent,
    ConfirmOverwriteDialog,
    MatSidenavModule,
    MatMenuModule,
    MatButtonToggleModule,
    MatAutocompleteModule,
    MatRadioModule,
    MatDatepickerModule,
    MatNativeDateModule,
    SaveListDialog
  ],
  providers: [
    IpsService,
    NoteService,
    IpDetailResolver,
    WatchlistResolver,
    TrendsResolver,
    IpQueryResolver,
    LoginResolver,
    AdminResolver,
    MatDialog,
    IpRangesResolver,
    GmapResolver,
    MyAccountResolver
  ],
  entryComponents: [
    ImportDialogComponent,
    QueryNameDialogComponent,
    ConfirmOverwriteDialog,
    CreateTagDialog,
    CreateWatchlistDialog,
    SearchDeleteDialog,
    DeleteUserDialog,
    CreateUserDialog,
    CreateApiKeyDialog,
    DeleteApiKeyDialog,
    TagDeleteDialog,
    SaveListDialog,
    EditNoteDialog,
    DeleteNoteDialog,
    WatchlistDialogComponent,
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
