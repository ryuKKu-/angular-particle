# angular-particle

Implementation of [particle.js](https://github.com/VincentGarreau/particles.js/) with TypeScript for Angular2/4

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

And use the component in your HTML

```html
<particles [style]="style" [width]="width" [height]="height" [params]="params"></particles>
```

Find your parameters configuration [here](http://vincentgarreau.com/particles.js/).


## License

MIT © [Luc Raymond](mailto:ryukku.raymond@gmail.com)
