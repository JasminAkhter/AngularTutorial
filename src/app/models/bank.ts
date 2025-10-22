import { Branch } from "./branch";

export interface Bank {
    bankID: number;
    bankName: string;
    accountNumber: string;
    accountType: string;
    openingDate: string;
    bankAddress: string;
    branchs?: Branch[];
}


