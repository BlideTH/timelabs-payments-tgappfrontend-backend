import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProduct, ProductsService } from '../../services/products.service';
import { TelegramService } from '../../services/telegram.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate, state } from '@angular/animations';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs, addDoc } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';



@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatRadioModule],
  template: `
    <div *ngIf="product; else notFound" class="centered glass-card" [@flipInOut]>
      <h2 class="mb">{{ product?.title }}</h2>
      <img *ngIf="product?.image" [src]="product?.image" [alt]="product?.title" />
      <p class="product-description">{{ product?.text }}</p> <!-- Added product description here -->
      <br />
      <div *ngIf="isDonateProduct(); else regularProduct" class="glass-card">
  <p>Выберите сумму пожертвования:</p>
  <mat-button-toggle-group [(value)]="selectedDonationAmount" hideSingleSelectionIndicator>
    <mat-button-toggle *ngFor="let amount of donationAmounts" [value]="amount">
      {{ amount }} ₽
    </mat-button-toggle>
  </mat-button-toggle-group>
  <p *ngIf="selectedDonationAmount" class="selected-amount">
    Сумма пожертвования: {{ selectedDonationAmount }} ₽
  </p>
</div>

<!-- Email Input Field -->
<div class="email-input glass-card">
  <label for="email">Эл. почта для отправки чека:</label>
  <input
    id="email"
    type="email"
    [(ngModel)]="customerEmail"
    required
    placeholder="example@mail.com"
    class="styled-input"
  />
</div>

<ng-template #regularProduct>
  <p>Цена за единицу: {{ product?.price }} ₽</p>
  <div class="quantity-selector glass-card-radio">
  <label>Количество:</label>
  <div class="quantity-control">
    <button mat-mini-fab color="accent" (click)="decrementQuantity()" [disabled]="quantity <= 1">
      <mat-icon>remove</mat-icon>
    </button>
    <input
      type="number"
      inputmode="decimal"
      min="1"
      [(ngModel)]="quantity"
      (ngModelChange)="updateTotalPrice()"
      class="quantity-input"
    />
    <button mat-mini-fab color="accent" (click)="incrementQuantity()">
      <mat-icon>add</mat-icon>
    </button>
  </div>
</div>


  <p>Общая цена: {{ totalPrice }} ₽</p>
</ng-template>

<!-- Booking & Payment Logic -->
<div *ngIf="product?.type === 'consultation'">
  <!-- Booking Workflow -->
  <h2>Выберите специалиста</h2>
  <div class="specialists">
    <button
      *ngFor="let specialist of specialists"
      (click)="onSelectSpecialist(specialist)"
      [class.selected]="selectedSpecialist?.id === specialist.id"
    >
      {{ specialist.name }}
    </button>
  </div>

  <div *ngIf="selectedSpecialist">
    <h2>Выберите дату</h2>
    <div class="dates">
    <button
      *ngFor="let date of nextSevenDates; let i = index"
      (click)="onSelectDate(date)"
      [class.selected]="selectedDate === date"
      [disabled]="isDateUnavailable(date)"
    >
        {{ date }}
      </button>
    </div>
  </div>

  <div *ngIf="selectedDate">
    <h2>Выберите время</h2>
    <div class="times">
      <button
        *ngFor="let time of availableTimes"
        (click)="selectedTime = time"
        [class.selected]="selectedTime === time"
      >
        {{ time }}
      </button>
    </div>
  </div>
</div>

<!-- Payment Button Logic -->
<div>
  <button
    mat-raised-button
    color="accent"
    class="custom-pay-button"
    (click)="purchaseProduct()"
    [disabled]="
      isLoading ||
      (product?.type === 'consultation' &&
        (!selectedSpecialist || !selectedDate || !selectedTime)) ||
      (isDonateProduct() && !selectedDonationAmount)
    "
  >
    {{ isLoading ? 'Обработка...' : 'Оплатить' }}
  </button>
</div>



<div class="payment-method-selector glass-card-radio" *ngIf="paymentMethods.length > 1; else singleMethod">
  <p>Выберите способ оплаты:</p>
  <mat-radio-group [(ngModel)]="selectedPaymentMethod">
    <mat-radio-button *ngFor="let method of paymentMethods" [value]="method.token" [disabled]="method.disabled" class="payment-radio-button">
      <img [src]="method.icon" alt="{{ method.name }}" class="payment-method-icon" />
      <span>{{ method.name }}</span>
    </mat-radio-button>
  </mat-radio-group>
</div>

<ng-template #singleMethod>
  <input type="hidden" [value]="paymentMethods[0]?.token" [(ngModel)]="selectedPaymentMethod" />
</ng-template>




      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <ng-template #notFound>
      <div class="centered1" [@flipInOut]>
        <h2>Продукт не найден</h2>
        <button (click)="goBack()" class="payment-button">Вернуться назад</button>
      </div>
    </ng-template>
  `,

  styles: [
    `
      .centered1 {
        display: none; /* Default state is hidden */
      }

      .centered1[ng-reflect-ng-if="true"] {
        display: block; /* Make it visible when the condition is true */
      }
      .payment-button {
        padding: 5px 10px;
        border: none;
        border-radius: 5px;
        cursor: pointer;
      }
      .payment-button:hover {
        background-color: #006c9e;
      }
      .error-message {
        color: #ff0000;
        margin-top: 10px;
      }
      .product-description {
        font-size: 1rem;
        color: var(--tg-theme-text-color, #ffffff); /* Dynamic color based on theme */
        margin-bottom: 15px;
      }
      .price,
      .total-price {
        font-size: 1rem;
        color: var(--tg-theme-text-color, #ffffff); /* Dynamic color for price */
        margin-bottom: 10px;
      }
      .input-group {
        margin-bottom: 15px;
      }

      .input-group label {
        display: block;
        margin-bottom: 5px;
        color: var(--tg-theme-text-color, #ffffff); /* Dynamic color for label */
        font-weight: bold;
      }

      .styled-input,
      .styled-select {
        width: 100%;
        padding: 8px;
        border: 1px solid var(--tg-theme-button-color, #cc8f00);
        border-radius: 5px;
        font-size: 1rem;
        background-color: var(--tg-theme-secondary-bg-color, #f5f5f5);
        color: var(--tg-theme-text-color, #ffffff);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }

      .styled-input:focus,
      .styled-select:focus {
        border-color: var(--tg-theme-link-color, #98e01b);
        box-shadow: 0 0 5px#56980a;
        outline: none;
        }

        .custom-pay-button {
          padding: 16px 32px;
          font-size: 1.2rem;
          font-weight: bold;
          background-color: var(--tg-theme-button-color, #ccaa00);
          color: var(--tg-theme-button-text-color, #ffffff);
          border-radius: 10px;
          text-transform: uppercase;
          transition: background-color 0.3s ease, transform 0.2s ease;
        }

        .custom-pay-button:hover {
          background-color: lighten(var(--tg-theme-button-color, #ccc500), 100%);
          transform: scale(1.10);
        }

        .custom-pay-button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
      .quantity-selector {
        width: 100%;
        margin-bottom: 20px;
      }

      .quantity-selector label {
        display: block;
        margin-bottom: 10px;
        font-weight: bold;
        color: var(--tg-theme-text-color, #ffffff);
      }

      .quantity-control {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 10px;
      }

      .quantity-input {
        width: 60px;
        text-align: center;
        padding: 8px;
        font-size: 1rem;
        border: 2px solid var( #ffa726) !important;
        border-radius: 5px;
        background-color: var(--tg-theme-secondary-bg-color, #ffcc80);
        color: var(--tg-theme-text-color, #ffffff);
        transition: border-color 0.3s ease, box-shadow 0.3s ease;
      }

      /* Focus State for Quantity Input */
      .quantity-input:focus {
        outline: none;
        border-color: #ffb74d;            /* Slightly lighter orange on focus */
        box-shadow: 0 0 5px rgba(255, 167, 38, 0.6); /* Orange glow */
      }

      button[mat-mini-fab] {
        min-width: 40px;
        height: 40px;
      }

      /* Base style for the increment and decrement buttons */
      .quantity-control button[mat-mini-fab] {
        background-color: #ffa726; /* Orange-yellowish color */
        color: #ffffff;            /* White icon color */
        transition: background-color 0.2s ease, transform 0.2s ease;
      }

      /* Hover state */
      .quantity-control button[mat-mini-fab]:hover {
        background-color: #ffb74d; /* Slightly lighter orange */
      }

      /* Active (clicked) state */
      .quantity-control button[mat-mini-fab]:active {
        background-color: #ffcc80; /* Even lighter orange */
      }

      /* Focus state */
      .quantity-control button[mat-mini-fab]:focus {
        outline: none;
        box-shadow: 0 0 5px #ffa726; /* Subtle orange glow */
      }

      /* Ensure the icon inside the button stays visible */
      .quantity-control button[mat-mini-fab] mat-icon {
        color: #ffffff; /* Keep the icon white */
      }

      /* Prevent buttons from staying darkened on mobile */
      .quantity-control button[mat-mini-fab]:not(:hover):not(:active) {
        background-color: #ffa726; /* Reset to base color */
      }



      .payment-method-selector {
        margin-bottom: 20px;
      }

      .payment-method-selector p {
        font-weight: bold;
        margin-bottom: 10px;
        color: var(--tg-theme-text-color, #ffffff);
      }

      .payment-radio-button {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        gap: 10px; /* Space between the radio button and the icon/text */
        position: relative;
      }

      .payment-radio-button .mat-radio-container {
        position: static; /* Reset any positioning that might cause displacement */
      }

      .payment-method-icon {
        width: 30px;
        height: 30px;
        flex-shrink: 0; /* Prevent the icon from shrinking */
      }

      .payment-radio-button span {
        font-size: 1.1rem;
        color: var(--tg-theme-text-color, #ffffff);
        flex-grow: 1; /* Allow the text to take the remaining space */
      }


      .payment-radio-button.mat-radio-button-disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }

      /* Selected State */
      .payment-radio-button.mat-radio-checked {
        background-color: #ffcc80; /* Light orange background for selected state */
        border-color: #ffb74d;     /* Slightly lighter orange border */
      }

      .payment-method-icon {
        width: 40px;
        height: 40px;
        margin-right: 15px;
      }

      .payment-radio-button span {
        font-size: 1.1rem;
        color: var(--tg-theme-text-color, #ffffff);
      }

      .specialists button {
        margin: 5px;
        padding: 10px 20px;
        border: 1px solid #c97425;
        background-color: #554848;
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.3s ease;
      }

      .specialists button:hover {
        background-color: #fce145;
        color: white;
        border: 2px solid #fce145;
      }

      .specialists button.selected {
        background-color: #ff9d00;
        color: white;
        border: 2px solid #bbcde0;
      }

      .specialists button:disabled {
        background-color: #dddddd;
        color: #aaaaaa;
        cursor: not-allowed;
      }

      .dates button {
        margin: 5px;
        padding: 10px 20px;
        border: 1px solid #c97425;
        background-color: #554848;
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.3s ease;
      }

      .dates button:hover {
        background-color: #fce145;
        color: white;
        border: 2px solid #fce145;
      }

      .dates button.selected {
        background-color: #ff9d00;
        color: white;
        border: 2px solid #bbcde0;
      }

      .dates button:disabled {
        background-color: #dddddd;
        color: #aaaaaa;
        cursor: not-allowed;
      }

      .times button {
        margin: 5px;
        padding: 10px 20px;
        border: 1px solid #c97425;
        background-color: #554848;
        cursor: pointer;
        border-radius: 5px;
        transition: all 0.3s ease;
      }

      .times button:hover {
        background-color: #fce145;
        color: white;
        border: 2px solid #fce145;
      }

      .times button.selected {
        background-color: #ff9d00;
        color: white;
        border: 2px solid #bbcde0;
      }

      .times button:disabled {
        background-color: #dddddd;
        color: #aaaaaa;
        cursor: not-allowed;
      }


    `,
  ],
  animations: [
    trigger('flipInOut', [
      transition(':enter', [
        style({ transform: 'rotateY(90deg)', opacity: 0 }),
        animate('0.5s ease-out', style({ transform: 'rotateY(0)', opacity: 1 })),
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({ transform: 'rotateY(-90deg)', opacity: 0 })),
      ]),
    ]),
  ],
})
export class ProductComponent implements OnInit, OnDestroy {
  product: IProduct | null = null;
  isLoading = false;
  selectedDonationAmount: number | null = null;
  donationAmounts = [100, 200, 500, 1000];
  customerEmail: string = ''; // To store the customer's email address
  errorMessage: string | null = null;
  selectedPaymentMethod: string;
  quantity: number = 1; // Default quantity
  totalPrice: number = 0; // Calculated total price
  specialists: any[] = [];
  selectedSpecialist: any = null;
  availableDates: string[] = [];
  availableTimes: string[] = [];
  selectedDate: string | null = null;
  selectedTime: string | null = null;
  category = ''; // To store the product's category
  paymentMethods = [
   // { name: 'PayMaster', token: environment.paymentTokens.payMaster, icon: 'assets/icons/paymaster.png', disabled: false },
    { name: 'ЮKassa', token: environment.paymentTokens.yuKassa, icon: 'assets/icons/yukassa.png', disabled: false },
  //  { name: 'Сбербанк', token: environment.paymentTokens.sberbank, icon: 'assets/icons/sberbank.png', disabled: true },
  ];

