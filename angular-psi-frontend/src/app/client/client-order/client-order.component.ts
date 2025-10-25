import { Component, inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import * as Leaflet from 'leaflet';
import { Location } from '../../interfaces/location';
import { ClientInfo } from '../../interfaces/client_info';
import { TaxiOrder } from '../../interfaces/taxiOrder';
import { TaxiOrderService } from '../../services/taxi-order/taxiOrder.service';
import { ClientSessionService } from '../../services/sessions/client-session/client-session.service';
import { Router } from '@angular/router';

delete (Leaflet.Icon.Default.prototype as any)._getIconUrl;
Leaflet.Icon.Default.mergeOptions({
  iconRetinaUrl: 'assets/leaflet/images/marker-icon-2x.png',
  iconUrl: 'assets/leaflet/images/marker-icon.png',
  shadowUrl: 'assets/leaflet/images/marker-shadow.png'
});

@Component({
  selector: 'app-client-order',
  standalone: false,
  templateUrl: './client-order.component.html',
  styleUrl: './client-order.component.css'
})
export class ClientOrderComponent {
  taxiOrder: TaxiOrder = {
    client: {
      nif: "",
      name: "",
      gender: 'male',
    },
    location: { lat: 0, lon: 0 },
    destination: { lat: 0, lon: 0 },
    numberOfPeople: 0,
    status: 'pending',
    comfortLevel: 'standard'
  }

  doorNumber: string = "";
  doorNumberDestiny: string = "";
  postCode: string = "";
  postCodeDestiny: string = "";
  street: string = "";
  streetDestiny: string = "";
  locality: string = "";
  localityDestiny: string = "";

  confort: 'standard' | 'luxury' | undefined;
  gender: 'male' | 'female' | undefined;
  num: number = 1;

  lat: number = 0;
  lon: number = 0;
  latD: number = 0;
  lonD: number = 0;

  private map!: Leaflet.Map;
  private marker!: Leaflet.Marker;

  constructor(private taxiOrderService: TaxiOrderService, private router: Router, private clientSessionService: ClientSessionService) { }

  ngOnInit(): void {
    this.initMap();
    this.geoFindMe();
  }

  private initMap(defaultLat = 38.713670, defaultLon = -9.139301): void {
    const mapContainer = document.getElementById('map')!;

    this.map = Leaflet.map(mapContainer).setView([defaultLat, defaultLon], 12);
    Leaflet.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(this.map);

    // inicializar o marcador para ser movido com cliques
    this.marker = Leaflet.marker([38.713670, defaultLon]).addTo(this.map);

    // escutar eventos de clique
    this.map.on('click', async (e: Leaflet.LeafletMouseEvent) => {
      const { lat, lng } = e.latlng;
      this.marker.setLatLng([lat, lng]);
      await this.updateAddressFromCoordsDestiny(lat, lng);
    });
  }

  private async geoFindMe(): Promise<void> {
    const mapLink = document.getElementById('map-link');
    if (!mapLink) return;

    mapLink.textContent = '';
    if (!navigator.geolocation) {
      mapLink.textContent = 'Geolocation is not supported by your browser';
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        mapLink.textContent = `Coordinates: ${latitude}, ${longitude}`
        await this.updateAddressFromCoords(latitude, longitude);
      },
      () => {
        mapLink.textContent = 'Unable to retrieve your location please enter it manually.';
      }
    );
  }

  private async updateAddressFromCoords(lat: number, lon: number): Promise<void> {

    //atualizar lat e lon do usuário
    this.lat = lat
    this.lon = lon

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'YourAppName/1.0' } });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      const address = data.address || {};

      this.street = address.road || '';
      this.doorNumber = address.house_number || '';
      this.postCode = address.postcode || '';
      this.locality = address.city || address.town || address.village || ''

    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  }

  private async updateAddressFromCoordsDestiny(lat: number, lon: number): Promise<void> {

    //atualizar lat e lon do destino
    this.latD = lat
    this.lonD = lon

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`;
    try {
      const response = await fetch(url, { headers: { 'User-Agent': 'YourAppName/1.0' } });
      if (!response.ok) throw new Error(`HTTP error: ${response.status}`);
      const data = await response.json();
      const address = data.address || {};

      this.streetDestiny = address.road || '';
      this.doorNumberDestiny = address.house_number || '';
      this.postCodeDestiny = address.postcode || '';
      this.localityDestiny = address.city || address.town || address.village || ''

    } catch (error) {
      console.error('Reverse geocode error:', error);
    }
  }

  onInfoChange(): void {
    const street = this.street.trim();
    const postCode = this.postCode.trim();
    const doorNumber = this.doorNumber.trim();

    const query = `${doorNumber} ${street} ${postCode} `;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=1`;

    const mapLink = document.getElementById('map-link');
    if (!mapLink) return;

    mapLink.textContent = '';

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          console.log(`Coordinates: ${lat}, ${lon}`);
          mapLink.textContent = `Coordinates: ${lat}, ${lon}`
          this.lat = lat
          this.lon = lon
        } else {
          console.log("No results found.");
        }
      })
      .catch(error => {
        console.error("Error fetching from Nominatim:", error);
      });
  }

  onInfoChangeDestiny(): void {
    const streetDestiny = this.streetDestiny.trim();
    const postCodeDestiny = this.postCodeDestiny.trim();
    const doorNumberDestiny = this.doorNumberDestiny.trim();

    const query = `${doorNumberDestiny} ${streetDestiny} ${postCodeDestiny} `;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&addressdetails=1&limit=1`;

    fetch(url)
      .then(response => response.json())
      .then(data => {
        if (data.length > 0) {
          const { lat, lon } = data[0];
          console.log(`Coordinates: ${lat}, ${lon}`);
          this.map.setView([lat, lon], 15);
          this.marker.setLatLng([lat, lon]);
          this.latD = lat
          this.lonD = lon
        } else {
          console.log("No results found.");
        }
      })
      .catch(error => {
        console.error("Error fetching from Nominatim:", error);
      });
  }

  onSubmitOrder(): void {

    // primeiro verificar os campos pessoais
    var nif = (document.getElementById('nif') as HTMLInputElement).value.trim();
    var name = (
      document.getElementById('name') as HTMLInputElement
    ).value.trim();

    if (!nif || !name || !this.gender) {
      alert('All personal fields must be entered.');
      return;
    }

    var nifRegex = /^\d{9}$/;
    if (!nifRegex.test(nif)) {
      alert('NIF must contain 9 digits.');
      return;
    }

    //atualiza os campos do taxiOrder referente ao cliente
    this.taxiOrder.client.nif = nif;
    this.taxiOrder.client.name = name;
    this.taxiOrder.client.gender = this.gender;

    // Verificar as informacoes do táxi

    if (!this.confort || !this.num) {
      alert('Please fill the trip information.');
      return;
    }
    if (this.num < 1 || this.num >= 7) {
      alert('Number of customers must be between 1 and 6.')
      return;
    }

    //atualiza os campos do taxiOrder referente ao taxi
    this.taxiOrder.numberOfPeople = this.num;
    this.taxiOrder.comfortLevel = this.confort;

    // verificar os campos do endereco
    const street = this.street.trim();
    const postCode = this.postCode.trim();
    const doorNumber = this.doorNumber.trim();
    const streetDestiny = this.streetDestiny.trim();
    const postCodeDestiny = this.postCodeDestiny.trim();
    const doorNumberDestiny = this.doorNumberDestiny.trim();
    const localityDestiny = this.localityDestiny.trim();
    const locality = this.locality.trim();

    if (!street || !postCode || !doorNumber || !streetDestiny || !postCodeDestiny || !doorNumberDestiny || !localityDestiny || !locality) {
      alert("Please fill in all address fields.");
      return;
    }

    var postalCodeRegex = /^[0-9]{4}-[0-9]{3}$/;
    if (!postalCodeRegex.test(postCode)) {
      alert('Postal code must be in format: 1234-567.');
      return;
    }
    var doorNumberRegex = /^[A-Za-z0-9]{1,10}$/;
    if (!doorNumberRegex.test(doorNumber)) {
      alert(
        'Door number must be alphanumeric characters with length 1-10.'
      );
      return;
    }

    //atualiza os campos do taxiOrder referente ao destino
    this.taxiOrder.destination.lat = this.latD
    this.taxiOrder.destination.lon = this.lonD

    //atualiza os campos do taxiOrder referente a localização atual
    this.taxiOrder.location.lat = this.lat
    this.taxiOrder.location.lon = this.lon

    this.taxiOrder.locationAddress = {
      street: this.street,
      doorNumber: this.doorNumber,
      postalCode: this.postCode,
      locality: this.locality
    };

    this.taxiOrder.destinationAddress = {
      street: this.streetDestiny,
      doorNumber: this.doorNumberDestiny,
      postalCode: this.postCodeDestiny,
      locality: this.localityDestiny
    };

    // criar pedido
    this.taxiOrderService.createTaxiOrder(this.taxiOrder).subscribe({
      next: (createdTaxiOrder: TaxiOrder) => {
        alert(`TaxiOrder for a trip sucessfuly created, status: ${createdTaxiOrder.status}`);
        this.clientSessionService.setTaxiOrder(createdTaxiOrder);
        this.router.navigate(['/waiting'])
      },
      error: (err) => {
        console.error(err);
        const serverMsg = err.error?.message || 'Error creating taxiOrder.';
        alert(serverMsg);
      },
    });
  }
}