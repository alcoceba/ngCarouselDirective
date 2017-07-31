import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {NativeScriptModule} from "nativescript-angular/nativescript.module";
import {AppComponent} from "./app.component";
import {CarouselDirective} from "nativescript-ng2-carousel/nativescript-ng2-carousel";

// Uncomment and add to NgModule imports if you need to use two-way binding
// import { NativeScriptFormsModule } from "nativescript-angular/forms";

// Uncomment and add to NgModule imports  if you need to use the HTTP wrapper
// import { NativeScriptHttpModule } from "nativescript-angular/http";

@NgModule({
    bootstrap: [
        AppComponent
    ],
    imports: [
        NativeScriptModule
    ],
    declarations: [
        AppComponent,
        CarouselDirective
    ],
    schemas: [
        NO_ERRORS_SCHEMA
    ]
})
/*
 Pass your application module to the bootstrapModule function located in main.ts to start your app
 */
export class AppModule {
}
