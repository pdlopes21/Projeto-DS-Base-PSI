import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms'; // <-- NgModel lives here
import { provideHttpClient, withInterceptorsFromDi } from '@angular/common/http';

import { AppComponent } from './app.component'; 
import { AppRoutingModule } from './app-routing.module';
import { MessagesComponent } from './messages/messages.component';

// login components
import { ManagerLoginComponent } from './login/manager-login/manager-login.component';
import { DriverLoginComponent } from './login/driver-login/driver-login.component';
import { ClientLoginComponent } from './login/client-login/client-login.component';

// manager components
import { ManagerMainPageComponent } from './manager/manager-main-page/manager-main-page.component';
import { ManagerTaxisComponent } from './manager/taxis/taxis.component';
import { ManagerPriceSettingsComponent } from './manager/price-settings/price-settings.component';
import { ManagerDriversComponent } from './manager/drivers/drivers.component';
import { ManagerDriverDetailComponent } from './manager/driver-detail/driver-detail.component';
import { ManagerTaxiDetailComponent } from './manager/taxi-detail/taxi-detail.component';
import { ManagerDashboardComponent } from './manager/dashboard/dashboard.component';
import { ManagerTaxiFormsComponent } from './manager/taxi-forms/taxi-forms.component';
import { ManagerDriverFormsComponent } from './manager/driver-forms/driver-forms.component';  
import { ReactiveFormsModule } from '@angular/forms';
import { ManagerTaxiEditComponent } from './manager/taxi-edit/taxi-edit.component';
import { SubtotalTimeComponent } from './manager/subtotals/subtotal-time/subtotal-time.component';
import { SubtotalRideComponent } from './manager/subtotals/subtotal-ride/subtotal-ride.component';
import { SubtotalDistanceComponent } from './manager/subtotals/subtotal-distance/subtotal-distance.component';
import { RidesComponent } from './manager/rides/rides.component';
import { RideDetailsComponent } from './manager/ride-details/ride-details.component';

//@angular/material imports
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatListModule } from '@angular/material/list'
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

// driver components
import { DriverMainPageComponent } from './driver/driver-main-page/driver-main-page.component';
import { DriverDashboardComponent } from './driver/driver-dashboard/driver-dashboard.component';
import { DriverShiftRequestComponent } from './driver/driver-shift-requests/driver-shift-request.component';
import { DriverClientTaxiOrderComponent } from './driver/driver-client-taxi-orders/driver-client-taxi-order.component';
import { DriverRecordsComponent } from './driver/driver-records/driver-records.component';
import { DriverRecordDetailsComponent } from './driver/driver-record-details/driver-record-details.component';
import { StartRideComponent } from './driver/register-ride/start-ride/start-ride.component';
import { EndRideComponent } from './driver/register-ride/end-ride/end-ride.component';

// client components
import { ClientOrderComponent } from './client/client-order/client-order.component';
import { ClientWaitingComponent } from './client/client-waiting/client-waiting.component';
import { DriverShiftsComponent } from './driver/driver-shifts/driver-shifts.component';
import { ManagerDriverEditComponent } from './manager/driver-edit/driver-edit.component';



@NgModule({
  declarations: [
    AppComponent,
    ManagerMainPageComponent,
    ManagerTaxisComponent,
    ManagerTaxiDetailComponent,
    ManagerPriceSettingsComponent,
    ManagerDashboardComponent,
    MessagesComponent,
    ManagerDriversComponent,
    ManagerDriverDetailComponent,
    ManagerTaxiFormsComponent,
    ManagerDriverFormsComponent,
    ManagerLoginComponent,
    ManagerDriverEditComponent,
    DriverLoginComponent,
    ClientLoginComponent,
    DriverMainPageComponent,
    DriverDashboardComponent,
    DriverShiftRequestComponent,
    DriverClientTaxiOrderComponent, 
    DriverRecordsComponent,
    DriverRecordDetailsComponent,
    DriverShiftsComponent,
    ClientOrderComponent,
    StartRideComponent,
    EndRideComponent,
    ClientWaitingComponent,
    ManagerTaxiEditComponent,
    SubtotalTimeComponent,
    SubtotalRideComponent,
    SubtotalDistanceComponent,
    RidesComponent,
    RideDetailsComponent,
  ],
  
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    MatFormFieldModule,
    MatInputModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatListModule,
    MatAutocompleteModule,
    MatStepperModule,
    MatCardModule,
    MatProgressSpinnerModule
],
  bootstrap: [ AppComponent ],
  providers: [provideHttpClient(withInterceptorsFromDi())]
})
export class AppModule { }
