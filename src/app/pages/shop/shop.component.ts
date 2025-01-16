import { Component, inject, OnInit } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';
import { ProductsService, IProduct, ICategory } from '../../services/products.service';
import { ProductListComponent } from '../../components/product-list/product-list.component';
import { trigger, transition, style, animate } from '@angular/animations';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-shop',
  standalone: true,
  imports: [CommonModule, ProductListComponent],
  template: `
    <div class="shop-container glass-card" [class.dark]="theme === 'dark'" [class.light]="theme === 'light'">
      <ng-container *ngFor="let category of categories; trackBy: trackById">
        <div
          class="category-header" id="{{ 'object-' + category.id }}"
          (click)="toggleCategory(category.id)"
          [class.expanded]="expandedCategories[category.id]"
        >
          <h3>{{ category.name }}</h3>
        </div>
        <div
          class="category-products"
          *ngIf="expandedCategories[category.id]"
          [@scrollReveal]
        >
          <app-product-list
            [title]="category.name"
            [subtitle]="category.description || ''"
            [products]="groupedProducts[category.id] || []"
          ></app-product-list>
        </div>
      </ng-container>

      <div *ngIf="isLoading" class="loading">Загрузка продуктов...</div>
      <div *ngIf="errorMessage" class="error">{{ errorMessage }}</div>
    </div>
  `,
  styles: [
    `
      .category-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      cursor: pointer;
      padding: 15px;
      background: #1c1c1c; /* Hardcoded dark background */
      border: 1px solid #ffa726; /* Orangish border */
      color: #ffffff; /* White text color */
      transition: background-color 0.3s ease, border-color 0.3s ease;
      border-radius: 10px; /* Smooth rounded edges */
      margin-bottom: 10px;
    }
    
    .category-header:hover {
      background-color: #292929; /* Slightly lighter on hover */
      border-color: #ffcc80; /* Lighter orange on hover */
    }

    .category-header h3 {
      font-size: 1.2rem;
      margin: 0;
      flex-grow: 1; /* Ensures text takes maximum space */
    }

    .category-header span {
      font-size: 1.5rem;
      font-weight: bold;
      color: #ffa726; /* Orangish icon for + and - */
    }

    .category-products {
      padding: 10px 15px;
      background: #1c1c1c; /* Matches the dark theme */
      border-radius: 10px;
      border: 1px solid #ffa726; /* Matches the header border */
      margin-bottom: 20px;
    }

    .loading,
    .error {
      text-align: center;
      margin: 20px;
      color: #ffffff; /* Ensure text is visible on dark background */
    }

    #object-47 { display: none; }

    #object-46 { display: none; }
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
export class ShopComponent implements OnInit {
  telegram = inject(TelegramService);
  categories: ICategory[] = [];
  groupedProducts: Record<string, IProduct[]> = {}; // Grouped by category ID
  expandedCategories: Record<string, boolean> = {}; // Tracks expanded categories
  isLoading = false;
  errorMessage: string | null = null;
  theme: 'light' | 'dark' = 'dark';

  constructor(private productsService: ProductsService) {
    this.telegram.BackButton.hide();
    const tg = (window as any).Telegram?.WebApp;
    this.theme =
      tg?.themeParams?.theme ||
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  private loadCategories(): void {
    this.isLoading = true;
    this.productsService.fetchCategoriesFromFirestore().subscribe({
      next: (categories) => {
        // Filter out "Misc" category
        this.categories = categories.filter(
          (category) => category.name.toLowerCase() !== 'misc'
        );
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Failed to load categories:', error);
        this.errorMessage = 'Ошибка загрузки категорий. Попробуйте позже.';
        this.isLoading = false;
      },
    });
  }

  toggleCategory(categoryId: string): void {
    this.expandedCategories[categoryId] = !this.expandedCategories[categoryId];

    if (this.expandedCategories[categoryId] && !this.groupedProducts[categoryId]) {
      this.loadProductsForCategory(categoryId);
    }
  }

  private loadProductsForCategory(categoryId: string): void {
    const categoryName = this.categories.find((category) => category.id === categoryId)?.name;
  
    if (!categoryName) {
      console.error(`Category name not found for category ID: ${categoryId}`);
      return;
    }
  
    this.isLoading = true;
  
    this.productsService.fetchProductsFromFirestore().subscribe({
      next: (products) => {
        console.log('All fetched products:', products); // Log all products fetched from Firestore
  
        // Match products based on the category name
        const filteredProducts = products.filter((product) =>
          product.categories?.some((category) => category === categoryName)
        );
  
        console.log(`Filtered products for category "${categoryName}":`, filteredProducts);
  
        this.groupedProducts[categoryId] = filteredProducts;
        this.isLoading = false;
  
        if (filteredProducts.length === 0) {
          console.warn(`No products found for category "${categoryName}"`);
        }
      },
      error: (error) => {
        console.error(`Failed to load products for category "${categoryName}":`, error);
        this.errorMessage = `Ошибка загрузки продуктов для категории. Попробуйте позже.`;
        this.isLoading = false;
      },
    });
  }
  

  trackById(index: number, item: ICategory | IProduct): string {
    return item.id;
  }
}
