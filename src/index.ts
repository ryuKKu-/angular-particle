import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ParticlesComponent } from './particles.component';
import { ParticlesDirective } from './particles.directive';

export * from './lib/index';

@NgModule({
    imports: [
        CommonModule
    ],
    declarations: [
        ParticlesComponent,
        ParticlesDirective
    ],
    exports: [
        ParticlesComponent,
        ParticlesDirective
    ]
})
export class ParticlesModule { }