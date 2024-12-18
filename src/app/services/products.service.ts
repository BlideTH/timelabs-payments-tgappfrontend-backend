import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';

const domain = 'https://payments.timelabs.su';

export enum ProductType {
  Consultation = 'consultation',
  VPNKey = 'vpnkey',
  TarotConsultation = 'tarot-consultation',
  Donate = 'donate', // Added new product type for donations
}

export interface IProduct {
  id: string;
  text: string;
  title: string;
  link: string;
  image?: string; // Made optional since Donate won't have an image
  time?: string; // Made optional since Donate doesn't require time
  type: ProductType;
  price?: number; // Made optional for flexible donation amounts
}

function addDomainToLinkAndImage(product: IProduct) {
  return {
    ...product,
    image: product.image ? domain + product.image : undefined, // Only add domain if image exists
    link: product.link ? domain + product.link : undefined, // Only add domain if link exists
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
    price: 10000,
  },
  {
    id: '33',
    title: 'Консультация биотехнолога',
    link: '/product/biotech-consultation',
    image: '/wp-content/uploads/2024/11/Pic4-e1732649873772.webp',
    text: 'Консультация 1 час с биотехнологом',
    time: '1 час',
    type: ProductType.Consultation,
    price: 20000,
  },
  {
    id: '26',
    title: 'Консультация психолога',
    link: '/product/psy-consultation',
    image: '/wp-content/uploads/2024/11/Pic2-e1732649906322.webp',
    text: 'Консультация 1 час с психологом',
    time: '1 час',
    type: ProductType.Consultation,
    price: 4000,
  },
  {
    id: '261',
    title: 'Стандартная консультация Таро',
    link: '/product/tarot-standard',
    image: '/wp-content/uploads/2024/12/tarot-standard-consultation-e1734360951115.webp',
    text: 'Консультация продолжительностью 1 час. Количество и тематика вопросов к Таро не ограничены',
    time: '1 час',
    type: ProductType.TarotConsultation,
    price: 4000,
  },
  {
    id: '264',
    title: 'Расклад Таро на любую тематику',
    link: '/product/one-theme-tarot-consultation',
    image: '/wp-content/uploads/2024/12/tarot-one-question-consultation-e1734361271509.webp',
    text: 'Расклад на картах Таро на любую тематику и любой срок давности',
    time: '30 минут',
    type: ProductType.TarotConsultation,
    price: 3500,
  },
  {
    id: '269',
    title: 'Расклад Таро на заданную тематику',
    link: '/product/tarot-question-given-theme',
    image: '/wp-content/uploads/2024/12/tarot-one-question-on-given-theme-e1734361445549.webp',
    text: 'Расклад на личную жизнь, отношения, на финансы и карьеру, переезд и смену места жительства, вопросы, связанные с обучением (выбор ВУЗа или направления), профориентация и предназначение. Один расклад на одну тематику',
    time: '30 минут',
    type: ProductType.TarotConsultation,
    price: 3200,
  },
  {
    id: '271',
    title: 'Краткий вопрос к Таро',
    link: '/product/tarot-short-question',
    image: '/wp-content/uploads/2024/12/tarot-one-question-consultation-e1734361271509.webp',
    text: 'Краткий вопрос к Таро с ответом Да/Нет',
    time: '10 минут',
    type: ProductType.TarotConsultation,
    price: 500,
  },
  {
    id: 'donate', // Unique ID for the donation product
    title: 'Поддержать проект', // Title for the donation product
    link: undefined, // No link since this product isn't on the website
    image: '', // No image for the donation product
    text: 'Поддержите проект, внеся добровольный взнос.', // Description for the donation
    type: ProductType.Donate, // Assign to the new "Donate" type
    price: 100, // Undefined to allow flexible donation amounts
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
