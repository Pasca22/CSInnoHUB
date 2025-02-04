import {Timestamp} from "firebase/firestore";

export type Event = {
	title : string;
	description : string;
	date : Timestamp;
	location : string;
};

export type Mentor = {
	name : string;
	pictureURL : string;
	title: string;
	company : string;
	interests: string[];
	email : string;
};