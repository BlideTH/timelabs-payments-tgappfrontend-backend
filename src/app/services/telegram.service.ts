import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';

interface TgButton {
  show(): void;
  hide(): void;
  setText(text: string): void;
  onClick(fn: Function): void;
  offClick(fn: Function): void;
  enable(): void;
  disable(): void;
}

@Injectable({
  providedIn: 'root',
})
export class TelegramService {
  private window: any;
  private tg: any;
  private isReady = false;

  constructor(@Inject(DOCUMENT) private _document: Document) {
    this.window = this._document.defaultView;
    if (this.window && this.window.Telegram) {
      this.tg = this.window.Telegram.WebApp;
      this.addReadyListener(); // Listen for WebApp readiness
      this.ready(); // Set WebApp ready as early as possible
    } else {
      console.error('Telegram WebApp is not available in the current context.');
    }
  }

  get MainButton(): TgButton {
    return this.tg?.MainButton;
  }

  get BackButton(): TgButton {
    return this.tg?.BackButton;
  }

  get WebApp(): any {
    return this.tg;
  }

  async getUserChatId(): Promise<number | null> {
    const maxRetries = 10;
    let retryCount = 0;
    let delay = 500; // Start with 500ms delay for retries

    const getUserData = (): number | null => {
      if (this.isReady && this.tg) {
        console.log('tg object:', this.tg);
        if (this.tg.initDataUnsafe?.user?.id) {
          return this.tg.initDataUnsafe.user.id;
        }
        if (this.tg.initData) {
          const initDataParams = new URLSearchParams(this.tg.initData);
          const userId = initDataParams.get('user_id');
          if (userId) {
            return parseInt(userId, 10);
          }
        }
      }
      return null;
    };

    while (retryCount < maxRetries) {
      const userId = getUserData();
      if (userId !== null) return userId;
      retryCount++;
      console.warn(`Retrying to get user chat ID... (${retryCount}/${maxRetries})`);
      await new Promise((resolve) => setTimeout(resolve, delay));
      delay *= 2; // Exponential backoff
    }

    console.error('Unable to retrieve user chat ID after maximum retries.');
    return null;
  }

  sendData(data: any): void {
    if (this.tg) {
      try {
        const serializedData =
          typeof data === 'string' || typeof data === 'object'
            ? JSON.stringify(data)
            : JSON.stringify({ message: String(data) });
        this.tg.sendData(serializedData);
      } catch (error) {
        console.error('Failed to send data:', error);
      }
    } else {
      console.error('Telegram WebApp is not initialized. Cannot send data.');
    }
  }

  ready(): void {
    if (this.tg) {
      try {
        this.tg.ready();
        this.isReady = true;
        console.log('Telegram WebApp is ready.');
      } catch (error) {
        console.error('Error setting WebApp ready state:', error);
      }
    } else {
      console.error('Telegram WebApp is not initialized. Cannot set ready state.');
    }
  }

  addReadyListener(): void {
    if (this.tg) {
      this.tg.onEvent('web_app_ready', () => {
        console.log('Telegram WebApp is fully ready.');
        this.isReady = true;
      });
    }
  }

  async openInvoice(invoiceLink: string, callback: (result: any) => void): Promise<void> {
    console.log('Attempting to open invoice using WebApp:', invoiceLink);

    if (this.isReady && this.tg) {
      try {
        const result = await this.tg.openInvoice(invoiceLink);
        console.log('Invoice opened successfully with result:', result);
        callback(result);
      } catch (error) {
        console.error('Error while opening invoice via WebApp:', error);
        callback({ status: 'error', error });
      }
    } else {
      console.error('Telegram WebApp is not initialized or ready. Cannot open invoice.');
      callback({ status: 'error', message: 'WebApp not ready' });
    }
  }

  closeApp(): void {
    if (this.tg?.close) {
      try {
        this.tg.close();
        console.log('Telegram WebApp closed.');
      } catch (error) {
        console.error('Error closing Telegram WebApp:', error);
      }
    } else {
      console.error('Telegram WebApp is not initialized. Cannot close app.');
    }
  }
}
