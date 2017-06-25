import {NgModule, NO_ERRORS_SCHEMA} from "@angular/core";
import {platformNativeScriptDynamic} from "nativescript-angular/platform";
import {NativeScriptModule} from "nativescript-angular/nativescript.module";
import {AppComponent} from "./app.component";
import {CarouselDirective} from "nativescript-ng2-carousel/nativescript-ng2-carousel";

@NgModule({
    declarations: [AppComponent, CarouselDirective],
    bootstrap: [AppComponent],
    imports: [NativeScriptModule],
    schemas: [NO_ERRORS_SCHEMA]
})
export class AppModule {

}

platformNativeScriptDynamic().bootstrapModule(AppModule);
