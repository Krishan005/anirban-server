import { object, string, number } from "yup";

const regX = new RegExp(/^(?:(?:31(\/|-|\.)(?:0?[13578]|1[02]))\1|(?:(?:29|30)(\/|-|\.)(?:0?[13-9]|1[0-2])\2))(?:(?:1[6-9]|[2-9]\d)?\d{2})$|^(?:29(\/|-|\.)0?2\3(?:(?:(?:1[6-9]|[2-9]\d)?(?:0[48]|[2468][048]|[13579][26])|(?:(?:16|[2468][048]|[3579][26])00))))$|^(?:0?[1-9]|1\d|2[0-8])(\/|-|\.)(?:(?:0?[1-9])|(?:1[0-2]))\4(?:(?:1[6-9]|[2-9]\d)?\d{2})$/);

export const createEmployeeSchema = object({
    body: object({
        fullName: string().min(3).required("Full name is required"),
        designation: string().min(3).required("Designation is required"),
        // date_of_birth: string().matches(regX),
        experience_years: number().min(0)
    }),
});

export const editEmployeeSchema = object({
    params: object({
        id: string().required()
    }),
    body: object({
        fullName: string().min(3),
        designation: string().min(3),
        experience_years: number().min(0)
    }),
})