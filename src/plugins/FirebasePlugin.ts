import Phaser from 'phaser'
import { initializeApp } from 'firebase/app'
import {
	getFirestore,
	Firestore,
	setDoc,
	doc,
	getDoc,
	DocumentSnapshot,
	addDoc,
	collection,
	query,
	orderBy,
	limit,
	getDocs
} from 'firebase/firestore'

import {
	getAuth,
	createUserWithEmailAndPassword,
	Auth,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	Unsubscribe,
	signInAnonymously
} from 'firebase/auth'

const firebaseConfig = {
	apiKey: "AIzaSyC6zqlLcsmaelCjuGsYexpmBF9uO0JIwhQ",
	authDomain: "joffrecloud.firebaseapp.com",
	projectId: "joffrecloud",
	storageBucket: "joffrecloud.appspot.com",
	messagingSenderId: "171690906453",
	appId: "1:171690906453:web:e403705aee3e8f2a9595dc",
	measurementId: "G-78F3Y21P91"
};

export default class FirebasePlugin extends Phaser.Plugins.BasePlugin {
	private readonly db: Firestore
	private readonly auth: Auth

	private authStateChangedUnsubscribe: Unsubscribe
	private onLoggedInCallback?: () => void

	constructor(manager: Phaser.Plugins.PluginManager) {
		super(manager)

		const app = initializeApp(firebaseConfig)
		this.db = getFirestore(app)
		this.auth = getAuth(app)

		this.authStateChangedUnsubscribe = onAuthStateChanged(this.auth, (user) => {
			if (user && this.onLoggedInCallback) {
				this.onLoggedInCallback()
			}
		})
	}

	destroy() {
		this.authStateChangedUnsubscribe()

		super.destroy()
	}

	onLoggedIn(callback: () => void) {
		this.onLoggedInCallback = callback
	}

	async saveGameData(userId: string, data: { name: string, score: number }) {
		await setDoc(doc(this.db, 'game-data', userId), data)
	}

	async loadGameData(userId: string) {
		const snap = await getDoc(
			doc(this.db, 'game-data', userId)
		) as DocumentSnapshot<{ name: string, score: number }>

		return snap.data()
	}

	async createUserWithEmail(email: string, password: string) {
		const credentials = await createUserWithEmailAndPassword(this.auth, email, password)
		return credentials.user
	}

	async signInUserWithEmail(email: string, password: string) {
		const credentials = await signInWithEmailAndPassword(this.auth, email, password)
		return credentials.user
	}

	async signInAnonymously() {
		const credentials = await signInAnonymously(this.auth)
		return credentials.user
	}

	getUser() {
		return this.auth.currentUser
	}

	async addHighScore(name: string, score: number) {
		await addDoc(collection(this.db, 'high-scores'), { name, score })
	}

	async getHighScores() {
		const q = query(
			collection(this.db, 'high-scores'),
			orderBy('score', 'desc'),
			limit(10)
		)

		const snap = await getDocs(q)
		return snap.docs.map(ref => ref.data())
	}
}