  bookingDetails: {
    specialistId: string;
    specialistName: string;
    date: string;
    time: string;
  } | null = null;
  
  
  

  private pollingInterval: any;

  constructor(
    private products: ProductsService,
    private telegram: TelegramService,
    private route: ActivatedRoute,
    private location: Location,
    private http: HttpClient,
    private router: Router,
    private firestore: Firestore
  ) {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.products.getById(id).subscribe({
        next: (product) => {
          if (product) {
            this.product = product;
            this.updateTotalPrice();

            this.category = product.type; // Set category
            if (this.category === 'consultation') {
              this.loadSpecialists(); // Load specialists if category is Consultation
            }
          } else {
            console.error(`Product with ID ${id} not found.`);
          }
        },
        error: (error) => {
          console.error('Error fetching product:', error);
        },
      });
    }
    this.selectedPaymentMethod = this.paymentMethods[0].token;
    this.updateTotalPrice();
  }

  nextSevenDates: string[] = [];

  ngOnInit(): void {
    this.telegram.BackButton.show();
    this.telegram.BackButton.onClick(() => this.goBack());
    this.generateNextSevenDates();
  }

  ngOnDestroy(): void {
    this.telegram.BackButton.offClick(() => this.goBack());
    this.stopPollingPaymentSignal();    
  }

  isDateUnavailable(date: string): boolean {
    return !this.selectedSpecialist || !this.availableDates.includes(date);
  }

  private generateNextSevenDates(): void {
    const today = new Date();
    this.nextSevenDates = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(today);
      date.setDate(today.getDate() + i); // Add `i` days to today's date
      return date.toISOString().split('T')[0]; // Format as YYYY-MM-DD
    });
  }

  goBack() {
    this.location.back();
  }

  isDonateProduct(): boolean {
    return this.product?.type === 'donate';
  }

  async loadSpecialists(): Promise<void> {
    if (!this.product) {
      console.error('Cannot load specialists without product details.');
      return;
    }

    console.log('Querying specialists for topic:', this.product.type);

    const specialistsRef = collection(this.firestore, 'specialists');
    const q = query(specialistsRef, where('topic', '==', this.product.type));
    const querySnapshot = await getDocs(q);

    this.specialists = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log('Loaded specialists:', this.specialists);
  }

  onSelectSpecialist(specialist: any): void {
    this.selectedSpecialist = specialist;
    this.availableDates = Object.keys(specialist.availability || {});
    this.selectedDate = null;
    this.selectedTime = null;

    console.log('Specialist selected:', specialist);
    console.log('Available dates:', this.availableDates);
  }

  onSelectDate(date: string): void {
    this.selectedDate = date;
    this.availableTimes = this.selectedSpecialist.availability[date] || [];

    console.log('Date selected:', date);
    console.log('Available times for date:', this.availableTimes);
  }

  updateTotalPrice() {
    if (this.product) {
      this.totalPrice = this.product.price * this.quantity;
    }
  }

  incrementQuantity() {
    this.quantity++;
    this.updateTotalPrice();
  }
  
  decrementQuantity() {
    if (this.quantity > 1) {
      this.quantity--;
      this.updateTotalPrice();
    }
  }  

  async purchaseProduct() {
    if (!this.product) {
      alert('Продукт не найден.');
      return;
    }
  
    if (!this.customerEmail || !this.customerEmail.includes('@')) {
      alert('Пожалуйста, введите действительный email.');
      return;
    }

    if (this.product.type === 'consultation' && (!this.selectedSpecialist || !this.selectedDate || !this.selectedTime)) {
      alert('Выберите специалиста, дату и время.');
      return;
    }
    const bookingDetails = this.product.type === 'consultation'
    ? {
        specialistId: this.selectedSpecialist.id,
        specialistName: this.selectedSpecialist.name,
        date: this.selectedDate,
        time: this.selectedTime,
      }
    : null;
  
    console.log('Booking Details for Payment:', bookingDetails);
  
    try {
      this.isLoading = true;
      this.errorMessage = null;
  
      const amount = this.isDonateProduct()
        ? this.selectedDonationAmount
        : this.product.price * this.quantity;
  
      if (!amount) {
        alert('Пожалуйста, выберите сумму пожертвования.');
        return;
      }
  
      // Generate a unique order ID
      const orderId = `order_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
      // Gather Telegram user data
      const telegram = (window as any).Telegram?.WebApp;
      console.log('initData:', telegram?.initData);
      console.log('initDataUnsafe:', telegram?.initDataUnsafe);

      const telegram_user_id = telegram?.initDataUnsafe?.user?.id || 'Unknown';
      const telegram_username = telegram?.initDataUnsafe?.user?.username || 'Unknown';
  
      // Gather device information
      const device_info = `${navigator.platform} - ${navigator.userAgent}`;

      console.log({
        telegram_user_id,
        telegram_username,
        email: this.customerEmail,
        device_info,
      });
  
      // Prepare the provider_data for YooKassa
      const provider_data = {
        receipt: {
          customer: {
            email: this.customerEmail,
          },
          items: [
            {
              description: this.product.title,
              quantity: this.isDonateProduct()
                ? 1 // Donations don't have quantity beyond 1
                : this.quantity, // Use selected quantity for regular products
              amount: {
                value: this.isDonateProduct()
                  ? this.selectedDonationAmount.toFixed(2) // Use donation amount for donations
                  : (this.product.price * this.quantity).toFixed(2), // Calculate total for regular products
                currency: 'RUB',
              },
              vat_code: 1,
              payment_mode: 'full_prepayment',
              payment_subject: 'service',
            },
          ],          
        },
      };

      // Booking details
      const bookingDetails = this.bookingDetails; // Include booking details
  
      // Payment data
      const paymentData = {
        chat_id: await this.telegram.getUserChatId(),
        provider_token: this.selectedPaymentMethod,
        title: this.product.title,
        description: `Payment for ${this.product.title}`,
        currency: 'RUB',
        prices: [
          {
            label: `${this.product.title} x${this.quantity}`,
            amount: amount * 100,
          },
        ],
        payload: orderId,
        provider_data,
        email: this.customerEmail,
        telegram_user_id,
        telegram_username,
        device_info,
        bookingDetails, // Include booking details in the payload
      };

      console.log('Constructed Receipt Item:', {
        description: this.product.title,
        quantity: this.isDonateProduct() ? 1 : this.quantity,
        amount: {
          value: this.isDonateProduct()
            ? this.selectedDonationAmount.toFixed(2)
            : (this.product.price * this.quantity).toFixed(2),
          currency: 'RUB',
        },
      });
      console.log('Provider Data:', provider_data);
      console.log('Invoice Prices:', paymentData.prices);
      

      console.log('Invoice Amount:', paymentData.prices[0].amount);
      console.log('Receipt Amount:', provider_data.receipt.items[0].amount.value);
  
      const response = await this.http
        .post<{ invoice_link: string }>(`${environment.apiUrl}/createInvoiceLink`, paymentData)
        .toPromise();
  
      if (response?.invoice_link) {
        const chatId = await this.telegram.getUserChatId();
        this.startPollingForPaymentSignal(chatId, orderId);
        this.telegram.openInvoice(response.invoice_link, (result: any) => {
          if (result?.status === 'paid') {
            if (this.product.type === 'consultation') {
              this.storeBookingDetails(orderId, this.bookingDetails);
            }
          //  this.router.navigate(['/success']);
          } else if (result?.status === 'cancelled') {
            this.errorMessage = 'Оплата была отменена.';
          }
        });
      } else {
        this.errorMessage = 'Ошибка при создании ссылки на оплату.';
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      this.errorMessage = 'Ошибка при обработке оплаты.';
    } finally {
      this.isLoading = false;
    }
  }

  private async storeBookingDetails(orderId: string, bookingDetails: any): Promise<void> {
    try {
      const bookingRef = collection(this.firestore, 'bookingRecords');
      const telegram = (window as any).Telegram?.WebApp;
      const telegram_username = telegram?.initDataUnsafe?.user?.username || 'Unknown';
      await addDoc(bookingRef, {
        orderId,
        bookingDetails,
        productId: this.product?.id,
        productTitle: this.product?.title,
        email: this.customerEmail,
        date: new Date().toISOString(),
        telegram_username, // Add Telegram username
      });
      console.log('Booking details saved successfully!');
    } catch (error) {
      console.error('Error saving booking details:', error);
    }
  }
  
  
  
 
  startPollingForPaymentSignal(chatId: number, orderId: string) {
    const interval = setInterval(async () => {
      try {
        const paymentSignalsRef = collection(this.firestore, 'paymentSignals');
        const q = query(paymentSignalsRef, where('chat_id', '==', chatId), where('order_id', '==', orderId));
        const querySnapshot = await getDocs(q);

        let paymentConfirmed = false;

        querySnapshot.forEach((doc) => {
          const data = doc.data();
          if (data && data['status'] === 'paid') {
            console.log('Payment confirmed:', data);
            paymentConfirmed = true;
          }
        });

        if (paymentConfirmed) {
          clearInterval(interval);
          this.router.navigate(['/success']);
        } else {
          console.log('No successful payment found yet for chat ID: ${chatId} and order ID: ${orderId}');
        }
      } catch (error) {
        console.error('Error polling Firestore for payment signal:', error.message);
      }
    }, 3000);
  }

  private stopPollingPaymentSignal() {
    if (this.pollingInterval) {
      clearInterval(this.pollingInterval);
      console.log('Stopped polling for payment signal.');
    }
  }
}
