import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FlexLayoutModule } from "@angular/flex-layout";
import { MaterialModule } from "../material.module";
import { LoginComponent } from './login/login.component';
import { AdminComponent } from './admin/admin.component';
import { DriveComponent } from './drive/drive.component';
import { ActionsDialogComponent } from './actions-dialog/actions-dialog.component';
import { ProgressComponent } from './progress/progress.component';

@NgModule({
    declarations: [LoginComponent, AdminComponent, DriveComponent, ActionsDialogComponent, ProgressComponent],
    imports: [
        MaterialModule,
        FlexLayoutModule,
        HttpClientModule,
    ],
    exports: []
})
export class ComponentsModule { }