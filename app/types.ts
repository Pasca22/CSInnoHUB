import {Timestamp} from "firebase/firestore";

export type Event = {
	title : string;
	description : string;
	date : Timestamp;
	location : string;
};