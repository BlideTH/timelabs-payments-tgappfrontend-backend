import { Component, AfterViewInit } from '@angular/core';
import Rellax from 'rellax';

@Component({
  selector: 'app-parallax-background',
  standalone: true, // Add this line to make it a standalone component
  template: `
    <div class="parallax" data-rellax-speed="-2"></div>
    <div class="parallax" data-rellax-speed="1"></div>
  `,
  styles: [`
    .parallax {
      position: absolute;
      width: 100%;
      height: 100%;
      font-size: 2rem;
      color: #ffa726;
    }
  `]
})
export class ParallaxBackgroundComponent implements AfterViewInit {
  ngAfterViewInit() {
    new Rellax('.parallax');
  }
}
