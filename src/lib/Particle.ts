import { IParams, ICanvasParams, ITmpParams, hexToRgb, getColor, createSvgImg }  from '.';

export class Particle {
    radius: number;
    radius_bubble: number;
    size_status: boolean;
    vs: number;

    x: number;
    y: number;
    color: any;

    opacity: number;
    opacity_bubble: number;
    opacity_status: boolean;
    vo: number;

    vx: number;
    vy: number;

    vx_i: number;
    vy_i: number;

    shape: string;

    img: { src: string; ratio: number; loaded?: boolean; obj?: any; };

    constructor(private _canvasParams: ICanvasParams, private _params: IParams, private _tmpParams: ITmpParams, color?: any, opacity?: any, position?: { x: number; y: number; }) {
        this._setupSize();
        this._setupPosition(position);
        this._setupColor(color);
        this._setupOpacity();
        this._setupAnimation();
    }

    private _setupSize(): void {
        this.radius = (this._params.particles.size.random ? Math.random() : 1) * this._params.particles.size.value;
        if (this._params.particles.size.anim.enable) {
            this.size_status = false;
            this.vs = this._params.particles.size.anim.speed / 100;
            if (!this._params.particles.size.anim.sync)
                this.vs = this.vs * Math.random();
        }
    }

    private _setupPosition(position?: { x: number; y: number; }): void {
        this.x = position ? position.x : Math.random() * this._canvasParams.width;
        this.y = position ? position.y : Math.random() * this._canvasParams.height;

        if (this.x > this._canvasParams.width - this.radius * 2) {
            this.x = this.x - this.radius;
        } else if (this.x < this.radius * 2) {
            this.x = this.x + this.radius;
        }
        if (this.y > this._canvasParams.height - this.radius * 2) {
            this.y = this.y - this.radius;
        } else if (this.y < this.radius * 2) {
            this.y = this.y + this.radius;
        }

        if (this._params.particles.move.bounce) {
            this._checkOverlap(this, position);
        }
    }

    private _checkOverlap(p1: Particle, position?: { x: number; y: number; }): void {
        let { particles } = this._params;

        particles.array.forEach((particle: Particle) => {
            let p2: Particle = particle;

            let dx: number = p1.x - p2.x;
            let dy: number = p1.y - p2.y;
            let dist: number = Math.sqrt(dx * dx + dy * dy);

            if (dist <= p1.radius + p2.radius) {
                p1.x = position ? position.x : Math.random() * this._canvasParams.width;
                p1.y = position ? position.y : Math.random() * this._canvasParams.height;
                this._checkOverlap(p1);
            }
        });
    }

    private _setupColor(color?: any) {
        this.color = getColor(color.value);
    }

    private _setupOpacity(): void {
        this.opacity = (this._params.particles.opacity.random ? Math.random() : 1) * this._params.particles.opacity.value;
        if (this._params.particles.opacity.anim.enable) {
            this.opacity_status = false;
            this.vo = this._params.particles.opacity.anim.speed / 100;
            if (!this._params.particles.opacity.anim.sync) {
                this.vo = this.vo * Math.random();
            }
        }
    }

    private _setupAnimation(): void {
        let velbase: { x: number; y: number; } = null;
        switch (this._params.particles.move.direction) {
            case 'top':
                velbase = { x: 0, y: -1 };
                break;
            case 'top-right':
                velbase = { x: 0.5, y: -0.5 };
                break;
            case 'right':
                velbase = { x: 1, y: 0 };
                break;
            case 'bottom-right':
                velbase = {  x: 0.5, y: 0.5 };
                break;
            case 'bottom':
                velbase = { x: 0, y: 1 };
                break;
            case 'bottom-left':
                velbase = { x: -0.5, y: 1 };
                break;
            case 'left':
                velbase = { x: -1, y: 0 };
                break;
            case 'top-left':
                velbase = {  x: -0.5, y: -0.5 };
                break;
            default:
                velbase = {  x: 0, y: 0 };
                break;
        }

        if (this._params.particles.move.straight) {
            this.vx = velbase.x;
            this.vy = velbase.y;
            if (this._params.particles.move.random) {
                this.vx = this.vx * (Math.random());
                this.vy = this.vy * (Math.random());
            }
        } else {
            this.vx = velbase.x + Math.random() - 0.5;
            this.vy = velbase.y + Math.random() - 0.5;
        }

        this.vx_i = this.vx;
        this.vy_i = this.vy;

        let shape_type: any = this._params.particles.shape.type;

        if (typeof (shape_type) == 'object') {
            if (shape_type instanceof Array) {
                let shape_selected: string = shape_type[Math.floor(Math.random() * shape_type.length)];
                this.shape = shape_selected;
            }
        } else {
            this.shape = shape_type;
        }

        if (this.shape == 'image') {
            let sh: any = this._params.particles.shape;
            this.img = {
                src: sh.image.src,
                ratio: sh.image.width / sh.image.height
            };

            if (!this.img.ratio)
                this.img.ratio = 1;
            if (this._tmpParams.img_type == 'svg' && this._tmpParams.source_svg != undefined) {
                createSvgImg(this, this._tmpParams);
                if (this._tmpParams.pushing) {
                    this.img.loaded = false;
                }
            }
        }
    }

