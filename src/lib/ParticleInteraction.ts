import { Particle, IParams, ICanvasParams } from './index';

export class ParticleInteraction {
    constructor() { }

    linkParticles(p1: Particle, p2: Particle, params: IParams, canvasParams: ICanvasParams): void {
        let dx: number = p1.x - p2.x;
        let dy: number = p1.y - p2.y;
        let dist: number = Math.sqrt(dx * dx + dy * dy);
        let { line_linked } = params.particles;

        if (dist <= params.particles.line_linked.distance) {
            let opacity_line: number = params.particles.line_linked.opacity - (dist / (1 / params.particles.line_linked.opacity)) / params.particles.line_linked.distance;
            if (opacity_line > 0) {
                let color_line: any = params.particles.line_linked.color_rgb_line;
                let { r, g, b } = color_line;
                canvasParams.ctx.save();
                canvasParams.ctx.strokeStyle = `rgba( ${r}, ${g}, ${b}, ${opacity_line} )`;
                canvasParams.ctx.lineWidth = params.particles.line_linked.width;

                canvasParams.ctx.beginPath();
                if (line_linked.shadow.enable) {
                    canvasParams.ctx.shadowBlur = line_linked.shadow.blur;
                    canvasParams.ctx.shadowColor = line_linked.shadow.color;
                }

                canvasParams.ctx.moveTo(p1.x, p1.y);
                canvasParams.ctx.lineTo(p2.x, p2.y);
                canvasParams.ctx.stroke();
                canvasParams.ctx.closePath();
                canvasParams.ctx.restore();
            }
        }
    }

    attractParticles(p1: Particle, p2: Particle, params: IParams): void {
        let dx: number = p1.x - p2.x;
        let dy: number = p1.y - p2.y;
        let dist: number = Math.sqrt(dx * dx + dy * dy);

        if (dist <= params.particles.line_linked.distance) {
            let ax = dx / (params.particles.move.attract.rotateX * 1000);
            let ay = dy / (params.particles.move.attract.rotateY * 1000);

            p1.vx -= ax;
            p1.vy -= ay;

            p2.vx += ax;
            p2.vy += ay;
        }
    }

    bounceParticles(p1: Particle, p2: Particle): void {
        let dx: number = p1.x - p2.x;
        let dy: number = p1.y - p2.y;
        let dist: number = Math.sqrt(dx * dx + dy * dy);
        let dist_p: number = p1.radius + p2.radius;

        if (dist <= dist_p) {
            p1.vx = -p1.vx;
            p1.vy = -p1.vy;
            p2.vx = -p2.vx;
            p2.vy = -p2.vy;
        }
    }
}