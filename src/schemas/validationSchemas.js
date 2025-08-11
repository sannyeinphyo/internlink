import * as yup from "yup";

export const registerSchema = yup.object().shape({
  name: yup.string().when("role", {
    is: "company",
    then: (schema) => schema.required("Company name is required"),
    otherwise: (schema) => schema.required("Name is required"),
  }),

  email: yup
    .string()
    .email("Invalid email format")
    .required("Email is required"),

  password: yup
    .string()
    .required("Password is required")
    .min(8, "Password must be at least 8 characters long")
    .matches(/[a-z]/, "Password must contain at least one lowercase letter")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(/[0-9]/, "Password must contain at least one interger")
    .matches(
      /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/,
      "Password must contain at least one special character"
    ),

  role: yup
    .string()
    .oneOf(["student", "company", "teacher"], "Invalid role")
    .required("Role is required"),

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

  skills: yup
    .array()
    .of(yup.string())
    .when("role", {
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

  student_id_image: yup.string().when("role", {
    is: "student",
    then: (schema) =>
      schema
        .required("Student ID image is required")
        .test("is-image", "Invalid file format", (value) => {
          if (!value) return true;
          return value.startsWith("data:image/");
        }),
    otherwise: (schema) => schema.strip(),
  }),

  department: yup.string().when("role", {
    is: "teacher",
    then: (schema) => schema.required("Department is required"),
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

  description: yup.string().when("role", {
    is: "company",
    then: (schema) => schema.required("Description is required"),
    otherwise: (schema) => schema.notRequired(),
  }),

  contact_info: yup.string().when("role", {
    is: "company",
    then: (schema) => schema.required("Contact info is required"),
    otherwise: (schema) => schema.notRequired(),
  }),
});
