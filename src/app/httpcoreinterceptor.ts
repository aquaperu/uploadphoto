import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { catchError, throwError } from 'rxjs';
export const httpCoreInterceptorInterceptor: HttpInterceptorFn = (req, next) => {
  const authToken = 'YOUR_AUTH_TOKEN_HERE';
  // interceptor que habilita el cors en el cliente de donde está corriendo , tambien debe estar registrado en el servidor
  //la otra opcion es crear un archivo proxy.config.js , poner el siguiente contenido, es el servidor de front end
  /**
   * const PROXY_HOST = 'https://miniature-space-zebra-7v7j9qg6xrjx266g-4200.app.github.dev/';
      const PROXY_CONFIG = [
    {
        context:['./'],
        target:PROXY_HOST,
        secure:false
    }
];
module.exports = PROXY_CONFIG

seguidamente ponerlo en angular.json
en la seccion  "serve": {
          "builder": "@angular-devkit/build-angular:dev-server",
          "options": {
            "proxyConfig": "proxy.conf.js"
          },

   */
  // Clone the request and add the authorization header
  const authReq = req.clone({
    setHeaders: {
      'Content-Type':'application/json',
      
      'Access-Control-Allow-Origin': 'https://4200-monospace-sadfrontenddrive17-1713883251017.cluster-2xid2zxbenc4ixa74rpk7q7fyk.cloudworkstations.dev',
     
      Authorization: `Bearer ${authToken}`
    }
  });
  console.log({"llamando desde el interceptor":authToken})

  // Pass the cloned request with the updated header to the next handler
  return next(authReq).pipe(
    catchError((err: any) => {
      if (err instanceof HttpErrorResponse) {
        // Handle HTTP errors
        if (err.status === 401) {
          // Specific handling for unauthorized errors         
          console.error('Unauthorized request:', err);
          // You might trigger a re-authentication flow or redirect the user here
        } else {
          // Handle other HTTP error codes
          console.error('HTTP error:', err);
        }
      } else {
        // Handle non-HTTP errors
        console.error('An error occurred:', err);
      }

      // Re-throw the error to propagate it further
      return throwError(() => err); 
    })
  );;
};