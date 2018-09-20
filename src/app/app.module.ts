import {BrowserModule} from '@angular/platform-browser';
import {ErrorHandler, NgModule} from '@angular/core';
import {IonicApp, IonicErrorHandler, IonicModule, ToastController} from 'ionic-angular';
import {SplashScreen} from '@ionic-native/splash-screen';
import {StatusBar} from '@ionic-native/status-bar';

import {MyApp} from './app.component';
import {DayPage} from '../pages/day/day';
import {LoginPage} from "../pages/login/login";
import {SecureStorage} from "@ionic-native/secure-storage";
import {LoginPageModule} from "../pages/login/login.module";
import {HTTP} from "@ionic-native/http";
import {IonicStorageModule} from "@ionic/storage";
import {LocalNotifications} from "@ionic-native/local-notifications";
import {HttpClientModule} from "@angular/common/http";
import {MoodleProvider} from '../providers/moodle/moodle';

@NgModule({
    declarations: [
        MyApp,
        DayPage,
    ],
    imports: [
        BrowserModule,
        IonicModule.forRoot(MyApp),
        LoginPageModule,
        IonicStorageModule.forRoot(),
        HttpClientModule
    ],
    bootstrap: [IonicApp],
    entryComponents: [
        MyApp,
        DayPage,
        LoginPage
    ],
    providers: [
        StatusBar,
        SplashScreen,
        SecureStorage,
        ToastController,
        HTTP,
        LocalNotifications,
        {provide: ErrorHandler, useClass: IonicErrorHandler},
        MoodleProvider
    ]
})
export class AppModule
{
}
