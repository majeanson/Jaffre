/// <reference types="vite/client" />

declare namespace Phaser {
	interface Scene {
		fb: import('./plugins/FirebasePlugin').default
	}
}