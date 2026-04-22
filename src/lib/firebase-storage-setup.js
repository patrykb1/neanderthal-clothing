/**
 * Firebase Storage Setup Instructions
 * 
 * To enable image uploads in the admin panel, you need to:
 * 
 * 1. Go to your Firebase Console: https://console.firebase.google.com
 * 2. Select your project: "neanderthal-clothing"
 * 3. Go to the "Storage" tab
 * 4. Click "Start" if Storage is not yet enabled
 * 5. Replace the default security rules with the rules below
 * 
 * RECOMMENDED SECURITY RULES (paste into Firebase Console):
 * 
 * rules_version = '2';
 * service firebase.storage {
 *   match /b/{bucket}/o {
 *     // Allow anyone to read product images
 *     match /products/{productSlug}/images/{allPaths=**} {
 *       allow read: if true;
 *       allow write: if false;
 *     }
 *     
 *     // Allow authenticated users to upload to products/{slug}/images
 *     // (adjust based on your authentication setup)
 *     match /products/{productSlug}/images/{fileName} {
 *       allow write: if request.auth != null;
 *     }
 *     
 *     // Deny all other access
 *     match /{allPaths=**} {
 *       allow read, write: if false;
 *     }
 *   }
 * }
 * 
 * ALTERNATIVE (Allow unauthenticated uploads for testing):
 * 
 * rules_version = '2';
 * service firebase.storage {
 *   match /b/{bucket}/o {
 *     match /products/{productSlug}/images/{allPaths=**} {
 *       allow read, write: if true;
 *     }
 *   }
 * }
 * 
 * STEPS:
 * 1. Copy one of the rules above
 * 2. In Firebase Console → Storage → Rules
 * 3. Paste the rules
 * 4. Click "Publish"
 * 5. Wait ~30 seconds for rules to apply
 * 6. Retry image upload
 * 
 * If you still get errors:
 * - Open browser DevTools (F12)
 * - Check the Console tab for detailed error messages
 * - Verify Storage is enabled in Firebase Console
 * - Ensure your Firebase config is correct
 * - Check that the storage bucket URL is correct
 */

export const FIREBASE_STORAGE_CONFIG = {
  BUCKET: 'neanderthal-clothing.firebasestorage.app',
  IMAGES_PATH: 'products/{slug}/images',
};
