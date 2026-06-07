import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { ToastService } from '../services/toast.service';
import { Router } from '@angular/router';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth  = inject(AuthService);
  const token = auth.token;

  const authReq = token
    ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
    : req;

  return next(authReq);
};

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const toast  = inject(ToastService);
  const auth   = inject(AuthService);
  const router = inject(Router);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      if (err.status === 401) {
        auth.logout();
        toast.error('Session expired. Please log in again.');
      } else if (err.status === 403) {
        toast.error('You do not have permission to perform this action.');
        router.navigate(['/dashboard']);
      } else if (err.status === 404) {
        toast.error(err.error?.message || 'Resource not found.');
      } else if (err.status === 409) {
        toast.error(err.error?.message || 'A conflict occurred.');
      } else if (err.status >= 500) {
        toast.error('Server error. Please try again later.');
      }
      return throwError(() => err);
    })
  );
};