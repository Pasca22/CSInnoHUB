import {Timestamp} from "firebase/firestore";

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

export type ProjectMember = {
	refToUser : string;
	userName : string;
	role : string;
};

export type Project = {
	name : string;
	description : string;
	startingDate : Timestamp;
	tags : string[];
	members : ProjectMember[];
};