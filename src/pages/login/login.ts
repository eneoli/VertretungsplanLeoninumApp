import {Component} from '@angular/core';
import {IonicPage, LoadingController, NavController} from 'ionic-angular';
import {HTTP} from "@ionic-native/http";
import {DayPage} from "../day/day";
import {Storage} from "@ionic/storage";
import {MoodleProvider} from "../../providers/moodle/moodle";
import * as JSEncrypt from "jsencrypt";

@IonicPage()
@Component({
    selector: 'page-login',
    templateUrl: 'login.html',
})
export class LoginPage {
    username: string;
    password: string;
    remember: boolean;

    constructor(private moodleProvider: MoodleProvider, public loadingCtrl: LoadingController, public navCtrl: NavController, public http: HTTP, public storage: Storage) {
        try {
            this.storage.get("messageTime").then(value => {
                try {
                    if (value.day > new Date()) {
                        this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
                    }
                } catch (e) {
                    this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
                }
            });

            this.storage.get("messageTime").catch(() => {
                this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
            })


        } catch (e) {
            this.storage.set("messageTime", {day: new Date(), alreadyMessaged: false})
        }

        let spinner = null;
        try {
            this.storage.get("encryptedCredentials").then(async value => {
                if (value) {
                    spinner = this.loadingCtrl.create({
                        content: "Melde an..."
                    });

                    spinner.present();

                    // Timeout
                    setTimeout(() => {
                        spinner.dismissAll();
                        document.getElementById("errorText").textContent = "Automatischer Login fehlgeschlagen!";
                        storage.remove("encryptedCredentials");
                    }, 60000); // 1min timeout

                    // secure auto login
                    this.moodleProvider.secureLogin(value).subscribe((value: string) => {
                        spinner.dismissAll();
                        this.navCtrl.setRoot(DayPage, {moodleSession: value}, {
                            direction: "up",
                            animate: true,
                            animation: "md-transition"
                        }); // error handling
                    }, () => {
                        spinner.dismissAll();
                        document.getElementById("errorText").textContent = "Automatischer Login fehlgeschlagen!";
                    });
                }
            });
        } catch (e) {
            spinner.dismissAll();
            document.getElementById("errorText").textContent = "Automatischer Login fehlgeschlagen!";
            this.storage.remove("encryptedCredentials");
        }
    }

    async onLogin(): Promise<void> {

        let spinner = this.loadingCtrl.create({
            content: "Bitte warten..."
        });

        spinner.present();
        let encrypted = null;

        try {
            let crypto = new JSEncrypt.JSEncrypt();
            let publicKey = await this.http.get(this.moodleProvider.middlewareUrl + "/publickey", {}, {});
            crypto.setPublicKey(publicKey.data);
            encrypted = await crypto.encrypt(JSON.stringify({
                username: this.username,
                password: this.password
            }));
        } catch (e) {
            spinner.dismissAll();
            document.getElementById("errorText").textContent = "Login fehlgeschlagen!";
        }

        if (this.remember) {
            await this.storage.set("encryptedCredentials", encrypted);
        }

        setTimeout(() => {
            console.log(encrypted);
            this.moodleProvider.secureLogin(encrypted).subscribe(async (moodleSession) => {
                document.getElementById("errorText").textContent = "";

                this.navCtrl.setRoot(DayPage, {moodleSession: moodleSession}, {
                    direction: "up",
                    animate: true,
                    animation: "md-transition"
                });
                spinner.dismissAll();
            }, (error: Error) => {
                document.getElementById("errorText").textContent = error.message;
                spinner.dismissAll();
            });
        }, 1);
    }
}
