import { Component, Input } from '@angular/core';
import { IProduct } from '../../services/products.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div *ngIf="products?.length; else noProducts" class="product-list-container">
      <h2 class="mb">{{ title }}</h2>
      <h4 class="mb">{{ subtitle }}</h4>
      <ul class="products">
        <li 
          *ngFor="let product of products; trackBy: trackById" 
          [class.empty-product]="!product.image" 
          class="product-item" 
          [routerLink]="'/product/' + product.id" 
          [@scrollReveal]
          [attr.aria-label]="product.title"
          >
          <div *ngIf="product.image" class="product-image glass-card-radio">
            <img [src]="product.image" [alt]="product.title || 'Product image'" />
          </div>
          <div class="product-info glass-card-radio">
            <h3>{{ product.title }}</h3>
            <p class="hint" *ngIf="product.time">{{ product.time }}</p>
            <p class="price" *ngIf="product.price">{{ product.price | currency:'RUB':'symbol':'1.2-2' }}</p>
          </div>
        </li>
      </ul>
    </div>
    <ng-template #noProducts>
      <div class="no-products-message">
        <p>Продукты не найдены. Попробуйте позже.</p>
      </div>
    </ng-template>
  `,
  styles: [
    `
      .products {
        list-style: none;
        padding: 0;
        margin: 0;
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
        gap: 16px;
      }
      .product-item {
        overflow: hidden;
        box-shadow: 2px 3px 6px rgba(0, 0, 0, 0.25);
        border-radius: 10px;
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .product-item:hover {
        transform: scale(1.05);
        box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
      }
      .product-image {
        display: flex;
        justify-content: center;
        align-items: center;
        background: var(--tg-theme-secondary-bg-color);
        padding: 16px;
        border-bottom: 1px solid rgba(0, 0, 0, 0.1);
      }
      .product-image img {
        display: block;
        max-width: 100%;
        height: auto;
        object-fit: cover;
      }
      .product-info {
        padding: var(--main-padding);
      }
      .price {
        font-weight: bold;
        margin-top: 8px;
        color: var(--tg-theme-text-color, #ffffff);
      }
      .no-products-message {
        text-align: center;
        margin-top: 20px;
        color: var(--tg-theme-hint-color, #999999);
      }
    `,
  ],
  animations: [
    trigger('scrollReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ],
})
export class ProductListComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() products: IProduct[] | null = null;

  trackById(index: number, product: IProduct): string {
    return product.id;
  }
}
