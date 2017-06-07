# angular-particle

Implementation of [particle.js](https://github.com/VincentGarreau/particles.js/) with TypeScript for Angular2/4. Inspired by [react-particles-js](https://github.com/Wufe/react-particles-js)

## Installation

To install this library, run:

```bash
$ npm install angular-particle --save
```

## How to use

```typescript
// Import ParticlesModule
import { ParticlesModule } from 'angular-particle';

@NgModule({
  declarations: [
    ...
  ],
  imports: [
	...
    ParticlesModule
  ],
  providers: [],
  bootstrap: []
})
export class AppModule { }
```

And just use the component in your HTML

```html
<particles [style]="style" [width]="width" [height]="height" [params]="params"></particles>
```

Parameters configuration can be found [here](http://vincentgarreau.com/particles.js/). If you don't provide any parameters, default one are used.


## Properties

| Property | Type   | Definition                              |
| -------- | ------ | --------------------------------------- |
| params   | object | The parameters for particle.js          |
| style    | object | The style of the canvas container       |
| width    | number | The width of the canvas element (in %)  |
| height   | number | The height of the canvas element (in %) |


## Example

```typescript

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    myStyle: object = {};
	myParams: object = {};
	width: number = 100;
	height: number = 100;

    ngOnInit() {
        this.myStyle = {
            'position': 'fixed',
            'width': '100%',
            'height': '100%',
            'z-index': -1,
            'top': 0,
            'left': 0,
            'right': 0,
            'bottom': 0,
        };

	this.myParams = {
            particles: {
                number: {
                    value: 200,
                },
                color: {
                    value: '#ff0000'
                },
                shape: {
                    type: 'triangle',
                },
	    }
	};
    }
}
```

```html
<particles [params]="myParams" [style]="myStyle" [width]="width" [height]="height"></particles>
```


## License

MIT © [Luc Raymond](mailto:ryukku.raymond@gmail.com)
