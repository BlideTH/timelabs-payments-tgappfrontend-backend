import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';
import { provideRouter } from '@angular/router';
import { routes } from './app/app.routes';

// Import Firebase modules
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Import environment for Firebase configuration
import { environment } from './environments/environment';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';



bootstrapApplication(AppComponent, {
  ...appConfig,
  providers: [
    // Add Firebase providers with error handling
    provideFirebaseApp(() => {
      try {
        const app = initializeApp(environment.firebaseConfig);
        console.log('Firebase initialized successfully', app);
        return app;
      } catch (error) {
        console.error('Firebase initialization error:', error);
        throw error; // Ensure error propagates if initialization fails
      }
    }),
    provideRouter(routes),
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    ...(appConfig.providers || []), provideAnimationsAsync(),
  ],
}).catch((err) => console.error(err));

