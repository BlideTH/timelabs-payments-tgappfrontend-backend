import { Component, OnDestroy, OnInit } from '@angular/core';
import { IProduct, ProductsService } from '../../services/products.service';
import { TelegramService } from '../../services/telegram.service';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { trigger, transition, style, animate } from '@angular/animations';
import { Router } from '@angular/router';
import { Firestore, collection, query, where, getDocs } from '@angular/fire/firestore';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';



@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule, MatButtonModule, MatButtonToggleModule, MatIconModule, MatRadioModule],
  template: `
    <div *ngIf="product; else notFound" class="centered" [@flipInOut]>
      <h2 class="mb">{{ product?.title }}</h2>
      <img *ngIf="product?.image" [src]="product?.image" [alt]="product?.title" />
      <p class="product-description">{{ product?.text }}</p> <!-- Added product description here -->
      <br />
      <div *ngIf="isDonateProduct(); else regularProduct">
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

<ng-template #regularProduct>
  <p>Цена за единицу: {{ product?.price }} ₽</p>
  <div class="quantity-selector">
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


<div class="payment-method-selector">
  <p>Выберите способ оплаты:</p>
  <mat-radio-group [(ngModel)]="selectedPaymentMethod">
    <mat-radio-button *ngFor="let method of paymentMethods" [value]="method.token" [disabled]="method.disabled" class="payment-radio-button">
      <img [src]="method.icon" alt="{{ method.name }}" class="payment-method-icon" />
      <span>{{ method.name }}</span>
    </mat-radio-button>
  </mat-radio-group>
</div>



      <button mat-raised-button color="accent" class="custom-pay-button" (click)="purchaseProduct()" [disabled]="isLoading || (isDonateProduct() && !selectedDonationAmount)">
        {{ isLoading ? 'Обработка...' : 'Оплатить' }}
      </button>

      <p *ngIf="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <ng-template #notFound>
      <div class="centered" [@flipInOut]>
        <h2>Продукт не найден</h2>
        <button (click)="goBack()" class="payment-button">Вернуться назад</button>
      </div>
    </ng-template>
  `,
  styles: [
    `
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
          background-color: lighten(var(--tg-theme-button-color, #ccc500), 10%);
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
        border: 2px solid var(--tg-theme-button-color, #ffa726) !important;
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
        margin-bottom: 15px;
        padding: 10px;
        border: 1px solid #ffa726; /* Orange border color */
        border-radius: 8px;
        width: 100%;
        cursor: pointer;
        transition: background-color 0.3s ease, box-shadow 0.3s ease;
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
  errorMessage: string | null = null;
  selectedPaymentMethod: string;
  quantity: number = 1; // Default quantity
  totalPrice: number = 0; // Calculated total price
  paymentMethods = [
    { name: 'PayMaster', token: environment.paymentTokens.payMaster, icon: 'assets/icons/paymaster.png', disabled: false },
    { name: 'ЮKassa', token: environment.paymentTokens.yuKassa, icon: 'assets/icons/yukassa.png', disabled: false },
  //  { name: 'Сбербанк', token: environment.paymentTokens.sberbank, icon: 'assets/icons/sberbank.png', disabled: true },
  ];
  
  

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
      this.product = this.products.getById(id) || null;
    }
    this.selectedPaymentMethod = this.paymentMethods[0].token;
    this.updateTotalPrice();
  }

  ngOnInit(): void {
    this.telegram.BackButton.show();
    this.telegram.BackButton.onClick(() => this.goBack());
  }

  ngOnDestroy(): void {
    this.telegram.BackButton.offClick(() => this.goBack());
    this.stopPollingPaymentSignal();
  }

  goBack() {
    this.location.back();
  }

  isDonateProduct(): boolean {
    return this.product?.type === 'donate';
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

    try {
      this.isLoading = true;
      this.errorMessage = null;

      const amount = this.isDonateProduct() ? this.selectedDonationAmount : this.product.price * this.quantity;

    if (!amount) {
      alert('Пожалуйста, выберите сумму пожертвования.');
      return;
    }
      
      const paymentData = {
        chat_id: await this.telegram.getUserChatId(),
        provider_token: this.selectedPaymentMethod,
        title: this.product.title,
        description: `Payment for ${this.product.title}`,
        currency: 'RUB',
        prices: [
          {
            label: `${this.product.title} x${this.quantity}`,
            amount: amount * 100, // Telegram expects the smallest currency unit
          },
        ],
        payload: `product_${this.product.id}`,
      };

      const response = await this.http
        .post<{ invoice_link: string }>(`${environment.apiUrl}/createInvoiceLink`, paymentData)
        .toPromise();

      if (response?.invoice_link) {
        const chatId = await this.telegram.getUserChatId();
        console.log('Polling for chatId:', chatId);

        this.startPollingForPaymentSignal(chatId);
        this.telegram.openInvoice(response.invoice_link, (result: any) => {
          console.log('Invoice result from openInvoice callback:', result);

          if (result?.status === 'paid') {
            this.router.navigate(['/success']);
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

  startPollingForPaymentSignal(chatId: number) {
    const interval = setInterval(async () => {
      try {
        const paymentSignalsRef = collection(this.firestore, 'paymentSignals');
        const q = query(paymentSignalsRef, where('chat_id', '==', chatId));
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
          console.log('No successful payment found yet for chat ID:', chatId);
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
