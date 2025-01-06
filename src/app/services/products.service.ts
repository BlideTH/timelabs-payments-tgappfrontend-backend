import { Injectable } from '@angular/core';
import { Observable, forkJoin, from, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Firestore, collection, collectionData, query, orderBy } from '@angular/fire/firestore';

const domain = 'https://payments.timelabs.su';

export enum ProductType {
  Consultation = 'consultation',
  Donate = 'donate',
  IT = 'it-product',
  Ticket = 'ticket',
  Subscription = 'subscription',
}

export interface IProduct {
  id: string;
  text: string; // Product description
  title: string; // Product name
  link: string; // Product permalink
  image?: string; // Product image URL
  time?: string; // Time-related info (optional)
  type: ProductType; // Mapped product type
  price?: number; // Product price
  categories?: string[]; // Product categories
}

export interface ICategory {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  order?: number;
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private firestore: Firestore) {}

   // Fetch all categories
   fetchCategoriesFromFirestore(): Observable<ICategory[]> {
    const categoriesCollection = collection(this.firestore, 'categories');
    const categoriesQuery = query(categoriesCollection, orderBy('order', 'asc'));

    return collectionData(categoriesQuery, { idField: 'id' }).pipe(
      map((categories: any[]) => categories),
      catchError((error) => {
        console.error('Error fetching categories from Firestore:', error);
        return [];
      })
    );
  }

  // Fetch products
  fetchProductsFromFirestore(): Observable<IProduct[]> {
    const productsCollection = collection(this.firestore, 'products');
    const productsQuery = query(productsCollection);

    return collectionData(productsQuery, { idField: 'id' }).pipe(
    map((products: any[]) => {
      console.log('Raw products from Firestore:', products); // Log raw product data
      return products.map((product) => this.mapFirestoreToIProduct(product));
    }),
    catchError((error) => {
      console.error('Error fetching products from Firestore:', error);
      return from([]); // Return an empty array on error
    })
  );
  }

  // Fetch categories with products grouped
  fetchCategoriesWithProducts(): Observable<Record<string, IProduct[]>> {
    return forkJoin({
      categories: this.fetchCategoriesFromFirestore(),
      products: this.fetchProductsFromFirestore(),
    }).pipe(
      map(({ categories, products }) => {
        const grouped: Record<string, IProduct[]> = {};
        categories.forEach((category) => {
          grouped[category.name] = products.filter((product) =>
            product.type === this.mapCategoryToType([category.name])
          );
        });
        return grouped;
      }),
      catchError((error) => {
        console.error('Error fetching categories with products:', error);
        return of({});
      })
    );
  }

  // Helper to map Firestore data to IProduct
  private mapFirestoreToIProduct(product: any): IProduct {
    return {
      id: product.id,
      title: product.name, // Map Firestore 'name' to 'title'
      text: product.description, // Firestore stores 'description'
      link: product.link, // Directly use Firestore 'link'
      image: product.image || '', // Use the stored image or empty string
      price: product.price || 0, // Use stored price
      categories: product.categories || [], // Map categories from Firestore
      type: this.mapCategoryToType(product.categories || []), // Map categories to ProductType
    };
  }

  // Helper function to map categories to ProductType
  private mapCategoryToType(categories: string[]): ProductType | null {
    console.log('Mapping categories:', categories); // Log the categories being mapped
    const categoryNames = categories.map((category) => category.toLowerCase());
    if (categoryNames.includes('консультации')) {
      return ProductType.Consultation;
    }
    if (categoryNames.includes('it-услуги')) {
      return ProductType.IT;
    }
    if (categoryNames.includes('донат')) {
      return ProductType.Donate;
    }
    if (categoryNames.includes('билеты')) {
      return ProductType.Ticket;
    }
    if (categoryNames.includes('подписки')) {
      return ProductType.Subscription;
    }
    return null; // No matching category found
  }

  // Method to get a product by ID
  getById(id: string): Observable<IProduct | null> {
    return this.fetchProductsFromFirestore().pipe(
      map((products) => products.find((product) => product.id === id) || null)
    );
  }

  // Method to get products grouped by type
  getProductsGroupedByType(): Observable<Record<ProductType, IProduct[]>> {
    return this.fetchProductsFromFirestore().pipe(
      map((products) =>
        products.reduce((group, prod) => {
          if (!group[prod.type]) {
            group[prod.type] = [];
          }
          group[prod.type].push(prod);
          return group;
        }, {} as Record<ProductType, IProduct[]>)
      )
    );
  }
}
