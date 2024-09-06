// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
          apiKey: "AIzaSyAHz9zSUk258f3CyoMA2cvE8Kf2BnF442c",
          authDomain: "esbrinachain-777.firebaseapp.com",
          projectId: "esbrinachain-777",
          storageBucket: "esbrinachain-777.appspot.com",
          messagingSenderId: "825098637790",
          appId: "1:825098637790:web:1c3930b7e4033004c70d4f",
          measurementId: "G-Y0VFSVPTBC"
        };

export const providerETH = 'https://sepolia.drpc.org';

//export const providerETH = 'https://sepolia-eth.w3node.com/4e8fbb3cbececa76950fbb8dcd185bc3b6db8cc5eec8a98593713a6a3d2ffdcb/api';
export const contract_address: any = "0x603C4fAB85A5df9eB531e40b9d80c137B2B0c591";


  //providerETH = 'https://sepolia.infura.io/v3/d09825f256ae4705a74fdee006040903';
  //export const providerETH = 'https://sepolia.infura.io/v3/14a07be1d5274d6e873766271f369061';
  //providerETH = 'https://rpc2.sepolia.org';
  //providerETH = 'http://127.0.0.1:7545/';
  //contract_address: any = "0x7a588bF361542fb2aD6191fe467e83fb097E1Ea6";
  

// Initialize Firebase
//const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);