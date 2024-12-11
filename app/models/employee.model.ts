import mongoose from "mongoose";
import config from "config";

export interface EmployeeDocument extends mongoose.Document {
    fullName: string;
    designation: string;
    date_of_birth: string;
    experience_years: number;
    reporting: this["_id"];
    createdAt: Date;
    updatedAt: Date;
}

const EMPLOYEE_SCHEMA = new mongoose.Schema({
    fullName: {
        type: String,
        required: true
    },
    designation: {
        type: String,
        required: true
    },
    date_of_birth: {
        type: String
    },
    experience_years: {
        type: Number,
        default: 0
    },
    reporting: {
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "employee"
    },
    picture: {
        type: String,
        default: "server/storages/uploads/images/download.jpg",
    },
}, { timestamps: true });

const employeeModel = mongoose.model<EmployeeDocument>("employee", EMPLOYEE_SCHEMA);

export default employeeModel;