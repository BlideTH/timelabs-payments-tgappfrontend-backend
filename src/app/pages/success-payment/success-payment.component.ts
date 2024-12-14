import { Component, OnInit } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';

@Component({
  selector: 'app-success',
  template: `
    <div class="centered">
      <h2>Оплата прошла успешно!</h2>
      <p>Спасибо за ваш платеж. Вы можете закрыть приложение.</p>
      <button (click)="closeApp()" class="success-button">Закрыть приложение</button>
    </div>
  `,
  styles: [
    `
      .centered {
        display: flex;
        flex-direction: column;
        justify-content: center;
        align-items: center;
        height: 100vh;
      }
      .success-button {
        padding: 10px 20px;
        border: none;
        background-color: #28a745;
        color: white;
        border-radius: 5px;
        cursor: pointer;
      }
      .success-button:hover {
        background-color: #218838;
      }
    `,
  ],
})
export class SuccessComponent implements OnInit {
  constructor(private telegram: TelegramService) {}

  ngOnInit(): void {
    const tg = this.telegram.WebApp; // Use TelegramService
    if (tg) {
      tg.MainButton.setText('Закрыть');
      tg.MainButton.show();
      tg.MainButton.onClick(() => this.closeApp());
    }
  }

  closeApp(): void {
    const tg = this.telegram.WebApp;
    if (tg) {
      tg.close();
    }
  }
}
