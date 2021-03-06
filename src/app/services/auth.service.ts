import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

import { Observable } from 'rxjs/Observable';
import { of } from 'rxjs/observable/of';
import { BehaviorSubject } from 'rxjs/BehaviorSubject';
import { catchError, map, tap } from 'rxjs/operators';

import { environment } from '../../environments/environment';
import { User } from '../domain/user';
import { Usuario } from '../domain/usuario';

@Injectable()
export class AuthService {

    private loggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(this.hasToken());

    private token: String;

    private realName: String;
    
    private user: Usuario;
    
    constructor(private http: HttpClient) {}

    get userName() {
        return localStorage.getItem('name') || this.realName;
    }
    
    get isLoggedIn() {
        return this.loggedIn.asObservable();
    }

    get userData() {
        return this.user;
    }

    private hasToken(): boolean {
        return !!localStorage.getItem('token');
    }

    login(user: User) {
        if (user.email !== '' && user.password != '' ){
            this.requestAuthenticationToken(user).subscribe(
                data => {
                    if( 'token' in data ){
                        this.token = data.token;
                        localStorage.setItem('token', this.token.toString());
                        this.requestPersonalData().subscribe(
                            data => {
                                this.realName = data.first_name + ' ' + data.last_name;
                                this.realName = this.realName.trim();
                                localStorage.setItem('name', this.realName.toString());
                                this.user = data;
                                this.loggedIn.next(true);
                            }
                        );
                    }
                    else {
                        this.loggedIn.next(false);
                    }
                }
            );
        }
        else {
            this.loggedIn.next(false);
        }
    }

    private requestAuthenticationToken(user: User): Observable<any> {
        return this.http.post<any>( environment.api + '/auth/login/', user)
            .pipe(
                catchError(this.handleError('Failure authenticating user', {}))
              );
    }

    private requestPersonalData(): Observable<any> {
        return this.http.get<any>( environment.api + '/auth/me', {
            headers: new HttpHeaders().set('Authorization', 'Token ' + this.token)
        })
            .pipe(
                catchError(this.handleError('Failure retrieving user data', {}))
                );
    }

    private handleError<T> (operation = 'operation', result?: T) {
        return (error: any): Observable<T> => {
            console.error(error);
            return of(result as T);
        };
    }

    logout() {
        localStorage.removeItem('token');
        localStorage.removeItem('name');
        this.realName = "";
        this.token = null;
        this.loggedIn.next(false);
    }
}