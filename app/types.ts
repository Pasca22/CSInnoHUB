import {Timestamp} from "firebase/firestore";
import { DocumentReference } from "firebase/firestore";

export type Event = {
	title : string;
	description : string;
	date : Timestamp;
	location : string;
	registrationLink : string;
};

export type Mentor = {
	name : string;
	pictureURL : string;
	title: string;
	company : string;
	interests: string[];
	email : string;
};

export type Project = {
	name: string;
	founder: DocumentReference;
  	members: {
    	ref: DocumentReference;
    	role: string;
  	}[];
};
