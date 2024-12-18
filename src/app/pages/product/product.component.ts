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

@Component({
  selector: 'app-product',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div *ngIf="product; else notFound" class="centered" [@flipInOut]>
      <h2 class="mb">{{ product?.title }}</h2>
      <br />
      <img [src]="product?.image" [alt]="product?.title" />
      <p>Цена за единицу: {{ product?.price }} ₽</p>

      <div>
        <label for="quantity">Количество:</label>
        <input
          id="quantity"
          type="number"
          min="1"
          [(ngModel)]="quantity"
          (ngModelChange)="updateTotalPrice()"
        />
      </div>

      <p>Общая цена: {{ totalPrice }} ₽</p>

      <div>
        <label for="paymentMethod">Выберите способ оплаты:</label>
        <select id="paymentMethod" [(ngModel)]="selectedPaymentMethod">
          <option *ngFor="let method of paymentMethods" [value]="method.token">
            {{ method.name }}
          </option>
        </select>
      </div>

      <button (click)="purchaseProduct()" class="payment-button" [disabled]="isLoading">
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
  errorMessage: string | null = null;
  selectedPaymentMethod: string;
  quantity: number = 1; // Default quantity
  totalPrice: number = 0; // Calculated total price
  paymentMethods = [
    { name: 'PayMaster', token: environment.paymentTokens.payMaster },
    { name: 'ЮKassa', token: environment.paymentTokens.yuKassa },
    { name: 'Сбербанк', token: environment.paymentTokens.sberbank },
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

  updateTotalPrice() {
    if (this.product) {
      this.totalPrice = this.product.price * this.quantity;
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

      const paymentData = {
        chat_id: await this.telegram.getUserChatId(),
        provider_token: this.selectedPaymentMethod,
        title: this.product.title,
        description: `Payment for ${this.product.title} (x${this.quantity})`,
        currency: 'RUB',
        prices: [
          {
            label: `${this.product.title} x${this.quantity}`,
            amount: this.totalPrice * 100, // Telegram expects the smallest currency unit
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
