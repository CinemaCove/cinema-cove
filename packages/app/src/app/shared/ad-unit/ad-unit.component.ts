import { AfterViewInit, ChangeDetectionStrategy, Component, isDevMode } from '@angular/core';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'cc-ad-unit',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (dev) {
      <div class="ad-placeholder" aria-hidden="true">Ad</div>
    } @else {
      <ins class="adsbygoogle"
           style="display:block"
           [attr.data-ad-client]="config!.client"
           [attr.data-ad-slot]="config!.slot"
           data-ad-format="auto"
           data-full-width-responsive="true"></ins>
    }
  `,
  styles: [`
    :host { display: block; }
    .ad-placeholder {
      width: 100%;
      height: 90px;
      background: color-mix(in srgb, currentColor 6%, transparent);
      border: 1px dashed color-mix(in srgb, currentColor 25%, transparent);
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      letter-spacing: 1px;
      text-transform: uppercase;
      color: color-mix(in srgb, currentColor 40%, transparent);
    }
  `],
})
export class AdUnitComponent implements AfterViewInit {
  protected readonly dev = isDevMode();
  protected readonly config = environment.adsense;

  ngAfterViewInit(): void {
    if (this.dev || !this.config) return;
    ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
  }
}
