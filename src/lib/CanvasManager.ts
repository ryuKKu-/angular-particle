import { ParticlesManager, ICanvasParams, IParams, ITmpParams, hexToRgb } from './index';

export class CanvasManager {
    public particlesManager: ParticlesManager;

    constructor(private _canvasParams: ICanvasParams, private _params: IParams, private _tmpParams: ITmpParams) {
        this._onWindowResize = this._onWindowResize.bind(this);

        this._retinaInit();
        this._canvasSize();

        this.particlesManager = new ParticlesManager(this._canvasParams, this._params, this._tmpParams);
        this.particlesManager.particlesCreate();

        this._densityAutoParticles();

        let { particles } = this._params;
        particles.line_linked.color_rgb_line = hexToRgb(particles.line_linked.color);
    }


    public draw(): void {
        let { particles } = this._params;

        if (particles.shape.type == 'image') {
            if (this._tmpParams.img_type == 'svg') {
                if (this._tmpParams.count_svg >= particles.number.value) {
                    this.particlesManager.particlesDraw();
                    if (!particles.move.enable) {
                        cancelAnimationFrame(this._tmpParams.drawAnimFrame);
                    } else {
                        this._tmpParams.drawAnimFrame = requestAnimationFrame(this.draw.bind(this));
                    }
                } else {
                    if (!this._tmpParams.img_error) {
                        this._tmpParams.drawAnimFrame = requestAnimationFrame(this.draw.bind(this));
                    }
                }
            } else {
                if (this._tmpParams.img_obj != undefined) {
                    this.particlesManager.particlesDraw();
                    if (!particles.move.enable) {
                        cancelAnimationFrame(this._tmpParams.drawAnimFrame);
                    } else {
                        this._tmpParams.drawAnimFrame = requestAnimationFrame(this.draw.bind(this));
                    }
                } else {
                    if (!this._tmpParams.img_error) {
                        this._tmpParams.drawAnimFrame = requestAnimationFrame(this.draw.bind(this));
                    }
                }
            }
        } else {
            this.particlesManager.particlesDraw();

            if (!particles.move.enable) {
                cancelAnimationFrame(this._tmpParams.drawAnimFrame);
            } else {
                this._tmpParams.drawAnimFrame = requestAnimationFrame(this.draw.bind(this));
            }
        }
    }

    private _densityAutoParticles(): void {
        let { particles } = this._params;

        if (particles.number.density.enable) {
            let area: number = this._canvasParams.el.width * this._canvasParams.el.height / 1000;

            if (this._tmpParams.retina) {
                area = area / (this._canvasParams.pxratio * 2);
            }

            let nb_particles: number = area * particles.number.value / particles.number.density.value_area;

            let missing_particles: number = particles.array.length - nb_particles;

            if (missing_particles < 0) {
                this.particlesManager.pushParticles(Math.abs(missing_particles));
            } else {
                this.particlesManager.removeParticles(missing_particles);
            }
        }
    }

    private _retinaInit(): void {
        if (this._params.retina_detect && window.devicePixelRatio > 1) {
            this._canvasParams.pxratio = window.devicePixelRatio;
            this._tmpParams.retina = true;

            this._canvasParams.width = this._canvasParams.el.offsetWidth * this._canvasParams.pxratio;
            this._canvasParams.height = this._canvasParams.el.offsetHeight * this._canvasParams.pxratio;

            this._params.particles.size.value = this._tmpParams.obj.size_value * this._canvasParams.pxratio;
            this._params.particles.size.anim.speed = this._tmpParams.obj.size_anim_speed * this._canvasParams.pxratio;
            this._params.particles.move.speed = this._tmpParams.obj.move_speed * this._canvasParams.pxratio;
            this._params.particles.line_linked.distance = this._tmpParams.obj.line_linked_distance * this._canvasParams.pxratio;
            this._params.interactivity.modes.grab.distance = this._tmpParams.obj.mode_grab_distance * this._canvasParams.pxratio;
            this._params.interactivity.modes.bubble.distance = this._tmpParams.obj.mode_bubble_distance * this._canvasParams.pxratio;
            this._params.particles.line_linked.width = this._tmpParams.obj.line_linked_width * this._canvasParams.pxratio;
            this._params.interactivity.modes.bubble.size = this._tmpParams.obj.mode_bubble_size * this._canvasParams.pxratio;
            this._params.interactivity.modes.repulse.distance = this._tmpParams.obj.mode_repulse_distance * this._canvasParams.pxratio;

        } else {
            this._canvasParams.pxratio = 1;
            this._tmpParams.retina = false;
        }
    }

    private _canvasClear(): void {
        this._canvasParams.ctx.clearRect(0, 0, this._canvasParams.width, this._canvasParams.height);
    }

    private _canvasPaint(): void {
        this._canvasParams.ctx.fillRect(0, 0, this._canvasParams.width, this._canvasParams.height);
    }

    private _canvasSize(): void {
        this._canvasParams.el.width = this._canvasParams.width;
        this._canvasParams.el.height = this._canvasParams.height;

        if (this._params && this._params.interactivity.events.resize) {
            window.addEventListener('resize', this._onWindowResize);
        }
    }

    private _onWindowResize(): void {
        this._canvasParams.width = this._canvasParams.el.offsetWidth;
        this._canvasParams.height = this._canvasParams.el.offsetHeight;

        if (this._tmpParams.retina) {
            this._canvasParams.width *= this._canvasParams.pxratio;
            this._canvasParams.height *= this._canvasParams.pxratio;
        }

        this._canvasParams.el.width = this._canvasParams.width;
        this._canvasParams.el.height = this._canvasParams.height;

        if (!this._params.particles.move.enable) {
            this.particlesManager.particlesEmpty();
            this.particlesManager.particlesCreate();
            this.particlesManager.particlesDraw();
            this._densityAutoParticles();
        }

        this._densityAutoParticles();
    }
}