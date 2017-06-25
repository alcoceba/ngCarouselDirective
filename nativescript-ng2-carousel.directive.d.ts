import { ElementRef, AfterViewInit } from '@angular/core';
export declare class CarouselDirective implements AfterViewInit {
    private elem;
    private static animationSpeedDefault;
    private static autoPlaySpeedDefault;
    private container;
    private carouselSlides;
    private totalItems;
    private autoPlayIntervalId;
    private autoPlayTimeoutId;
    private arrowType;
    private direction;
    private currentImage;
    private movingImages;
    private indexMoveLeft;
    private indexMoveRight;
    private indexMoveCenter;
    carousel: any;
    carouselSpeed: number;
    carouselArrows: string;
    carouselLabelOverlay: boolean;
    carouselAnimationSpeed: number;
    constructor(elem: ElementRef);
    ngAfterViewInit(): void;
    /**
     * Get and set options from directive
     */
    private initOptions();
    /**
     * Init carousel layout
     */
    private initContainer();
    /**
     * Init sliders layout
     */
    private initImagesLayout();
    /**
     * Init carousel sliders provided in "carousel" directive attribute
     */
    private initSlides();
    /**
     * Load images from URL
     * @param src
     * @returns {Image}
     */
    private static generateImageSliderFromUrl(src);
    /**
     * Load images from file
     * @param path
     * @returns {Image}
     */
    private static generateImageSliderFromFile(path);
    /**
     * Generate title slider element
     * @param title
     * @returns {any}
     */
    private static generateTitleSlider(title);
    /**
     * Init carousel controls
     */
    private initControls();
    /**
     * Init caroussel autoplay
     */
    private initAutoPlay();
    /**
     * Stop on gesture detected, resume after 4 seconds
     */
    private stopStartAutoplay();
    /**
     * Animate right to left or left to right
     * @param direction
     * @returns {boolean}
     */
    private swipe(direction);
    /**
     * Animate slides
     */
    private animateSlides();
    /**
     * Move image center -> left
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkCL(view, index, elementWidth);
    /**
     * Move image right -> center
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkRC(view, index, elementWidth);
    /**
     * Move image center -> right
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkCR(view, index, elementWidth);
    /**
     * Move image left -> center
     * @param view
     * @param index
     * @param elementWidth
     */
    private checkLC(view, index, elementWidth);
    /**
     * Set values to perform the animation
     */
    private setDirectionValues();
    /**
     * Reset values after animation
     */
    private resetAnimationValues();
    /**
     * Get arrow type to be displayed in frontend
     * @returns {{l: string, r: string}}
     */
    private getArrowType();
    /**
     * Check if numeric value
     * @param value
     * @returns {boolean}
     */
    private static isNumeric(value);
}
export declare class CarouselSlide {
    url?: string;
    file?: string;
    title?: string;
}
