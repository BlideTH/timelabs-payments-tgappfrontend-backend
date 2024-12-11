import { Component, Input } from '@angular/core';
import { IProduct } from '../../services/products.service';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common'; // Import CommonModule for ngFor
import { trigger, transition, style, animate } from '@angular/animations';

@Component({
  selector: 'app-product-list',
  standalone: true,
  imports: [CommonModule, RouterLink], // Add CommonModule to support ngFor
  template: `
    <h2 class="mb">{{ title }}</h2>
    <h4 class="mb">{{ subtitle }}</h4>
    <ul class="products">
      <li *ngFor="let product of products; trackBy: trackById" class="product-item" [routerLink]="'/product/' + product.id" [@scrollReveal]>
        <div class="product-image">
          <img [src]="product.image" [alt]="product.title" />
        </div>
        <div class="product-info">
          <h3>{{ product.title }}</h3>
          <p class="hint">{{ product.text }}</p>
          <p class="hint">{{ product.time }}</p>
        </div>
      </li>
    </ul>
  `,
  styles: [
    `
      .products {
        list-style: none;
        padding: 0;
        margin: 0;
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
        background: var(--tg-theme-secondary-bg-color);
        text-align: center;
      }
      .product-image img {
        display: block;
        padding: 10px;
      }
      .product-info {
        padding: var(--main-padding);
      }
    `
  ],
  animations: [
    trigger('scrollReveal', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(20px)' }),
        animate('0.5s ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ])
  ]
})
export class ProductListComponent {
  @Input() title: string;
  @Input() subtitle: string;
  @Input() products: IProduct[];

  // TrackBy function to improve performance by tracking products by their id
  trackById(index: number, product: IProduct): string {
    return product.id;
  }
}
