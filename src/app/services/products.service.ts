import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Firestore, collection, collectionData, query } from '@angular/fire/firestore';

const domain = 'https://payments.timelabs.su';

export enum ProductType {
  Consultation = 'consultation',
  VPNKey = 'vpnkey',
  TarotConsultation = 'tarot-consultation',
  Donate = 'donate',
  IT = 'it-product',
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
}

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  constructor(private firestore: Firestore) {}

  // Fetch products from Firestore
  fetchProductsFromFirestore(): Observable<IProduct[]> {
    const productsCollection = collection(this.firestore, 'products');
    const productsQuery = query(productsCollection);

    return collectionData(productsQuery, { idField: 'id' }).pipe(
      map((products: any[]) => {
        console.log('Fetched Firestore products:', products); // Debug fetched products
        return products.map((product) => this.mapFirestoreToIProduct(product));
      }),
      catchError((error) => {
        console.error('Error fetching products from Firestore:', error);
        return from([]); // Return an empty array on error
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
      type: this.mapCategoryToType(product.categories || []), // Map categories to ProductType
    };
  }

  // Helper function to map categories to ProductType
  private mapCategoryToType(categories: string[]): ProductType | null {
    const categoryNames = categories[0].toLowerCase();
    if (categoryNames.includes('консультации')) {
      return ProductType.Consultation;
    }
    if (categoryNames.includes('it-услуги')) {
      return ProductType.IT;
    }
    if (categoryNames.includes('vpn')) {
      return ProductType.VPNKey;
    }
    if (categoryNames.includes('консультации таро')) {
      return ProductType.TarotConsultation;
    }
    if (categoryNames.includes('донат')) {
      return ProductType.Donate;
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
