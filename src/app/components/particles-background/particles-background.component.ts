import { Component } from '@angular/core';
import { loadFull } from 'tsparticles';

@Component({
  selector: 'app-particles-background',
  template: `<ngx-particles [id]="'tsparticles'" [particlesInit]="particlesInit" [options]="particlesOptions"></ngx-particles>`,
})
export class ParticlesBackgroundComponent {
  particlesOptions = {
    background: {
      color: {
        value: '#000000', // Dark background
      },
    },
    particles: {
      number: {
        value: 100, // Number of stars
      },
      color: {
        value: '#ffffff', // White stars
      },
      stroke: {
        width: 1,       // Outline width
        color: '#ff6718' // Outline color (yellowish for contrast)
      },
      shape: {
        type: 'star',
      },
      opacity: {
        value: 0.7,
      },
      size: {
        value: 2, // Small stars
      },
      links: {
        enable: true,
        distance: 150, // Distance to connect stars
        color: '#ff6718',
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.5, // Slow movement for a subtle effect
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab', // Connect lines when hovering
        },
        onClick: {
          enable: true,
          mode: 'push', // Add particles on click
        },
      },
    },
  };

  async particlesInit(engine: any): Promise<void> {
    await loadFull(engine);
  }
}
