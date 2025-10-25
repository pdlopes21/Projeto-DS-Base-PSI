import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// imports login
import { LoginComponent } from './login/login.component';
import { ManagerLoginComponent } from './login/manager-login/manager-login.component';
import { DriverLoginComponent } from './login/driver-login/driver-login.component';
import { ClientLoginComponent } from './login/client-login/client-login.component';

// imports manager
import { ManagerTaxisComponent } from './manager/taxis/taxis.component';
import { ManagerDashboardComponent } from './manager/dashboard/dashboard.component';
import { ManagerTaxiDetailComponent } from './manager/taxi-detail/taxi-detail.component';
import { ManagerTaxiEditComponent } from './manager/taxi-edit/taxi-edit.component';
import { ManagerDriversComponent } from './manager/drivers/drivers.component';
import { ManagerDriverDetailComponent } from './manager/driver-detail/driver-detail.component';
import { ManagerPriceSettingsComponent }  from './manager/price-settings/price-settings.component';
import { ManagerMainPageComponent } from './manager/manager-main-page/manager-main-page.component';
import { ManagerDriverEditComponent } from './manager/driver-edit/driver-edit.component';
import { SubtotalTimeComponent } from './manager/subtotals/subtotal-time/subtotal-time.component';
import { SubtotalRideComponent } from './manager/subtotals/subtotal-ride/subtotal-ride.component';
import { SubtotalDistanceComponent } from './manager/subtotals/subtotal-distance/subtotal-distance.component';
import { RidesComponent } from './manager/rides/rides.component';
import { RideDetailsComponent } from './manager/ride-details/ride-details.component';
// imports driver
import { DriverMainPageComponent } from './driver/driver-main-page/driver-main-page.component';
import { DriverDashboardComponent } from './driver/driver-dashboard/driver-dashboard.component';
import { DriverShiftRequestComponent } from './driver/driver-shift-requests/driver-shift-request.component';
import { DriverClientTaxiOrderComponent } from './driver/driver-client-taxi-orders/driver-client-taxi-order.component';
import { DriverRecordsComponent } from './driver/driver-records/driver-records.component';
import { DriverRecordDetailsComponent } from './driver/driver-record-details/driver-record-details.component';
import { StartRideComponent } from './driver/register-ride/start-ride/start-ride.component';
import { EndRideComponent } from './driver/register-ride/end-ride/end-ride.component';

// imports client
import { ClientOrderComponent } from './client/client-order/client-order.component';
import { ClientWaitingComponent } from './client/client-waiting/client-waiting.component';
import { DriverShiftsComponent } from './driver/driver-shifts/driver-shifts.component';


const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'login/manager', component: ManagerLoginComponent },
  { path: 'login/driver', component: DriverLoginComponent },
  { path: 'login/client', component: ClientLoginComponent },
  
  { path: 'manager', component: ManagerMainPageComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'taxis', component: ManagerTaxisComponent },
    { path: 'drivers', component: ManagerDriversComponent },
    {
      path: 'dashboard', component: ManagerDashboardComponent, children: [
        { path: 'subtotal-time', component: SubtotalTimeComponent },
        { path: 'subtotal-ride', component: SubtotalRideComponent },
        { path: 'subtotal-distance', component: SubtotalDistanceComponent }]
    },
    { path: 'taxi-detail/:id', component: ManagerTaxiDetailComponent },
    { path: 'taxi-edit/:id', component: ManagerTaxiEditComponent },
    { path: 'driver-detail/:id', component: ManagerDriverDetailComponent },
    { path: 'driver-edit/:id', component: ManagerDriverEditComponent },
    { path: 'prices', component: ManagerPriceSettingsComponent },
    { path: 'rides', component: RidesComponent },
    { path: 'ride-detail/:id', component: RideDetailsComponent },

  ]},

  { path: 'driver', component: DriverMainPageComponent, children: [
    { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    { path: 'dashboard', component: DriverDashboardComponent },
    { path: 'driver-shift-request/:licensePlate', component: DriverShiftRequestComponent},
    { path: 'taxiOrders', component: DriverClientTaxiOrderComponent},
    { path: 'records', component: DriverRecordsComponent}, 
    { path: 'records/:id', component: DriverRecordDetailsComponent },
    { path: 'start-ride', component: StartRideComponent },
    { path: 'finish-ride/:rideId', component: EndRideComponent },
    { path: 'shifts', component: DriverShiftsComponent}
  ]},

  { path: 'client', component: ClientOrderComponent },

  { path: 'waiting', component: ClientWaitingComponent },


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }