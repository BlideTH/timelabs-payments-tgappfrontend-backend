import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const domain = 'https://payments.timelabs.su';

export enum ProductType {
  Consultation = 'consultation',
  VPNKey = 'vpnkey',
}

export interface IProduct {
  id: string;
  text: string;
  title: string;
  link: string;
  image: string;
  time: string;
  type: ProductType;
  price: number; // Added price property
}

function addDomainToLinkAndImage(product: IProduct) {
  return {
    ...product,
    image: domain + product.image,
    link: domain + product.link,
  };
}

const products: IProduct[] = [
  {
    id: '29',
    title: 'Консультация IT-специалиста',
    link: '/product/it-specialist-consultation',
    image: '/wp-content/uploads/2024/11/Pic3-e1732649593864.webp',
    text: 'Консультация 1 час с IT-специалистом по Вашим вопросам',
    time: '1 час',
    type: ProductType.Consultation,
    price: 10000, // Price added here
  },
  {
    id: '33',
    title: 'Консультация биотехнолога',
    link: '/product/biotech-consultation',
    image: '/wp-content/uploads/2024/11/Pic4-e1732649873772.webp',
    text: 'Консультация 1 час с биотехнологом',
    time: '1 час',
    type: ProductType.Consultation,
    price: 20000, // Price added here
  },
  {
    id: '26',
    title: 'Консультация психолога',
    link: '/product/psy-consultation',
    image: '/wp-content/uploads/2024/11/Pic2-e1732649906322.webp',
    text: 'Консультация 1 час с психологом',
    time: '1 час',
    type: ProductType.Consultation,
    price: 400, // Price added here
  },
];

@Injectable({
  providedIn: 'root',
})
export class ProductsService {
  readonly products: IProduct[] = products.map(addDomainToLinkAndImage);

  // Method to simulate loading products with a delay
  loadProducts(): Observable<IProduct[]> {
    return of(this.products).pipe(delay(1000)); // Simulates 1 second delay
  }

  // Method to get a product by ID
  getById(id: string): IProduct | null {
    const product = this.products.find((p) => p.id === id);
    if (!product) {
      console.error(`Product with ID ${id} not found.`);
      return null;
    }
    return product;
  }

  // Method to get products grouped by type
  get byGroup() {
    return this.products.reduce((group, prod) => {
      if (!group[prod.type]) {
        group[prod.type] = [];
      }
      group[prod.type].push(prod);
      return group;
    }, {} as Record<ProductType, IProduct[]>);
  }
}
