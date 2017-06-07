import { IParams, ITmpParams, Particle } from './index';

export type RGB = {
	r: number;
	g: number;
	b: number;
};

export type HSL = {
	h: number;
	s: number;
	l: number;
};

export const hexToRgb: (hex: string) => RGB =
    (hex) => {
        let shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
        hex = hex.replace(shorthandRegex, (m, r, g, b) => {
            return r + r + g + g + b + b;
        });
        let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : null;
    };

export const clamp: (number: number, min: number, max: number) => number =
    (number, min, max) => {
        return Math.min(Math.max(number, min), max);
    };

export const isInArray: (value: any, array: any) => boolean =
    (value, array) => {
        return array.indexOf(value) > -1;
    };

export const deepExtend: (destination: any, source: any) => any =
    function (destination, source) {
        for (let property in source) {
            if (source[property] &&
                source[property].constructor &&
                source[property].constructor === Object) {
                destination[property] = destination[property] || {};
                deepExtend(destination[property], source[property]);
            } else {
                destination[property] = source[property];
            }
        }
        return destination;
    };

export const getColor: (colorObject: any) => { rgb?: RGB, hsl?: HSL } =
    (colorObject) => {
        let color: { rgb?: RGB, hsl?: HSL } = {};
        if (typeof (colorObject) == 'object') {
            if (colorObject instanceof Array) {
                let selectedColor: string = colorObject[Math.floor(Math.random() * colorObject.length)];
                color.rgb = hexToRgb(selectedColor);
            } else {
                let { r, g, b } = colorObject;
                if (r !== undefined && g !== undefined && b !== undefined) {
                    color.rgb = { r, g, b };
                } else {
                    let { h, s, l } = colorObject;
                    if (h !== undefined && g !== undefined && b !== undefined) {
                        color.hsl = { h, s, l };
                    }
                }
            }
        } else if (colorObject == 'random') {
            color.rgb = {
                r: (Math.floor(Math.random() * 255) + 1),
                g: (Math.floor(Math.random() * 255) + 1),
                b: (Math.floor(Math.random() * 255) + 1)
            }
        } else if (typeof (colorObject) == 'string') {
            color.rgb = hexToRgb(colorObject);
        }
        return color;
    };

export const getDefaultParams: () => IParams =
    () => {
        return {
            particles: {
                number: {
                    value: 100,
                    density: {
                        enable: true,
                        value_area: 800
                    }
                },
                color: {
                    value: '#FFF'
                },
                shape: {
                    type: 'circle',
                    stroke: {
                        width: 0,
                        color: '#000000'
                    },
                    polygon: {
                        nb_sides: 5
                    },
                    image: {
                        src: '',
                        width: 100,
                        height: 100
                    }
                },
                opacity: {
                    value: 0.5,
                    random: false,
                    anim: {
                        enable: true,
                        speed: 1,
                        opacity_min: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: 3,
                    random: true,
                    anim: {
                        enable: false,
                        speed: 40,
                        size_min: 0,
                        sync: false
                    }
                },
                line_linked: {
                    enable: true,
                    distance: 150,
                    color: '#FFF',
                    opacity: 0.6,
                    width: 1,
                    shadow: {
                        enable: false,
                        blur: 5,
                        color: 'lime'
                    }
                },
                move: {
                    enable: true,
                    speed: 3,
                    direction: 'none',
                    random: false,
                    straight: false,
                    out_mode: 'out',
                    bounce: true,
                    attract: {
                        enable: false,
                        rotateX: 3000,
                        rotateY: 3000
                    }
                },
                array: []
            },
            interactivity: {
                detect_on: 'canvas',
                events: {
                    onhover: {
                        enable: true,
                        mode: 'grab'
                    },
                    onclick: {
                        enable: true,
                        mode: 'push'
                    },
                    resize: true
                },
                modes: {
                    grab: {
                        distance: 200,
                        line_linked: {
                            opacity: 1
                        }
                    },
                    bubble: {
                        distance: 200,
                        size: 80,
                        duration: 0.4
                    },
                    repulse: {
                        distance: 200,
                        duration: 0.4
                    },
                    push: {
                        particles_nb: 4
                    },
                    remove: {
                        particles_nb: 2
                    }
                },
                mouse: {}
            },
            retina_detect: true
        }
    };


export function loadImg(params: IParams, tmp: ITmpParams) {
    let { particles } = this.params;

    tmp.img_error = undefined;

    if (particles.shape.type == 'image' && particles.shape.image.src != '') {
        if (tmp.img_type == 'svg') {
            let xhr: XMLHttpRequest = new XMLHttpRequest();
            xhr.open('GET', particles.shape.image.src);
            xhr.onreadystatechange = (data: any) => {
                if (xhr.readyState == 4) {
                    if (xhr.status == 200) {
                        tmp.source_svg = data.currentTarget.response;
                        if (tmp.source_svg == undefined) {
                            let check: any;
                            tmp.checkAnimFrame = requestAnimationFrame(check);
                        }
                    } else {
                        tmp.img_error = true;
                        throw "Error : image not found";
                    }
                }
            };
            xhr.send();
        } else {
            let img: HTMLImageElement = new Image();
            img.addEventListener('load', () => {
                tmp.img_obj = img;
                cancelAnimationFrame(tmp.checkAnimFrame);
            });
            img.src = particles.shape.image.src;
        }
    } else {
        tmp.img_error = true;
        throw "Error : no image.src";
    }
}

export function createSvgImg(particle: Particle, tmp: ITmpParams): void {
    let svgXml: string = tmp.source_svg;
    let rgbHex: RegExp = /#([0-9A-F]{3,6})/gi;
    let coloredSvgXml: string = svgXml.replace(rgbHex, (m, r, g, b) => {
        let color_value: string;
        if (particle.color.rgb) {
            let { r, g, b } = particle.color.rgb;
            color_value = `rgba( ${r}, ${g}, ${b}, ${particle.opacity} )`;
        } else {
            let { h, s, l } = particle.color.hsl;
            color_value = `rgba( ${h}, ${s}, ${l}, ${particle.opacity} )`;
        }
        return color_value;
    });

    let svg: Blob = new Blob([coloredSvgXml], {
        type: 'image/svg+xml;charset=utf-8'
    });

    let DOMURL: any = window.URL || window;
    let url: any = DOMURL.createObjectURL(svg);

    let img = new Image();
    img.addEventListener('load', () => {
        particle.img.obj = img;
        particle.img.loaded = true;
        DOMURL.revokeObjectURL(url);
        tmp.count_svg++;
    });
    img.src = url;
}