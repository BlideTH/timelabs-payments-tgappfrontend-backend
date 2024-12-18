import { Component, inject } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { ProductsService } from '../../services/products.service';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  template: `
    <div class="shop-container">
      <app-product-list 
        title="Консультации"
        subtitle="Удалённые консультации по Zoom"
        [products]="products.byGroup['consultation']"
        [@scrollReveal]
      />
      <app-product-list 
        title="VPN-ключи"
        subtitle="Персональные ключи доступа"
        [products]="products.byGroup['vpnkey']"
        [@scrollReveal]
      />
      <app-product-list 
        title="Консультации Таро"
        subtitle="Удалённые консультации по Zoom или Telegram"
        [products]="products.byGroup['tarot-consultation']"
        [@scrollReveal]
      />
      <app-product-list 
        title="Донат"
        subtitle="Поддержите наш проект донатом"
        [products]="products.byGroup['donate']"
        [@scrollReveal]
      />
    </div>
  `,
  animations: [
    trigger('flipInOut', [
      transition(':enter', [
        style({ transform: 'rotateY(-90deg)', opacity: 0 }), // Starts flipped away
        animate('0.5s ease-out', style({ transform: 'rotateY(0)', opacity: 1 })) // Flips into view
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({ transform: 'rotateY(90deg)', opacity: 0 })) // Flips out when leaving
      ])
    ]),
    trigger('scrollReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ShopComponent {
  telegram = inject(TelegramService);
  products = inject(ProductsService);

  constructor() {
    this.telegram.BackButton.hide();
  }
}
