import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { TelegramService } from '../../services/telegram.service';

@Component({
  selector: 'app-feedback',
  standalone: true,
  styles: `
    .form {
      height: 70vh;
      justify-content: center;
    }
  `,
  template: `
  <form class="centered form">
    <h2 class = "mb">Обратная связь</h2>    
    <textarea [value]="feedback()" (input)="handleChange($event)" class = "form-control"></textarea>
  </form>
  `,
})
export class FeedbackComponent implements OnInit, OnDestroy {
  feedback = signal('');

  constructor(private telegram: TelegramService) {
    this.sendData = this.sendData.bind(this);
  }
    
  ngOnInit(): void {
    console.log('FeedbackComponent initialized'); // Debugging log
    this.telegram.MainButton.setText('Отправить сообщение');   
    this.telegram.MainButton.hide();
    this.telegram.MainButton.onClick(this.sendData);
    console.log('MainButton onClick event bound'); // Debugging log
  }
  sendData() {
    console.log('Send Data Clicked'); // Debugging log
    console.log('Send Data Clicked'); // Debugging log
    if (!this.feedback().trim()) {
      alert('Пожалуйста, введите сообщение.');
      return;
    }
    // Send feedback to the bot
    this.telegram.sendData({ feedback: this.feedback() });
    console.log('Data Sent:', this.feedback()); // Debugging log
    console.log('Data Sent:', this.feedback()); // Debugging log
    alert('Ваше сообщение было отправлено.');
  }

  handleChange(event) {
    this.feedback.set(event.target.value);
    if (this.feedback().trim()) {
      this.telegram.MainButton.show();
    } else {
      this.telegram.MainButton.hide();
    }
    }

  ngOnDestroy(): void {
    console.log('FeedbackComponent destroyed'); // Debugging log
    this.telegram.MainButton.offClick(this.sendData);
  }
  
}
