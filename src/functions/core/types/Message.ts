import { User } from "./User";

export class MessageData implements Message {
    user: User;
    message: string;

    constructor(raw: Message) {
        this.user = raw.user;
        this.message = raw.message;
    }
}

export interface Message {
    user: User;
    message: string;
    id?: string;
}

export { User };