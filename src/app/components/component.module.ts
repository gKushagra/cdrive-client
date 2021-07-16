import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MaterialModule } from "../material.module";

@NgModule({
    declarations: [],
    imports: [
        MaterialModule,
        FlexLayoutModule,
        HttpClientModule,
        FlexLayoutModule
    ],
    exports: []
})
export class ComponentsModule { }