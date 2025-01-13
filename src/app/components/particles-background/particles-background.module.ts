import { NgModule } from '@angular/core';
import { NgxParticlesModule } from '@tsparticles/angular';
import { ParticlesBackgroundComponent } from './particles-background.component';

@NgModule({  
  imports: [NgxParticlesModule, ParticlesBackgroundComponent],
  exports: [ParticlesBackgroundComponent],
})
export class ParticlesBackgroundModule {}
