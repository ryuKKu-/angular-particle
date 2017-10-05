import { Directive, ElementRef, AfterViewInit, HostListener, Input, OnDestroy } from "@angular/core";
import { CanvasManager, ICanvasParams, IParams, ITmpParams, getDefaultParams, isInArray, deepExtend, loadImg } from './lib/index';

@Directive({
    selector: '[d-particles]'
})
export class ParticlesDirective implements AfterViewInit, OnDestroy  {
    @Input() set params(value: IParams) {
        let defaultParams: IParams = getDefaultParams();
        this._params = deepExtend(defaultParams, value);
    }

    constructor(private el: ElementRef) { }

    private _canvasParams: ICanvasParams;
    private _params: IParams;
    private _tmpParams: ITmpParams = {};
    private _canvasManager: CanvasManager;

    ngOnDestroy(): void {
        if (!this._canvasManager) {
            return;
        }
        this._canvasManager.cancelAnimation();
    }

    ngAfterViewInit(): void {
        this._canvasParams = {
            el: this.el.nativeElement,
            ctx: this.el.nativeElement.getContext('2d'),
            width: this.el.nativeElement.offsetWidth,
            height: this.el.nativeElement.offsetHeight
        };

        this._tmpParams.obj = {
            size_value: this._params.particles.size.value,
            size_anim_speed: this._params.particles.size.anim.speed,
            move_speed: this._params.particles.move.speed,
            line_linked_distance: this._params.particles.line_linked.distance,
            line_linked_width: this._params.particles.line_linked.width,
            mode_grab_distance: this._params.interactivity.modes.grab.distance,
            mode_bubble_distance: this._params.interactivity.modes.bubble.distance,
            mode_bubble_size: this._params.interactivity.modes.bubble.size,
            mode_repulse_distance: this._params.interactivity.modes.repulse.distance
        };

        this._params.interactivity.el = (this._params.interactivity.detect_on == 'window') ? window : this._canvasParams.el;

        if (isInArray('image', this._params.particles.shape.type)) {
            this._tmpParams.img_type = this._params.particles.shape.image.src.substr(this._params.particles.shape.image.src.length - 3);
            loadImg(this._params, this._tmpParams);
        }

        this._canvasManager = new CanvasManager(this._canvasParams, this._params, this._tmpParams);
        this._canvasManager.draw();
    }

    /**
     * Mouse move event
     * @param event
     */
    @HostListener('mousemove', ['$event']) onMouseMove(event) {
        let { interactivity } = this._params;

        if (interactivity.events.onhover.enable ||
            interactivity.events.onclick.enable) {

            let pos: {
                x: number;
                y: number;
            };

            if (interactivity.el == window) {
                pos = {
                    x: event.clientX,
                    y: event.clientY
                };
            } else {
                pos = {
                    x: event.offsetX || event.clientX,
                    y: event.offsetY || event.clientY
                };
            }

            interactivity.mouse.pos_x = pos.x;
            interactivity.mouse.pos_y = pos.y;

            if (this._tmpParams.retina) {
                interactivity.mouse.pos_x *= this._canvasParams.pxratio;
                interactivity.mouse.pos_y *= this._canvasParams.pxratio;
            }

            interactivity.status = 'mousemove';
        }
    }

    /**
     * Mouse leave event
     */
    @HostListener('mouseleave') onMouseLeave() {
        let { interactivity } = this._params;

        if (interactivity.events.onhover.enable ||
            interactivity.events.onclick.enable) {

            interactivity.mouse.pos_x = null;
            interactivity.mouse.pos_y = null;
            interactivity.status = 'mouseleave';
        }
    }

    /**
     * Click event
     */
    @HostListener('click') onClick() {
        let { interactivity, particles } = this._params;

        if (interactivity.events.onclick.enable) {
            interactivity.mouse.click_pos_x = interactivity.mouse.pos_x;
            interactivity.mouse.click_pos_y = interactivity.mouse.pos_y;
            interactivity.mouse.click_time = new Date().getTime();

            switch (interactivity.events.onclick.mode) {
                case 'push':
                    if (particles.move.enable) {
                        this._canvasManager.particlesManager.pushParticles(interactivity.modes.push.particles_nb, interactivity.mouse);
                    } else {
                        if (interactivity.modes.push.particles_nb == 1) {
                            this._canvasManager.particlesManager.pushParticles(interactivity.modes.push.particles_nb, interactivity.mouse);
                        } else if (interactivity.modes.push.particles_nb > 1) {
                            this._canvasManager.particlesManager.pushParticles(interactivity.modes.push.particles_nb);
                        }
                    }
                    break;

                case 'remove':
                    this._canvasManager.particlesManager.removeParticles(interactivity.modes.remove.particles_nb);
                    break;

                case 'bubble':
                    this._tmpParams.bubble_clicking = true;
                    break;

                case 'repulse':
                    this._tmpParams.repulse_clicking = true;
                    this._tmpParams.repulse_count = 0;
                    this._tmpParams.repulse_finish = false;
                    setTimeout(() => {
                        this._tmpParams.repulse_clicking = false;
                    }, interactivity.modes.repulse.duration * 1000);
                    break;
            }
        }
    }
}
