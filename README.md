local development build setup

npx expo run:ios
npx expo run:android


To fix the error "Error: Distribution certificate with fingerprint XYZ hasn't been imported successfully" first download the Apple Worldwide Developer Relations certificate from:

https://www.apple.com/certificateauthority/AppleWWDRCAG3.cer

Then install it to Keychain with:

security add-trusted-cert -d -r unspecified -k ~/Library/Keychains/login.keychain-db ~/Downloads/AppleWWDRCAG3.cer