import {AfterViewInit, Directive, ElementRef, EventEmitter, Input, Output} from '@angular/core';
import {Image} from "ui/image";
import {StackLayout} from "ui/layouts/stack-layout";
import {GridLayout, ItemSpec} from "ui/layouts/grid-layout";
import {Label} from "ui/label";
import {GestureTypes, SwipeGestureEventData} from "ui/gestures";
import {View} from "ui/core/view";
import {fromFile, fromResource} from "image-source";

@Directive({selector: '[carousel]'})
export class CarouselDirective implements AfterViewInit {

    private static TRANSPARENT: string = "#FFFFFF";

    private static animationSpeedDefault: number = 400; // in ms
    private static autoPlaySpeedDefault: number = 0; // in ms

    private container: GridLayout;
    private carouselSlides: GridLayout;
    private totalItems: number = 0;
    private autoPlayIntervalId: number;
    private autoPlayTimeoutId: number;
    private arrowType: number = CarouselArrowTypes.NORMAL;

    // Private control attributes
    private direction: CarouselDirections = null;
    private movingImages: boolean = false;

    // My pointers
    private currentImage: number = 0;
    private nextImage: number = null;
    private nextNextImage: number = null;

    // Options
    @Input() carousel: any;
    @Input() carouselSpeed: number; // autoplay speed (ms)
    @Input() carouselArrows: string; // arrows type
    @Input() arrowsEnabled: boolean = false; // enable arrows [default to false]
    @Input() carouselLabelOverlay: boolean; // title over image (bool)
    @Input() carouselAnimationSpeed: number; // animation speed
    @Input() currentElementHiglhtColor: string;

    @Output() selectedImageChange: EventEmitter<string> = new EventEmitter<string>();

    constructor(private elem: ElementRef) {
        this.container = elem.nativeElement;
    }

    ngAfterViewInit() {
        this.initOptions();
        this.initContainer();
        this.initImagesLayout();
        this.initSlides();
        // Prefer swipe over arrows tap
        if (this.arrowsEnabled === true) {
            this.initControls();
        }
        this.initAutoPlay();
    }

    /**
     * Get and set options from directive
     */
    private initOptions() {

        // Animation duration (in ms)
        if (this.carouselAnimationSpeed && CarouselDirective.isNumeric(this.carouselAnimationSpeed)) {
            this.carouselAnimationSpeed = +this.carouselAnimationSpeed;
        }
        else {
            this.carouselAnimationSpeed = CarouselDirective.animationSpeedDefault;
        }

        // Autoplay (in ms) + animation duration
        if (this.carouselSpeed && CarouselDirective.isNumeric(this.carouselSpeed)) {
            this.carouselSpeed = +(this.carouselSpeed);
        }
        else {
            this.carouselSpeed = CarouselDirective.autoPlaySpeedDefault;
        }

        // Set arrow type
        if (this.carouselArrows) {
            switch (this.carouselArrows) {
                case 'none':
                    this.arrowType = CarouselArrowTypes.NONE;
                    break;
                case 'small':
                    this.arrowType = CarouselArrowTypes.SMALL;
                    break;
                case 'normal':
                    this.arrowType = CarouselArrowTypes.NORMAL;
                    break;
                case 'bold':
                    this.arrowType = CarouselArrowTypes.BOLD;
                    break;
                case 'narrow':
                    this.arrowType = CarouselArrowTypes.NARROW;
                    break;
            }
        }
    }

    /**
     * Init carousel layout
     */
    private initContainer() {
        this.container.horizontalAlignment = "left";
        this.container.addRow(new ItemSpec(1, "auto"));
    }

    /**
     * Init sliders layout
     */
    private initImagesLayout() {
        this.totalItems = this.carousel.length;
        this.carouselSlides = new GridLayout();
        GridLayout.setColumnSpan(this.carouselSlides, 3);
        this.carouselSlides.addColumn(new ItemSpec(1, 'auto'));
        this.carouselSlides.addColumn(new ItemSpec(1, 'auto'));
        this.carouselSlides.addColumn(new ItemSpec(1, 'auto'));
        this.container.addChild(this.carouselSlides);
    }

    private initVisibility(index: number) {
        return index === 0 || index === 1 || index === 2 ? "visible" : "collapse";
    }

    private getInitColPos(index: number) {
        switch (index) {
            case 0:
                return 0;
            case 1:
                return 1;
            case 2:
                return 2; // could be any value between 0-2 since would be collapse

        }
    }


