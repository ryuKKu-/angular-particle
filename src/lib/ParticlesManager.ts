import { Particle, ParticleInteraction, IParams, ICanvasParams, IMouseParams, ITmpParams, isInArray, clamp } from './index';

export class ParticlesManager {
    private _interaction: ParticleInteraction;

    constructor(private _canvasParams: ICanvasParams, private _params: IParams, private _tmpParams: ITmpParams) {
        this._interaction = new ParticleInteraction();
    }

    public particlesCreate(): void {
        let { color, opacity } = this._params.particles;
        for (let i = 0; i < this._params.particles.number.value; i++) {
            this._params.particles.array.push(new Particle(this._canvasParams, this._params, this._tmpParams, color, opacity.value));
        }
    }

    private _particlesUpdate(): void {
        type Pos = {
            x_left: number;
            x_right: number;
            y_top: number;
            y_bottom: number;
        };

        this._params.particles.array.forEach((particle: Particle, i: number) => {
            if (this._params.particles.move.enable) {
                let ms = this._params.particles.move.speed / 2;
                particle.x += particle.vx * ms;
                particle.y += particle.vy * ms;
            }

            if (this._params.particles.opacity.anim.enable) {
                if (particle.opacity_status == true) {
                    if (particle.opacity >= this._params.particles.opacity.value)
                        particle.opacity_status = false;
                    particle.opacity += particle.vo;
                } else {
                    if (particle.opacity <= this._params.particles.opacity.anim.opacity_min)
                        particle.opacity_status = true;
                    particle.opacity -= particle.vo;
                }
                if (particle.opacity < 0)
                    particle.opacity = 0;
            }

            if (this._params.particles.size.anim.enable) {
                if (particle.size_status == true) {
                    if (particle.radius >= this._params.particles.size.value)
                        particle.size_status = false;
                    particle.radius += particle.vs;
                } else {
                    if (particle.radius <= this._params.particles.size.anim.size_min)
                        particle.size_status = true;
                    particle.radius -= particle.vs;
                }
                if (particle.radius < 0)
                    particle.radius = 0;
            }

            let new_pos: Pos;

            if (this._params.particles.move.out_mode == 'bounce') {
                new_pos = {
                    x_left: particle.radius,
                    x_right: this._canvasParams.width,
                    y_top: particle.radius,
                    y_bottom: this._canvasParams.height
                };
            } else {
                new_pos = {
                    x_left: -particle.radius,
                    x_right: this._canvasParams.width + particle.radius,
                    y_top: -particle.radius,
                    y_bottom: this._canvasParams.height + particle.radius
                };
            }

            if (particle.x - particle.radius > this._canvasParams.width) {
                particle.x = new_pos.x_left;
                particle.y = Math.random() * this._canvasParams.height;
            } else if (particle.x + particle.radius < 0) {
                particle.x = new_pos.x_right;
                particle.y = Math.random() * this._canvasParams.height;
            }

            if (particle.y - particle.radius > this._canvasParams.height) {
                particle.y = new_pos.y_top;
                particle.x = Math.random() * this._canvasParams.width;
            } else if (particle.y + particle.radius < 0) {
                particle.y = new_pos.y_bottom;
                particle.x = Math.random() * this._canvasParams.width;
            }

            switch (this._params.particles.move.out_mode) {
                case 'bounce':
                    if (particle.x + particle.radius > this._canvasParams.width)
                        particle.vx = -particle.vx;
                    else if (particle.x - particle.radius < 0)
                        particle.vx = -particle.vx;
                    if (particle.y + particle.radius > this._canvasParams.height)
                        particle.vy = -particle.vy;
                    else if (particle.y - particle.radius < 0)
                        particle.vy = -particle.vy;
                    break;
            }

            if (isInArray('grab', this._params.interactivity.events.onhover.mode)) {
                this._grabParticle(particle);
            }

            if (isInArray('bubble', this._params.interactivity.events.onhover.mode) ||
                isInArray('bubble', this._params.interactivity.events.onclick.mode)) {
                this._bubbleParticle(particle);
            }

            if (isInArray('repulse', this._params.interactivity.events.onhover.mode) ||
                isInArray('repulse', this._params.interactivity.events.onclick.mode)) {
                this._repulseParticle(particle);
            }

            if (this._params.particles.line_linked.enable || this._params.particles.move.attract.enable) {
                for (let j = i + 1; j < this._params.particles.array.length; j++) {
                    let link = this._params.particles.array[j];

                    if (this._params.particles.line_linked.enable)
                        this._interaction.linkParticles(particle, link, this._params, this._canvasParams);

                    if (this._params.particles.move.attract.enable)
                        this._interaction.attractParticles(particle, link, this._params);

                    if (this._params.particles.move.bounce)
                        this._interaction.bounceParticles(particle, link);
                }
            }
        });
    }

