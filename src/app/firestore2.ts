// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
  apiKey: "AIzaSyDVchTBjD_eoLrnj_A11NWXqdT9jgR5iws",
  authDomain: "esb666-eef8b.firebaseapp.com",
  projectId: "esb666-eef8b",
  storageBucket: "esb666-eef8b.appspot.com",
  messagingSenderId: "120427871828",
  appId: "1:120427871828:web:33ec72c6f9dcbfd1de77c1",
  measurementId: "G-V5SP5S2F6P"
};


  //providerETH = 'https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903';
  //export const providerETH = 'https://sepolia.infura.io/v3/14a07be1d5274d6e873766271f369061';

//export const providerETH = 'https://rpc2.sepolia.org';
  
export const providerETH ="https://sepolia.drpc.org";
export const contract_address: any = "0x7bCB2464970bbCF66a4243E6E25C004Da878e03b";
    

  //providerETH = 'http://127.0.0.1:7545/';
//contract_address: any = "0x7a588bF361542fb2aD6191fe467e83fb097E1Ea6";


// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);