import {Directive, ElementRef, AfterViewInit, Input} from '@angular/core';
import {AnimationCurve} from "ui/enums";
import {Image} from "ui/image";
import {StackLayout} from "ui/layouts/stack-layout";
import {GridLayout, ItemSpec} from "ui/layouts/grid-layout";
import {GridUnitType} from "ui/layouts/grid-layout";
import {HorizontalAlignment} from "ui/enums";
import {Label} from "ui/label";
import {GestureTypes} from "ui/gestures";
import {View} from "ui/core/view";
import {Visibility} from "ui/enums";
import {fromFile} from "image-source";
import {fromResource} from "image-source";

@Directive({selector: '[carousel]'})
export class CarouselDirective implements AfterViewInit {

    private static animationSpeedDefault: number = 400; // in ms
    private static autoPlaySpeedDefault: number = 0; // in ms

    private container: GridLayout;
    private carouselSlides: GridLayout;
    private totalItems: number = 0;
    private autoPlayIntervalId: any;
    private autoPlayTimeoutId: any;
    private arrowType: number = CarouselArrowTypes.NORMAL;

    // Private control attributes
    private direction: CarouselDirections = null;
    private currentImage: number = 0;
    private movingImages: boolean = false;
    private indexMoveLeft: number = null;
    private indexMoveRight: number = null;
    private indexMoveCenter: number = null;

    // Options
    @Input() carousel: any;
    @Input() carouselSpeed: number; // autoplay speed (ms)
    @Input() carouselArrows: string; // arrows type
    @Input() carouselLabelOverlay: boolean; // title over image (bool)
    @Input() carouselAnimationSpeed: number; // animation speed

    constructor(private elem: ElementRef) {
        this.container = elem.nativeElement;
    }

    ngAfterViewInit() {
        this.initOptions();
        this.initContainer();
        this.initImagesLayout();
        this.initSlides();
        this.initControls();
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
        this.container.horizontalAlignment = "center";
        this.container.addRow(new ItemSpec(1, "auto"));
        this.container.addColumn(new ItemSpec(1, "star"));
        this.container.addColumn(new ItemSpec(1, "star"));
    }

    /**
     * Init sliders layout
     */
    private initImagesLayout() {
        this.totalItems = this.carousel.length;
        this.carouselSlides = new GridLayout();
        GridLayout.setColumnSpan(this.carouselSlides, 2);
        this.container.addChild(this.carouselSlides);
    }

    /**
     * Init carousel sliders provided in "carousel" directive attribute
     */
    private initSlides() {
        this.carousel.forEach((slide: CarouselSlide, i: number) => {

            let gridLayout = new GridLayout();
            gridLayout.addRow(new ItemSpec(1, "auto"));
            gridLayout.visibility = i == 0 ? "visible" : "collapse";

            if (slide.url) {
                let image: Image = CarouselDirective.generateImageSliderFromUrl(slide.url);
                gridLayout.addChild(image);
            }

            if (slide.file && slide.file.indexOf('res://') !== 0) {
                let image: Image = CarouselDirective.generateImageSliderFromFile(slide.file);
                gridLayout.addChild(image);
            }

            if (slide.file && slide.file.indexOf('res://') === 0) {
                let image: Image = CarouselDirective.generateImageSliderFromResource(slide.file);
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
            view.visibility = [this.indexMoveCenter, this.indexMoveLeft, this.indexMoveRight].indexOf(i) > -1 ? "visible" : "collapse";

            // Perfrom animation
            this.checkCL(view, i, elementWidth);
            this.checkCR(view, i, elementWidth);
            this.checkRC(view, i, elementWidth);
            this.checkLC(view, i, elementWidth);
        }
    }

    /**
     * Move image center -> left
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkCL(view: View, index: number, elementWidth: number) {
        if (this.indexMoveLeft == index) {
            view.translateX = 0;
            view.animate({
                translate: {x: elementWidth, y: 0},
                duration: this.carouselAnimationSpeed,
                curve: AnimationCurve.easeIn
            });
        }
    }

    /**
     * Move image right -> center
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkRC(view: View, index: number, elementWidth: number) {
        if (this.indexMoveCenter == index && this.direction == CarouselDirections.DIRECTION_LEFT) {
            view.translateX = -elementWidth;
            view.animate({
                translate: {x: 0, y: 0},
                duration: this.carouselAnimationSpeed,
                curve: AnimationCurve.easeOut
            });
        }
    }

    /**
     * Move image center -> right
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkCR(view: View, index: number, elementWidth: number) {
        if (this.indexMoveRight == index) {
            view.translateX = 0;
            view.animate({
                translate: {x: -elementWidth, y: 0},
                duration: this.carouselAnimationSpeed,
                curve: AnimationCurve.easeIn
            });
        }
    }

    /**
     * Move image left -> center
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkLC(view: View, index: number, elementWidth: number) {
        if (this.indexMoveCenter == index && this.direction == CarouselDirections.DIRECTION_RIGHT) {
            view.translateX = elementWidth;
            view.animate({
                translate: {x: 0, y: 0},
                duration: this.carouselAnimationSpeed,
                curve: AnimationCurve.easeOut
            });
        }
    }

    /**
     * Set values to perform the animation
     */
    private setDirectionValues() {
        switch (this.direction) {

            // right to left
            case CarouselDirections.DIRECTION_LEFT:
                this.indexMoveLeft = this.currentImage;
                this.currentImage = ((this.currentImage == 0 ? this.totalItems : this.currentImage) - 1) % this.totalItems;
                this.indexMoveCenter = this.currentImage;
                break;

            // left to right
            case CarouselDirections.DIRECTION_RIGHT:
                this.indexMoveRight = this.currentImage;
                this.currentImage = (this.currentImage + 1) % this.totalItems;
                this.indexMoveCenter = this.currentImage;
                break;
        }
    }

    /**
     * Reset values after animation
     */
    private resetAnimationValues() {
        this.indexMoveLeft = null;
        this.indexMoveRight = null;
        this.indexMoveCenter = null;
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