    /**
     * Init carousel sliders provided in "carousel" directive attribute
     */
    private initSlides() {
        this.carousel.forEach((slide: CarouselSlide, i: number) => {

            let gridLayout = new GridLayout();
            gridLayout.addRow(new ItemSpec(1, "auto"));
            gridLayout.visibility = this.initVisibility(i);

            if (i === 0 ) {
                gridLayout.backgroundColor = this.currentElementHiglhtColor;
            }

            let image: Image;
            if (slide.url) {
                image = CarouselDirective.generateImageSliderFromUrl(slide.url);
                image.on(GestureTypes.tap, () => {
                    this.selectedImageChange.emit( slide.title );
                });
                image.on(GestureTypes.swipe, (args: SwipeGestureEventData) => {
                    if (args.direction === 1) {
                        this.swipe(CarouselDirections.DIRECTION_LEFT);
                    } else if (args.direction === 2) {
                        this.swipe(CarouselDirections.DIRECTION_RIGHT);
                    }
                });
                gridLayout.addChild(image);
            }

            if (slide.file && slide.file.indexOf('res://') !== 0) {
                image = CarouselDirective.generateImageSliderFromFile(slide.file);
                image.on(GestureTypes.tap, () => {
                    this.selectedImageChange.emit( slide.title );
                });
                image.on(GestureTypes.swipe, (args: SwipeGestureEventData) => {
                    if (args.direction === 1) {
                        this.swipe(CarouselDirections.DIRECTION_LEFT);
                    } else if (args.direction === 2) {
                        this.swipe(CarouselDirections.DIRECTION_RIGHT);
                    }
                });
                gridLayout.addChild(image);
            }

            if (slide.file && slide.file.indexOf('res://') === 0) {
                image = CarouselDirective.generateImageSliderFromResource(slide.file);
                image.on(GestureTypes.tap, () => {
                    this.selectedImageChange.emit( slide.title );
                });
                image.on(GestureTypes.swipe, (args: SwipeGestureEventData) => {
                    if (args.direction === 1) {
                        this.swipe(CarouselDirections.DIRECTION_LEFT);
                    } else if (args.direction === 2) {
                        this.swipe(CarouselDirections.DIRECTION_RIGHT);
                    }
                });
                gridLayout.addChild(image);
            }


            if (slide.title) {
                let title: Label = CarouselDirective.generateTitleSlider(slide.title);
                if (this.carouselLabelOverlay) {
                    gridLayout.addRow(new ItemSpec(1, "auto"));
                    GridLayout.setRow(title, 1);
                }
                gridLayout.addChild(title);
            }

            this.carouselSlides.addChild(gridLayout);
            if (gridLayout.visibility === 'visible') {
                GridLayout.setColumn(gridLayout, this.getInitColPos(i));
            }
        });
    }

    /**
     * Load images from URL
     * @param src
     * @returns {Image}
     */
    private static generateImageSliderFromUrl(src: string): Image {
        let image: Image = new Image();
        image.src = src;
        image.className = "slider-image";
        return image;
    }

    /**
     * Load images from file
     * @param path
     * @returns {Image}
     */
    private static generateImageSliderFromFile(path: string): Image {
        let image: Image = new Image();
        image.imageSource = fromFile(path);
        image.className = "slider-image";
        return image;
    }

    /**
     * Load images from file
     * @param path
     * @returns {Image}
     */
    private static generateImageSliderFromResource(path: string): Image {
        let image: Image = new Image();
        let pathRaw: string = path.replace('res://', '');
        image.imageSource = fromResource(pathRaw);
        image.className = "slider-image";
        return image;
    }

    /**
     * Generate title slider element
     * @param title
     * @returns {Label}
     */
    private static generateTitleSlider(title: string): Label {
        let label = new Label();
        label.text = title;
        label.textWrap = true;
        label.className = 'slider-title';
        return label;
    }

    /**
     * Init carousel controls
     */
    private initControls() {
        if (this.totalItems > 1) {

            // Get Arrow type
            let arrowType = this.getArrowType();

            // Left arrow label
            let lLabel = new Label();
            lLabel.text = String.fromCharCode(parseInt(arrowType.l, 16));

            // Left arrow layout
            let lStackLayout = new StackLayout();
            lStackLayout.addChild(lLabel);
            lStackLayout.horizontalAlignment = "left";
            lStackLayout.on(GestureTypes.tap, () => {
                this.stopStartAutoplay();
                this.swipe(CarouselDirections.DIRECTION_LEFT);
            });
            lStackLayout.className = 'arrow arrow-left';
            GridLayout.setColumn(lStackLayout, 0);
            this.container.addChild(lStackLayout);

            // Right arrow label
            let rLabel = new Label();
            rLabel.text = String.fromCharCode(parseInt(arrowType.r, 16));

            // Left arrow layout
            let rStackLayout = new StackLayout();
            rStackLayout.addChild(rLabel);
            rStackLayout.horizontalAlignment = "right";
            rStackLayout.on(GestureTypes.tap, () => {
                this.stopStartAutoplay();
                this.swipe(CarouselDirections.DIRECTION_RIGHT);
            });
            rStackLayout.className = 'arrow arrow-right';
            GridLayout.setColumn(rStackLayout, 1);
            this.container.addChild(rStackLayout);
        }
    }

