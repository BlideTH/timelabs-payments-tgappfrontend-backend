import { Component, inject, OnInit } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { ProductsService, IProduct, ProductType } from '../../services/products.service';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  template: `
    <div class="shop-container glass-card" [class.dark]="theme === 'dark'" [class.light]="theme === 'light'">
      <ng-container *ngIf="groupedProducts['consultation']?.length">
        <app-product-list
          title="Консультации"
          subtitle="Удалённые консультации по Zoom"
          [products]="groupedProducts['consultation']"
          [@scrollReveal]
        ></app-product-list>
      </ng-container>

      <ng-container *ngIf="groupedProducts['vpnkey']?.length">
        <app-product-list
          title="VPN-ключи"
          subtitle="Персональные ключи доступа"
          [products]="groupedProducts['vpnkey']"
          [@scrollReveal]
        ></app-product-list>
      </ng-container>

      <ng-container *ngIf="groupedProducts['it-product']?.length">
        <app-product-list
          title="IT-услуги"
          subtitle="Профессиональные IT-услуги"
          [products]="groupedProducts['it-product']"
          [@scrollReveal]
        ></app-product-list>
      </ng-container>

      <ng-container *ngIf="groupedProducts['tarot-consultation']?.length">
        <app-product-list
          title="Консультации Таро"
          subtitle="Удалённые консультации по Telegram"
          [products]="groupedProducts['tarot-consultation']"
          [@scrollReveal]
        ></app-product-list>
      </ng-container>

      <ng-container *ngIf="groupedProducts['donate']?.length">
        <app-product-list
          title="Донат"
          subtitle="Поддержите наш проект донатом"
          [products]="groupedProducts['donate']"
          [@scrollReveal]
        ></app-product-list>
      </ng-container>

      <div *ngIf="isLoading" class="loading">Загрузка продуктов...</div>
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
  `,
  animations: [
    trigger('flipInOut', [
      transition(':enter', [
        style({ transform: 'rotateY(-90deg)', opacity: 0 }),
        animate('0.5s ease-out', style({ transform: 'rotateY(0)', opacity: 1 }))
      ]),
      transition(':leave', [
        animate('0.5s ease-out', style({ transform: 'rotateY(90deg)', opacity: 0 }))
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
export class ShopComponent implements OnInit {
  telegram = inject(TelegramService);
  groupedProducts: Record<ProductType, IProduct[]> = {
    [ProductType.Consultation]: [],
    [ProductType.VPNKey]: [],
    [ProductType.IT]: [],
    [ProductType.TarotConsultation]: [],
    [ProductType.Donate]: [],    
  }; // Grouped products by type
  isLoading = false;
  errorMessage: string | null = null;
  theme: 'light' | 'dark' = 'dark';

  constructor(private productsService: ProductsService) {
    this.telegram.BackButton.hide();
    const tg = (window as any).Telegram?.WebApp;
    this.theme = tg?.themeParams?.theme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    this.isLoading = true;
    this.productsService.fetchProductsFromFirestore().subscribe({
      next: (fetchedProducts) => {
        console.log('Fetched products:', fetchedProducts); // Debug
        this.groupedProducts = this.groupProductsByType(fetchedProducts);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load products:', error);
        this.errorMessage = 'Ошибка загрузки продуктов. Попробуйте позже.';
        this.isLoading = false;
      },
    });
  }

  private groupProductsByType(products: IProduct[]): Record<ProductType, IProduct[]> {
    return products.reduce((group, prod) => {
      if (!group[prod.type]) {
        group[prod.type] = [];
      }
      group[prod.type].push(prod);
      return group;
    }, {} as Record<ProductType, IProduct[]>);
  }
}
