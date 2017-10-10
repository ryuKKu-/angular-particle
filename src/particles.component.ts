import { Component, Input, OnInit } from '@angular/core';
import { IParams } from './lib/index';

@Component({
    selector: 'particles',
    template: `
        <div [ngStyle]="style" class="particles-container">
            <canvas d-particles [params]="params" [style.width.%]="width" [style.height.%]="height"></canvas>
        </div>
    `
})
export class ParticlesComponent {

    @Input() width: number = 100;
    @Input() height: number = 100;
    @Input() params: IParams;
    @Input() style: Object = {};

    constructor() { }
}