    /**
     * Init caroussel autoplay
     */
    private initAutoPlay() {
        if (this.carouselSpeed && CarouselDirective.isNumeric(this.carouselSpeed)) {
            clearInterval(this.autoPlayIntervalId);
            // @ts-ignore
            this.autoPlayIntervalId = setInterval(() => {
                this.swipe(CarouselDirections.DIRECTION_RIGHT);
            }, this.carouselSpeed + this.carouselAnimationSpeed);
        }
    }

    /**
     * Stop on gesture detected, resume after 4 seconds
     */
    private stopStartAutoplay() {
        if (this.autoPlayIntervalId) {
            clearTimeout(this.autoPlayTimeoutId);
            clearInterval(this.autoPlayIntervalId);
            // @ts-ignore
            this.autoPlayTimeoutId = setTimeout(() => {
                this.swipe(CarouselDirections.DIRECTION_RIGHT);
                this.initAutoPlay();
            }, 4000)
        }
    }

    /**
     * Animate right to left or left to right
     * @param direction
     * @returns {boolean}
     */
    private swipe(direction: CarouselDirections) {

        // Do nothing, hay solo una imagen...
        if (this.totalItems < 2 || this.movingImages) {
            return false;
        }

        // Animate slides
        this.direction = direction;
        this.movingImages = true;
        this.setDirectionValues();
        this.animateSlides();

        // Reset all after animation
        setTimeout(() => this.resetAnimationValues(), this.carouselAnimationSpeed);
    }

    /**
     * Animate slides
     */
    private animateSlides() {
        for (let i = 0; i < this.carouselSlides.getChildrenCount(); i++) {

            // Get view
            let view: View = this.carouselSlides.getChildAt(i);

            // Get element width + image visibility
            let elementWidth = this.elem.nativeElement.getActualSize().width;
            view.visibility = [this.currentImage, this.nextImage, this.nextNextImage].indexOf(i) > -1 ? "visible" : "collapse";

            // Perfrom translation
            if (view.visibility === 'visible'){
                this.applySwipe(view, i, elementWidth);
            }
        }
    }

    private applySwipe (view: View, index: number, elementWidth: number) {
        switch (index) {
            case this.currentImage:
                view.backgroundColor = this.currentElementHiglhtColor;
                GridLayout.setColumn(view, 0);
                break;
            case this.nextImage:
                view.backgroundColor = CarouselDirective.TRANSPARENT;
                GridLayout.setColumn(view, 1);
                break;
            case this.nextNextImage:
                view.backgroundColor = CarouselDirective.TRANSPARENT;
                GridLayout.setColumn(view, 2);
                break;
        }
    }

    /**
     * Set values to perform the animation
     */
    private setDirectionValues() {
        switch (this.direction) {

            // right to left
            case CarouselDirections.DIRECTION_LEFT:
                this.currentImage = ((this.currentImage === 0 ? this.totalItems : this.currentImage) - 1) % this.totalItems;
                this.nextImage = ((this.currentImage === 0 ? this.totalItems : this.currentImage) - 1) % this.totalItems;
                this.nextNextImage = ((this.nextImage === 0 ? this.totalItems : this.nextImage) - 1) % this.totalItems;
                break;

            // left to right
            case CarouselDirections.DIRECTION_RIGHT:
                this.currentImage = ((this.currentImage === 0 ? this.totalItems : this.currentImage) + 1) % this.totalItems;
                this.nextImage = (this.currentImage + 1) % this.totalItems;
                this.nextNextImage = (this.nextImage + 1) % this.totalItems;
                break;
        }
    }

    /**
     * Reset values after animation
     */
    private resetAnimationValues() {
        this.nextImage = null;
        this.nextNextImage = null;
        this.movingImages = false;
    }

    /**
     * Get arrow type to be displayed in frontend
     * @returns {{l: string, r: string}}
     */
    private getArrowType() {
        let ret = {l: '', r: ''};
        switch (this.arrowType) {
            case CarouselArrowTypes.NONE:
                ret.l = '';
                ret.r = '';
                break;
            case CarouselArrowTypes.SMALL:
                ret.l = '2039';
                ret.r = '203A';
                break;
            default:
            case CarouselArrowTypes.NORMAL:
                ret.l = '276E';
                ret.r = '276F';
                break;
            case CarouselArrowTypes.BOLD:
                ret.l = '2770';
                ret.r = '2771';
                break;
            case CarouselArrowTypes.NARROW:
                ret.l = '2329';
                ret.r = '232A';
                break;
        }
        return ret;
    }

    /**
     * Check if numeric value
     * @param value
     * @returns {boolean}
     */
    private static isNumeric(value: any) {
        return !isNaN(value - parseFloat(value));
    }
}

enum CarouselArrowTypes {
    NONE,
    SMALL,
    NARROW,
    NORMAL,
    BOLD
}

enum CarouselDirections {
    DIRECTION_LEFT,
    DIRECTION_RIGHT
}

export class CarouselSlide {
    url?: string;
    file?: string;
    title?: string;
}