import { LocationStrategy, PathLocationStrategy } from '@angular/common';
import { ErrorHandler, Injectable, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/core/user/user.service';
import * as StackTrace from 'stacktrace-js';
import { ServerLogService } from './server-log.services';
import { environment } from '../../../environments/environment'

@Injectable()
export class GlobalErrorHandler implements ErrorHandler {

    constructor(private injector: Injector) {}

    handleError(error: any): void {
        const location = this.injector.get(LocationStrategy);
        const userService = this.injector.get(UserService);
        const serverLogService = this.injector.get(ServerLogService);
        const router = this.injector.get(Router);

        const url = location instanceof PathLocationStrategy ? location.path() : '';
        
        if(environment.production) router.navigate(['/error']);

        const message = error.message ? error.message : error.toString();
        StackTrace 
            .fromError(error)
            .then(stackFrames => {
               const stackAsString  = stackFrames
                    .map(sf => sf.toString())
                    .join('\n');

                serverLogService.log({
                    message, 
                    url, 
                    userName: userService.getUserName(), 
                    stack: stackAsString
                }).subscribe(
                    () => console.log('Error logged on server'),
                    err => {
                        console.log(err);
                        console.log('Fail to send error log to server');
                    });
                });
    }
}