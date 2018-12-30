import {HttpClient} from '@angular/common/http';
import {Injectable} from '@angular/core';
import {Observable} from "rxjs";

@Injectable()
export class MoodleProvider {

    public static middlewareUrl: string = "http://192.168.188.62:3000";
    public middlewareUrl: string = MoodleProvider.middlewareUrl;

    constructor(public http: HttpClient) {
    }

    /**
     * @deprecated use secureLogin
     * @param username
     * @param password
     */
    public login(username: string, password: string) {
        let observable = new Observable((observer) => {
            try {
                this.http.get(MoodleProvider.middlewareUrl + "/moodleSession?username=" + username + "&password=" + password, {}).subscribe((res: any) => {
                    try {
                        if (res.hasOwnProperty("error")) {
                            throw new Error(res.error);
                        } else {
                            let moodleSession = res.moodleSession;
                            observer.next(moodleSession);
                            observer.complete()
                        }
                    } catch (e) {
                        observer.error(e);
                    }
                });
            } catch (e) {
                observer.error(e);
            }
        });

        return observable;
    }

    public secureLogin(encryptedCredentials: string) {
        let observable = new Observable((observer) => {
            try {
                this.http.post(MoodleProvider.middlewareUrl + "/secureMoodleSession", {secret: encryptedCredentials}).subscribe((res: any) => {
                    try {
                        if (res.hasOwnProperty("error")) {
                            throw new Error(res.error);
                        } else {
                            let moodleSession = res.moodleSession;
                            observer.next(moodleSession);
                            observer.complete()
                        }
                    } catch (e) {
                        observer.error(e);
                    }
                });
            } catch (e) {
                observer.error(e);
            }
        });

        return observable;
    }

    public loadPlan(day: string, moodleSession: string) {
        let observable = new Observable((observer) => {
            try {
                // fetch plan
                let lessons;

                let headers = new Headers();
                headers.append('Access-Control-Allow-Origin', '*');
                headers.append('Access-Control-Allow-Methods', 'POST, GET, OPTIONS, PUT');
                headers.append('Accept', 'application/json');
                headers.append('content-type', 'application/json');

                this.http.get(MoodleProvider.middlewareUrl + "/fetch/" + day + "?moodleSession=" + moodleSession, {}).subscribe((res: any) => {
                    try {
                        //console.log(res);
                        let tmp = JSON.stringify(res);
                        lessons = JSON.parse(tmp, (key: string, value: any) => {
                            if (key === "date" || key === "state") {
                                return new Date(Date.parse(value));
                            }
                            return value;
                        });

                        observer.next(lessons);
                        observer.complete()
                    } catch (e) {
                        observer.error(e);
                    }
                });
            } catch (e) {
                observer.error(e);
            }
        });

        return observable;
    }
}