    public particlesDraw(): void {
        this._canvasParams.ctx.clearRect(0, 0, this._canvasParams.width, this._canvasParams.height);
        this._particlesUpdate();

        this._params.particles.array.forEach((particle: Particle) => {
            particle.draw();
        });
    }

    public particlesEmpty(): void {
        this._params.particles.array = [];
    }

    public removeParticles(nb: number): void {
        this._params.particles.array.splice(0, nb);

        if (!this._params.particles.move.enable) {
            this.particlesDraw();
        }
    }

    public pushParticles(nb: number, pos?: IMouseParams): void {
        this._tmpParams.pushing = true;

        for (let i = 0; i < nb; i++) {
            this._params.particles.array.push(
                new Particle(
                    this._canvasParams,
                    this._params,
                    this._tmpParams,
                    this._params.particles.color,
                    this._params.particles.opacity.value,
                    {
                        x: pos ? pos.pos_x : Math.random() * this._canvasParams.width,
                        y: pos ? pos.pos_y : Math.random() * this._canvasParams.height
                    })
            );

            if (i == nb - 1) {
                if (!this._params.particles.move.enable) {
                    this.particlesDraw();
                }
                this._tmpParams.pushing = false;
            }
        }
    }

    private _bubbleParticle(particle: Particle) {
        if (this._params.interactivity.events.onhover.enable &&
            isInArray('bubble', this._params.interactivity.events.onhover.mode)) {

            let dx_mouse: number = particle.x - this._params.interactivity.mouse.pos_x;
            let dy_mouse: number = particle.y - this._params.interactivity.mouse.pos_y;
            let dist_mouse: number = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
            let ratio: number = 1 - dist_mouse / this._params.interactivity.modes.bubble.distance;

            let init: () => void =
                () => {
                    particle.opacity_bubble = particle.opacity;
                    particle.radius_bubble = particle.radius;
                };

            if (dist_mouse <= this._params.interactivity.modes.bubble.distance) {
                if (ratio >= 0 && this._params.interactivity.status == 'mousemove') {

                    if (this._params.interactivity.modes.bubble.size != this._params.particles.size.value) {
                        if (this._params.interactivity.modes.bubble.size > this._params.particles.size.value) {
                            let size: number = particle.radius + (this._params.interactivity.modes.bubble.size * ratio);
                            if (size >= 0) {
                                particle.radius_bubble = size;
                            }
                        } else {
                            let dif: number = particle.radius - this._params.interactivity.modes.bubble.size;
                            let size: number = particle.radius - (dif * ratio);
                            if (size > 0) {
                                particle.radius_bubble = size;
                            } else {
                                particle.radius_bubble = 0;
                            }
                        }
                    }

                    if (this._params.interactivity.modes.bubble.opacity != this._params.particles.opacity.value) {
                        if (this._params.interactivity.modes.bubble.opacity > this._params.particles.opacity.value) {
                            let opacity: number = this._params.interactivity.modes.bubble.opacity * ratio;
                            if (opacity > particle.opacity && opacity <= this._params.interactivity.modes.bubble.opacity) {
                                particle.opacity_bubble = opacity;
                            }
                        } else {
                            let opacity: number = particle.opacity - (this._params.particles.opacity.value - this._params.interactivity.modes.bubble.opacity) * ratio;
                            if (opacity < particle.opacity && opacity >= this._params.interactivity.modes.bubble.opacity) {
                                particle.opacity_bubble = opacity;
                            }
                        }
                    }
                }
            } else {
                init();
            }

            if (this._params.interactivity.status == 'mouseleave') {
                init();
            }

        } else if (this._params.interactivity.events.onclick.enable &&
            isInArray('bubble', this._params.interactivity.events.onclick.mode)) {

            if (this._tmpParams.bubble_clicking) {
                let dx_mouse: number = particle.x - this._params.interactivity.mouse.click_pos_x;
                let dy_mouse: number = particle.y - this._params.interactivity.mouse.click_pos_y;
                let dist_mouse: number = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);
                let time_spent: number = (new Date().getTime() - this._params.interactivity.mouse.click_time) / 1000;

                if (time_spent > this._params.interactivity.modes.bubble.duration) {
                    this._tmpParams.bubble_duration_end = true;
                }

                if (time_spent > this._params.interactivity.modes.bubble.duration * 2) {
                    this._tmpParams.bubble_clicking = false;
                    this._tmpParams.bubble_duration_end = false;
                }

                let process: any = (bubble_param: any, particles_param: any, p_obj_bubble: any, p_obj: any, id: any) => {
                    if (bubble_param != particles_param) {
                        if (!this._tmpParams.bubble_duration_end) {
                            if (dist_mouse <= this._params.interactivity.modes.bubble.distance) {
                                let obj: any;
                                if (p_obj_bubble != undefined) {
                                    obj = p_obj_bubble;
                                } else {
                                    obj = p_obj;
                                }
                                if (obj != bubble_param) {
                                    let value: any = p_obj - (time_spent * (p_obj - bubble_param) / this._params.interactivity.modes.bubble.duration);
                                    if (id == 'size')
                                        particle.radius_bubble = value;
                                    if (id == 'opacity')
                                        particle.opacity_bubble = value;
                                }
                            } else {
                                if (id == 'size')
                                    particle.radius_bubble = undefined;
                                if (id == 'opacity')
                                    particle.opacity_bubble = undefined;
                            }
                        } else {
                            if (p_obj_bubble != undefined) {
                                let value_tmp: any = p_obj - (time_spent * (p_obj - bubble_param) / this._params.interactivity.modes.bubble.duration);
                                let dif: any = bubble_param - value_tmp;
                                let value: any = bubble_param + dif;
                                if (id == 'size')
                                    particle.radius_bubble = value;
                                if (id == 'opacity')
                                    particle.opacity_bubble = value;
                            }
                        }
                    }
                };

                if (this._tmpParams.bubble_clicking) {
                    process(this._params.interactivity.modes.bubble.size, this._params.particles.size.value, particle.radius_bubble, particle.radius, 'size');
                    process(this._params.interactivity.modes.bubble.opacity, this._params.particles.opacity.value, particle.opacity_bubble, particle.opacity, 'opacity');
                }
            }
        }
    }

    private _repulseParticle(particle: Particle) {
        if (this._params.interactivity.events.onhover.enable &&
            isInArray('repulse', this._params.interactivity.events.onhover.mode) &&
            this._params.interactivity.status == 'mousemove') {

            let dx_mouse: number = particle.x - this._params.interactivity.mouse.pos_x;
            let dy_mouse: number = particle.y - this._params.interactivity.mouse.pos_y;
            let dist_mouse: number = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);

            let normVec: any = { x: dx_mouse / dist_mouse, y: dy_mouse / dist_mouse };
            let repulseRadius: number = this._params.interactivity.modes.repulse.distance;
            let velocity: number = 100;
            let repulseFactor: number = clamp((1 / repulseRadius) * (-1 * Math.pow(dist_mouse / repulseRadius, 2) + 1) * repulseRadius * velocity, 0, 50);

            let pos = {
                x: particle.x + normVec.x * repulseFactor,
                y: particle.y + normVec.y * repulseFactor
            }

            if (this._params.particles.move.out_mode == 'bounce') {
                if (pos.x - particle.radius > 0 && pos.x + particle.radius < this._canvasParams.width)
                    particle.x = pos.x;
                if (pos.y - particle.radius > 0 && pos.y + particle.radius < this._canvasParams.height)
                    particle.y = pos.y;
            } else {
                particle.x = pos.x;
                particle.y = pos.y;
            }

        } else if (this._params.interactivity.events.onclick.enable &&
            isInArray('repulse', this._params.interactivity.events.onclick.mode)) {

            if (!this._tmpParams.repulse_finish) {
                this._tmpParams.repulse_count++;
                if (this._tmpParams.repulse_count == this._params.particles.array.length)
                    this._tmpParams.repulse_finish = true;
            }

            if (this._tmpParams.repulse_clicking) {

                let repulseRadius: number = Math.pow(this._params.interactivity.modes.repulse.distance / 6, 3);

                let dx: number = this._params.interactivity.mouse.click_pos_x - particle.x;
                let dy: number = this._params.interactivity.mouse.click_pos_y - particle.y;
                let d: number = dx * dx + dy * dy;

                let force: number = -repulseRadius / d * 1;

                let process: () => void =
                    () => {
                        let f: number = Math.atan2(dy, dx);
                        particle.vx = force * Math.cos(f);
                        particle.vy = force * Math.sin(f);
                        if (this._params.particles.move.out_mode == 'bounce') {
                            let pos: {
                                x: number;
                                y: number;
                            } = {
                                    x: particle.x + particle.vx,
                                    y: particle.y + particle.vy
                                }
                            if (pos.x + particle.radius > this._canvasParams.width)
                                particle.vx = -particle.vx;
                            else if (pos.x - particle.radius < 0)
                                particle.vx = -particle.vx;
                            if (pos.y + particle.radius > this._canvasParams.height)
                                particle.vy = -particle.vy;
                            else if (pos.y - particle.radius < 0)
                                particle.vy = -particle.vy;
                        }
                    };

                if (d <= repulseRadius) {
                    process();
                }
            } else {
                if (this._tmpParams.repulse_clicking == false) {
                    particle.vx = particle.vx_i;
                    particle.vy = particle.vy_i;
                }
            }
        }
    }

    private _grabParticle(particle: Particle): void {
        let { interactivity, particles } = this._params;

        if (interactivity.events.onhover.enable &&
            interactivity.status == 'mousemove') {

            let dx_mouse: number = particle.x - interactivity.mouse.pos_x;
            let dy_mouse: number = particle.y - interactivity.mouse.pos_y;
            let dist_mouse: number = Math.sqrt(dx_mouse * dx_mouse + dy_mouse * dy_mouse);

            if (dist_mouse <= interactivity.modes.grab.distance) {

                let { grab } = interactivity.modes;

                let opacity_line: number = grab.line_linked.opacity - (dist_mouse / (1 / grab.line_linked.opacity)) / grab.distance;

                if (opacity_line > 0) {
                    let color_line: {
                        r: number;
                        g: number;
                        b: number;
                    } = particles.line_linked.color_rgb_line;

                    let { r, g, b } = color_line;
                    this._canvasParams.ctx.strokeStyle = `rgba( ${r}, ${g}, ${b}, ${opacity_line} )`;
                    this._canvasParams.ctx.lineWidth = particles.line_linked.width;

                    this._canvasParams.ctx.beginPath();
                    this._canvasParams.ctx.moveTo(particle.x, particle.y);
                    this._canvasParams.ctx.lineTo(interactivity.mouse.pos_x, interactivity.mouse.pos_y);
                    this._canvasParams.ctx.stroke();
                    this._canvasParams.ctx.closePath();
                }
            }
        }
    }
}