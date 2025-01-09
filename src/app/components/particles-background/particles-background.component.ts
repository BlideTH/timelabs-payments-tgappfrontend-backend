import { Component, OnInit } from '@angular/core';
import { loadFull } from 'tsparticles';

@Component({
    selector: 'app-particles-background',
    template: `<ngx-particles [id]="'tsparticles'" [particlesInit]="particlesInit" [options]="particlesOptions"></ngx-particles>`,
    standalone: false
})
export class ParticlesBackgroundComponent implements OnInit {
  particlesOptions: any;

  // Theme-based configurations
  private darkThemeOptions = {
    background: {
      color: {
        value: '#000000', // Dark background
      },
    },
    particles: {
      number: {
        value: 100,
      },
      color: {
        value: '#ffffff', // White stars
      },
      stroke: {
        width: 1,
        color: '#ff6718', // Yellow outline
      },
      shape: {
        type: 'star',
      },
      opacity: {
        value: 0.7,
      },
      size: {
        value: 2,
      },
      links: {
        enable: true,
        distance: 150,
        color: '#ff6718',
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.5,
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
      },
    },
  };

  private lightThemeOptions = {
    background: {
      color: {
        value: '#ffffff', // Light background
      },
    },
    particles: {
      number: {
        value: 100,
      },
      color: {
        value: '#000000', // Black stars
      },
      stroke: {
        width: 1,
        color: '#6a0dad', // Purple outline
      },
      shape: {
        type: 'star',
      },
      opacity: {
        value: 0.8,
      },
      size: {
        value: 3,
      },
      links: {
        enable: true,
        distance: 150,
        color: '#6a0dad',
        opacity: 0.3,
        width: 1,
      },
      move: {
        enable: true,
        speed: 0.5,
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'grab',
        },
        onClick: {
          enable: true,
          mode: 'push',
        },
      },
    },
  };

  async particlesInit(engine: any): Promise<void> {
    await loadFull(engine);
  }

  ngOnInit(): void {
    this.updateParticlesOptions();
    const tg = (window as any).Telegram?.WebApp;
    if (tg) {
      tg.onEvent('themeChanged', () => {
        this.updateParticlesOptions();
      });
    }
  }
  
  private updateParticlesOptions(): void {
    const telegramTheme = this.getTelegramTheme();
    this.particlesOptions = telegramTheme === 'dark' ? this.darkThemeOptions : this.lightThemeOptions;
  }
  private getTelegramTheme(): 'light' | 'dark' {
    const tgTheme = (window as any)?.Telegram?.WebApp?.themeParams;

    if (tgTheme?.theme === 'light') {
        return 'light';
    } else if (tgTheme?.theme === 'dark') {
        return 'dark';
    } else {
        // Force dark theme for desktop if no theme parameters are detected
        if ((window as any).Telegram?.WebApp) {
            return 'dark';
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
}

  
  
  
}
