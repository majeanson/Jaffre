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
	updateProfile,
	updateCurrentUser,
	createUserWithEmailAndPassword,
	Auth,
	signInWithEmailAndPassword,
	onAuthStateChanged,
	Unsubscribe,
	signInAnonymously,
    User
} from 'firebase/auth'

import {
	uniqueNamesGenerator,
	adjectives,
	colors,
	animals
} from "unique-names-generator";

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
	private onLoggedInCallback = (user) => {
		console.log('loggin ', user);
	}

	private lastErrorMessage: string

	constructor(manager: Phaser.Plugins.PluginManager) {
		super(manager)

		const app = initializeApp(firebaseConfig)
		this.db = getFirestore(app)
		this.auth = getAuth(app)
		
		this.authStateChangedUnsubscribe = onAuthStateChanged(this.auth, (user) => {
			if (user && this.onLoggedInCallback) {
				this.onLoggedInCallback(user)
			}
		})
	}

	getRandomName = () => {
		let name = uniqueNamesGenerator({ dictionaries: [adjectives, colors, animals], length: 2 });
		let first = name.split("_")[0];
		let second = name.split("_")[1];
		return first.charAt(0).toUpperCase() + first.slice(1) + second.charAt(0).toUpperCase() + second.slice(1);
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

	loginUserSuccess(credential) {
		this.lastErrorMessage = '';
		return credential?.user;
	}

	signUpUserSuccess(credential) {
		this.lastErrorMessage = '';
		return credential?.user;
	}

	getLastErrorMessage() {
		return this.lastErrorMessage;
	}

	hasSameName(aName) {
		return this.getUser().displayName == aName;
    }

	extractMessage(message) {
		var errorMessage = message;
		const onlyMsg = errorMessage.substr(errorMessage.indexOf(':') + 1, errorMessage.length + 1);
		return onlyMsg;
    }

	async createUserWithEmail(email: string, password: string) {
		const credentials = await createUserWithEmailAndPassword(this.auth, email, password)
			.then((credential) => {
				const name = this.getRandomName();
				updateProfile(credential?.user, {
					displayName: name
				});
				return this.loginUserSuccess(credential)
			})
			.catch((error) => {
			this.lastErrorMessage = this.extractMessage(error.message);
		});
		return credentials?.user;
	}

	addUserToLobby(user, lobbyName) {
		updateProfile(user, {
			...user,
			photoURL: lobbyName
		});
		console.log('i addede', lobbyName);
	}

	removeUserFromLobby(user) {
		updateProfile(user, {
			...user,
			photoURL: ''
		});
	
		console.log('I REMOVED!', user);
	}

	async signInUserWithEmail(email: string, password: string) {
		const credentials = await signInWithEmailAndPassword(this.auth, email, password).then((user) => this.signUpUserSuccess(user)).catch((error) => {
			this.lastErrorMessage = this.extractMessage(error.message);;
		});
		return credentials?.user;
	}

	async signInAnonymously() {
		try {
		const credentials = await signInAnonymously(this.auth)
			return credentials?.user
		} catch {
			return null;
		}
	}

	getUser() {
		return this.auth?.currentUser;
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