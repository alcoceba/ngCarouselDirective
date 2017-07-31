import {Component} from "@angular/core";

@Component({
    selector: "ns-app",
    templateUrl: "app.component.html",
})

export class AppComponent {

    protected images: Array<any> = [];

    constructor() {
        this.images = [
            {
                title: 'Image 1',
                url: 'https://unsplash.it/400/300/?image=867'
            },
            {
                title: 'Image 2',
                file: '~/assets/mountain.jpeg'
            },
            {
                title: 'Image 3',
                url: 'https://unsplash.it/400/300/?image=868'
            },
            {
                title: 'Image 4',
                url: 'https://unsplash.it/400/300/?image=870'
            },
            {
                title: 'Image 5',
                url: 'https://unsplash.it/400/300/?image=876'
            },
        ];
    }
}
