import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController} from 'ionic-angular';
import {HTTP} from "@ionic-native/http";
import {DayPage} from "../day/day";
import {Storage} from "@ionic/storage";
import {MoodleProvider} from "../../providers/moodle/moodle";

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage
{
    username: string;
    password: string;

    constructor(private moodleProvider: MoodleProvider, public loadingCtrl: LoadingController, public navCtrl: NavController, public http: HTTP, public storage: Storage)
    {
        try
        {
            this.storage.get("messageTime").then(value =>
            {
                try
                {
                    if (value.day > new Date())
                    {
                        this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
                    }
                } catch (e)
                {
                    this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
                }
            });

            this.storage.get("messageTime").catch(() =>
            {
                this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
            })


        } catch (e)
        {
            this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
        }

        try
        {
            storage.get("LeoMoodleSesssion").then(value =>
            {
                this.http.get("http://vertretung.leoninum.org/validateSession?moodleSession=" + value, {}, {}).then(res =>
                {
                    let result = JSON.parse(res.data);
                    if (result.valid)
                    {
                        this.navCtrl.setRoot(DayPage, {moodleSession: value}, {direction: "up"});
                    }
                });
            });
        } catch (e)
        {
        }
    }

    onLogin(): void
    {
        let spinner = this.loadingCtrl.create({
            content: "Bitte warten..."
        });

        spinner.present();

        setTimeout(() =>
        {
            this.moodleProvider.login(this.username, this.password).subscribe((moodleSession) =>
            {
                document.getElementById("errorText").textContent = "";
                this.storage.set("LeoMoodleSesssion", moodleSession);
                this.navCtrl.setRoot(DayPage, {moodleSession: moodleSession}, {direction: "up"});
                spinner.dismissAll();
            }, (error: Error) =>
            {
                document.getElementById("errorText").textContent = error.message;
                spinner.dismissAll();
            });
        }, 1);
    }

}
