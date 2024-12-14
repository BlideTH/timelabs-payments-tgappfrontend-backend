import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent } from './app/app.component';
import { appConfig } from './app/app.config';

// Import Firebase modules
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideAuth, getAuth, onAuthStateChanged } from '@angular/fire/auth';
import { provideStorage, getStorage } from '@angular/fire/storage';

// Import environment for Firebase configuration
import { environment } from './environments/environment';



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
    provideFirestore(() => getFirestore()),
    provideAuth(() => getAuth()),
    provideStorage(() => getStorage()),
    ...(appConfig.providers || []),
  ],
}).catch((err) => console.error(err));

