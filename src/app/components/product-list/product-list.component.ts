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
          class="product-item" 
          [routerLink]="'/product/' + product.id" 
          [@scrollReveal]
          [attr.aria-label]="product.title"
        >
          <div class="product-background" [style.backgroundImage]="'url(' + product.image + ')'">
            <div class="product-overlay">
              <h3>{{ product.title }}</h3>
              <p class="price" *ngIf="product.price">{{ product.price | currency:'RUB':'symbol':'1.2-2' }}</p>
            </div>
          </div>
        </li>
      </ul>
    </div>
    <ng-template #noProducts>
      <div class="no-products-message">
        <p>Загрузка продуктов</p>
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
        cursor: pointer;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
      }
      .product-item:hover {
        transform: scale(1.05);
        box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
      }
      .product-background {
        display: flex;
        justify-content: center;
        align-items: center;
        background-size: cover;
        background-position: center;
        height: 150px;
        position: relative;
        border-radius: 8px;
        overflow: hidden;
      }
      .product-overlay {
        background: rgba(0, 0, 0, 0.6);
        color: #fff;
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        text-align: center;
      }
      .price {
        font-weight: bold;
        margin-top: 8px;
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
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' })),
      ]),
    ]),
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
