import { NgModule } from '@angular/core';
import { NgxParticlesModule } from '@tsparticles/angular';
import { ParticlesBackgroundComponent } from './particles-background.component';

@NgModule({
  declarations: [ParticlesBackgroundComponent],
  imports: [NgxParticlesModule],
  exports: [ParticlesBackgroundComponent],
})
export class ParticlesBackgroundModule {}
