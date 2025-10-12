import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';
import { AppModule } from './app.module';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';

@NgModule({
  imports: [
    AppModule,       // Include the main AppModule
    ServerModule,    // Required for SSR
    RouterModule     // Include RouterModule so ActivatedRoute works
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
