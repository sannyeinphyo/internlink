import * as yup from "yup";

export const registerSchema = yup.object().shape({
  // Common to all
  email: yup.string().email("Invalid email format").required("Email is required"),

  password: yup
    .string()
    .min(6, "Password must be at least 6 characters")
    .required("Password is required"),

  role: yup
    .string()
    .oneOf(["student", "company", "teacher"], "Invalid role")
    .required("Role is required"),

  // Conditional for STUDENT
  batch_year: yup.number().when("role", {
    is: "student",
    then: (schema) =>
      schema
        .typeError("Batch year must be a number")
        .integer("Batch year must be an integer")
        .min(1900, "Batch year seems invalid")
        .max(new Date().getFullYear(), "Batch year cannot be in the future")
        .required("Batch year is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  major: yup.string().when("role", {
    is: "student",
    then: (schema) => schema.required("Major is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  skills: yup.array().of(yup.string()).when("role", {
    is: "student",
    then: (schema) =>
      schema.min(1, "Please add at least one skill").required(),
    otherwise: (schema) => schema.notRequired(),
  }),

  university_id: yup.number().when("role", {
    is: "student",
    then: (schema) =>
      schema
        .typeError("University is required")
        .required("University is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  facebook: yup.string().url("Invalid URL").nullable(),
  linkedIn: yup.string().url("Invalid URL").nullable(),

  // Conditional for TEACHER
  department: yup.string().when("role", {
    is: "teacher",
    then: (schema) => schema.required("Department is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  // Conditional for COMPANY
  name: yup.string().when("role", {
    is: "company",
    then: (schema) => schema.required("Company name is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  location: yup.string().when("role", {
    is: "company",
    then: (schema) => schema.required("Location is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
  
  image: yup.string().nullable(),


  website: yup.string().url("Invalid URL").nullable(),

  facebook_company: yup.string().url("Invalid URL").nullable(),

  description: yup.string().nullable(),

  contact_info: yup.string().when("role", {
    is: "company",
    then: (schema) => schema.required("Contact info is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
