import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import firebaseConfigData from "../../firebase-applet-config.json";

// In AI Studio, we need to map the config properly
const firebaseConfig = {
  ...firebaseConfigData,
  databaseId: firebaseConfigData.firestoreDatabaseId,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);

export { db };
