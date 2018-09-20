import {Component} from '@angular/core';
import {IonicPage, ViewController} from 'ionic-angular';
import {Storage} from "@ionic/storage";

@IonicPage()
@Component({
    selector: 'page-settings',
    templateUrl: 'settings.html',
})
export class SettingsPage
{
    private year: number;
    private classCharacter: string;
    private showPush: boolean;

    constructor(private storage: Storage, private view: ViewController)
    {
        this.storage.get("settings").then(value =>
        {
            this.year = value.year;
            this.classCharacter = value.classCharacter;
            this.showPush = value.showPush;
        }).catch(() =>
        {
            this.year = -1;
            this.classCharacter = "z";
            this.showPush = false;
        })
    }

    onDismiss()
    {
        this.view.dismiss({"saved": false});
    }

    onSave()
    {
        this.storage.set("settings", {
            year: this.year,
            classCharacter: this.classCharacter,
            showPush: this.showPush
        });

        this.view.dismiss({"saved": true});
    }

}