    private _drawShape(c: CanvasRenderingContext2D, startX: number, startY: number, sideLength: number, sideCountNumerator: number, sideCountDenominator: number): void {
        let sideCount: number = sideCountNumerator * sideCountDenominator;
        let decimalSides: number = sideCountNumerator / sideCountDenominator;
        let interiorAngleDegrees: number = (180 * (decimalSides - 2)) / decimalSides;
        let interiorAngle: number = Math.PI - Math.PI * interiorAngleDegrees / 180;

        c.save();
        c.beginPath();
        c.translate(startX, startY);
        c.moveTo(0, 0);

        for (let i = 0; i < sideCount; i++) {
            c.lineTo(sideLength, 0);
            c.translate(sideLength, 0);
            c.rotate(interiorAngle);
        }

        c.fill();
        c.restore();
    }

    public draw(): void {
        let { particles } = this._params;

        let radius: number;
        if (this.radius_bubble != undefined) {
            radius = this.radius_bubble;
        } else {
            radius = this.radius;
        }

        let opacity: number;
        if (this.opacity_bubble != undefined) {
            opacity = this.opacity_bubble;
        } else {
            opacity = this.opacity;
        }

        let color_value: string;

        if (this.color.rgb) {
            let { r, g, b } = this.color.rgb;
            color_value = `rgba( ${r}, ${g}, ${b}, ${opacity} )`;
        } else {
            let { h, s, l } = this.color.hsl;
            color_value = `hsla( ${h}, ${s}, ${l}, ${opacity} )`;
        }

        this._canvasParams.ctx.fillStyle = color_value;
        this._canvasParams.ctx.beginPath();

        switch (this.shape) {
            case 'circle':
                this._canvasParams.ctx.arc(this.x, this.y, radius, 0, Math.PI * 2, false);
                break;

            case 'edge':
                this._canvasParams.ctx.rect(this.x - radius, this.y - radius, radius * 2, radius * 2);
                break;

            case 'triangle':
                this._drawShape(this._canvasParams.ctx, this.x - radius, this.y + radius / 1.66, radius * 2, 3, 2);
                break;

            case 'polygon':
                this._drawShape(
                    this._canvasParams.ctx,
                    this.x - radius / (this._params.particles.shape.polygon.nb_sides / 3.5),
                    this.y - radius / (2.66 / 3.5),
                    radius * 2.66 / (this._params.particles.shape.polygon.nb_sides / 3),
                    this._params.particles.shape.polygon.nb_sides,
                    1
                );
                break;

            case 'star':
                this._drawShape(
                    this._canvasParams.ctx,
                    this.x - radius * 2 / (this._params.particles.shape.polygon.nb_sides / 4),
                    this.y - radius / (2 * 2.66 / 3.5),
                    radius * 2 * 2.66 / (this._params.particles.shape.polygon.nb_sides / 3),
                    this._params.particles.shape.polygon.nb_sides,
                    2
                );
                break;

            case 'image':
                let draw: (img_obj: any) => void =
                    (img_obj) => {
                        this._canvasParams.ctx.drawImage(
                            img_obj,
                            this.x - radius,
                            this.y - radius,
                            radius * 2,
                            radius * 2 / this.img.ratio
                        );
                    };
                let img_obj: any;

                if (this._tmpParams.img_type == 'svg') {
                    img_obj = this.img.obj;
                } else {
                    img_obj = this._tmpParams.img_obj;
                }

                if (img_obj)
                    draw(img_obj);
                break;
        }

        this._canvasParams.ctx.closePath();

        if (this._params.particles.shape.stroke.width > 0) {
            this._canvasParams.ctx.strokeStyle = this._params.particles.shape.stroke.color;
            this._canvasParams.ctx.lineWidth = this._params.particles.shape.stroke.width;
            this._canvasParams.ctx.stroke();
        }

        this._canvasParams.ctx.fill();
    }
}