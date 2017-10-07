# {N} + Angular Carousel Slider
A simple NativeScript + Angular images carousel for iOS and Android. For {N} version >= 3.0.0.

I would appreciate any feedback as well as bug report, suggestions or changes. Thank you in advance.

## Demo

iOs                        |  Android
:-------------------------:|:-------------------------:
![](https://github.com/alcoceba/ngCarouselDirective/blob/master/demo/ios.gif?raw=true)|![](https://github.com/alcoceba/ngCarouselDirective/blob/master/demo/android.gif?raw=true)

## Getting started


See demo for further details.

1. Add the CarouselDirective class to the declarations NgMoudle metadata:
<pre>
@NgModule({
    declarations: [AppComponent, CarouselDirective],
    bootstrap: [AppComponent],
    imports: [NativeScriptModule],
    schemas: [NO_ERRORS_SCHEMA]
})
</pre>

2. To use the CarouselDirective, create a template that applies the directive as an attribute to a paragraph GridLayout element:
<pre>
&lt;GridLayout [carousel]="images" carouselLabelOverlay="true" carouselSpeed="2000"&gt;
    
&lt;/GridLayout&gt;
</pre>

Add images from component:
<pre>
@Component({
    selector: "my-app",
    templateUrl: "app.component.html"
})
export class AppComponent {

    protected images: Array<any> = [];

    constructor() {
        this.images = [
            { title: 'Image 1', url: 'https://unsplash.it/400/300/?image=867' },
            { title: 'Image 2', url: 'https://unsplash.it/400/300/?image=870' },
            { title: 'Image 3', url: 'https://unsplash.it/400/300/?image=876' },
        ];
    }
}
</pre>

You can also add images from your assets folder or resources folder using `file` attribute instead of `url` attribute:
<pre>
@Component({
    selector: "my-app",
    templateUrl: "app.component.html"
})
export class AppComponent {

    protected images: Array<any> = [];

    constructor() {
        this.images = [
            { title: 'Image 1', url: 'https://unsplash.it/400/300/?image=867' },
            { title: 'Image 2', file: '~/assets/sea-sunset.jpg' },
            { title: 'Image 2', file: 'res://mountain' }, // Resource without extension
            { title: 'Image 3', url: 'https://unsplash.it/400/300/?image=876' },
        ];
    }
}
</pre>


3. CSS styling:

<pre>
/** Slider image */
.slider-image {

}

/** Slider title format */
.slider-title {
    color: #fff;
    font-weight: bold;
    background-color: rgba(125, 125, 125);
    padding: 8;
    text-align: center;
    vertical-align: bottom;
}

/** Arrows */
.arrow {
    color: #ffffff;
    font-size: 32;
    vertical-align: middle;
    padding: 10;
}

/** Arrow left wrapper */
.arrow.arrow-left {

}

/** Arrow right */
.arrow.arrow-right {

}
</pre>

## Supported attributes

Currently directive supported attributes:

* **carousel** list of images as JSON or CarouselSlide class, accepted parameters (title?, url?, file?)
* **carouselSpeed** _(optional)_ defines the interval (number in ms) to wait before the next slide is shown 
* **carouselAnimationSpeed** _(optional)_ defines the animation speed (number in ms)
* **carouselArrows** _(optional)_ arrow type, accepted values _none_, _small_, _normal_, _bold_ or _narrow_ (default _normal_)
* **carouselLabelOverlay** _(optional)_ silde title over image, accepted values _true_ or _false_ (default false)

## Changelog

**Version 0.0.5**

* Possibility to load images from resources folder in Android and iOS

**Version 0.0.4**

* Updated to Nativescript >= 3.0.0 + Angular 4

**Version 0.0.3**

* Package.json fixes
* Minor fixes
