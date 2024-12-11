import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TelegramService } from './services/telegram.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet],
  template: `<router-outlet></router-outlet>`, // Fixed self-closing syntax for Angular
})
export class AppComponent implements OnInit {
  constructor(private telegram: TelegramService) {}

  ngOnInit(): void {
    // Mark Telegram WebApp as ready
    this.telegram.ready();

    // Check if Telegram WebApp object is available
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      const themeParams = tg.themeParams || {};
      
      // Apply the Telegram theme parameters to CSS variables
      const applyThemeParam = (name: string, value: string | undefined, fallback: string) => {
        document.documentElement.style.setProperty(name, value || fallback);
      };

      applyThemeParam('--tg-theme-bg-color', themeParams.bg_color, '#ffffff');
      applyThemeParam('--tg-theme-text-color', themeParams.text_color, '#000000');
      applyThemeParam('--tg-theme-link-color', themeParams.link_color, '#1b95e0');
      applyThemeParam('--tg-theme-button-color', themeParams.button_color, '#0088cc');
      applyThemeParam('--tg-theme-button-text-color', themeParams.button_text_color, '#ffffff');
      applyThemeParam('--tg-theme-secondary-bg-color', themeParams.secondary_bg_color, '#f5f5f5');
      applyThemeParam('--tg-theme-hint-color', themeParams.hint_color, '#999999');
    } else {
      console.warn('Telegram WebApp object is not available. Theme parameters will not be applied.');
    }
  }
}
