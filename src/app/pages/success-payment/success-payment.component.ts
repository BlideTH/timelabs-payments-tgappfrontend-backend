import { Component, OnInit } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';

@Component({
    selector: 'app-success',
    template: `
    <div class="centered">
      <div class="success-checkmark"></div>
      <h2 class="success-message">Оплата прошла успешно!</h2>
      <p class="success-text">Спасибо за ваш платеж. Вы можете закрыть приложение.</p>
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
        text-align: center;
        position: relative;
        overflow: hidden;
      }

      .success-checkmark {
        width: 60px;
        height: 30px;
        border-left: 6px solid #28a745;
        border-bottom: 6px solid #28a745;
        transform: rotate(-45deg);
        margin-bottom: 20px;
        animation: checkmarkAppear 0.5s ease forwards;
      }

      @keyframes checkmarkAppear {
        from {
          opacity: 0;
          transform: rotate(-45deg) scale(0.5);
        }
        to {
          opacity: 1;
          transform: rotate(-45deg) scale(1);
        }
      }

      .success-message {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--tg-theme-text-color, #ffffff);
        margin-bottom: 10px;
      }

      .success-text {
        font-size: 1rem;
        color: var(--tg-theme-text-color, #ffffff);
        margin-bottom: 20px;
        max-width: 80%;
      }

      .success-button {
        padding: 12px 24px;
        background-color: var(--tg-theme-button-color, #28a745);
        color: var(--tg-theme-button-text-color, #ffffff);
        border: none;
        border-radius: 5px;
        cursor: pointer;
        font-size: 1rem;
        transition: transform 0.3s ease, background-color 0.3s ease;
        position: relative;
      }

      .success-button:hover {
        background-color: lighten(var(--tg-theme-button-color, #28a745), 10%);
        transform: scale(1.05);
      }

      .success-button:active {
        transform: scale(0.95);
      }
    `,
    ],
    standalone: false
})
export class SuccessComponent implements OnInit {
  constructor(private telegram: TelegramService) {}

  ngOnInit(): void {
    const tg = this.telegram.WebApp;
    if (tg) {
      tg.MainButton.hide(); // Hide the Telegram MainButton
    }
  }

  closeApp(): void {
    const tg = this.telegram.WebApp;
    if (tg) {
      tg.close();
    }
  }
}
