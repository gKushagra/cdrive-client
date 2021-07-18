import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MaterialModule } from "../material.module";
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { DriveComponent } from './drive/drive.component';
import { ActionsDialogComponent } from './actions-dialog/actions-dialog.component';
import { ReactiveFormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";
import { FileActionsComponent } from './drive/file-actions/file-actions.component';
import { StopPropogationDirective } from "../directives/stop-propogation.directive";

@NgModule({
    declarations: [
        LoginComponent, 
        AdminComponent, 
        DriveComponent, 
        ActionsDialogComponent, 
        FileActionsComponent,
        StopPropogationDirective,
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        MaterialModule,
        FlexLayoutModule,
        HttpClientModule,
    ],
    exports: []
})
export class ComponentsModule { }