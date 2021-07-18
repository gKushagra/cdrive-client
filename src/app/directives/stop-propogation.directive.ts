import { Directive, HostListener } from '@angular/core';

@Directive({
  selector: '[appStopPropogation]'
})
export class StopPropogationDirective {

  @HostListener("click", ["$event"])
  public onClick(event: any): void {
    event.stopPropagation();
  }

  @HostListener("mousedown", ["$event"])
  public onMousedown(event: any): void {
    event.stopPropagation();
  }
}
