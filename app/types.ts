import {Timestamp} from "firebase/firestore";
import { DocumentReference } from "firebase/firestore";

export type Event = {
	name : string;
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
	startingDate: Timestamp;
	description: string;
	founder: DocumentReference;
  	members: {
    	ref: DocumentReference;
    	role: string;
  	}[];
	keywords: string;
	projectRef?: DocumentReference;
};

export type MembersDropdownDataType = {
	label: string,
	value: {
		refToUser : string;
		userName : string;
		role : string;
	}
}