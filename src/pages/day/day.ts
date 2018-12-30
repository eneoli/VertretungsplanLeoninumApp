import {Component, OnInit} from '@angular/core';
import {
    LoadingController, ModalController, NavController, NavParams
} from 'ionic-angular';
import {LocalNotifications} from "@ionic-native/local-notifications";
import {Storage} from "@ionic/storage";
import {HttpClient} from "@angular/common/http";
import {MoodleProvider} from "../../providers/moodle/moodle";
import {LoginPage} from "../login/login";

@Component({
    selector: 'page-day',
    templateUrl: 'day.html'
})
export class DayPage implements OnInit
{

    private userClass: string;
    private showPush: boolean = false;
    private readonly day: any;
    private moodleSession: string;
    private lessons: any = {lessons: [], state: new Date(), date: new Date(), usedTeachers: "", missingTeachers: ""};
    private dayName: string = "today";
    private lessonsForUser = [];

    constructor(private moodleProvider: MoodleProvider, private modalCtrl: ModalController, private nav: NavController, private storage: Storage, private localNotifications: LocalNotifications, public loadingCtrl: LoadingController, public http: HttpClient, public navParams: NavParams, public navCtrl: NavController)
    {
        this.day = "today";
        this.moodleSession = this.navParams.get("moodleSession");
    }

    loadPlan(day: string)
    {
        this.moodleProvider.loadPlan(day, this.moodleSession).subscribe((lessons: any) =>
        {
            this.lessons = lessons;
        });

        this.storage.get("settings").then(value =>
        {
            if (value.year >= 11)
            {
                this.userClass = value.year.toString();
            } else
            {
                this.userClass = value.year.toString() + value.classCharacter;
            }

            this.showPush = value.showPush;
        }).catch(() =>
        {
        });

        this.sendMessage(false);
    }

    sendMessage(ignoreAlreadyMessaged: boolean)
    {
        if (this.showPush)
        {
            this.storage.get("messageTime").then(value =>
            {
                let lessonsForUser = [];
                this.lessons.lessons.forEach(((element) =>
                {
                    if (element.class === this.userClass)
                    {
                        lessonsForUser.push(element);
                    }
                }));

                if (lessonsForUser.length > 0 && lessonsForUser != this.lessonsForUser)
                {
                    if ((new Date(value.date).getDate() < new Date(Date.now()).getDate() || new Date(value.date).getMonth() < new Date(Date.now()).getMonth()) || ignoreAlreadyMessaged || (!value.alreadyMessagedA && this.day == "today") || (!value.alreadyMessagedB && this.day == "tomorrow"))
                    {
                        this.lessonsForUser = lessonsForUser;
                        this.storage.set("messageTime", {date: new Date(Date.now()), alreadyMessaged: true});
                        if (!value.alreadyMessagedA && this.day == "today")
                            this.storage.set("messageTime", {
                                date: new Date(Date.now()),
                                alreadyMessagedA: true,
                                alreadyMessagedB: value.alreadyMessagedB
                            });
                        else if (!value.alreadyMessagedB && this.day == "tomorrow")
                            this.storage.set("messageTime", {
                                date: new Date(Date.now()),
                                alreadyMessagedB: true,
                                alreadyMessagedA: value.alreadyMessagedA
                            });

                        let message = "";
                        lessonsForUser.forEach((element) =>
                        {
                            message += element.hour + ". Std. " + element.subject + " bei " + element.teacher + ", ";
                        });

                        message = message.substring(0, message.length - 2);
                        message += " am " + this.lessons.date.toLocaleString("de-de", {weekday: "long"});

                        this.localNotifications.schedule({
                            id: 1,
                            title: "Du hast Vertretung!",
                            text: message,
                            icon: "res://icon_message"
                        });
                    }
                }

            });
        }
    }

    ngOnInit(): void
    {
        this.loadPlan("today");
    }

    onRefresh(refresher)
    {
        this.loadPlan(this.dayName);
        setTimeout(() =>
        {
            refresher.complete()
        }, 3000);
    }

    logout() {
        this.storage.remove("encryptedCredentials");
        this.navCtrl.setRoot(LoginPage, {}, {direction: "down", animate: true, animation:"md-transition"});
    }

    switchPlan()
    {
        if (this.dayName == "today")
            this.dayName = "tomorrow";
        else if (this.dayName == "tomorrow")
            this.dayName = "today";

        let spinner = this.loadingCtrl.create({
            content: "Lade Plan..."
        });

        spinner.present();

        setTimeout(() =>
        {
            this.loadPlan(this.dayName);
            spinner.dismissAll();
        }, 1);

        setTimeout(() =>
        {
            spinner.dismissAll();
        }, 10000);
    }

    openSettings()
    {
        let settings = this.modalCtrl.create("SettingsPage");
        settings.onDidDismiss((data) =>
        {
            let saved = data.saved;
            this.storage.get("settings").then(value =>
            {
                this.userClass = value.year.toString() + value.classCharacter;
                this.showPush = value.showPush;
                if (saved)
                    this.sendMessage(true);
            })
        });
        settings.present();
    }

    getColor(className: string)
    {
        if (this.userClass === className)
            return "yellow";
        else return "";
    }
}